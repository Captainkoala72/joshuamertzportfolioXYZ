import '@fontsource-variable/bricolage-grotesque/opsz.css';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import 'lenis/dist/lenis.css';
import './styles/main.css';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { reduceMotion } from './lib/dom.js';
import { initWork } from './modules/work.js';
import { initLightbox } from './modules/lightbox.js';
import { initSheet } from './modules/sheet.js';
import { initTiles } from './modules/tiles.js';
import { initNav } from './modules/nav.js';
import { initMotion } from './modules/motion.js';

gsap.registerPlugin(ScrollTrigger);

const reduce = reduceMotion();

initWork();

// Smooth scrolling (skipped for reduced motion), driven by GSAP's ticker so ScrollTrigger stays in sync.
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const lightbox = initLightbox(lenis);
initSheet(lenis, lightbox);
initTiles();
initNav(lenis);
initMotion({ reduce });
