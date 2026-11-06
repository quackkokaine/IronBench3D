# IronBench Build Preview — Assembly Spec (AR-15, v7)

View: RIGHT side of the rifle, muzzle pointing RIGHT. Scale S = 38 px per real inch. Canvas 1600x600.
Code: /home/claude/ib2d.js (library + per-part META + orientation checks) and /home/claude/compose5.js (assembly). Inject ib2d.js, then compose5.js, then patch6.js into a palmettostatearmory.com tab, then `await IB.build()`.
Never keep pipeline code only in the browser tab: the pane can close and wipe it.

## 1. Photo selection (per part, from the PSA product gallery)
| Part | Rule | Default build pick |
|---|---|---|
| Upper | True flat side view, ejection port visible. Reject elevated/3-4 shots (they look squished). If the selected upper has none, borrow the closest equivalent stripped flat-top side shot. | YHM flat-top stripped upper, gallery[1] (stand-in: PSA stripped upper only has an elevated shot) |
| Lower | Right side (mag-catch side), buffer tower on the left | Ruger AR-556 lower, gallery[1] |
| Magazine | Pure side profile showing the curve. Reject angled shots (look twisted) | gallery[3] |
| Optic | Right side (windage knob side) | EOTech 512, gallery[4] |
| Handguard / barrel / muzzle / grip / stock | Longest straight-on side view | index 0 |

