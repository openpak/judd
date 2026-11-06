-- judd: match results. Additive only; applied at start-up and recorded in judd_migrations.
-- The player's Mii name and face image are not stored: they are copies of the account core's Mii
-- and nothing reads them. Only the pid reference and the game's own numbers are kept.
CREATE TABLE IF NOT EXISTS judd_results (
	id               bigserial PRIMARY KEY,
	type             text        NOT NULL,
	boss_unique_id   text,
	boss_digest      text,
	fes_id           bigint,
	fes_team         smallint,
	pid              bigint,
	is_win_game      smallint,
	paint            bigint,
	kills            bigint,
	deaths           bigint,
	fes_power        bigint,
	result_data      jsonb       NOT NULL DEFAULT '{}'::jsonb,
	legacy_mongo_id  text UNIQUE,
	created_at       timestamptz NOT NULL DEFAULT now(),
	updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS judd_results_fest ON judd_results (type, fes_id, fes_team);
