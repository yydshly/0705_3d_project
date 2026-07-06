# 3D Gaussian Splatting / Real Scenes

Date: 2026-07-06

## Why This Case Matters

Our current prototypes mostly use mesh-based rendering:

```text
GLB / glTF product models
procedural Three.js geometry
DOM + WebGL scroll scenes
game-like portfolio nodes
```

3D Gaussian Splatting adds a different class of capability:

```text
photos or video of a real place
  -> camera calibration / sparse points
  -> optimized 3D Gaussian representation
  -> browser or native viewer
  -> real-scene navigation, guided tour, digital twin, or spatial story
```

This matters because some future products should not start with "make a mesh model." A room, store, exhibition, studio, workshop, home corner, venue, or memory space may be better represented as a captured splat scene.

## Source Evidence

### Original 3DGS Reference

Source:

```text
https://github.com/graphdeco-inria/gaussian-splatting
```

The original reference implementation is attached to the paper "3D Gaussian Splatting for Real-Time Radiance Field Rendering." The repository includes training, rendering, evaluation, conversion, and viewer components.

Important implementation clues:

- It starts from camera calibration / sparse points.
- It optimizes many 3D Gaussians rather than traditional triangle surfaces.
- It targets high-quality real-time novel-view rendering.
- Its codebase includes a PyTorch optimizer, a network viewer, an OpenGL real-time viewer, and a script for preparing image data.

Bounded conclusion:

```text
3DGS is a reconstruction / novel-view rendering pipeline, not just a web component.
```

### SuperSplat

Source:

```text
https://github.com/playcanvas/supersplat
```

SuperSplat is positioned as a browser-based editor for inspecting, editing, optimizing, and publishing 3D Gaussian Splats. It is useful to our workflow because it represents the practical middle layer:

```text
raw or trained splat
  -> inspect / edit / optimize
  -> publish or embed
```

Bounded conclusion:

```text
3DGS needs an editing and optimization step before it becomes a publishable web scene.
```

### WebGL Splat Viewer

Source:

```text
https://github.com/antimatter15/splat
```

This viewer shows the browser-runtime side of 3DGS. Its README describes controls for navigation, custom `.splat` URLs, drag-and-drop conversion from `.ply`, saved camera views, WebGL implementation, and progressive loading.

Bounded conclusion:

```text
3DGS can be a lightweight browser viewing pattern, but viewer quality depends on format, loading strategy, camera controls, and browser performance.
```

### SPZ Format

Source:

```text
https://github.com/nianticlabs/spz
```

SPZ is a compressed format for 3D Gaussian splats. The repository highlights smaller file sizes compared with PLY and calls out coordinate-system differences between SPZ, PLY, GLB, Unity, OpenGL, and Three.js conventions.

Bounded conclusion:

```text
3DGS publishing is not only about rendering. Format conversion, compression, coordinates, and interoperability matter.
```

### Spark

Source:

```text
https://sparkjs.dev/
```

Spark is described as an advanced 3D Gaussian Splatting renderer for Three.js. It matters to us because it points toward a hybrid route:

```text
Three.js scene
  + splat scene
  + regular meshes
  + programmable effects
  + multiple splat formats
```

Bounded conclusion:

```text
For product websites, the likely mature pattern is not pure splat only. It is splat + mesh + DOM + directed camera.
```

## Difference From Our Existing Patterns

| Pattern | Primary Asset | Best For | Weak At |
| --- | --- | --- | --- |
| GLB product viewer | Mesh model | Product inspection, AR, variants, hotspots | Real rooms, natural messy scenes |
| Cinematic product showcase | Mesh / separated parts | Product launch motion, exploded views | Captured real-world spaces |
| Story-driven 3D portfolio | Authored 3D world | Identity, projects, interactive nodes | Photoreal scanned places |
| 3DGS real scene | Captured splat scene | Real rooms, venues, memories, spatial tours | Editable geometry, product parts, materials, collision |

## When To Recommend 3DGS

Recommend 3DGS when the user's desired output is:

- a real room or venue;
- a store, studio, booth, gallery, home corner, or workspace;
- a tourism / real-estate / architecture scene;
- a memory-like personal space;
- a product shown inside a real captured environment;
- a digital twin where visual fidelity matters more than editable geometry.

Do not recommend 3DGS as the first route when the user needs:

- product configurators;
- clean material variants;
- exploded product parts;
- AR product inspection;
- precise CAD-like geometry;
- reliable collision and physics without a proxy mesh;
- dynamic lighting as the main feature.

## Hybrid Product Pattern

The most useful practical pattern for our skill is:

```text
3DGS captured environment
  -> mesh proxy for collision / occlusion when needed
  -> GLB product or character overlays
  -> DOM text and controls
  -> camera path / guided tour
  -> optional Film Mode
```

Example:

```text
Captured desk / room
  + GLB AI companion device
  + hotspots on real objects
  + guided tour camera
  + publishable website or film
```

This directly connects 3DGS to our existing work without turning it into an unrelated research branch.

## Skill Recommendation

Update `webgl-product-film` so it can route real-scene requests:

```text
If the user has a real place, memory, room, venue, or scan:
  inspect whether 3DGS is better than GLB.

If the user has .ply, .splat, .ksplat, .spz, .sogs:
  inspect viewer compatibility, file size, compression, coordinates, and mobile performance.

If the user wants interaction:
  check whether a proxy mesh is needed for collision, occlusion, pathfinding, or object placement.
```

Reusable artifacts:

```text
webgl-product-research/templates/3dgs-capability-checklist.md
C:\Users\yun68\.codex\skills\webgl-product-film\references\gaussian-splatting.md
```

## Next Prototype Decision

A local prototype is optional, not mandatory yet.

If we do build one, the useful prototype should be:

```text
minimal splat viewer
  + one public or generated sample splat
  + saved camera views
  + hotspot overlays
  + "mesh vs splat" explanation panel
```

It should not be another abstract rotating object. The value is teaching:

```text
real-scene capture
  -> splat file
  -> browser viewer
  -> limitations and hybrid route
```
