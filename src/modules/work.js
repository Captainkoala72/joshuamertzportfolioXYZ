// The Work bento: one tile per project, plus filter buttons that re-flow the grid with GSAP Flip.
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { projects, FILTERS } from '../data/projects.js';
import { $, $$, esc, imgTag, reduceMotion, layoutChanged } from '../lib/dom.js';

gsap.registerPlugin(Flip);

const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';

function media(p) {
  if (p.videos) {
    return `<span class="ptile__media ptile__media--video"><img src="${esc(p.poster)}" width="540" height="960" alt="" loading="lazy" decoding="async"><span class="ptile__play">${PLAY}</span></span>`;
  }
  const [key, alt] = p.images[0];
  const cls = ['ptile__media'];
  if (p.phone) cls.push('ptile__media--phone');
  if (key.startsWith('uhc/')) cls.push('ptile__media--light');
  const sizes =
    p.size === 'xl'
      ? '(max-width: 600px) 100vw, 640px'
      : p.phone
        ? '260px'
        : '(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 340px';
  return `<span class="${cls.join(' ')}">${imgTag(key, alt, { sizes })}</span>`;
}

function tile(p) {
  return `<button class="tile ptile size-${esc(p.size)}" type="button" data-open="${esc(p.id)}" data-tone="${esc(p.tone)}" data-cats="${esc(p.cats.join(' '))}" aria-haspopup="dialog" aria-label="${esc(p.title)}: ${esc(p.tagline)}">
    ${media(p)}
    <span class="ptile__foot">
      <span class="ptile__text">
        <span class="ptile__kind">${esc(p.kind)}</span>
        <span class="ptile__title">${esc(p.title)}</span>
        <span class="ptile__line">${esc(p.tagline)}</span>
      </span>
      <span class="arrow" aria-hidden="true">↗</span>
    </span>
  </button>`;
}

export function initWork() {
  const grid = $('[data-work]');
  const bar = $('[data-filters]');
  if (!grid || !bar) return;
  grid.innerHTML = projects.map(tile).join('');

  const count = (key) => (key === 'all' ? projects.length : projects.filter((p) => p.cats.includes(key)).length);
  bar.innerHTML = FILTERS.map(
    ([key, label], i) =>
      `<button class="filter" type="button" data-filter="${key}" aria-pressed="${i === 0}">${esc(label)}<span>${count(key)}</span></button>`,
  ).join('');

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn || btn.getAttribute('aria-pressed') === 'true') return;
    const key = btn.dataset.filter;
    $$('[data-filter]', bar).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

    const tiles = $$('.ptile', grid);
    const state = Flip.getState(tiles);
    tiles.forEach((t) => t.classList.toggle('is-hidden', !(key === 'all' || t.dataset.cats.split(' ').includes(key))));

    if (reduceMotion()) {
      layoutChanged();
      return;
    }
    Flip.from(state, {
      duration: 0.6,
      ease: 'power3.inOut',
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.45, delay: 0.15 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.3 }),
      onComplete: layoutChanged,
    });
  });
}
