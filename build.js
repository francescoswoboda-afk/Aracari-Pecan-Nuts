// Builds the Araçari site into one self-contained file.
//   npm run build
// Reads src/index.html, inlines src/styles.css and the scripts in src/js (in the
// order listed below), and replaces every "assets/<file>" reference (src/assets)
// with a data URI.
// Writes:
//   public/index.html        the live site (Cloudflare serves public/)
//   public/nl/index.html     the same page in Dutch (Dutch strings from src/js/i18n.js written into the HTML)
//   public/contact/, public/nl/contact/   company details pages, from src/page.html and PAGES in i18n.js
//   public/sitemap.xml, public/robots.txt
//   public/<file>            each file in src/root (favicon, app icons), copied as is to the site root
//   build/artifact.html      the same page without <html>/<head>/<body>, for the claude.ai preview
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = __dirname;
const src = p => path.join(root, 'src', p);
const SCRIPTS = ['data.js', 'i18n.js', 'util.js', 'bird.js', 'pack.js', 'hero.js', 'origin.js', 'shop.js', 'checkout.js', 'pairing.js', 'farm.js', 'quiz.js', 'main.js'];

const mime = { '.webp': 'image/webp', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const assetCache = {};
function dataUri(file) {
  if (!assetCache[file]) {
    const full = path.join(root, 'src', 'assets', file);
    const buf = fs.readFileSync(full);
    assetCache[file] = `data:${mime[path.extname(file)]};base64,${buf.toString('base64')}`;
  }
  return assetCache[file];
}
// Large images that are only needed once something is on screen (the full-resolution tube labels)
// stay separate files in public/assets/ instead of being inlined, so the page itself stays light.
// The claude.ai preview (build/artifact.html) cannot load these.
const EXTERNAL = /-tube-label\.webp$/;
const external = new Set();
// external files get an absolute path, so they also load from /nl/ and the other sub-pages
const inlineAssets = text => text.replace(/assets\/([a-z0-9-]+\.(?:webp|png|jpg|svg))/g, (m, f) => {
  if (EXTERNAL.test(f)) { external.add(f); return '/' + m; }
  return dataUri(f);
});

const SITE = 'https://aracari.nl';
const write = (rel, text) => { const out = path.join(root, 'public', rel); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, text); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const tbd = s => s.replace(/\[(TBD|VERIFY)\]/g, '<span class="tbd">[$1]</span>');

// Dutch strings and the separate pages, read from i18n.js so every translation stays in one file
const { NL, PAGES } = vm.runInNewContext(fs.readFileSync(src('js/i18n.js'), 'utf8') + '\n;({ NL, PAGES })', {});

const css = fs.readFileSync(src('styles.css'), 'utf8');
const js = SCRIPTS.map(f => `/* ---- ${f} ---- */\n` + fs.readFileSync(src('js/' + f), 'utf8')).join('\n');
const assemble = page => inlineAssets(page
  .replace('<!--STYLES-->', () => `<style>\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>`));

// Swap the inner HTML of every [data-i18n] element for its Dutch string, and return the English
// originals too (the Dutch page needs them for its EN/NL fallback). Nested tags of the same name are counted.
function translate(page, dict) {
  const en = {}, open = /<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>/g;
  let out = '', from = 0, m;
  while ((m = open.exec(page))) {
    const [tag, key] = [m[1], m[2]], start = m.index + m[0].length;
    const tags = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi'); tags.lastIndex = start;
    let depth = 1, t, end = -1;
    while ((t = tags.exec(page))) { if (t[1]) { if (--depth === 0) { end = t.index; break; } } else depth++; }
    if (end < 0) throw new Error(`no closing </${tag}> for data-i18n="${key}"`);
    en[key] = page.slice(start, end);
    out += page.slice(from, start) + (dict[key] != null ? dict[key] : en[key]);
    from = end; open.lastIndex = end;
  }
  return { page: out + page.slice(from), en };
}
// replace exactly one occurrence, so a changed index.html fails the build instead of silently shipping English
function swap(page, from, to) {
  if (page.split(from).length !== 2) throw new Error('build: expected exactly one "' + from + '" in index.html');
  return page.replace(from, () => to);
}

const source = fs.readFileSync(src('index.html'), 'utf8');
const html = assemble(source);
write('index.html', html);

// /nl/: the same page with Dutch in the HTML, so search engines see it
{
  const nl = PAGES.nl.index, { page, en } = translate(source, NL);
  let p = page;
  p = swap(p, '<html lang="en" data-lang="en">', '<html lang="nl" data-lang="nl">');
  p = p.replace(/<title>[^<]*<\/title>/, `<title>${esc(nl.title)}</title>`);
  p = p.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(nl.description)}">`);
  p = p.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(nl.title)}">`);
  p = p.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(nl.ogDescription)}">`);
  p = swap(p, `<link rel="canonical" href="${SITE}/">`, `<link rel="canonical" href="${SITE}/nl/">`);
  p = swap(p, `<meta property="og:url" content="${SITE}/">`, `<meta property="og:url" content="${SITE}/nl/">`);
  p = swap(p, '<meta property="og:locale" content="en_GB">', '<meta property="og:locale" content="nl_NL">');
  p = swap(p, 'data-lang="en" aria-current="true"', 'data-lang="en" aria-current="false"');
  p = swap(p, 'data-lang="nl" aria-current="false"', 'data-lang="nl" aria-current="true"');
  p = swap(p, 'href="/contact/" id="contactLink"', 'href="/nl/contact/" id="contactLink"');
  p = swap(p, '<!--SCRIPTS-->', `<script type="application/json" id="i18nEn">${JSON.stringify(en).replace(/</g, '\\u003c')}</script>\n<!--SCRIPTS-->`);
  write('nl/index.html', assemble(p));
}

