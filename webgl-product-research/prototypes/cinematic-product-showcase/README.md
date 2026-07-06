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

## Scope Decision

This prototype is now intentionally kept as a technical validation prototype.

Do not keep polishing the procedural earphone model as if it were a final product asset. The model is good enough to prove:

- directed camera motion;
- timeline-driven part movement;
- product entrance and final hero framing;
- feature visualization with waves and particles;
- the difference between `model-viewer` inspection and custom Three.js animation.

It is not intended to prove commercial-grade industrial design, real product modeling, UV mapping, texture quality, or launch-page visual polish.

If the goal becomes product realism, the next step must be a real asset pipeline:

```text
real product brief
  -> high-quality GLB / Blender / generated 3D asset
  -> material and lighting QA
  -> animation retargeting
  -> publishing package
```

## Next Improvements

1. Keep this prototype as the reference for cinematic animation mechanics.
2. Start a separate real-asset case before pursuing higher product realism.
3. Add GSAP or a small internal timeline system only if timeline authoring becomes the bottleneck.
4. Add record controls using the existing GrassSystem publishing workflow after the asset quality is convincing.
5. Add a checklist that decides when to choose this pattern over `model-viewer`.
