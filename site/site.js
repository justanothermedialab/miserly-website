// Miserly's landing page: the theme, the pictures for it, the field and its diamonds, the nav's fill,
// the accordion, the tabs, the questions, and the zoom that fits the app's pieces to their column.
(function () {
	const root = document.documentElement;

	// ---- Theme: Light is the Daylight ground, Dark the Ink ground. The system's choice unless the visitor picks one
	// in the footer (kept on this device only; System forgets it). This part runs in the head, before the first paint.
	// The key is the guide's (Starlight's), so a choice made on either carries to the other.
	// DARK_PICS: the app pictures in Dark ('dark' or 'light').
	const DARK_PICS = 'dark';
	const KEY = 'starlight-theme';
	const mq = matchMedia('(prefers-color-scheme: dark)');
	let mode = 'system';
	try { const m = localStorage.getItem(KEY); if (m === 'light' || m === 'dark') mode = m; } catch (e) {}
	const isDark = () => (mode === 'system' ? mq.matches : mode === 'dark');
	function apply() {
		const d = isDark();
		root.dataset.ground = d ? 'ink' : 'day';
		root.dataset.theme = d ? DARK_PICS : 'light';
	}
	apply();
	window.Site = { apply };
	// start() runs once the page is parsed (this file loads in the head, so the theme is set before the first paint).
	// It is called at the end of this file, after every declaration below.

	function start() {
		const swap = () => document.querySelectorAll('img[data-light]').forEach(i => {
			const want = i.dataset[root.dataset.theme]; if (i.getAttribute('src') !== want) i.src = want; });
		swap();
		const mark = () => document.querySelectorAll('[data-theme-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeMode === mode)));
		const set = m => { mode = m; try { if (m === 'system') localStorage.removeItem(KEY); else localStorage.setItem(KEY, m); } catch (e) {} apply(); swap(); mark(); };
		document.querySelectorAll('[data-theme-mode]').forEach(b => b.addEventListener('click', () => set(b.dataset.themeMode)));
		mq.addEventListener('change', () => { if (mode === 'system') { apply(); swap(); } });
		mark();
		Site.swap = swap;

		fit();
		field(document.getElementById('field'));
		diamonds();

		// The nav takes the page's ground once scrolled.
		const nav = document.querySelector('.nav');
		const fill = () => nav.classList.toggle('scrolled', scrollY > 8);
		addEventListener('scroll', fill, { passive: true }); fill();

		// Section 2: two items, each showing its own pieces.
		document.querySelectorAll('[data-acc]').forEach(a => {
			const items = [...a.querySelectorAll('.ai')], pics = [...document.getElementById(a.dataset.acc).children];
			items.forEach((it, k) => it.addEventListener('click', () => {
				items.forEach((x, j) => x.setAttribute('aria-expanded', String(j === k)));
				pics.forEach((p, j) => { p.hidden = j !== k; });
			}));
		});
		// Section 4: the chart tabs (arrow keys move between them, as tabs should).
		document.querySelectorAll('[role="tablist"]').forEach(list => {
			const tabs = [...list.querySelectorAll('[role="tab"]')];
			const pick = k => tabs.forEach((t, j) => {
				const on = j === k; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
				document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
				const cap = document.getElementById(t.dataset.cap); if (cap) cap.hidden = !on;
			});
			tabs.forEach((t, k) => {
				t.addEventListener('click', () => pick(k));
				t.addEventListener('keydown', e => {
					const n = e.key === 'ArrowRight' ? k + 1 : e.key === 'ArrowLeft' ? k - 1 : null;
					if (n === null) return; e.preventDefault(); const m = (n + tabs.length) % tabs.length; pick(m); tabs[m].focus();
				});
			});
		});
		// Section 9: Expand all and Collapse all, each greyed when there is nothing for it to do.
		const qs = [...document.querySelectorAll('.qs details')];
		const [ex, co] = ['[data-q="open"]', '[data-q="close"]'].map(s => document.querySelector(s));
		const state = () => { ex.disabled = qs.every(q => q.open); co.disabled = !qs.some(q => q.open); };
		ex.addEventListener('click', () => { qs.forEach(q => { q.open = true; }); state(); });
		co.addEventListener('click', () => { qs.forEach(q => { q.open = false; }); state(); });
		qs.forEach(q => q.addEventListener('toggle', state)); state();
	}

	// ---- Fit: each element with a --fit (its drawn width in CSS px) is zoomed to its parent's width, never above 1
	// and never under its --fit-min. The pieces keep their layout and their pixels; only their size changes.
	function fit() {
		const els = [...document.querySelectorAll('.m3, .m3 .grp')];
		const run = () => els.forEach(e => {
			const w = parseFloat(getComputedStyle(e).getPropertyValue('--fit')) || 0;
			if (!w) { e.style.zoom = ''; return; }
			const min = parseFloat(getComputedStyle(e).getPropertyValue('--fit-min')) || 0;
			// The space: the element's own box when it stretches to fill its column or grid cell; its parent's when it
			// has a set width (--fit-in: parent).
			const ps = getComputedStyle(e.parentElement);
			const avail = getComputedStyle(e).getPropertyValue('--fit-in').trim() === 'parent'
				? e.parentElement.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight)
				: e.getBoundingClientRect().width;
			const z = Math.max(min, Math.min(1, avail / w));
			e.style.zoom = z === 1 ? '' : z.toFixed(4);
		});
		run();
		new ResizeObserver(run).observe(document.body);
	}

	const NS = 'http://www.w3.org/2000/svg';
	let uid = 0;
	const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v); if (parent) parent.append(e); return e; };
	function field(host) {
		if (!host) return;
		const W = 1180, H = 630, id = 'fx' + (++uid);
		const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMaxYMid slice', 'aria-hidden': 'true' }, host);
		const defs = el('defs', {}, svg);
		const pool = el('radialGradient', { id: id + 'p', cx: 0.72, cy: 0.55, r: 0.5 }, defs);
		el('stop', { offset: 0, style: 'stop-color:var(--fx-pool); stop-opacity:var(--fx-pool-a)' }, pool);
		el('stop', { offset: 1, style: 'stop-color:var(--fx-pool); stop-opacity:0' }, pool);
		el('rect', { width: W, height: H, fill: `url(#${id}p)` }, svg);
	}

	// ---- The diamonds on the ground: clusters pinned to a corner of an element, drawn in the box's own pixels with
	// 1 px lines, lit near its light, with a clear patch round every line of words. Phones get smaller clusters.
	const SHAPES = [[1070, 230, 170], [830, 330, 160], [1010, 470, 240], [720, 160, 90], [1150, 360, 120], [880, 560, 110], [940, 290, 120]];
	const PENS = { gold: ['var(--fx-gold)', 0.95, 'var(--fx-line)', 0.14], tone: ['var(--fx-line)', 0.32, 'var(--fx-line)', 0.08] };
	const BAND5 = ['var(--dk-on)', 0.24, 'var(--dk-on)', 0.06];
	const dPath = (cx, cy, r) => `M${cx},${cy - r} L${cx + r},${cy} L${cx},${cy + r} L${cx - r},${cy} Z`;
	const inFixed = e => { for (let n = e; n; n = n.parentElement) if (getComputedStyle(n).position === 'fixed') return true; return false; };
	const PHONE = '(max-width: 700px)';
	function diamonds() {
		const band = document.querySelector('.band');
		ground(band, [
			{ anchor: 'h1', k: [0, 0], d: [-4, -110], s: 0.62, pen: 'gold', media: 'not all and ' + PHONE },
			{ anchor: 'h1', k: [0, 0], d: [276, 490], s: 0.74, pen: 'gold', media: '(min-width: 1000px)' },
			{ anchor: 'h1', k: [1, 0], d: [0, 50], s: 0.3, pen: 'gold', media: PHONE }, // below the nav's Download
		], { clear: [...document.querySelectorAll('.hero, .nav')], bottom: 140, z: 1 });
		[
			[1, '.m3-s1 .p-nw', [1, 0], [-60, -90], 0.55, 'tone', 'not all and ' + PHONE],
			[1, '.m3-s1 .gb .pill', [1, 0.5], [120, 10], 0.3, 'tone', PHONE],
			[2, '.m3-s2 > div:not([hidden]) .part.lift', [1, 1], [-40, -50], 0.6, 'tone', 'not all and ' + PHONE],
			[5, '.dsplit > div:first-child', [0, 1], [180, 170], 0.55, BAND5, '(min-width: 1000px)'],
			[5, '.dsplit > div:first-child', [1, 1], [-80, 40], 0.32, BAND5, '(max-width: 999px)'],
			[6, '.m3-s6 .q-a', [0, 1], [-20, 20], 0.5, 'tone', 'not all and ' + PHONE],
			[10, '.m3-s10 .q-form', [0, 1], [10, -20], 0.7, 'gold', 'not all and ' + PHONE],
			[10, '.acts10', [1, 1], [-40, 10], 0.4, 'gold', PHONE],
		].reduce((m, [id, anchor, k, d, s, pen, media]) => { (m[id] = m[id] || []).push({ anchor, k, d, s, pen, media }); return m; }, [])
			.forEach((items, id) => { if (!items) return; const sec = document.querySelector(`[data-sec="${id}"]`); ground(sec, items, { clear: [sec], top: 90, bottom: 90 }); });
	}
	function ground(box, items, cfg) {
		let raf = 0;
		const later = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => draw(box, items, cfg)); };
		draw(box, items, cfg);
		addEventListener('resize', later); addEventListener('load', later);
		if (document.fonts) document.fonts.ready.then(later);
		box.addEventListener('load', later, true);
		new MutationObserver(later).observe(box, { attributes: true, subtree: true, attributeFilter: ['hidden'] });
	}
	function draw(box, items, cfg) {
		box.querySelectorAll(':scope > svg.fx-ground').forEach(s => s.remove());
		const b = box.getBoundingClientRect(), W = b.width, H = b.height;
		const live = items.filter(it => !it.media || matchMedia(it.media).matches);
		if (!W || !H || !live.length) return;
		const id = 'fg' + (++uid);
		const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true', class: 'fx-ground' });
		svg.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:${cfg.z || 0};pointer-events:none`;
		const defs = el('defs', {}, svg);
		const top = cfg.top || 0, bottom = cfg.bottom || 0;
		const fade = el('linearGradient', { id: id + 'f', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 0, y2: H }, defs);
		[[0, top ? '#000' : '#fff'], [top / H, '#fff'], [1 - bottom / H, '#fff'], [1, bottom ? '#000' : '#fff']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, fade));
		const blur = el('filter', { id: id + 'b', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
		el('feGaussianBlur', { stdDeviation: 8 }, blur);
		const m = el('mask', { id: id + 'm', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
		el('rect', { width: W, height: H, fill: `url(#${id}f)` }, m);
		const holes = el('g', { filter: `url(#${id}b)`, fill: '#000' }, m);
		const hole = (r, e) => { if (!r.width || !r.height) return; const p = 14, y = r.top - b.top - (inFixed(e) ? scrollY : 0);
			el('rect', { x: r.left - b.left - p, y: y - p, width: r.width + 2 * p, height: r.height + 2 * p, rx: 10 }, holes); };
		(cfg.clear || []).forEach(rootEl => [rootEl, ...rootEl.querySelectorAll('*')].forEach(e => {
			if (e.closest('.part, .pill, svg')) return;
			e.childNodes.forEach(n => { if (n.nodeType !== 3 || !n.textContent.trim()) return;
				const r = document.createRange(); r.selectNodeContents(n); [...r.getClientRects()].forEach(x => hole(x, e)); });
			if (e.matches('a, button, .brand')) hole(e.getBoundingClientRect(), e);
		}));
		live.forEach((it, i) => {
			const a = box.querySelector(it.anchor) || document.querySelector(it.anchor); if (!a) return;
			const ar = a.getBoundingClientRect(); if (!ar.width) return;
			const s = it.s, cx = ar.left - b.left + it.k[0] * ar.width + it.d[0], cy = ar.top - b.top + it.k[1] * ar.height + it.d[1];
			const [c0, o0, c1, o1] = Array.isArray(it.pen) ? it.pen : PENS[it.pen];
			const lit = el('radialGradient', { id: id + 'l' + i, gradientUnits: 'userSpaceOnUse', cx: cx - 30 * s, cy: cy - 60 * s, r: 360 * s }, defs);
			el('stop', { offset: 0, style: `stop-color:${c0}; stop-opacity:${o0}` }, lit);
			el('stop', { offset: 1, style: `stop-color:${c1}; stop-opacity:${o1}` }, lit);
			const g = el('g', { mask: `url(#${id}m)`, fill: 'none', stroke: `url(#${id}l${i})`, 'stroke-width': 1 }, svg);
			SHAPES.forEach(([x, y, r]) => el('path', { d: dPath(cx + (x - 950) * s, cy + (y - 390) * s, r * s) }, g));
		});
		box.prepend(svg);
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
