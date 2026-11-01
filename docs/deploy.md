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
