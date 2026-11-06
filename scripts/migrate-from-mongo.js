// One-shot: copy judd.results from Mongo into Postgres, idempotent (legacy_mongo_id is unique).
//   JUDD_MONGO_CONNECTION_STRING=... JUDD_DATABASE_URL=... node scripts/migrate-from-mongo.js
// Prints the Mongo and Postgres counts before and after; exits 1 if they differ.
const mongoose = require('mongoose');
const { createPostgresStore } = require('../src/store/postgres');
const config = require('../src/config');

(async () => {
	await mongoose.connect(config.mongoose.connection_string);
	const coll = mongoose.connection.collection('results');
	const store = createPostgresStore(config.postgres.url);
	await store.connect();
	const count = async () => Number((await store.pool.query('SELECT count(*) FROM judd_results')).rows[0].count);
	console.log('before: mongo', await coll.countDocuments(), 'postgres', await count());
	for await (const doc of coll.find({})) {
		const data = {};
		for (const [k, v] of Object.entries(doc.resultData || {})) if (k !== 'MiiName' && k !== 'FaceImg') data[k] = v;
		const n = (v) => (Number.isFinite(Number(v)) && v != null ? Number(v) : null);
		await store.pool.query(
			`INSERT INTO judd_results (type, boss_unique_id, boss_digest, fes_id, fes_team, pid, is_win_game, paint, kills, deaths, fes_power, result_data, legacy_mongo_id, created_at, updated_at)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT (legacy_mongo_id) DO NOTHING`,
			[doc.type, doc.bossUniqueId, doc.bossDigest, n(data.FesID), n(data.FesTeam), n(data.PId), n(data.IsWinGame), n(data.Paint), n(data.Kill),
				n(data.Death), n(data.FesPower), JSON.stringify(data), String(doc._id), doc.createdAt || new Date(), doc.updatedAt || new Date()]);
	}
	const m = await coll.countDocuments();
	const p = await count();
	console.log('after: mongo', m, 'postgres', p);
	await store.close();
	await mongoose.disconnect();
	process.exit(m === p ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
