# Notes: judd

- Port changes from upstream: environment configuration, 8 MB body limit (Express' 100 kB
  default is too small for the face image), `x-powered-by` off, tag-driven image release.
- Upstream stores results only. OpenPak adds an aggregate read API (v0.2.0, `src/tally.js`, `src/api.js`) for SplatNet.
