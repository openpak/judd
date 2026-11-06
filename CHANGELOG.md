# Changelog: judd

The early history is upstream (Pretendo); OpenPak work starts at v0.1.0.

## v0.3.0 - 2026-11-06

- Postgres store (card #20): set `JUDD_DATABASE_URL` and match results go to `judd_results`
  (migrations in `migrations/`, applied at start-up). Unset, the service still uses Mongo, which
  is the rollback. The Mii name and face image of an upload are no longer stored (copies of the
  account core's Mii that nothing reads). `scripts/migrate-from-mongo.js` copies old rows.
- Request logging unchanged (one line per request on stdout).

## v0.2.1 — 2026-11-04

- docs: README + protocol + deploy only; PRDs move to openpak/prds
- docs: drop time-stamped status notes

## v0.2.0 - 2026-11-01

- Splatfest tally read API on its own port (`JUDD_API_PORT`, default 20141, internal network only):
  `GET /api/splatfests` and `GET /api/splatfests/:id` return per-team aggregates (players, matches,
  wins, paint, kills, deaths, best power, win percent, leader) computed from the stored match
  records. No player ids, names or images leave the service.
- Tests: `npm test` (pure tally tests; the Mongo test runs with `JUDD_TEST_MONGO`)

## v0.1.0 - 2026-11-01

- OpenPak port: environment configuration, larger body limit, tag-driven ghcr release, docs
