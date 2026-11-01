# Evidence: judd

- Hostname `wup-agmj.app.nintendo.net`: the Splatoon title code is `wup-agmj` (the NEX
  build name in `nex/titles/splatoon` is `branch:origin/project/wup-agmj`); the
  splatnet-plus README redirects that exact host in a Fiddler rule. The upstream Judd code
  takes the title code from the host's subdomain. Not yet captured from a console.
- The console resolves `.nintendo.net` to OpenPak through `nn-sssl-dns`. The Wii U patcher
  does not rewrite this name (the string lives in the game); it does not need to.