## 2. Cut-out pipeline (every photo)
1. Gradient-aware background flood from the border (handles PSA's grey gradient backdrops).
2. Keep the main body; drop specks under 4% of the largest component.
3. Remove border lines ONLY when they touch both image edges. Never remove long interior rows (that step deleted the EOTech mount base in v3).
4. Crop to the opaque bounding box. Normalize the blacks. Tame specular highlights on mags (values above 70 compressed to 30%).
5. Orientation: barrel thick end left; lower tower left; mag straight in the magwell and curving forward toward the bottom (see section 8); muzzle device flipped so the slotted/prong end faces the muzzle and the thread shoulder faces the barrel.

## 3. Real-world sizes (inches)
Upper body 7.05 L (rear to front face, no threads) = the absolute scale anchor · Lower = solved from the pin holes (came out 7.56) · Pivot-to-takedown pin spacing came out 6.17 · Handguard = its listed length (15) · Barrel = listed length (16), 0.55 inside the upper · Muzzle device 2.15 L, 0.45 thread overlap · Mag 7.4 tall (30 rd) · Grip 4.4 tall · Stock 7.0 L · Buffer tube Ø1.15, 7.6 visible · EOTech 512 5.6 L.

## 4. Anchors (detected from each part's silhouette, never hand-placed)
- **Upper to lower = pins, never outlines.** The upper's rear and front lug holes must land exactly on the lower's rear takedown and front pivot pin holes. Lower pin pair = the two holes at the same height near the body top that are farthest apart. This ignores a stray hole in the buffer tower.
- The lower's body top sits at y = 258. The upper is drawn UNDER the lower, so its lugs nest inside the lower's ears and the tower covers the upper's rear edge.
- **Upper front face**: from the right, the first column taller than 72% of the body height. Everything in front of it is threads.
- **Bore line**: the median centre of the thread columns. The barrel, muzzle device and buffer tube are all centred on it.
- **Handguard**: its rear edge butts the upper face (0.04" overlap covers the threads). Its rail top is flush with the upper rail top.
- **Optic**: rear edge 1.25" ahead of the upper's rear. Base bottom 0.24" below the rail top, so the clamp grips the rail.
- **Magwell**: front and rear walls come from the deep part of the lower's bottom profile. The mag's top-front corner (top 10% of rows) sits 0.07" inside the front wall, with its top 0.42" below the lower top.
- **Trigger-guard ears**: the lowest points on either side of the trigger-slot opening behind the magwell.
- **Trigger guard**: a flat bar spanning the two ears, overlapping each by 0.16", with a roll-pin dot at each end.
- **Trigger**: hangs from the slot, 42% of the way from the rear ear to the front ear. The finger face is toward the muzzle and the tip curls forward.
- **Grip**: right edge 0.15" ahead of the rear ear; top 0.32" above the grip-boss level.
- **Stock**: front edge 1.25" behind where the tube enters the tower.

## 5. Small parts (drawn, located from the holes in the stripped-lower photo)
Light enclosed blobs inside the lower silhouette are pin holes:
- Largest hole = **selector**: Ø0.40 with a lever stub pointing forward and an indicator mark.
- Behind the selector = **rear takedown pin** (Ø0.30).
- Front-most hole = **front pivot pin** (Ø0.30).
- Largest hole between the magwell walls = **mag release button** (Ø0.48, knurled).
- Remaining holes between the selector and the magwell = **hammer/trigger pin ends** (Ø0.17).
- Pins are dark steel with a radial highlight and a dark outline, so they read on black anodizing.

## 6. Layer order (back to front)
Buffer tube → stock → castle nut and end plate → magazine → grip → barrel → muzzle device → lower → trigger guard → trigger → pins, selector and mag release → upper (clipped at the mating line) → charging handle → handguard → optic → drop shadow → caption.

## 7. Known stand-ins in the default render
- Upper photo: YHM side view, because the PSA stripped upper has only an elevated shot.
- Barrel/handguard: Faxon HBAR and Sabre 15" QDSM, because the Diamondback barrel and Rise handguard have no usable PSA side photos.

## 8. Mistakes made so far, and the rule that prevents each
| Mistake | Rule now |
|---|---|
| EOTech floated (v3) | Border-line removal deletes a row only if it touches both image edges. |
| Mag twisted (v3) | Never use 3/4 or angled shots. True side profile only. |
| Upper squished (v4) | Reject elevated shots; borrow the closest equivalent side view. |
| Mag backwards (v4 and v5) | Shape rule, checked against the user's reference photo: first rotate the mag so the section inside the magwell (top 8–35%) is perfectly vertical; then the curve must bend FORWARD (toward the muzzle) and get stronger toward the bottom. Mirror the mag if it doesn't. The v5 test ("bottom ahead of top") passed on a backwards mag, so it is not enough on its own. |
| Flash hider backwards (v3) | Measured check: the slotted/prong end goes toward the muzzle, the thread shoulder toward the barrel. |
| Grip backwards risk | Measured check: the bottom of the grip rakes rearward. |
| Upper not joined (v4) | Lengths were guessed (lower 8.3 was ~10% too big). Now: scale from the upper body, size the lower from the pins, and place the upper by its pin holes. |
| Purple/blue tint | Desaturate black-anodized parts to 25% saturation. |
| White M-LOK slots | Photo background trapped in closed openings is turned see-through, with a dark interior behind the handguard. |
| Diagonal product photo | Straighten long parts by their main axis, up to about 70 degrees. |
| Pipeline lost when the pane closed | All code lives in saved files and is re-injected. |

## 9. Blueprint — every part visible in a right-side photo (from the user's reference rifle)
Status in v7: **photo** = streamed PSA product photo · **drawn** = drawn in, because PSA has no usable photo · **n/a** = not in this build.

| # | Part | Where it sits (right side, muzzle right) | How it is placed | v7 |
|---|---|---|---|---|
| 1 | Stock | On the buffer tube, front edge 1.25" behind the tower | Tube centre on the bore line | photo |
| 2 | Buffer tube | From the tower back 7.6", centred on the bore line | Bore line from the upper's thread stub | drawn |
| 3 | Castle nut + end plate | Against the tower's rear face | Tower rear at the bore row | drawn |
| 4 | Lower receiver | Datum. Body top at y = 258 | Sized from the pins (section 4) | photo |
| 5 | Rear takedown pin | Lower rear pin hole | Pin pair (same height, farthest apart) | drawn |
| 6 | Front pivot pin | Lower front pin hole | Pin pair | drawn |
| 7 | Selector (right side = shaft end) | Largest hole ≥ 1" behind the magwell rear wall, below the body top. NOT the largest hole overall (v6 bug: it landed by the forward assist) | Position rule | drawn |
| 8 | Hammer pin / trigger pin ends | The two small holes between the selector and the magwell. Trigger pin = rear/lower, hammer pin = forward/higher | Position rule | drawn |
| 9 | Trigger | Its photo's trigger-pin and hammer-pin holes land on the lower's. Drawn BEHIND the lower so only the blade shows | 2-point pin fit (2.21" unit, −0.3°) | photo |
| 10 | Mag release button | Centred in the catch hole inside the magwell fence, Ø0.5" | Largest hole within 0.7" of the magwell rear wall | photo |
| 11 | Trigger guard | Flat bar across both guard tabs | Tab detection | drawn |
| 12 | Pistol grip | Front-top tucked under the rear guard tab | Tab + grip-boss level | photo |
| 13 | Magazine | Top-front corner 0.07" inside the magwell front wall, straight in the well, curving forward below | orientMag rule | photo |
| 14 | Upper receiver | Lugs on the lower's pins; drawn UNDER the lower | Pins | photo |
| 15 | Forward assist knob | Upper photo fraction (0.39, 0.53) — rear end of the FA housing | Feature map | drawn |
| 16 | Dust cover (closed) | Over the ejection port, upper photo fractions x 0.47–0.785, y 0.33–0.63 | Feature map | drawn |
| 17 | Charging handle | Behind the upper's rear, above the buffer tube | Upper rear + rail row | drawn |
| 18 | Brass deflector | Part of the upper photo | — | photo |
| 19 | Handguard | Butts the upper's front face, rail tops flush | Face + rail row | photo |
| 20 | Barrel (exposed) | Bore line, muzzle at face + 16" − 0.55" | Bore line | photo |
| 21 | Muzzle device | Threads 0.45" onto the barrel; slots toward the muzzle | Bore line + shoulderLeft check | photo |
| 22 | Optic (EOTech 512) | Clamp 0.24" below the rail top, 1.25" ahead of the upper's rear | Rail row | photo |
| 23 | Front / rear flip-up sights | Rear sight on the upper rail rear; front sight at the handguard tip | Rail row | n/a (not in this build) |

### Lower-photo clean-up rules (fixes "funky magwell", v6)
- Never run the see-through pass on the lower: it turned bright machining highlights into white holes.
- Measure the hole map and pin pair from the photo FIRST, then paint every enclosed hole as a dark recess. The pins, selector and mag release are drawn on top of the recesses.

## 10. Charging handle, barrel, threads, muzzle device (v8)
**Charging handle** (drawn; PSA only has top-down photos). Profile matched to the user's reference rifle:
- solid block, top 0.02" below the rail top, 0.5" tall
- sticks out 0.62" behind the upper's rear face, rounded rear corners, a finger-groove relief and a top-edge highlight
- the shaft runs 1.4" forward under the upper to fill the CH channel
- drawn BEFORE the upper, so the upper covers the shaft

**Barrel** (drawn — all barrels look alike; length is what matters):
- muzzle = upper front face + (catalog length − 0.55"), since barrel length is measured from the bolt face
- visible diameter by profile: pencil/lightweight 0.625 · gunner/taper/medium 0.70 · gov/HBAR/heavy/SOCOM 0.75 · DMR 0.80 · bull 0.936
- low-profile gas block at face + (gas length − 0.25"), drawn only when the handguard ends behind it
- 16" barrel + 15" rail: about 0.5" of barrel shows. 20" barrel: about 4.5"

**Threads** (psa_barrel_threads.txt, one row per catalog barrel):
- 1/2-28 = Ø0.50 × 0.60" · 5/8-24 = Ø0.625 × 0.60"
- with NO muzzle device, a threaded barrel shows the thread stub (diagonal crests), the shoulder step and the crown
- thread sources: PSA page wording ("Muzzle Thread: 5/8-24", "Standard 1/2-28 muzzle thread"), else manufacturer specs via retailer listings, else the same model family on PSA. Three are marked `assumed` and need confirming: FN 14.7", BCM 14.5", Ballistic Advantage 6.5 Grendel 20"
- the Diamondback 16" has no PSA page link in the catalog, so it is not in the table yet

**Muzzle device**:
- its rear face sits on the barrel's thread shoulder (muzzle − thread length) and it covers the threads
- the builder must block devices whose thread doesn't match the barrel (e.g. 1/2-28 device on a 5/8-24 barrel)

**Handguard vs barrel (for the swap system)**:
- if the handguard is longer than (barrel length − 0.55" − thread length), the device would sit inside the rail
- the builder should flag that as incompatible, or require a pinned & welded device

## 11. Calibration against real PSA rifles (user-supplied references)
The proportions were checked against two complete PSA rifles. I used the full-size product photos (1920 px; strip `/cache/<hash>/` from the image URL), set each photo's scale from its handguard's known length, and lined them up at the rail's rear edge.

| Check | Guardsman-15 16" / 15" rail (photo) | IronBench render | Guardsman-15 10.3" / 9" rail (photo) | IronBench render (9.75" Sabre) |
|---|---|---|---|---|
| Flash hider starts at the rail end? | yes — ~0.25" bare barrel | yes — ~0.2" | yes — ~0.2–0.3" | yes — ~0.2" |
| Muzzle tip position | — | within 0.2" | — | within 2 px (render rail is 0.75" longer) |
| Flash hider (A2) visible length × dia | 2.1" × 0.84" | 2.05" × 0.85" | 2.0" × 0.83" | 2.05" × 0.85" |
| Rail height | same | same | same | same |
| Overall length | 32" (PSA spec, MOE PR stock) | 32.7" (M4 Classic stock) | — | — |

What I learned:
- Bolt-face-to-receiver-face offset **0.55"**: the two rifles imply 0.4" and 0.7"; their mean is 0.55", so it stays.
- The previous flash-hider fit made it ~1.0" in diameter, too fat. Muzzle devices are now sized to real dimensions (length × diameter), not by the photo's aspect.
- PSA spec lists worth pulling for every complete rifle: Barrel Length, Barrel Profile, Gas System, Muzzle Thread, Diameter at Gas Block, Gas Block Type, Muzzle Device, Handguard Type, Length (OAL), Weight.
- Both Guardsman rifles: taper profile, .750 low-profile pinned gas block, 1/2x28 threads, A2 flash hider. Carbine gas on the 10.3", mid-length on the 16".

## 12. Handguard fix (v9): open M-LOK slots
Problem: the middle row of M-LOK slots rendered as one solid black bar, and the 9.75" blue-titanium rail turned black. There were four causes:
1. The slots were made transparent, then a dark "interior" was painted behind the rail, so every opening showed black.
2. `trim()` deleted any edge-to-edge solid row as a "border line". A rail's body runs end to end, so it deleted real rail.
3. The gradient background flood leaked into light, low-saturation finishes such as blue titanium.
4. The black-tone pass ran on a colored part.

Rules now:
- Handguards are cut from PSA's full-size originals with `IB.prepHandguard()`:
  - strict cut: background = near-white only
  - `trimSafe`: only remove isolated lines
  - black-tone/desaturate only if the part is actually black
  - `openSlots`: enclosed see-through openings become real transparency with soft rims
- No dark backing behind the rail. The renderer draws what is really inside a free-float rail, so it shows through the slots the way it does in real product photos:
  - barrel nut: Ø1.25", 0.9" long at the receiver face
  - gas tube: Ø0.18", 0.58" above the bore, from the receiver to the gas block
  - low-profile gas block: at face + gas length − 0.25", always drawn
- Check other long parts (uppers, barrels, stocks) for the same `trim()` line-deletion bug when they are re-processed.

## 13. Layer-order rule (locked)
The handguard is always drawn over the barrel, barrel nut, gas tube, gas block, threads and any part of a muzzle device it overlaps.
- Anything that physically sits inside the handguard is drawn before it, so it is visible only through the slots.
- When new part types are added (gas blocks with photos, suppressors, lights, foregrips):
  - parts inside the rail go before the handguard
  - rail-mounted accessories (lights, foregrips, lasers, front sight) go after it
- The order is written at the top of `compose()` in `render/site2d.js`.
