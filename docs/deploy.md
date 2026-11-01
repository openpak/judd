# Deploy: judd

Image `ghcr.io/openpak/judd`, built on `v*.*.*` tags only. Quadlet `openpak-judd` on the
`openpak.network` network (pinned IP), HTTP on 20140, MongoDB database `judd` in
`openpak-mongo`. Traefik router `judd` on the `console` entrypoint (21443) matches
`wup-agmj.app.nintendo.net` and `wup-agmj.app.openpak.org` and sends them to
`http://openpak-judd:20140`.

TLS: the `wup-agmj` leaf is signed by the OpenPak CA (the same one the console already
trusts) and listed under `tls.certificates` in Traefik's `dynamic.yml`; `wiiu.pem` does
not cover these names.

Environment: `JUDD_HTTP_PORT=20140`, `JUDD_MONGO_CONNECTION_STRING=mongodb://openpak-mongo:27017/judd`.

## Read API (v0.2.0)

`GET /api/splatfests` (festivals with uploads) and `GET /api/splatfests/:id` (per-team tally) on
`JUDD_API_PORT` (default 20141). It is a separate listener so it is never behind the console
hostnames: Traefik routes `wup-agmj.*` to 20140 only. Expose 20141 on the `openpak.network` network
and nothing else. SplatNet reads it through `JUDD_URL=http://openpak-judd:20141`.

Teams are the game's `FesTeam` (0 = Alpha, 1 = Bravo). `wins` counts uploads with `IsWinGame = 1`,
so a match is counted once per player who uploaded it.
