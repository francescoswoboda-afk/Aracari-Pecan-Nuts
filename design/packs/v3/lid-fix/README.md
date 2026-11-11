# Tube lid fix (October 2026)

**Why the lid looked wrong on the site:** the copper lid was never drawn. In `src/js/pack.js` the
lid is an `<svg class="lid2d" hidden>`, and `paint()` did `lidSvg.hidden = !isTube`. `.hidden` is
an HTML-only property, so on an `<svg>` it never removes the attribute, and
`.pack3d [hidden] { display: none !important }` kept the lid hidden. The site only showed the
thin copper band painted on the label strips.

**What this changes** (`tube-lid.patch`, applies to `src/js/pack.js` and `src/styles.css`):
1. `paint()`: `lidSvg.toggleAttribute('hidden', !isTube)`, so the lid shows.
2. The lid now matches the owner's 3D model:
   - It rises 4.5% of the label height above the label and slips 3% over it.
   - It is 2.7% wider than the tube, with a rolled bead at the bottom edge.
   - It has copper shading mapped around the cylinder, a highlight on the top rim, and a domed cap with a pressed ring when you look down on it.
   - The constants are `LID_UP`, `LID_DOWN`, `LID_R`, `BEAD_R`, `BEAD_H` and `CAP_RING` at the top of `pack.js`.
3. The lid shape is the visible front band only. The old convex hull would have covered the lid's
   open bottom, where the label shows, as soon as the lid was visible.
4. "Seen from above" for the cap is now tested on the projected circle itself.
5. The label is now 0.88 of the box (it was 0.9), so the taller lid fits.
6. In `styles.css`, the copper band on the strips is 2.6% (it was 5%) and the lid shadow starts at 3% (it was 6%), to match the new lid.

`pack.js` is the full patched file, for reference. `before-after.png` shows the site before
(left), then after: at rest, tilted down and tilted up.

Tested: built page in Chromium, tube format, no console errors.
