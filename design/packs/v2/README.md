# Araçari packaging v2 (October 2026): update brief for the website

This folder holds the new pack designs. They replace the 100 g "perched / flying" packs in `design/packs/core` and `design/packs/concept`, which stay in the repo for reference. When this brief and `design/BRAND.md` disagree, this brief wins; update `BRAND.md` to match.

Everything in `CLAUDE.md` still applies: keep `[TBD]` / `[VERIFY]` placeholders visible, no invented facts, no prices while `DATA.pricesConfirmed` is false, specific environmental claims only, rebuild with `npm run build` after editing `src/`.

## What changed

| | Old (BRAND.md) | New (v2) |
|---|---|---|
| Formats | 100 g pouch | **250 g stand-up pouch** and **500 g paper tube** |
| Pack design | toucan perched or flying, big toucan | one design: pecan pattern background, smaller perched toucan, bigger real-looking pecans |
| Strip text | "EL PORVENIR FARMS · BRAZIL" | **"SELECTED BRAZILIAN PECANS"** (pecans come from several farmers, not only El Porvenir) |
| Handwritten notes | "slow roasted …" | **"slow roasted" is gone everywhere** (the nuts are not roasted on the farm). New notes are in the table below |
| Pack back | none | full back: story, ingredients, allergens, nutrition table, QR card, barcode, recycling note |
| Flavours | 4 core + 4 concept | all **8 flavours are now designed** (see the status note below) |

## Files

```
design/packs/v2/
  README.md                 this brief
  flavours-v2.json          the 8 flavours: colours, notes, taglines, allergens, image paths, both formats
  overview-pouch-250g.jpg   every pouch, front and back, in one picture (reference only)
  overview-tube-500g.jpg    every tube label, unrolled (reference only)
  <slug>/aracari-<slug>-pouch-250g-front.png | .webp | -600.webp   pouch front, transparent cut-out
  <slug>/aracari-<slug>-pouch-250g-back.png  | .webp | -600.webp   pouch back, transparent cut-out
  <slug>/aracari-<slug>-tube-500g-front.png  | .webp | -600.webp   tube mockup, transparent cut-out
  <slug>/aracari-<slug>-tube-500g-label-flat.jpg                    tube label unrolled (front half | back half)
```
Slugs: `salted-caramel`, `chocolate`, `chocolate-sea-salt`, `caramel`, `doce-de-leite`, `cinnamon-sugar`, `coffee-chocolate`, `honey-sea-salt`.

On the web use the `-600.webp` files for cards and the `.webp` (1000 px) for big views. Copy the ones you use into `src/assets/` (the build inlines everything, so keep the page light: don't inline the PNG masters).

The images are digital mockups (the pecans are photo composites), not product photos.

## Flavours

| Flavour | Pack body | Handwritten note | Back tagline |
|---|---|---|---|
| Salted caramel | `#dd6c22` orange | sweet, salty & crunchy | SWEET · SALTY · CRUNCHY |
| Chocolate | `#4a221a` dark brown | rich dark chocolate | RICH · DARK · CRUNCHY |
| Chocolate & sea salt | `#1f5a5c` deep teal | dark chocolate, a pinch of salt | DARK · SALTY · CRUNCHY |
| Caramel | `#e6d2a8` cream | golden caramel, extra crunchy | GOLDEN · SWEET · CRUNCHY |
| Doce de leite | `#c08243` caramel brown | creamy doce de leite | CREAMY · SWEET · CRUNCHY |
| Cinnamon sugar | `#93301f` cinnamon red | warm cinnamon, sugar crust | WARM · SPICED · CRUNCHY |
| Coffee & chocolate | `#33201a` espresso | coffee kick, dark chocolate | BOLD · DARK · CRUNCHY |
| Honey & sea salt | `#e0a00c` honey gold | golden honey, a pinch of salt | GOLDEN · SALTY · CRUNCHY |

Full colours (strip, band, text) are in `flavours-v2.json`.

**Status [VERIFY]:** the owner calls these "the 8 flavours we have", but recipes are not final for any of them. Ask the owner whether the site should show all 8 as the range or keep the last four in a "coming soon" section. Until then don't present any flavour as for sale.

## Formats (for product pages and an "our packaging" section)

**250 g stand-up pouch**: 150 × 220 mm, 80 mm bottom gusset, holds about 0.9 L.
- Mono-PE film with a thin EVOH oxygen barrier, matte varnish, PE press-to-close zip.
- Nitrogen flushed, under 2% oxygen left inside.
- Disposal: plastic bin (PMD) in the Netherlands and Belgium.

**500 g paper tube**: Ø105 × 210 mm, holds about 1.6 L.
- Wound paperboard (90%+ paper) with a barrier liner, peel-off membrane, metal slip lid.
- Nitrogen flushed.
- Disposal: tube in the paper bin, lid in the PMD bin, membrane depends on the supplier [VERIFY].

Layers of the pouch, outside to inside: matte varnish (1–2 µm), MDO-PE print film (20–25 µm), reverse-printed ink, adhesive, PE (≈40 µm), EVOH (3–5 µm), PE sealant (≈40 µm). These are typical values; the supplier is not chosen yet [VERIFY].

Interactive 3D model of both packs, all 8 flavours, with measurements and the layers (for the owner's reference; link out, don't embed): https://claude.ai/artifact/6Tv8PsrZekcCUrxpVY7qbX

## Claims: what the site may and may not say

- OK (once the supplier confirms): "Recyclable pouch – put it in the plastic bin", "Tube made of 90%+ paper – paper bin", "Packed with nitrogen so the pecans stay fresh longer".
- Not OK: "sustainable", "eco-friendly", "green", "plastic-free" for the pouch, "compostable", "organic", "bio", "slow roasted", "from our farm".
- Donations: the QR on the back goes to Araçari's own page, where customers can support rainforest projects directly. Araçari itself makes **no donation promise** until it breaks even. Never write "we donate" or "% of every pack".
- Bio-based PE (from Brazilian sugarcane) or recycled content in the pouch is an option being priced, not a fact yet.

## Back-of-pack placeholders

Ingredients and percentages, nutrition values, the company name and address, website, barcode and QR link are placeholders on the packs. Treat them as `[TBD]` on the site too.

## Suggested work for the site

1. Replace the pack images on product cards and the hero with the v2 pouch fronts (and add the tube where formats are shown).
2. Change pack size from 100 g to the two formats (250 g pouch, 500 g tube) in `src/js/data.js`, keeping prices as placeholders.
3. Update flavour data (names, notes, colours) from `flavours-v2.json`; remove every "slow roasted" and any "El Porvenir Farms · Brazil" pack text.
4. Show the back of the pack (front/back toggle or hover) on product pages.
5. Add a short "Our packaging" section with the two formats, how to dispose of them, and the honest claims above.
6. Update `design/BRAND.md` and `design/flavours.json` (or point them to v2), then `npm run build`, check locally with `npm run start`, and only deploy when the owner says so.
