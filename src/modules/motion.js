// Entrance and scroll animations: the intro bento assembles, headings rise word by word,
// tiles fade up as they scroll in, counters count and skill bars fill.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { $, $$ } from '../lib/dom.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

function countUp(el) {
  const end = Number(el.dataset.count);
  if (!Number.isFinite(end)) return;
  const state = { v: 0 };
  el.textContent = '0';
  gsap.to(state, {
    v: end,
    duration: 1.6,
    ease: 'power3.out',
    onUpdate: () => {
      el.textContent = String(Math.round(state.v));
    },
  });
}

function intro() {
  const tiles = $$('[data-in]');
  gsap.set(tiles, { opacity: 1 });
  gsap.from(tiles, {
    y: 40,
    scale: 0.96,
    opacity: 0,
    duration: 0.9,
    ease: 'expo.out',
    stagger: { each: 0.06, from: 'start' },
    clearProps: 'transform,opacity',
  });
  $$('.t-stats [data-count]').forEach((el) => countUp(el));
}

function titles() {
  $$('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'words',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.words, {
          yPercent: 60,
          opacity: 0,
          duration: 0.8,
          ease: 'expo.out',
          stagger: 0.045,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      },
    });
  });
}

function reveals() {
  const items = [...$$('[data-reveal]'), ...$$('.ptile')];
  gsap.set(items, { opacity: 0, y: 30 });
  ScrollTrigger.batch(items, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, overwrite: true, clearProps: 'transform,opacity' }),
  });
}

function skillBars() {
  const bars = $$('.skillbars i');
  if (!bars.length) return;
  bars.forEach((b) => b.style.setProperty('--fill', '0'));
  ScrollTrigger.create({
    trigger: '.skillbars',
    start: 'top 88%',
    once: true,
    onEnter: () => bars.forEach((b) => b.style.setProperty('--fill', '1')),
  });
}

export function initMotion({ reduce }) {
  if (reduce) return;
  intro();
  titles();
  reveals();
  skillBars();

  let pending;
  document.addEventListener('layout:changed', () => {
    clearTimeout(pending);
    pending = setTimeout(() => ScrollTrigger.refresh(), 150);
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
