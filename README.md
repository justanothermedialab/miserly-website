# miserly.jamlab.in

The website of [Miserly](https://github.com/justanothermedialab/miserly), an expense and net worth
tracker for Indian accounts: the landing page at `/` and the user guide at `/docs`.

The guide's text is not kept here. It lives in the app's repo, in
[`docs/user-guide/pages/`](https://github.com/justanothermedialab/miserly/tree/main/docs/user-guide/pages),
next to the code it describes, and this site pulls it at build time. To fix or improve the guide,
open a pull request there.

| Folder | What it is |
|---|---|
| `site/` | The landing page: plain HTML, CSS and JavaScript, no build step. Also `404.html`, `robots.txt`, the favicon and the social card (`img/og.png`). |
| `docs/` | The guide's site ([Starlight](https://starlight.astro.build/)), styled to match the landing page (`src/styles/miserly.css`). |
| `scripts/build.mjs` | Builds both into `_site/`: copies the guide's pages in, builds the guide, puts the landing at `/` and the guide at `/docs`, writes `sitemap.xml`, and fails if a guide page the landing links to has gone. |
| `.github/workflows/pages.yml` | Builds and publishes to GitHub Pages on every push to `main`, by hand, and once a day. |

## Build it locally

Needs Node 24 and a clone of the app's repo.

```sh
cd docs && npm ci && cd ..
node scripts/build.mjs ../miserly     # the path to your clone of justanothermedialab/miserly
npx serve _site                       # or any static server; open http://localhost:3000
```

Open `_site` through a server, not as files: the pages link to `/docs/...` from the site's root.

## Light and Dark

Both pages follow the system's theme. A choice made in the landing's footer or the guide's header is
kept in the browser under one key (`starlight-theme`), so it carries from one to the other.

© 2026 JAM Lab. The guide's text is part of Miserly, under its
[AGPL-3.0](https://github.com/justanothermedialab/miserly/blob/main/LICENSE). Inter is under the
SIL Open Font License (`site/fonts/OFL-inter.txt`); the icons' licence is in `site/img/icons-LICENSE.txt`.
