// Legacy Mongo store, kept for rollback (used when JUDD_DATABASE_URL is unset). Removed once Mongo is gone.
const database = require('../database');
const { SplatfestResult } = require('../models/splatfest_result');
const { teamPipeline, festListPipeline } = require('../tally');

function createMongoStore() {
	return {
		kind: 'mongo',
		connect: () => database.connect(),
		async saveResult({ type, bossUniqueId, bossDigest, resultData }) {
			await new SplatfestResult({ type, bossUniqueId, bossDigest, resultData }).save();
		},
		teamGroups: (festId) => SplatfestResult.aggregate(teamPipeline(festId)),
		festGroups: () => SplatfestResult.aggregate(festListPipeline())
	};
}

module.exports = { createMongoStore };
