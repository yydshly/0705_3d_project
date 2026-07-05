# Scroll Product Story Prototype

This prototype validates the next step after researching `14islands/r3f-scroll-rig`.

The current version is a concrete case study: an `EcoSense` outdoor ecology monitoring device. It is no longer an abstract placeholder cube.

```text
HTML story sections
  + global WebGL canvas
  + scroll-tracked 3D ecology monitoring device
  + simple Film Mode auto progression
```

## Goal

Confirm that an immersive product page can work as both:

- an interactive scroll-driven website;
- a foundation for a later recordable product film.

## Run

```bash
npm install
npm run dev
```

Then open the Vite URL.

## What This Tests

- `GlobalCanvas` as a persistent WebGL layer.
- `SmoothScrollbar` as scroll timeline driver.
- `UseCanvas` to tunnel 3D objects from page components into the global canvas.
- `ScrollScene` to align a 3D object with a DOM section.
- A directed `Film Mode` button that auto-advances through story beats.
- A template structure for product story sections, visual states, and future capture.
- A concrete four-part story: field setup, live sensing, hardware structure, and publishable film flow.

## Template Guide

See `TEMPLATE_GUIDE.md` for how to reuse this prototype as a scroll-driven 3D product website base.

If you want to generate a new product page from this pattern, start with:

```text
PRODUCT_INPUT_BRIEF.md
  -> TEMPLATE_GUIDE.md
  -> src/App.jsx
  -> src/styles.css
```

`PRODUCT_INPUT_BRIEF.md` defines what the user should provide: product, audience, selling points, story, assets, style, and output target.

`TEMPLATE_GUIDE.md` explains how those inputs map to chapters, DOM anchors, 3D state, Film Mode, and future video publishing.

## Reuse Scenarios

This prototype can be reused for:

- a 3D product landing page;
- a personal portfolio or project showcase;
- a Samsy Ninja-style scroll presentation;
- a technical demo explanation page;
- an interactive page that later becomes a publishable video.

## Next Improvements

- Add recording with `MediaRecorder`.
- Add captions and voiceover timing.
- Add a more realistic GLB product model.
- Add director templates for 30s/60s/90s outputs.
- Add mobile performance switches for lower-end GPUs.
