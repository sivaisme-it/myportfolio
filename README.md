# dummy. — portfolio

Personal portfolio of Suvam Sugyan Sahoo. React + Vite single-page site with
WebGL shader backgrounds, particle effects, and scroll-driven storytelling.

## Run it locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## Deploy on Vercel

No config needed — Vercel auto-detects Vite.

1. Push this folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`,
   output directory `dist/` — both auto-filled. Click **Deploy**.

Every push to the connected branch redeploys automatically.

## Structure

```
public/            # gifs served as-is (hm.gif, ha/*.gif)
src/
  main.jsx         # entry
  App.jsx          # mounts Body + Cursor, runs all effects once
  Body.jsx         # all static section markup
  index.css        # the full site stylesheet
  components/
    Cursor.jsx       # gooey cursor (from cursor.md) — currently unwired, see note
    BotanicalText.jsx# blossom-and-leaf name art (from Botanical Text.md)
    LetterDrop.jsx   # dropping name animation (from fluid.md)
    Loader.jsx       # fullscreen loading overlay, fades on ready
    OrbConverge.jsx  # converging particle orb inside the loader (from lod.md)
  lib/
    backgrounds.js   # cloud sky + ink cyclone + nav/parallax/reveal boot
    motes.js         # ambient pollen particles
    liquidCarve.js   # gooey buttons (from button.md)
    scrollHighlight.js # scroll-scrubbed paragraph lighting
    cinema.js        # retro project cinema player
    tilt.js          # iPad hover tilt
    animeFx.js       # anime.js v4 micro-interactions
    drift.js         # butterfly drift hero layer (from drift.md)
```
