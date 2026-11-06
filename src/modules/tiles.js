// Small living tiles: the local clock, the light/dark switch, the tool marquee,
// copy-email buttons, click-to-load YouTube and the cursor spotlight on every grid.
import { $, $$, esc, toast } from '../lib/dom.js';

function initClock() {
  const out = $('[data-clock]');
  if (!out) return;
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' });
  const tick = () => {
    out.textContent = fmt.format(new Date());
  };
  tick();
  setInterval(tick, 15000);
}

function initTheme() {
  const btn = $('[data-theme-toggle]');
  const label = $('[data-theme-label]');
  if (!btn) return;
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : system.matches);
  const sync = () => {
    const dark = isDark();
    btn.setAttribute('aria-checked', String(dark));
    label.textContent = dark ? 'Dark mode on' : 'Dark mode off';
  };
  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('jm-theme', next);
    } catch {
      /* private mode: the choice just won't be remembered */
    }
    sync();
  });
  system.addEventListener('change', sync);
  sync();
}

function initMarquee() {
  $$('[data-marquee]').forEach((row) => {
    const items = row.textContent.split('|').map((s) => s.trim()).filter(Boolean);
    const chips = items.map((t) => `<span>${esc(t)}</span>`).join('');
    row.innerHTML = chips + chips; // doubled so the loop is seamless
  });
}

function initCopy() {
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        toast('Email copied');
      } catch {
        window.location.href = `mailto:${btn.dataset.copy}`;
      }
    });
  });
}

function initYouTube() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-yt]');
    if (!btn) return;
    const frame = document.createElement('iframe');
    frame.className = 'yt-frame';
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(btn.dataset.yt)}?autoplay=1&rel=0&playsinline=1`;
    frame.title = 'DeuceTennis showcase video';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    btn.replaceWith(frame);
    frame.focus();
  });
}

// A soft light follows the cursor across every bento grid (see .tile::before/::after in CSS).
function initSpotlight() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('[data-spot]').forEach((grid) => {
    let frame = 0;
    let last = null;
    grid.addEventListener('pointermove', (e) => {
      last = e;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        $$('.tile', grid).forEach((tile) => {
          const r = tile.getBoundingClientRect();
          tile.style.setProperty('--x', `${last.clientX - r.left}px`);
          tile.style.setProperty('--y', `${last.clientY - r.top}px`);
        });
      });
    });
  });
}

export function initTiles() {
  initClock();
  initTheme();
  initMarquee();
  initCopy();
  initYouTube();
  initSpotlight();
}
