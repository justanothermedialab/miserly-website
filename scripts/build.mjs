// Builds the whole site into _site/: the landing page at /, the guide at /docs.
//
//   node scripts/build.mjs <path to a checkout of justanothermedialab/miserly>
//
// The guide's pages come from that checkout (docs/user-guide/pages/), so the site always shows the
// guide as it is in the app's repo. The Pages workflow checks the app's repo out and runs this;
// locally, point it at your own clone.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const app = process.argv[2] ?? process.env.MISERLY_DIR;
if (!app) throw new Error('Give the path to a checkout of the miserly repo.');
const pagesSrc = path.resolve(app, 'docs/user-guide/pages');
if (!fs.existsSync(path.join(pagesSrc, 'index.md'))) throw new Error(`No guide pages at ${pagesSrc}`);

const docs = path.join(root, 'docs');
const out = path.join(root, '_site');
const fresh = (d) => { fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); };

// 1. The guide's pages and the landing's font and favicon, into the docs project.
fresh(path.join(docs, 'pages'));
fs.cpSync(pagesSrc, path.join(docs, 'pages'), { recursive: true });
fresh(path.join(docs, 'public'));
fs.cpSync(path.join(root, 'site/fonts'), path.join(docs, 'public/fonts'), { recursive: true });
fs.copyFileSync(path.join(root, 'site/favicon.svg'), path.join(docs, 'public/favicon.svg'));

// 2. Build the guide.
const run = spawnSync(process.execPath, [path.join(docs, 'node_modules/astro/bin/astro.mjs'), 'build'], { cwd: docs, stdio: 'inherit' });
if (run.status !== 0) process.exit(run.status ?? 1);

// 3. Put the landing at / and the guide at /docs. GitHub Pages serves only the root 404.html.
fresh(out);
fs.cpSync(path.join(root, 'site'), out, { recursive: true });
fs.cpSync(path.join(docs, 'dist'), path.join(out, 'docs'), { recursive: true });
fs.rmSync(path.join(out, 'docs/404.html'), { force: true });

// 4. The landing links into the guide: fail the build if a page or the Docker anchor it needs is gone.
const need = { 'docs/index.html': null, 'docs/install/index.html': 'docker', 'docs/people-and-sharing/index.html': null,
	'docs/your-data/index.html': null, 'docs/switching-from-actual/index.html': null };
for (const [file, anchor] of Object.entries(need)) {
	const f = path.join(out, file);
	if (!fs.existsSync(f)) throw new Error(`The landing links to /${path.dirname(file)}/, which the guide no longer has.`);
	if (anchor && !fs.readFileSync(f, 'utf8').includes(`id="${anchor}"`)) throw new Error(`/${path.dirname(file)}/ has no #${anchor}.`);
}

// 5. sitemap.xml: the landing and every page of the guide.
const today = new Date().toISOString().slice(0, 10);
const slugs = fs.readdirSync(pagesSrc).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')).sort();
const urls = ['/', ...slugs.map((s) => (s === 'index' ? '/docs/' : `/docs/${s}/`))];
fs.writeFileSync(path.join(out, 'sitemap.xml'),
	'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
	urls.map((u) => `\t<url><loc>https://miserly.jamlab.in${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
	'\n</urlset>\n');

console.log(`_site/ built: the landing and ${slugs.length} guide pages.`);
