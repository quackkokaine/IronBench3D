# IronBench 2D render pipeline

This folder holds the tools that turn PSA product photos into ready-made part layers. It is not code the live site runs.

Today these scripts run inside a palmettostatearmory.com tab, because the cut-outs need to read photo pixels from the same site. Inject them in order:

1. `ib2d.js`: library. Gallery fetch, background removal, trim, orientation checks, pin and hole detection, per-part META.
2. `compose5.js`: assembler. Places the parts using pins and the bore line, and controls layer order.
3. `patch6.js`: classifies holes by position; adds the pinned trigger photo, mag release, selector, dust cover and forward assist.
4. `patch7.js`: procedural barrel (true to length), threads, muzzle-device seating and charging handle.

Then run `await IB.build()`.

Option 1 plan: export each processed part as `parts/img/<slot>/<id>.webp` and record its anchors in `parts/manifest.json`. The site then places layers from the manifest and does no image processing.

The placement blueprint is in `docs/composite-spec.md`.