// Small separate pages (contact), one per language, from src/page.html
const template = fs.readFileSync(src('page.html'), 'utf8').replace(/<!--[\s\S]*?-->\n/, '');
const LANGS = ['en', 'nl'];
const alternates = pathOf => LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${SITE}${pathOf(l)}">`).join('\n')
  + `\n<link rel="alternate" hreflang="x-default" href="${SITE}${pathOf('en')}">`;
const sitemap = [{ path: l => PAGES[l].home }];
for (const name of ['contact']) {
  const pathOf = l => PAGES[l][name].path;
  sitemap.push({ path: pathOf });
  for (const l of LANGS) {
    const P = PAGES[l], c = P[name];
    const sections = c.sections.map(s => `<section>\n    <h2>${s.h}</h2>\n    ${s.rows
      ? `<dl>${s.rows.map(([k, v]) => `<dt>${k}</dt><dd>${tbd(v)}</dd>`).join('')}</dl>`
      : `<p>${tbd(s.p)}</p>`}\n  </section>`).join('\n  ');
    const langLinks = LANGS.map(x => `<a href="${pathOf(x)}" hreflang="${x}" lang="${x}"${x === l ? ' aria-current="page"' : ''}>${x.toUpperCase()}</a>`).join('');
    const vars = { lang: l, title: esc(c.title), description: esc(c.description), canonical: SITE + c.path, alternates: alternates(pathOf),
      home: P.home, back: P.back, langLabel: P.langLabel, langLinks, h1: c.h1, lead: tbd(c.lead), sections };
    write(c.path.replace(/^\//, '') + 'index.html', inlineAssets(template.replace(/\{\{(\w+)\}\}/g, (m, k) => {
      if (vars[k] == null) throw new Error('page.html: no value for ' + m);
      return vars[k];
    })));
  }
}

// sitemap.xml with the EN/NL pairs, and robots.txt pointing to it
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemap.flatMap(e => LANGS.map(l => `  <url>
    <loc>${SITE}${e.path(l)}</loc>
${LANGS.map(x => `    <xhtml:link rel="alternate" hreflang="${x}" href="${SITE}${e.path(x)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${e.path('en')}"/>
  </url>`)).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
// copy the external images, and remove ones the page no longer uses
const pubAssets = path.join(root, 'public', 'assets');
fs.mkdirSync(pubAssets, { recursive: true });
for (const f of fs.readdirSync(pubAssets)) if (!external.has(f)) fs.rmSync(path.join(pubAssets, f));
for (const f of external) fs.copyFileSync(path.join(root, 'src', 'assets', f), path.join(pubAssets, f));
// favicon and app icons stay real files at the site root, so search engines can fetch them
for (const f of fs.readdirSync(src('root'))) fs.copyFileSync(src('root/' + f), path.join(root, 'public', f));

// Artifact version: the host adds its own doctype, html, head and body.
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta charset[^>]*>\s*/, '').replace(/<meta name="viewport"[^>]*>\s*/, '');
const body = html.match(/<body([^>]*)>([\s\S]*)<\/body>/);
fs.mkdirSync(path.join(root, 'build'), { recursive: true });
fs.writeFileSync(path.join(root, 'build', 'artifact.html'), head.trim() + '\n' + body[2].trim() + '\n');

const kb = n => (n / 1024).toFixed(0) + ' KB';
console.log('public/index.html', kb(Buffer.byteLength(html)));
