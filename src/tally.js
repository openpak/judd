// Splatfest tallies from the stored match records. Pure functions plus the two Mongo
// aggregation pipelines; nothing here touches the network, so it can be tested alone.
//
// Teams are the game's FesTeam values (0 = Alpha, 1 = Bravo). The tally is aggregate only:
// no player ids, names or images leave this module.

const TEAMS = 2;

function matchStage(festId) {
	return { $match: { type: 'splatfest', 'resultData.FesID': festId } };
}

// One group per team: matches, wins, paint, kills, deaths, distinct players, best power.
function teamPipeline(festId) {
	return [
		matchStage(festId),
		{ $group: {
			_id: '$resultData.FesTeam',
			matches: { $sum: 1 },
			wins: { $sum: { $cond: [{ $eq: ['$resultData.IsWinGame', 1] }, 1, 0] } },
			paint: { $sum: '$resultData.Paint' },
			kills: { $sum: '$resultData.Kill' },
			deaths: { $sum: '$resultData.Death' },
			players: { $addToSet: '$resultData.PId' },
			bestPower: { $max: '$resultData.FesPower' },
			first: { $min: '$createdAt' },
			last: { $max: '$createdAt' }
		} },
		{ $project: { matches: 1, wins: 1, paint: 1, kills: 1, deaths: 1, bestPower: 1, first: 1, last: 1, players: { $size: '$players' } } }
	];
}

function festListPipeline() {
	return [
		{ $match: { type: 'splatfest' } },
		{ $group: {
			_id: '$resultData.FesID',
			matches: { $sum: 1 },
			players: { $addToSet: '$resultData.PId' },
			first: { $min: '$createdAt' },
			last: { $max: '$createdAt' }
		} },
		{ $project: { matches: 1, first: 1, last: 1, players: { $size: '$players' } } },
		{ $sort: { _id: -1 } }
	];
}

const num = (v) => (Number.isFinite(v) ? v : 0);
const iso = (d) => (d ? new Date(d).toISOString() : null);

// shapeFest turns the per-team groups into the API document. Teams outside 0..1 (a record
// with a bogus FesTeam) are ignored rather than invented as a third team.
function shapeFest(festId, groups) {
	const teams = Array.from({ length: TEAMS }, (_, team) => ({
		team, players: 0, matches: 0, wins: 0, paint: 0, kills: 0, deaths: 0, bestPower: 0
	}));
	let first = null;
	let last = null;
	for (const g of groups) {
		const t = teams[g._id];
		if (!t) continue;
		t.players = num(g.players);
		t.matches = num(g.matches);
		t.wins = num(g.wins);
		t.paint = num(g.paint);
		t.kills = num(g.kills);
		t.deaths = num(g.deaths);
		t.bestPower = num(g.bestPower);
		if (g.first && (!first || g.first < first)) first = g.first;
		if (g.last && (!last || g.last > last)) last = g.last;
	}
	const matches = teams.reduce((n, t) => n + t.matches, 0);
	const totalWins = teams.reduce((n, t) => n + t.wins, 0);
	const winRatio = teams.map((t) => (totalWins ? Math.round((t.wins / totalWins) * 1000) / 10 : 0));
	let leader = null;
	if (totalWins > 0 && teams[0].wins !== teams[1].wins) leader = teams[0].wins > teams[1].wins ? 0 : 1;
	return {
		festId,
		matches,
		players: teams.reduce((n, t) => n + t.players, 0),
		teams: teams.map((t, i) => ({ ...t, winPercent: winRatio[i] })),
		leader,
		firstUpload: iso(first),
		lastUpload: iso(last)
	};
}

function shapeFestList(groups) {
	return groups
		.filter((g) => Number.isInteger(g._id))
		.map((g) => ({ festId: g._id, matches: num(g.matches), players: num(g.players), firstUpload: iso(g.first), lastUpload: iso(g.last) }));
}

module.exports = { TEAMS, teamPipeline, festListPipeline, shapeFest, shapeFestList };
