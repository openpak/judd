# Judd

OpenPak's multiplayer match results server for the Wii U.

| | |
| --- | --- |
| Network | Wii U |
| Role | Receives match results a title uploads over BOSS; Splatoon 1 Splatfest results today |
| Depends on | MongoDB |
| Image | `ghcr.io/openpak/judd` |
| Based on | [Pretendo `Judd`](https://github.com/PretendoNetwork/Judd) (ISC) |
| Licence | ISC |

Judd is named after the cat who judges matches in Splatoon. A title is one entry in
`src/titles/`, keyed by its title code (`wup-agmj` is Splatoon, EUR/USA/JPN share it).

## Run

```sh
cp example.env .env
npm ci
npm start
```

Settings are environment variables: `JUDD_HTTP_PORT` and `JUDD_MONGO_CONNECTION_STRING`
(`config.json` still works as a fallback).

## Docs

- [Protocol](docs/protocol.md)
- [Evidence](docs/evidence.md)
- [Deploy](docs/deploy.md)
- [Notes](docs/notes.md)
- [Upstream README](docs/upstream.md)

## Licence

ISC. Written by the Pretendo Network contributors; OpenPak keeps their licence and credit.
See [LICENSE](LICENSE).
