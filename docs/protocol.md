# Protocol: judd

Splatoon (`wup-agmj`) uploads one record per player per Splatfest match.

- `POST /post` on `https://wup-agmj.app.nintendo.net`. The title code is the leftmost label
  of the host (`wup-agmj`); an unknown title code is rejected.
- Body: `multipart/form-data` with the 55 fields in `src/titles/splatoon.js` (numbers as
  text, `FaceImg` as a file part). A numeric field may be an empty string, stored as 0.
- Headers: `X-Boss-Digest` is the lowercase hex SHA-1 of the raw request body and must
  match; `X-Boss-UniqueId` identifies the upload.
- Answer: `200 success`. Every failure is `500 error`, as the original server did.
- Stored in the `results` collection of the `judd` database.

## Title host

The Splatoon title code is `wup-agmj` (the NEX build name in `nex/titles/splatoon` is
`branch:origin/project/wup-agmj`), so the game talks to `wup-agmj.app.nintendo.net`. Judd takes
the title code from the host's subdomain. The console resolves `.nintendo.net` to OpenPak
through `nn-sssl-dns`; the Wii U patcher does not rewrite this name (it lives in the game).

## Aggregate read API

Upstream stores results only. OpenPak adds an aggregate read API (v0.2.0, `src/tally.js`,
`src/api.js`) for SplatNet.
