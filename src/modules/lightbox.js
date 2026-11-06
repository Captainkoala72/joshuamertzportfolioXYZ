// Full-size image viewer (native <dialog>), shared by the project sheet.
import { $ } from '../lib/dom.js';

export function initLightbox(lenis) {
  const dlg = $('[data-lightbox]');
  const img = $('[data-lb-img]', dlg);
  const cap = $('[data-lb-cap]', dlg);
  const prev = $('[data-lb-prev]', dlg);
  const next = $('[data-lb-next]', dlg);
  let items = [];
  let index = 0;
  let opener = null;

  const show = () => {
    const item = items[index];
    img.src = item.src;
    img.alt = item.alt || item.caption || '';
    cap.textContent = item.caption || '';
    prev.hidden = next.hidden = items.length < 2;
  };
  const go = (step) => {
    index = (index + step + items.length) % items.length;
    show();
  };

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  $('[data-close]', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.classList.contains('lightbox__fig')) dlg.close();
  });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
  dlg.addEventListener('close', () => {
    if (!$('[data-sheet]').open) lenis?.start();
    opener?.focus?.({ preventScroll: true });
  });

  return {
    open(list, start = 0, from = null) {
      if (!list.length) return;
      items = list;
      index = Math.max(0, Math.min(start, list.length - 1));
      opener = from;
      show();
      if (!dlg.open) dlg.showModal();
      lenis?.stop();
    },
  };
}
