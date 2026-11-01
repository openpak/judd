// The read side: aggregate Splatfest tallies, on its own port so it is never reachable
// through the console-facing hostnames (those only route to the upload port).
//
//   GET /api/splatfests          every festival that has uploads
//   GET /api/splatfests/:id      one festival's per-team tally
//   GET /healthz
const express = require('express');
const { teamPipeline, festListPipeline, shapeFest, shapeFestList } = require('./tally');

function createApi(SplatfestResult) {
	const api = express();
	api.disable('x-powered-by');

	api.get('/healthz', (_req, res) => res.send('ok'));

	api.get('/api/splatfests', async (_req, res, next) => {
		try {
			res.json(shapeFestList(await SplatfestResult.aggregate(festListPipeline())));
		} catch (error) {
			next(error);
		}
	});

	api.get('/api/splatfests/:id', async (req, res, next) => {
		const festId = Number(req.params.id);
		if (!Number.isInteger(festId) || festId < 0 || festId > 0xffffffff) return res.sendStatus(400);
		try {
			res.json(shapeFest(festId, await SplatfestResult.aggregate(teamPipeline(festId))));
		} catch (error) {
			next(error);
		}
	});

	api.use((_req, res) => res.sendStatus(404));
	api.use((error, _req, res, _next) => {
		console.error(error);
		res.status(500).send('error');
	});
	return api;
}

module.exports = { createApi };
