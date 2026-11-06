// Needs a throwaway MongoDB (skipped without JUDD_TEST_MONGO):
//   podman run --rm -d -p 23198:27017 mongo:7
//   JUDD_TEST_MONGO=mongodb://127.0.0.1:23198/judd_test npm test
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const uri = process.env.JUDD_TEST_MONGO;

test('read API tallies stored matches', { skip: !uri && 'JUDD_TEST_MONGO is not set' }, async () => {
	const mongoose = require('mongoose');
	const { SplatfestResult } = require('../src/models/splatfest_result');
	const { createApi } = require('../src/api');
	await mongoose.connect(uri);
	await SplatfestResult.deleteMany({});
	const mk = (PId, FesTeam, IsWinGame, Paint, FesID = 31) =>
		({ type: 'splatfest', resultData: { PId, FesID, FesTeam, IsWinGame, Paint, Kill: 5, Death: 3, FesPower: 1500 + PId } });
	await SplatfestResult.insertMany([mk(1, 0, 1, 100), mk(1, 0, 0, 50), mk(2, 0, 1, 70), mk(3, 1, 1, 10), mk(3, 1, 0, 20), mk(9, 0, 1, 1, 40)]);
	const server = createApi(SplatfestResult).listen(0);
	const base = `http://127.0.0.1:${server.address().port}`;
	const get = (p) => new Promise((resolve) => http.get(base + p, (res) => {
		let body = '';
		res.on('data', (d) => (body += d));
		res.on('end', () => resolve({ status: res.statusCode, body }));
	}));
	try {
		const fest = JSON.parse((await get('/api/splatfests/31')).body);
		assert.strictEqual(fest.matches, 5);
		assert.strictEqual(fest.players, 3);
		assert.strictEqual(fest.leader, 0);
		assert.deepStrictEqual(fest.teams.map((t) => t.wins), [2, 1]);
		assert.deepStrictEqual(JSON.parse((await get('/api/splatfests')).body).map((f) => f.festId), [40, 31]);
		assert.strictEqual((await get('/api/splatfests/abc')).status, 400);
		assert.strictEqual((await get('/nope')).status, 404);
	} finally {
		server.close();
		await SplatfestResult.deleteMany({});
		await mongoose.disconnect();
	}
});


// Needs a throwaway Postgres (skipped without JUDD_TEST_PG):
//   JUDD_TEST_PG=postgres://postgres:pw@127.0.0.1:23199/postgres npm test
test('postgres store tallies stored matches', { skip: !process.env.JUDD_TEST_PG && 'JUDD_TEST_PG is not set' }, async () => {
	const { createPostgresStore } = require('../src/store/postgres');
	const { createApi } = require('../src/api');
	const store = createPostgresStore(process.env.JUDD_TEST_PG);
	await store.connect();
	await store.pool.query('TRUNCATE judd_results');
	const mk = (PId, FesTeam, IsWinGame, Paint, FesID = 31) =>
		store.saveResult({ type: 'splatfest', resultData: { PId, FesID, FesTeam, IsWinGame, Paint, Kill: 5, Death: 3, FesPower: 1500 + PId, MiiName: 'secret', FaceImg: Buffer.from('x') } });
	for (const r of [mk(1, 0, 1, 100), mk(1, 0, 0, 50), mk(2, 0, 1, 70), mk(3, 1, 1, 10), mk(3, 1, 0, 20), mk(9, 0, 1, 1, 40)]) await r;
	const server = createApi(store).listen(0);
	const base = `http://127.0.0.1:${server.address().port}`;
	const get = (p) => new Promise((resolve) => http.get(base + p, (res) => {
		let body = '';
		res.on('data', (d) => (body += d));
		res.on('end', () => resolve({ status: res.statusCode, body }));
	}));
	try {
		const fest = JSON.parse((await get('/api/splatfests/31')).body);
		assert.strictEqual(fest.matches, 5);
		assert.strictEqual(fest.players, 3);
		assert.strictEqual(fest.leader, 0);
		assert.deepStrictEqual(fest.teams.map((t) => t.wins), [2, 1]);
		assert.deepStrictEqual(JSON.parse((await get('/api/splatfests')).body).map((f) => f.festId), [40, 31]);
		const stored = await store.pool.query('SELECT result_data FROM judd_results LIMIT 1');
		assert.ok(!('MiiName' in stored.rows[0].result_data) && !('FaceImg' in stored.rows[0].result_data));
	} finally {
		server.close();
		await store.pool.query('TRUNCATE judd_results');
		await store.close();
	}
});
