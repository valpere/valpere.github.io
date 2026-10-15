# Endorphin — motion concept (source)

Next.js static-export demo published at `/endorphin-demo/` (not part of the Jekyll output: `demos/` is excluded in `_config.yml`).
The Pages workflow builds it with `NEXT_PUBLIC_BASE_PATH=/endorphin-demo npm run build` and copies `out/` into `_site/endorphin-demo/` after the Jekyll build.

Local: `npm ci && npm run dev`. Checks against a served build: `minions/endorphin-check <url>` (CDP, local helper).
