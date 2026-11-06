// Floating top bar: smooth in-page jumps and an active-section highlight.
import { $, $$, reduceMotion } from '../lib/dom.js';

export function initNav(lenis) {
  const links = $$('.bar__nav a');

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    if (hash.length < 2) return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();
    const toTop = hash === '#top';
    if (lenis) lenis.scrollTo(toTop ? 0 : target, { offset: toTop ? 0 : -88, duration: 1.2 });
    else target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', hash);
    if (!toTop) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });

  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((l) => l.classList.remove('is-active'));
        byId.get(entry.target.id)?.classList.add('is-active');
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  ['top', ...byId.keys()].forEach((id) => {
    const section = document.getElementById(id);
    if (section) io.observe(section);
  });
}
