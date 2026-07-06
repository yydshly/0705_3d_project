# 3DGS Technical Guide

This guide explains 3D Gaussian Splatting in practical product terms.

It complements:

```text
analyses/2026-07-06-3dgs-real-scenes.md
templates/3dgs-capability-checklist.md
prototypes/3dgs-real-scene-viewer/
```

## One-Sentence Summary

3DGS is a way to capture a real space from photos or video, reconstruct its view-dependent appearance, and render it as an explorable 3D scene.

It is best understood as:

```text
real-world capture
  -> learned spatial visual representation
  -> browser/native viewer
  -> real-scene walkthrough or guided spatial story
```

It is not the same as:

```text
360 panorama
CAD / BIM
GLB product model
ordinary Three.js mesh scene
```

## What Is Being Stored?

A traditional 3D model usually stores surfaces:

```text
vertices
triangles
UVs
materials
textures
animation clips
```

3DGS stores many small 3D Gaussian primitives. Each primitive roughly carries:

```text
position in 3D space
shape / scale / orientation
color
opacity
view-dependent appearance information
```

When rendered together, those many Gaussians reconstruct the captured scene from different viewpoints.

The important mental model:

```text
GLB / mesh asks: what is the geometry of this object?
3DGS asks: what should this real scene look like from this camera position?
```

## Typical Pipeline

### 1. Capture

Input is usually:

- many photos;
- video frames;
- drone / phone / camera path footage;
- sometimes depth or LiDAR-assisted capture, depending on toolchain.

Capture quality matters. Weak capture leads to holes, floaters, blur, ghosting, and poor side views.

Good capture usually needs:

- enough overlap between images;
- stable exposure;
- slow camera motion;
- coverage from useful viewing angles;
- minimal moving people, cars, reflections, or transparent objects;
- privacy and permission checks for real spaces.

### 2. Camera Solving

The system needs to understand where each photo was taken from:

```text
images
  -> camera positions
  -> sparse points / initial scene estimate
```

Many pipelines use Structure from Motion concepts here. The goal is not yet a clean model; it is to recover camera poses and rough spatial relationships.

### 3. 3DGS Training / Optimization

The system optimizes many Gaussians so the rendered scene matches the source photos:

```text
initial points
  -> many 3D Gaussians
  -> repeated rendering comparison
  -> optimized scene representation
```

This is why 3DGS often looks photographic: it learns a visual field from real images.

### 4. Editing And Optimization

Before publishing, a raw splat often needs:

- cropping;
- removing floating artifacts;
- cleaning bad regions;
- compressing;
- converting format;
- adding saved camera views;
- testing browser and mobile performance.

Tools such as SuperSplat are useful in this middle stage.

### 5. Web / App Rendering

In the browser, a viewer renders the splats with WebGL, WebGPU, or a higher-level library integration.

Common viewer tasks:

- load `.ply`, `.splat`, `.ksplat`, `.spz`, `.sogs`, or hosted scene data;
- sort splats or otherwise manage transparency order;
- render many semi-transparent primitives on the GPU;
- expose orbit / first-person / guided camera controls;
- support hotspots, saved views, and sometimes mesh overlays.

## Relationship To WebGL And GPU

3DGS still needs GPU rendering when displayed interactively.

The rough stack is:

```text
3DGS asset / splat file
  -> viewer or renderer library
  -> WebGL / WebGPU
  -> GPU draws many splats
  -> browser canvas displays the scene
```

So the user-facing page may look like a website, but the heavy visual work is still GPU-rendered.

The viewer code is the entry point. The browser's graphics API is the bridge. The GPU is the worker that draws the scene fast enough to move around.

## How It Differs From Selling-House VR

The phrase "VR house tour" can mean different technologies.

| Method | How It Works | Strength | Weakness |
| --- | --- | --- | --- |
| 360 panorama | Capture several fixed 360 photos and jump between them | Cheap, easy, good enough for many listings | Not continuous 3D movement |
| Mesh / BIM / CAD | Build a clean geometric model | Editable, measurable, supports design changes | Expensive, less photographic unless materials are excellent |
| 3DGS | Reconstruct a real scene from photos/video into splats | Photoreal, spatial, continuous viewpoints within capture quality | Less editable, harder to measure, weaker for collisions and design changes |

A simple way to remember:

```text
360 VR = stand at photo points
3DGS = move through a captured visual field
Mesh / BIM = walk through an editable 3D model
```

For selling houses:

- Use 360 panorama when cost and speed matter most.
- Use 3DGS when visual realism and spatial feeling matter.
- Use BIM / mesh when renovation, measurement, design changes, or editable layouts matter.

