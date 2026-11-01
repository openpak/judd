const test = require('node:test');
const assert = require('node:assert');
const { teamPipeline, shapeFest, shapeFestList } = require('../src/tally');

test('pipeline filters on festival and groups by team', () => {
	const p = teamPipeline(31);
	assert.deepStrictEqual(p[0].$match, { type: 'splatfest', 'resultData.FesID': 31 });
	assert.strictEqual(p[1].$group._id, '$resultData.FesTeam');
});

test('shapeFest totals two teams and names a leader', () => {
	const d = shapeFest(31, [
		{ _id: 0, matches: 10, wins: 6, paint: 1000, kills: 50, deaths: 40, players: 4, bestPower: 1800, first: new Date('2026-11-01T10:00:00Z'), last: new Date('2026-11-01T12:00:00Z') },
		{ _id: 1, matches: 10, wins: 4, paint: 900, kills: 40, deaths: 50, players: 5, bestPower: 1700, first: new Date('2026-11-01T09:00:00Z'), last: new Date('2026-11-01T13:00:00Z') }
	]);
	assert.strictEqual(d.matches, 20);
	assert.strictEqual(d.players, 9);
	assert.strictEqual(d.leader, 0);
	assert.deepStrictEqual(d.teams.map((t) => t.winPercent), [60, 40]);
	assert.strictEqual(d.firstUpload, '2026-11-01T09:00:00.000Z');
	assert.strictEqual(d.lastUpload, '2026-11-01T13:00:00.000Z');
});

test('shapeFest on an empty fest is zeros with no leader, and ignores bogus teams', () => {
	const d = shapeFest(5, [{ _id: 7, matches: 99, wins: 99 }]);
	assert.strictEqual(d.matches, 0);
	assert.strictEqual(d.leader, null);
	assert.strictEqual(d.teams.length, 2);
	assert.strictEqual(d.firstUpload, null);
});

test('a tied festival has no leader', () => {
	const d = shapeFest(5, [{ _id: 0, matches: 2, wins: 1, players: 1 }, { _id: 1, matches: 2, wins: 1, players: 1 }]);
	assert.strictEqual(d.leader, null);
});

test('festival list drops records without a festival id', () => {
	const l = shapeFestList([{ _id: 31, matches: 3, players: 2 }, { _id: null, matches: 1 }]);
	assert.deepStrictEqual(l.map((f) => f.festId), [31]);
});
