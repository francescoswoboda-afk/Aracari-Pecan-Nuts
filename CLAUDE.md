# Araçari

Website and shop for Araçari, a father-and-son business importing flavoured Brazilian pecans from El Porvenir Farms (Santa Cruz do Sul, Brazil) to the Netherlands.

## Brand

The brand kit is in `design/`. Read `design/BRAND.md` before changing anything visual or any copy. `design/flavours.json` holds the pack colours; the pack images, wordmark and toucan illustrations are in `design/packs`, `design/logo` and `design/illustrations`.

- Text in `[TBD]` or `[VERIFY]` is a placeholder the owners still have to supply or check. Keep it visible, and do not invent facts to fill it.
- El Porvenir is the family's own farm, but NOT every pecan comes from it; they also work with partner farms ([TBD] which) that follow the same practices: 20% native forest kept as a reserve, protected streams, no pesticides (all [VERIFY]). Never write copy that implies all nuts come from El Porvenir (no "pecans from El Porvenir Farms", no El Porvenir as producer). Farm facts describe that farm only.
- El Porvenir's website (https://www.elporvenir.farm/) is unfinished and most facts on it are not accurate yet (per the owner, Oct 2026). The Araçari site links to it (owner's choice), but do not use it as a source of facts; anything taken from it is marked [VERIFY].
- No fake reviews, awards, certifications, stock counts or health claims. Environmental claims must be specific and provable (EU Directive 2024/825); no generic "eco-friendly" or "sustainable" wording. Never use "organic", "bio" or "eco" for the products until an EU organic certificate is in place (Reg. (EU) 2018/848).
- Prices use a comma: `€5,95`. Prices are placeholders while `DATA.pricesConfirmed` is `false`.
- Copy is in English with a Dutch toggle; Dutch strings live in `src/js/i18n.js`.

## Code

- `src/` is the source: `index.html`, `styles.css`, `js/` (loaded in the order listed in `build.js`) `assets/` (600 px pack webps, wordmarks, icons) and `root/` (favicon.ico and app icons, copied as is to the site root so Google can fetch them; the source is `design/logo/aracari-icon.svg`).
- `src/js/data.js` holds every flavour, product, bundle, price, shipping rule and pairing. Change shop data there only.
- `npm run build` inlines everything into `public/index.html`, except the large full-resolution tube labels (`*-tube-label.webp`), which it copies to `public/assets/` so they load only when a tube is shown. Always rebuild after editing `src/`, and commit the rebuilt files.
- `docs/DECISIONES.md` (Spanish) explains the design decisions; `docs/type-study/` is the typography study.

## Site

- Only `public/` is deployed: a Cloudflare Worker named `7sentidos` serves it as static assets, set in `wrangler.jsonc`. `src/`, `design/` and `docs/` are never published.
- Live at https://aracari.nl (custom domain on the Worker; also https://7sentidos.francesco-swoboda.workers.dev). The page's canonical URL is https://aracari.nl/.
- Pushing to GitHub does NOT deploy: Cloudflare is not connected to the repo. Deploy with `npm run deploy` (builds, then uploads with wrangler; needs `npx wrangler login` once per machine). After deploying, open the live URL and check it changed.
- Run it locally with `npm run start` (http://localhost:3000).

## New packaging (October 2026)

The pack design changed. Read `design/packs/v3/README.md` before touching product images, formats or flavour copy: it has the final 250 g pouch and 500 g tube for all 8 flavours (front, back and tube images), `flavours-v3.json`, and the claim rules. Where it disagrees with `design/BRAND.md` (100 g pack, "slow roasted" notes, "El Porvenir Farms · Brazil" strip text), the v3 brief wins. `design/packs/v2`, `core` and `concept` are kept for reference only.
