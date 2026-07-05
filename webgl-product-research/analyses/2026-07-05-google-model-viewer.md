# google/model-viewer Research Note

Source:

- https://github.com/google/model-viewer
- https://modelviewer.dev/
- https://modelviewer.dev/examples/annotations/index.html
- https://modelviewer.dev/examples/stagingandcameras/index.html
- https://modelviewer.dev/examples/loading/index.html
- https://modelviewer.dev/examples/scenegraph/index.html
- https://modelviewer.dev/examples/augmentedreality/index.html

## Why This Case Matters

`google/model-viewer` represents a different 3D product pattern from our previous cases.

Previous cases:

```text
GrassSystemThreeJS
  -> cinematic technical scene

r3f-scroll-rig
  -> scroll-driven immersive website

brunosimon/folio-2019
  -> game-like spatial portfolio
```

`model-viewer` adds the missing practical product-viewer layer:

```text
real model
  -> load in a normal webpage
  -> rotate / zoom / inspect
  -> annotate details
  -> switch materials or variants
  -> preview in AR
  -> ship with sensible browser behavior
```

This is important because many real products do not need a whole cinematic world. They need a reliable object inspection experience.

## What The Library Is

`model-viewer` is a web component for displaying interactive 3D models on the web and in AR.

The key product idea is:

```text
Use a declarative HTML element for common 3D product viewing needs.
```

Instead of building a Three.js scene from scratch, a page can use a custom element like:

```html
<model-viewer
  src="product.glb"
  camera-controls
  auto-rotate
  ar>
</model-viewer>
```

That means it is closer to a product infrastructure component than a free-form WebGL demo.

## Capability Map

### Rendering Stack

- Web component: `<model-viewer>`.
- Underlying browser rendering: WebGL through the library internals.
- Model formats: GLB / glTF for display; USDZ or generated USDZ for iOS AR paths.
- Related ecosystem: `model-viewer-effects`, editor, shared assets, render fidelity tools.

### Scene Assets

- Primary asset is a product model, usually GLB or glTF.
- Supports model variants through glTF material variants.
- Supports DRACO, KTX2, and Meshopt-related workflows.
- Handles posters and lazy loading so a product page can avoid loading the full model too early.

### Motion System

- Built-in camera controls.
- Auto-rotate for passive display.
- Camera orbit and camera target controls.
- Interpolated camera transitions.
- Scroll-linked camera orbit is possible through CSS-like `calc()` usage.

### Interaction

- Mouse/touch rotate, zoom, pan, and tap behaviors.
- Hotspots / annotations through child DOM elements.
- Hotspot visibility can be driven by camera-facing state.
- Clickable hotspots can move the camera to predefined views.
- Material, texture, variant, orientation, and scale can be changed through attributes or API.

### Visual Quality

- Environment and lighting controls.
- AR environment estimation in WebXR mode through `xr-environment`.
- Material controls for color, metalness, roughness, textures, and variants.
- Dynamic render scaling to maintain frame rate.

### Publishing Path

- Can be embedded in a normal HTML page.
- Has an official editor for testing models and starter site output.
- AR modes include WebXR, Scene Viewer, and Quick Look.
- Works best as part of product pages, ecommerce, education, documentation, hardware landing pages, and object inspection flows.

### Risks

- It is not a full custom 3D world engine.
- Complex product storytelling still needs page design, copywriting, assets, and camera direction.
- AR behavior differs across WebXR, Scene Viewer, and Quick Look.
- Some runtime changes only reflect in WebXR mode, not native AR apps.
- Heavy or poorly prepared models can still hurt loading and performance.
- Full repo development on Windows is not the smoothest path; the official README recommends WSL for development.

## What This Adds To Our Skill

This case should teach `webgl-product-film` a new branch:

```text
If the user's goal is practical product inspection,
do not start with a cinematic scene.
Start with product viewer requirements.
```

The important questions become:

- What is the product model?
- What are the inspection views?
- Which parts need annotations?
- Does the user need AR?
- Are variants or material changes needed?
- What loading/poster state should appear before the model loads?
- What fallback should exist if AR or WebGL is unavailable?

## Difference From A Three.js Custom Scene

Use `model-viewer` when:

- the hero is one product/object;
- the user should rotate, zoom, inspect, and maybe view in AR;
- standard camera controls are enough;
- DOM annotations are more useful than custom shaders;
- the project needs practical publishing more than custom art direction.

Use custom Three.js / R3F when:

- multiple objects form a world;
- camera direction is highly authored;
- shaders, particles, physics, or custom rendering are central;
- the interaction model is not a normal product viewer;
- the website itself is the spatial experience.

## Prototype Direction

The first derivative prototype should not clone the whole `model-viewer` repo.

Build a small isolated page:

```text
product-viewer-story/
  -> one GLB product model
  -> poster/loading state
  -> orbit and zoom
  -> 3-5 hotspots
  -> material or variant switch
  -> AR button if supported
  -> feature explanation panel
  -> optional Film Mode walkthrough
```

This will validate the product-viewer pattern without taking on the full upstream repository complexity.

## Bounded Conclusion

`model-viewer` is a good target library for the "practical product 3D display" capability area.

It does not replace our existing Three.js/R3F work. It complements it:

```text
model-viewer
  -> practical product inspection

R3F / Three.js
  -> custom immersive worlds

webgl-product-film
  -> choose the right expression pattern and package it for explanation or publishing
```

## Next Step

Create:

```text
templates/product-viewer-capability-checklist.md
projects/model-viewer/README.md
prototypes/product-viewer-story/
```

Then decide whether to:

1. build the prototype with the CDN version of `@google/model-viewer`; or
2. clone the full upstream repo only if source-level investigation becomes necessary.
