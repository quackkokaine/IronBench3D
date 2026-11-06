# IronBench 3D

A Tarkov-workbench-style firearm builder. The AR-15 platform is live; AK and Glock are planned. It uses the real Palmetto State Armory catalog: 307 parts with prices, weights, reviews and compatibility filtering.

- `index.html`: the builder site, served by GitHub Pages.
- `data/`: catalog extracts from PSA (parts, links, reviews, images, barrel thread specs).
- `render/`: the 2D build-preview pipeline (see `render/README.md`).
- `parts/`: ready-made part layers plus `manifest.json`, loaded on demand by the preview (in progress).
- `docs/composite-spec.md`: the placement blueprint (part positions, proportions, calibration against real rifles).

Note: the Uncle Jim Bob assistant uses Claude's in-page AI, so it only answers when the site is opened as a claude.ai artifact.
