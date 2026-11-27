// The guide at miserly.jamlab.in/docs (Starlight). The pages are not kept here: they live in the
// app's repo (justanothermedialab/miserly, docs/user-guide/pages/), versioned with each release,
// and scripts/build.mjs copies them into pages/ before the build. Each page has a title and a
// sidebar order in its front matter, and links between pages are written as `x.md` or
// `x.md#heading` (they also work on GitHub and in the app's offline guide), which the plugin
// below turns into this site's addresses.
import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { satteri } from '@astrojs/markdown-satteri';

const site = 'https://miserly.jamlab.in';
const base = '/docs';
const repo = 'https://github.com/justanothermedialab/miserly';

if (!fs.existsSync('pages/index.md')) {
	throw new Error('pages/ is empty: run `node scripts/build.mjs <path to the miserly repo>` from the repo root.');
}

/** The sidebar, from each page's front matter (`title`, `sidebar: label, order`). Listed here
 *  because Starlight's own list would nest the pages under a "pages" heading. */
const sidebar = fs
	.readdirSync('pages')
	.filter((f) => f.endsWith('.md'))
	.map((f) => {
		const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(`pages/${f}`, 'utf8'))?.[1] ?? '';
		const field = (k) => new RegExp(`^[ \\t]*${k}:[ \\t]*(\\S.*?)[ \\t]*$`, 'm').exec(front)?.[1];
		const slug = f.replace(/\.md$/, '');
		return { order: Number(field('order')), label: field('label') ?? field('title'), slug: slug === 'index' ? '' : slug };
	})
	.filter((p) => !Number.isNaN(p.order)) // a page without a sidebar order (Privacy) is built but not listed
	.sort((a, b) => a.order - b.order)
	.map(({ label, slug }) => ({ label, slug }));

/** `x.md#y` -> `/docs/x/#y`; `index.md` -> `/docs/`. Leaves every other link alone. */
const pageLinks = {
	name: 'guide-page-links',
	link(node, ctx) {
		const m = /^([\w-]+)\.md(#[\w-]+)?$/.exec(node.url);
		if (m) ctx.setProperty(node, 'url', `${base}/${m[1] === 'index' ? '' : `${m[1]}/`}${m[2] ?? ''}`);
	},
};

export default defineConfig({
	site,
	base,
	trailingSlash: 'always',
	// The guide's pictures are screenshots of the app: lossless WebP keeps their small text sharp.
	image: { service: { entrypoint: 'astro/assets/services/sharp', config: { webp: { lossless: true } } } },
	markdown: { processor: satteri({ mdastPlugins: [pageLinks] }) },
	integrations: [
		starlight({
			title: 'Miserly Guide',
			description:
				'How to install and use Miserly, a free, open-source expense and net worth tracker.',
			logo: { src: './src/assets/mark.svg', alt: '' },
			favicon: '/favicon.svg',
			sidebar,
			social: [{ icon: 'github', label: 'Miserly on GitHub', href: repo }],
			editLink: { baseUrl: `${repo}/edit/main/docs/user-guide/` },
			customCss: ['./src/styles/miserly.css'],
			components: {
				SocialIcons: './src/components/SocialIcons.astro',
				Footer: './src/components/Footer.astro',
				SiteTitle: './src/components/SiteTitle.astro',
			},
			head: [
				// The landing's raster icons (served from the site's root): Google wants a multiple of 48 px.
				{ tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '48x48' } },
				{ tag: 'link', attrs: { rel: 'icon', href: '/icon-192.png', type: 'image/png', sizes: '192x192' } },
				{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
				{ tag: 'meta', attrs: { property: 'og:image', content: `${site}/img/og.png` } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: `${site}/img/og.png` } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#eef0f2', media: '(prefers-color-scheme: light)' } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#0b0b0b', media: '(prefers-color-scheme: dark)' } },
			],
			expressiveCode: {
				themes: ['github-dark', 'github-light'],
				styleOverrides: {
					borderRadius: '8px',
					borderColor: 'var(--mw-hair)',
					codeBackground: 'var(--mw-card)',
					frames: {
						editorBackground: 'var(--mw-card)',
						terminalBackground: 'var(--mw-card)',
						terminalTitlebarBackground: 'var(--mw-tint)',
						editorTabBarBackground: 'var(--mw-tint)',
						frameBoxShadowCssValue: 'none',
					},
				},
			},
		}),
	],
});
