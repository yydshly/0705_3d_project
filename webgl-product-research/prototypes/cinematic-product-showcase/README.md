# Cinematic Product Showcase

This prototype starts the next research branch after `product-viewer-story`.

It is intentionally different from `model-viewer`:

```text
product-viewer-story
  -> inspect one GLB product
  -> rotate / zoom / hotspots / AR

cinematic-product-showcase
  -> direct a product film in WebGL
  -> entrance / camera choreography / feature effects / exploded view / final hero shot
```

## Run

```powershell
cd D:\claude_code\20260704_opendesign\webgl-product-research\prototypes\cinematic-product-showcase
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## What This First Prototype Proves

- A product can enter the scene with a directed camera.
- Earbuds and charging case can be animated as separate parts.
- Sound waves visualize an audio feature.
- Energy particles visualize charging / connectivity.
- Exploded view is authored by a timeline, not just a camera orbit.
- The same timeline can later become a recorded product film.

## Current Limitations

- The product is procedural geometry, not a real industrial model.
- No recorded WebM / MP4 export yet.
- No real brand assets, product renders, or sound design yet.
- The purpose is capability validation, not final commercial polish.

## Next Improvements

1. Replace procedural geometry with a real GLB product model.
2. Add GSAP or a small internal timeline system for easier shot authoring.
3. Add record controls using the existing GrassSystem publishing workflow.
4. Add cover image, subtitles, voiceover, music, and publish notes.
5. Add a checklist that decides when to choose this pattern over `model-viewer`.
