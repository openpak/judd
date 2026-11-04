# Changelog: judd

The early history is upstream (Pretendo); OpenPak work starts at v0.1.0.

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
