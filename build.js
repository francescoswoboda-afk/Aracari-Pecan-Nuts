// Builds the Araçari site into one self-contained file.
//   npm run build
// Reads src/index.html, inlines src/styles.css and the scripts in src/js (in the
// order listed below), and replaces every "assets/<file>" reference (src/assets)
// with a data URI.
// Writes:
//   public/index.html        the live site (Cloudflare serves public/)
//   public/<file>            each file in src/root (favicon, app icons), copied as is to the site root
//   build/artifact.html      the same page without <html>/<head>/<body>, for the claude.ai preview
const fs = require('fs');
const path = require('path');

const root = __dirname;
const src = p => path.join(root, 'src', p);
const SCRIPTS = ['data.js', 'i18n.js', 'util.js', 'audio.js', 'bird.js', 'pack.js', 'hero.js', 'origin.js', 'shop.js', 'checkout.js', 'pairing.js', 'farm.js', 'quiz.js', 'main.js'];

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
const inlineAssets = text => text.replace(/assets\/([a-z0-9-]+\.(?:webp|png|jpg|svg))/g, (m, f) => {
  if (EXTERNAL.test(f)) { external.add(f); return m; }
  return dataUri(f);
});

let html = fs.readFileSync(src('index.html'), 'utf8');
const css = fs.readFileSync(src('styles.css'), 'utf8');
const js = SCRIPTS.map(f => `/* ---- ${f} ---- */\n` + fs.readFileSync(src('js/' + f), 'utf8')).join('\n');

html = html.replace('<!--STYLES-->', () => `<style>\n${css}\n</style>`);
html = html.replace('<!--SCRIPTS-->', () => `<script>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>`);
html = inlineAssets(html);

fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public', 'index.html'), html);
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
