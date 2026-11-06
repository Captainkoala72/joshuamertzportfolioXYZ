// Project details: a <dialog> that grows out of the tile you clicked (a FLIP animation)
// and shrinks back into it when closed. Handles screenshots, the AI videos, the
// DeuceTennis YouTube showcase and the Minecraft UHC Reddit feed.
import { gsap } from 'gsap';
import { projects } from '../data/projects.js';
import { eras } from '../data/uhc.js';
import { uhcLinks } from '../data/uhc-links.js';
import { $, $$, esc, imgSrc, reduceMotion } from '../lib/dom.js';

const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';

function linkLabel(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const slug = parts[2] === 'comments' ? parts[4] || '' : '';
    const words = slug.split('_').filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
    return words.join(' ') || `${u.hostname}${u.pathname}`;
  } catch {
    return 'Match thread';
  }
}

export function initSheet(lenis, lightbox) {
  const dlg = $('[data-sheet]');
  if (!dlg) return;
  const inner = $('.sheet__inner', dlg);
  const el = {
    media: $('[data-sheet-media]', dlg),
    kind: $('[data-sheet-kind]', dlg),
    title: $('[data-sheet-title]', dlg),
    tag: $('[data-sheet-tag]', dlg),
    body: $('[data-sheet-body]', dlg),
    count: $('[data-sheet-count]', dlg),
  };
  let index = 0;
  let opener = null;
  let busy = false;

  /* ---------- media ---------- */
  const showImage = (p, k) => {
    const [key, caption] = p.images[k];
    const stage = $('.sheet__stage', el.media);
    stage.innerHTML = `<img src="${imgSrc(key, 'full')}" alt="${esc(caption)}" data-zoom="${k}">`;
    $('.sheet__cap', el.media).textContent = caption;
    $$('.sheet__thumbs button', el.media).forEach((b, n) => b.setAttribute('aria-current', String(n === k)));
  };

  const showVideo = (p, k) => {
    const [file, title, meta, w, h] = p.videos[k];
    const stage = $('.sheet__stage', el.media);
    stage.innerHTML = `<video controls playsinline preload="metadata" width="${w}" height="${h}" poster="/video/${esc(file)}.webp"><source src="/video/${esc(file)}.mp4" type="video/mp4"></video>`;
    $('.sheet__cap', el.media).textContent = `${title} · ${meta}`;
    $$('.sheet__thumbs button', el.media).forEach((b, n) => b.setAttribute('aria-current', String(n === k)));
  };

  const renderMedia = (p) => {
    if (p.feed) {
      const strips = eras.flatMap((era) => era.strips);
      el.media.innerHTML = `<div class="sheet__stage"><div class="sheet__feed">${strips
        .map(
          ([key, alt], n) =>
            `<button type="button" data-feed="${n}" aria-label="Open: ${esc(alt)}"><img src="/img/uhc/${esc(key)}.webp" alt="${esc(alt)}" loading="lazy"></button>`,
        )
        .join('')}</div></div><p class="sheet__cap">My original match posts on Reddit, newest first. Tap one to zoom.</p>`;
      return;
    }
    if (p.videos) {
      el.media.innerHTML = `<div class="sheet__stage"></div><p class="sheet__cap"></p><div class="sheet__thumbs">${p.videos
        .map(([file, title], n) => `<button type="button" data-video="${n}" aria-label="Play ${esc(title)}"><img src="/video/${esc(file)}.webp" alt="" decoding="async"></button>`)
        .join('')}</div>`;
      showVideo(p, 0);
      return;
    }
    el.media.innerHTML = `<div class="sheet__stage"></div><p class="sheet__cap"></p>${
      p.images.length > 1
        ? `<div class="sheet__thumbs">${p.images
            .map(([key, caption], n) => `<button type="button" data-thumb="${n}" aria-label="Show screenshot ${n + 1}: ${esc(caption)}"><img src="${imgSrc(key)}" alt="" decoding="async"></button>`)
            .join('')}</div>`
        : ''
    }`;
    showImage(p, 0);
  };

  /* ---------- text ---------- */
  const render = (i) => {
    index = (i + projects.length) % projects.length;
    const p = projects[index];
    dlg.style.setProperty('--tone', `var(--${p.tone})`);
    el.kind.textContent = p.kind;
    el.title.textContent = p.title;
    el.tag.textContent = p.tagline;
    el.count.textContent = `${String(index + 1).padStart(2, '0')} / ${projects.length}`;

    let html = '';
    if (p.youtube) {
      html += `<button class="yt" type="button" data-yt="${esc(p.youtube)}" aria-label="Play the ${esc(p.title)} showcase video"><img src="${imgSrc(p.images[0][0])}" alt="" loading="lazy"><span class="yt__play">${PLAY}</span><span class="yt__label">Watch the showcase</span></button>`;
    }
    html += p.body.map((t) => `<p>${esc(t)}</p>`).join('');
    if (p.lineup) html += `<h3>The lineup</h3><ul class="lineup">${p.lineup.map(([n, t]) => `<li><strong>${esc(n)}</strong><span>${esc(t)}</span></li>`).join('')}</ul>`;
    if (p.features) html += `<h3>Highlights</h3><ul class="ticks">${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`;
    if (p.feed && Array.isArray(uhcLinks) && uhcLinks.length) {
      const links = uhcLinks
        .map((item) => (typeof item === 'string' ? { url: item } : item))
        .filter((l) => l && /^https?:\/\//i.test(l.url || ''))
        .map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.title || linkLabel(l.url))} ↗</a></li>`)
        .join('');
      if (links) html += `<h3>The original threads</h3><ul class="vlinks">${links}</ul>`;
    }
    if (p.tech) html += `<h3>Built with</h3><ul class="chips">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    el.body.innerHTML = html;
    renderMedia(p);
    $('.sheet__info', dlg).scrollTop = 0;
    inner.scrollTop = 0;
  };

  /* ---------- open / close with a FLIP morph ---------- */
  const onScreen = (t) => {
    if (!t || t.classList.contains('is-hidden') || !t.offsetParent) return false;
    const r = t.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
  };
  // Shrink back into the tile that opened the sheet, or the current project's tile if we moved on.
  const tileFor = (p) => {
    if (opener?.dataset.open === p.id && onScreen(opener)) return opener;
    const t = document.querySelector(`.ptile[data-open="${p.id}"]`);
    return onScreen(t) ? t : null;
  };

  const open = (i, from) => {
    if (busy) return;
    render(i);
    opener = from;
    dlg.showModal();
    lenis?.stop();
    if (reduceMotion() || !from) return;
    const a = from.getBoundingClientRect();
    const b = inner.getBoundingClientRect();
    busy = true;
    dlg.classList.add('is-morphing');
    gsap.fromTo(
      inner,
      { x: a.left - b.left, y: a.top - b.top, scaleX: a.width / b.width, scaleY: a.height / b.height },
      {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 0.62,
        ease: 'expo.out',
        onComplete: () => {
          dlg.classList.remove('is-morphing');
          busy = false;
        },
      },
    );
  };

  const finishClose = () => {
    dlg.close();
    gsap.set(inner, { clearProps: 'transform,opacity' });
    dlg.classList.remove('is-morphing');
    busy = false;
  };

  const close = () => {
    if (busy || !dlg.open) return;
    $$('video', dlg).forEach((v) => v.pause());
    const target = reduceMotion() ? null : tileFor(projects[index]);
    busy = true;
    if (!target) {
      gsap.to(inner, { opacity: 0, scale: 0.97, duration: 0.2, onComplete: finishClose });
      return;
    }
    const a = inner.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    dlg.classList.add('is-morphing');
    gsap.to(inner, {
      x: b.left - a.left,
      y: b.top - a.top,
      scaleX: b.width / a.width,
      scaleY: b.height / a.height,
      duration: 0.45,
      ease: 'expo.inOut',
      onComplete: finishClose,
    });
  };

  /* ---------- events ---------- */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open]');
    if (!trigger || dlg.contains(trigger)) return;
    const i = projects.findIndex((p) => p.id === trigger.dataset.open);
    if (i > -1) open(i, trigger);
  });

  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) return close();
    if (e.target.closest('[data-close]')) return close();
    if (e.target.closest('[data-sheet-prev]')) return render(index - 1);
    if (e.target.closest('[data-sheet-next]')) return render(index + 1);
    const p = projects[index];
    const thumb = e.target.closest('[data-thumb]');
    if (thumb) return showImage(p, Number(thumb.dataset.thumb));
    const vid = e.target.closest('[data-video]');
    if (vid) return showVideo(p, Number(vid.dataset.video));
    const zoom = e.target.closest('[data-zoom]');
    if (zoom) {
      return lightbox?.open(
        p.images.map(([key, caption]) => ({ src: imgSrc(key, 'full'), caption, alt: caption })),
        Number(zoom.dataset.zoom),
        zoom,
      );
    }
    const feed = e.target.closest('[data-feed]');
    if (feed) {
      const strips = eras.flatMap((era) => era.strips).map(([key, alt]) => ({ src: `/img/uhc/${key}.webp`, caption: alt, alt }));
      lightbox?.open(strips, Number(feed.dataset.feed), feed);
    }
  });

  dlg.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });

  dlg.addEventListener('keydown', (e) => {
    if (e.target.closest('video, iframe')) return;
    if (e.key === 'ArrowRight') render(index + 1);
    if (e.key === 'ArrowLeft') render(index - 1);
  });

  dlg.addEventListener('close', () => {
    el.body.querySelectorAll('iframe').forEach((f) => f.remove());
    el.media.innerHTML = '';
    lenis?.start();
    opener?.focus?.({ preventScroll: true });
  });
}
