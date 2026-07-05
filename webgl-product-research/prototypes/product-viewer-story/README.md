# Product Viewer Story

This prototype validates the `google/model-viewer` research branch through a small AI hardware product page.

It is intentionally different from the previous immersive showroom:

```text
showroom / portfolio
  -> user explores a world

product viewer
  -> user inspects one object
```

## Run

```powershell
cd D:\claude_code\20260704_opendesign\webgl-product-research\prototypes\product-viewer-story
npm install
npm run generate:model
npm run dev
```

Open the Vite URL shown in the terminal.

## What To Look For

- `public/models/lumadock-ai-companion.glb` loads as a generated AI desktop companion product model.
- Users can rotate and zoom the model.
- Hotspots explain product parts: interaction sensing, core module, extension connection.
- The guided tour button turns product features into a short story: whole product -> sensing -> interaction -> extension -> reusable template.
- Buttons switch camera views for whole product, front, side, and detail inspection.
- Material tone buttons demonstrate runtime model updates.
- Supporting product sections explain where this pattern fits.
- AR affordance is present when supported by the device/browser.

## Why This Prototype Exists

This tests whether the `model-viewer` pattern should become part of `webgl-product-film` as a practical product-inspection branch:

```text
real product model
  -> inspectable viewer
  -> annotations
  -> guided feature tour
  -> configuration
  -> practical product page
```

It does not try to create a cinematic world. That is the point.

## Reuse

Use `TEMPLATE_GUIDE.md` when adapting this prototype to another product.

Use `../../templates/product-viewer-input-brief.md` when preparing product content before generation.

If no real model exists yet, adapt `scripts/generate-lumadock-glb.mjs` to create a simple GLB from Three.js geometry first. This gives the page a real inspectable object instead of a placeholder.
