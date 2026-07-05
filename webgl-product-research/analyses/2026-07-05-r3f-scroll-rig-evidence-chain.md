# r3f-scroll-rig Evidence Chain

Date: 2026-07-05

Project: `14islands/r3f-scroll-rig`

Local source: `webgl-product-research/projects/r3f-scroll-rig`

Prototype: `webgl-product-research/prototypes/scroll-product-story`

## Why This Document Exists

This document prevents us from updating `webgl-product-film` from theory alone.

The rule for this research line is:

```text
source evidence
  -> runnable prototype evidence
  -> bounded conclusion
  -> skill update
```

## Core Claim

`r3f-scroll-rig` is not a 3D model generator, grass renderer, shader effect pack, or automatic "make any webpage 3D" tool.

It is a DOM/WebGL synchronization system for React and React Three Fiber:

```text
DOM section position
  + scroll state
  + one global R3F canvas
  -> 3D object aligned with webpage content
```

## Source Evidence

### 1. One Persistent Global Canvas

Evidence:

- `src/components/GlobalCanvas.tsx`
- `src/components/GlobalChildren.tsx`

What the source shows:

- `GlobalCanvas` wraps R3F `Canvas`.
- It sets default fixed-position styles: `position: fixed`, `top: 0`, `left: 0`, `right: 0`, `height: 100vh`.
- It renders `GlobalChildren`, which reads registered canvas children from the shared Zustand store.
- It marks WebGL availability in global state and handles WebGL initialization failure through `CanvasErrorBoundary`.

Conclusion supported by source:

The library expects a shared WebGL layer, not one canvas per DOM component.

### 2. DOM Tracking Drives 3D Placement

Evidence:

- `src/hooks/useTracker.ts`
- `src/components/ScrollScene.tsx`

What the source shows:

- `useTracker(track)` reads the tracked DOM element with `getBoundingClientRect()`.
- It stores initial DOM rect values and updates bounds by subtracting scroll offsets.
- It converts DOM center position into viewport-centered coordinates.
- It computes `scrollState.progress`, `scrollState.visibility`, and `scrollState.viewport`.
- `ScrollScene` calls `useTracker(track)` and applies the resulting `position.x` and `position.y` to a Three.js group.
- `ScrollScene` passes `scale`, `scrollState`, and `inViewport` to its child render function.

Conclusion supported by source:

The library's core value is aligning 3D content to DOM elements and exposing scroll progress to the 3D scene.

### 3. DOM Components Tunnel 3D Children Into The Global Canvas

Evidence:

- `src/components/UseCanvas.tsx`
- `src/hooks/useCanvas.ts`
- `src/components/GlobalChildren.tsx`

What the source shows:

- `UseCanvas` returns `null` in the DOM tree.
- It calls `useCanvas(children, props)` to register the 3D child into the canvas store.
- `useCanvas` calls `renderToCanvas(uniqueKey, object, props)` on mount and `removeFromCanvas` on unmount.
- `GlobalChildren` renders all registered canvas children inside `GlobalCanvas`.

Conclusion supported by source:

A normal React page component can declare 3D content near its DOM section, while actual rendering still happens inside the single global canvas.

### 4. Smooth Scrolling Is Synced With R3F Rendering

Evidence:

- `src/scrollbar/SmoothScrollbar.tsx`
- `src/components/R3FSmoothScrollbar.tsx`

What the source shows:

- `SmoothScrollbar` uses Lenis.
- On each scroll event it writes `y`, `x`, `velocity`, `direction`, and `progress` into global scroll state.
- It calls `invalidate()` so R3F can render when the page scrolls.
- `R3FSmoothScrollbar` passes R3F `invalidate` and `addEffect` when a canvas is available.

Conclusion supported by source:

The library is designed so scroll motion and WebGL rendering remain synchronized.

### 5. Scroll State Can Drive Shader/Material Effects

Evidence:

- `powerups/WebGLImage.tsx`

What the source shows:

- `WebGLImage` has shader uniforms including `u_progress`, `u_visibility`, `u_viewport`, and `u_velocity`.
- In `useFrame`, those uniforms are updated from `scrollState` and scrollbar velocity.

Conclusion supported by source:

The pattern is not limited to moving 3D meshes. It can also drive shader effects, image distortion, and scroll-reactive materials.

## Prototype Evidence

Prototype:

```text
webgl-product-research/prototypes/scroll-product-story
```

What we implemented:

- `GlobalCanvas` as the fixed WebGL layer.
- `SmoothScrollbar` for scroll-driven progression.
- `UseCanvas` inside page components.
- `ScrollScene track={anchorRef}` to bind 3D scenes to DOM sections.
- `scrollState.progress` and `scrollState.visibility` used to drive:
  - device rotation;
  - live scale;
  - data particle visibility;
  - structural expansion;
  - chapter-specific visual state.
- A first `Film Mode` button that auto-scrolls through sections.

Evidence in prototype source:

- `src/App.jsx` imports `GlobalCanvas`, `ScrollScene`, `SmoothScrollbar`, and `UseCanvas`.
- `StoryScene` nests `UseCanvas` and `ScrollScene`.
- `ProductScene` reads `scrollState.progress` and `scrollState.visibility`.
- `EcoSenseDevice` uses chapter index and progress to open device parts and change scene state.

Browser verification performed:

- The local page served at `http://127.0.0.1:5174/`.
- The browser contained one WebGL canvas.
- The hero displayed a 3D device preview.
- The `Play Film Mode` button was visible and enabled.
- No application-level console errors were observed.

## Bounded Conclusions

These conclusions are supported:

- `r3f-scroll-rig` is useful for scroll-driven 3D websites, product pages, and portfolio pages.
- It provides infrastructure for DOM/WebGL synchronization.
- It helps turn page scroll into a 3D timeline.
- It can support a later film mode because the same scroll progression can be directed automatically.
- It should be analyzed differently from a standalone 3D visual effect library like GrassSystemThreeJS.

These conclusions are not supported:

- It does not automatically convert any website into a good 3D website.
- It does not generate attractive 3D models.
- It does not provide complete cinematic direction by itself.
- It does not replace design, storytelling, product modeling, or video publishing work.
- It does not prove that every website should use WebGL.

## Difference From GrassSystemThreeJS

GrassSystemThreeJS:

- Main question: how does a 3D scene render lots of grass and environmental effects?
- Core capability: GPU-driven vegetation rendering, shaders, instancing, scene animation.
- Best output: a visual capability demo or cinematic technical film.

`r3f-scroll-rig`:

- Main question: how does a webpage control and align 3D content?
- Core capability: DOM tracking, scroll progress, global canvas, 3D tunneling.
- Best output: immersive website, 3D portfolio, product story page, or scroll-recordable demo.

## Skill Update Decision

The `webgl-product-film` skill should gain an "immersive website" branch.

That branch should tell Codex to inspect:

- whether there is a global canvas;
- whether DOM sections act as 3D anchors;
- how scroll progress enters 3D state;
- whether 3D content is tunnelled from page components;
- whether shader uniforms or materials depend on scroll state;
- whether the page can be transformed into a recordable film flow;
- what is proven by source/prototype and what is only a hypothesis.

The skill should also warn:

- do not treat scroll-rig-like projects as model libraries;
- do not claim a page can become 3D automatically;
- require source evidence before upgrading reusable guidance.

## Next Action

Update `webgl-product-film` with:

- a new `references/immersive-website.md`;
- a short pointer in `SKILL.md` telling Codex when to read it;
- the rule that skill updates must be based on source evidence plus prototype evidence when possible.
