# google/model-viewer Research Entry

This directory is reserved for the `google/model-viewer` research line.

Upstream:

```text
https://github.com/google/model-viewer
https://modelviewer.dev/
```

## Why It Is Isolated

This case studies practical product 3D viewing:

- GLB / glTF product display;
- camera controls;
- hotspots and annotations;
- material or variant switching;
- AR preview;
- loading and poster states;
- product-page publishing behavior.

It should not be mixed with the previous custom Three.js prototypes because the core abstraction is different:

```text
custom Three.js / R3F
  -> build a scene or world

model-viewer
  -> embed an inspectable product object
```

## Current Status

The full upstream repository has not been cloned into this workspace yet.

Reason:

- the official repository is large;
- the official README notes heavy history/assets and recommends WSL for Windows development;
- our immediate need is to understand and prototype the product-viewer pattern, which can be done with the published web component first.

## Recommended Local Prototype

Create the derivative prototype separately:

```text
webgl-product-research/prototypes/product-viewer-story/
```

Prototype goal:

```text
one product model
  -> poster/loading state
  -> orbit / zoom / camera views
  -> hotspots
  -> material or variant controls
  -> AR affordance
  -> product explanation panel
```

Only clone upstream source here if we need to inspect internals, modify the component, or run upstream tests.
