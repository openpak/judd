// Postgres store (JUDD_DATABASE_URL). Migrations in ../../migrations/*.sql run once each at start-up.
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

// Fields the game uploads that are copies of core data or raw images: never stored.
const DROP = new Set(['MiiName', 'FaceImg']);

function createPostgresStore(url) {
	const pool = new Pool({ connectionString: url, max: 5 });

	async function migrate() {
		await pool.query('CREATE TABLE IF NOT EXISTS judd_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
		const dir = path.join(__dirname, '..', '..', 'migrations');
		for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
			const done = await pool.query('SELECT 1 FROM judd_migrations WHERE name = $1', [file]);
			if (done.rowCount) continue;
			const client = await pool.connect();
			try {
				await client.query('BEGIN');
				await client.query(fs.readFileSync(path.join(dir, file), 'utf8'));
				await client.query('INSERT INTO judd_migrations (name) VALUES ($1)', [file]);
				await client.query('COMMIT');
			} catch (error) {
				await client.query('ROLLBACK');
				throw error;
			} finally {
				client.release();
			}
		}
	}

	const int = (v) => (Number.isFinite(Number(v)) && v !== undefined && v !== null ? Number(v) : null);

	async function saveResult({ type, bossUniqueId, bossDigest, resultData }) {
		const data = {};
		for (const [k, v] of Object.entries(resultData || {})) if (!DROP.has(k)) data[k] = v;
		await pool.query(
			`INSERT INTO judd_results (type, boss_unique_id, boss_digest, fes_id, fes_team, pid, is_win_game, paint, kills, deaths, fes_power, result_data)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
			[type, bossUniqueId, bossDigest, int(data.FesID), int(data.FesTeam), int(data.PId), int(data.IsWinGame),
				int(data.Paint), int(data.Kill), int(data.Death), int(data.FesPower), JSON.stringify(data)]
		);
	}

	// Same shape the Mongo pipelines returned, so tally.shapeFest / shapeFestList work on both.
	async function teamGroups(festId) {
		const { rows } = await pool.query(
			`SELECT fes_team AS _id, count(*)::int AS matches,
			        count(*) FILTER (WHERE is_win_game = 1)::int AS wins,
			        coalesce(sum(paint),0)::float8 AS paint, coalesce(sum(kills),0)::float8 AS kills, coalesce(sum(deaths),0)::float8 AS deaths,
			        count(DISTINCT pid)::int AS players, max(fes_power)::float8 AS "bestPower",
			        min(created_at) AS first, max(created_at) AS last
			   FROM judd_results WHERE type = 'splatfest' AND fes_id = $1 GROUP BY fes_team`, [festId]);
		return rows;
	}

	async function festGroups() {
		const { rows } = await pool.query(
			`SELECT fes_id::int AS _id, count(*)::int AS matches, count(DISTINCT pid)::int AS players,
			        min(created_at) AS first, max(created_at) AS last
			   FROM judd_results WHERE type = 'splatfest' GROUP BY fes_id ORDER BY fes_id DESC`);
		return rows;
	}

	return { kind: 'postgres', pool, connect: migrate, saveResult, teamGroups, festGroups, close: () => pool.end() };
}

module.exports = { createPostgresStore };
