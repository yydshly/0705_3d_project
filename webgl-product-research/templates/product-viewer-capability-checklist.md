# Product Viewer Capability Checklist

Use this checklist when researching or generating a practical 3D product viewer.

This pattern is different from a cinematic WebGL scene:

```text
cinematic scene
  -> directed viewing

product viewer
  -> user-controlled inspection
```

## Product Definition

- Product name:
- Target viewer:
- Primary viewing goal:
- Required model format:
- Has real GLB / glTF asset:
- Has fallback poster image:

## Core Viewer Requirements

- Can rotate the product.
- Can zoom without losing framing.
- Can reset or return to a known view.
- Has useful default camera angle.
- Has stable lighting and environment.
- Loads with a clear poster or progress state.
- Handles model loading failure gracefully.

## Inspection Requirements

- Important parts are identified.
- Hotspots or annotations explain details.
- Hotspots remain readable on desktop and mobile.
- Close-up camera views exist for key parts.
- Dimensions or scale cues are available if useful.
- Text stays in DOM or overlay UI, not long 3D labels.

## Variant / Configuration Requirements

- Material variants:
- Color variants:
- Texture variants:
- Mesh variants:
- Animation states:
- Price/spec changes tied to variant:

## AR Requirements

- AR needed: yes / no
- Target devices:
- WebXR required:
- iOS Quick Look required:
- Android Scene Viewer required:
- Scale should be fixed or user-adjustable:
- Placement target: floor / wall / object

## Asset Pipeline

- Model optimized for web.
- Texture sizes are reasonable.
- Compression decision: none / DRACO / Meshopt / KTX2.
- Real units and scale are correct.
- Product origin and camera framing are correct.
- License/source is documented.

## Publishing Requirements

- Page can be embedded in a normal site.
- SEO and product text are outside the 3D canvas.
- Accessibility label or fallback copy is present.
- Mobile layout is tested.
- Low-performance fallback exists.
- Cover image or poster can be reused for social sharing.

## When To Use model-viewer

Use a high-level viewer such as `model-viewer` when:

- the page focuses on one product or object;
- standard rotate/zoom/AR behavior is enough;
- annotations and DOM overlays matter more than custom shaders;
- the user needs a reliable product page quickly.

Use custom Three.js / R3F when:

- the product lives in a larger scene;
- the story requires complex camera direction;
- shader effects, particles, physics, or custom interaction are central;
- multiple products form an explorable world.

## Output For Research Cases

Each product viewer case should produce:

1. source or documentation evidence;
2. product-viewer capability map;
3. minimal prototype or runnable page;
4. asset and interaction quality notes;
5. bounded skill update recommendation.