## What It Is Good For

3DGS is strong when the value comes from the real place itself:

- real estate;
- rental housing;
- hotels and homestays;
- restaurants and cafes;
- galleries and museums;
- exhibitions and booths;
- offices, studios, factories, and labs;
- tourism and campus tours;
- construction progress capture;
- insurance / incident / site documentation;
- personal rooms, collections, desks, and memory spaces.

It also works well as a background layer in a larger product:

```text
captured real room
  + GLB product
  + 3D avatar / guide
  + DOM explanation
  + guided camera tour
```

## What It Is Not Good For

Do not choose 3DGS first when the main goal is:

- product part separation;
- material switching;
- product configurators;
- AR product placement;
- precise measurements;
- CAD editing;
- structural renovation;
- clean physics or collision;
- dynamic lighting as a core feature;
- stylized game worlds that need authored geometry.

Those are usually mesh / GLB / BIM / game-engine problems.

## Common Product Patterns

### Real-Space Showcase

```text
captured room
  -> splat viewer
  -> saved camera views
  -> hotspot annotations
  -> shareable page
```

Useful for real estate, exhibitions, stores, and studios.

### Guided Tour

```text
splat scene
  -> authored camera path
  -> narrated stops
  -> before/after or room-to-room explanation
```

Useful when the user should not freely wander first; the page should tell a story.

### Hybrid Product Scene

```text
splat environment
  -> GLB product overlay
  -> proxy mesh for occlusion / collision
  -> DOM controls
  -> optional video recording
```

Useful for showing a product inside a real space.

### Character Guide In Real Space

```text
captured venue
  -> avatar / guide overlay
  -> route explanation
  -> hotspots
```

Useful for museums, campuses, stores, AI assistant demos, and virtual hosts.

## Key Risks

### Capture Risk

Bad capture creates bad splats. Code cannot fully fix missing viewpoints, motion blur, poor lighting, or moving subjects.

### File Size Risk

Raw splats can be large. Publishing may require compression, progressive loading, or lower-detail fallbacks.

### Mobile Risk

Mobile GPU and memory limits matter. A desktop-smooth splat may fail or stutter on phones.

### Interaction Risk

Splats are visual, not automatically physical. If the user wants collision, pathfinding, occlusion, or object placement, plan a proxy mesh.

### Rights And Privacy Risk

A captured real scene may include private spaces, people, signs, screens, or sensitive objects.

## How To Decide: 3DGS Or GLB?

Use 3DGS if the sentence is:

```text
I want to show this real place.
```

Use GLB / mesh if the sentence is:

```text
I want to control this product or object.
```

Use both if the sentence is:

```text
I want to show a controllable product inside a real captured place.
```

## Relationship To Our Project

Our current 3DGS work now has three levels:

```text
research analysis
  -> analyses/2026-07-06-3dgs-real-scenes.md

decision checklist
  -> templates/3dgs-capability-checklist.md

visible prototype
  -> prototypes/3dgs-real-scene-viewer/
```

This means 3DGS has moved from theory into a usable research branch.

## Recommended Next Step

There are two valid next moves, depending on what we want to learn next.

### Option A: Finish 3DGS Deeper

Do this if we want to make 3DGS practical for real life:

```text
3DGS capture workflow
  -> what phone/camera input is needed
  -> how to process photos/video
  -> how to clean/compress/export
  -> how to host and embed
```

Expected output:

```text
templates/3dgs-capture-brief.md
analyses/YYYY-MM-DD-3dgs-capture-workflow.md
optional prototype using an owned or downloaded local splat asset
```

This is the most useful path if the goal is real estate, room capture, store capture, exhibition capture, or life documentation.

### Option B: Continue Main Backlog

Do this if we want broader 3D skill coverage:

```text
P1 Avatar / VRM / Live2D / character motion
```

Expected output:

```text
templates/avatar-character-input-brief.md
templates/character-display-checklist.md
references/character-avatar.md
optional character viewer prototype
```

This is the most useful path if the goal is virtual guide, AI companion, mascot, personal assistant, or character-led product pages.

## My Recommendation

For this repository's mainline, the best next step is:

```text
P1 Avatar / VRM / Live2D / Character Motion
```

Reason:

- 3DGS now has source research, checklist, skill reference, and a visible prototype.
- The next largest missing category is character/avatar capability.
- Character work connects directly to AI companion, virtual guide, product mascot, and immersive website use cases.

If later we want to make a real estate / real-space product, return to Option A and build the 3DGS capture workflow.
