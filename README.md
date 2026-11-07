# IronBench

IronBench is a work-in-process firearm builder with a live 2D build preview made from real product photos. The AR-15 platform is the only live page; AK and handgun platforms are planned. The website currently only uses the Palmetto State Armory catalog: 307 parts with prices, estimated weights, reviews and compatibility filtering.
IMPORTANT - THIS IS A PASSION PROJECT, NOT AN OFFICIAL STOREFRONT!!!
IronBench does NOT have explicit permission from Palmetto State Armory or any firearms/part manufacture to use their images. All images you see, including the generated previews, belong to Palmetto State Armory and/or the respective firearm part(s) manufacturer. All images have imbedded hotlinks that will take you straight to the Palmetto State Armory and/or its manufacture. 

- `index.html`: the builder site, served by GitHub Pages.
- `data/`: catalog extracts from PSA (parts, links, reviews, images, barrel thread specs).
- `render/`: the 2D build-preview pipeline (see `render/README.md`).
- `parts/`: ready-made part layers plus `manifest.json`, loaded on demand by the preview (in progress).
- `docs/composite-spec.md`: the placement blueprint (part positions, proportions, calibration against real rifles).

Note: the Uncle Jim Bob assistant uses Claude's in-page AI, so it only answers when the site is opened as a claude.ai artifact.
