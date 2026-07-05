# Product Viewer Story Template Guide

This guide explains how to reuse `product-viewer-story` for another product.

## What This Template Is For

Use this template when the user wants:

- one product model on a page;
- rotate / zoom / inspect controls;
- hotspots attached to product parts;
- color or material variants;
- optional AR preview;
- product copy and specs around the 3D viewer.

Do not use it for:

- game-like worlds;
- large spatial portfolios;
- shader-heavy technical scenes;
- multi-room or multi-node exploration.

## Replace These Inputs

### 1. Product Copy

Edit `index.html`:

- `<title>`
- main `<h1>`
- subtitle
- product story panel
- metric cards
- supporting product sections
- spec list

### 2. Model Asset

Put the new GLB in:

```text
public/models/
```

If you only have a concept brief, start by adapting:

```text
scripts/generate-lumadock-glb.mjs
```

Then run:

```powershell
npm run generate:model
```

Then update:

```html
<model-viewer src="/models/your-product.glb">
```

Keep the model web-ready:

- correct scale;
- centered origin;
- optimized texture sizes;
- documented source/license.

### 3. Camera Views

Edit `src/main.js`:

```js
const views = {
  hero: { orbit, target, focus },
  front: { orbit, target, focus },
  side: { orbit, target, focus },
  detail: { orbit, target, focus }
}
```

Use browser inspection to tune:

- `camera-orbit`;
- `camera-target`;
- `field-of-view`;
- `min-camera-orbit`;
- `max-camera-orbit`.

### 4. Hotspots

Edit the hotspot buttons inside `<model-viewer>`:

```html
<button
  class="hotspot"
  slot="hotspot-name"
  data-position="0m 1m 0m"
  data-normal="0m 0m 1m"
  data-view="detail"
  data-point="feature"
>
  Feature label
</button>
```

Then add matching copy in `src/main.js`:

```js
const details = {
  feature: {
    title: 'Feature title',
    copy: 'Feature explanation'
  }
}
```

Recommended count:

```text
3-5 hotspots.
```

### 5. Material / Color Variants

Edit `toneMap` in `src/main.js`:

```js
const toneMap = {
  original: null,
  colorName: {
    color: [r, g, b, a],
    metallic: 0.1,
    roughness: 0.5
  }
}
```

Then add matching buttons in `index.html`:

```html
<button type="button" data-tone="colorName">Color label</button>
```

This is useful for early prototypes. For production, prefer real glTF material variants when available.

## Validation Checklist

Before treating the page as a reusable product viewer:

- `npm run build` passes.
- First viewport explains the product.
- Model is visible and not badly cropped.
- Rotate and zoom work.
- Hotspot labels do not hide the product.
- Camera buttons move to meaningful views.
- Material buttons visibly change the product and reset works.
- Mobile layout keeps controls readable.
- README explains how to run and what the case proves.

## How This Connects To The Research

This template is the practical product-viewer branch of the WebGL research:

```text
GrassSystemThreeJS
  -> cinematic technical demo

r3f-scroll-rig
  -> scroll-driven immersive website

brunosimon/folio-2019
  -> game-like portfolio world

product-viewer-story
  -> one product, inspected clearly
```
