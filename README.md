# Joshua Mertz · Portfolio

My general portfolio: games, sports tools and AI apps, plus 15 years of building online communities. It's a bento grid with a few living tiles (a local clock, a light/dark switch, a tool marquee), cursor spotlights on every tile, animated filters, and project details that grow out of the tile you click.

**Stack:** Vite + vanilla JS, GSAP (Flip, ScrollTrigger, SplitText), Lenis smooth scrolling and self-hosted fonts (Bricolage Grotesque, Inter, JetBrains Mono). No backend.

## Run it locally

```bash
npm install
npm run dev
```

`npm run build` creates the production site in `dist/`, and `npm run preview` serves that build.

## Deploy on Vercel

Import this GitHub repo in Vercel. It detects **Vite** automatically (build `npm run build`, output `dist`), and no environment variables are needed. Social previews use `public/og.jpg`.

## Where to edit things

| What | File |
| --- | --- |
| Intro, experience, about and contact text | `index.html` |
| Projects (text, tile size, color, screenshots, order) | `src/data/projects.js` |
| **Reddit links for the Minecraft UHC posts** | `src/data/uhc-links.js` |
| Colors, fonts, layout | `src/styles/main.css` |
| Animations | `src/modules/motion.js` |

Each project has a tile `size` (`xl`, `wide`, `tall` or `sm`) and a `tone` (the tile color). The grid packs itself, so the order in `projects.js` is the order on the page.

### Adding the UHC Reddit links

Paste each link into `src/data/uhc-links.js` as a string, one per line, with a comma after it (same format as the other two portfolios). They show up as "The original threads" inside the Minecraft UHC project.

## Images and videos

Screenshots live in `public/img` as WebP (sizes listed in `src/data/image-dims.js`). The three AI test videos in `public/video` are compressed 540p copies with poster images, and they only load when someone presses play.
