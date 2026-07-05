# Workflow

Use this to structure analysis and implementation.

## Capability Map Format

Summarize the project in these groups:

- Rendering stack: framework, renderer, browser/API layer, shader use.
- Scene assets: terrain, models, textures, sprites, particles, environment.
- Motion system: animation loop, timeline, controls, physics, noise, procedural changes.
- Interaction: mouse, keyboard, touch, GUI, scroll, route changes.
- Visual quality: lighting, shadows, post-processing, camera, composition.
- Publishing path: recording, export format, audio, captions, cover, docs.
- Risks: performance, browser support, missing assets, hardcoded paths, weak story, model distortion.

## Demo Direction Pattern

Prefer a build-up sequence:

1. Establish the empty or baseline scene briefly.
2. Introduce the hero object or environment anchor.
3. Reveal one capability at a time through visible change.
4. Use camera motion to explain spatial relationship.
5. Hold on important details long enough for the viewer to understand.
6. End with a composed final state.

Avoid:

- Equal-length feature clips when some moments deserve more time.
- Pure camera orbit without state changes.
- Repeating the same push-in shot.
- Showing technical controls instead of visual consequences.
- Overusing close-ups that hide the whole system.

## Implementation Pattern

- Create a director state object for timeline values.
- Interpolate parameters from time, not from scattered timers.
- Keep irreversible story events monotonic when appropriate, such as growth.
- Use labels or captions to explain capabilities only where visuals cannot.
- Let user controls override or inspect the scene outside the film mode.
