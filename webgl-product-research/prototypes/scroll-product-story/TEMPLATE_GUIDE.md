# Scroll Product Story Template Guide

This prototype is a reusable base for scroll-driven 3D product websites.

It is not only a visual demo. It is a workflow for turning product content into a structured 3D page:

```text
product brief
  -> story chapters
  -> DOM anchors
  -> scroll progress
  -> global WebGL canvas
  -> 3D state changes
  -> Film Mode / video path
```

## When To Use This Template

Use it when the target is one of these:

- immersive product landing page;
- 3D personal portfolio;
- scroll-driven technical explanation;
- product story page;
- interactive page that can later become a video;
- Samsy Ninja-style project presentation.

Do not use it when:

- the page is mostly a dashboard or CRUD tool;
- the product has no visual story;
- a normal static landing page would communicate better;
- the 3D layer would be decoration only.

## Required Input

Start with `PRODUCT_INPUT_BRIEF.md`.

Minimum useful input:

```text
1. What are we showing?
2. What are the 3-5 core capabilities?
3. What story should the page tell?
4. Do we have GLB/images/screenshots, or should we use placeholders?
5. What visual style should it have?
6. Is the final output a webpage, video, or both?
```

If these are unclear, the result will drift into generic 3D decoration.

## Core Idea

```text
HTML section
  -> DOM ref
  -> ScrollScene track
  -> scrollState.progress / visibility
  -> 3D state
  -> camera / object / material response
```

The page should not treat 3D as decoration. Each chapter needs a reason to move or change the model:

- establish the product in space;
- connect scroll progress to product state;
- reveal details at the right distance;
- explain a capability through motion or material;
- prepare the same flow for recording.

## Current Demo Product

The current demo product is `EcoSense`, a procedural ecology monitoring device.

It demonstrates the pattern without requiring a real GLB model:

- grass and soil base for context;
- device body and screen for product identity;
- solar panel and sensor probes for hardware explanation;
- data particles for live sensing;
- structural expansion for product inspection;
- Film Mode for directed auto progression.

## Files To Customize

### `src/App.jsx`

Main template file.

Customize:

- `chapters`: page sections and product story beats;
- `EcoSenseDevice`: current procedural 3D product model;
- `ProductScene`: how scroll progress affects model state;
- `MechanismPanel`: teaching/debugging overlay;
- `runFilm`: auto-scroll timing for Film Mode;
- lights and camera inside `GlobalCanvas`.

### `src/styles.css`

Visual design and layout.

Customize:

- typography;
- page rhythm;
- color palette;
- mechanism panel placement;
- section layout;
- mobile behavior;
- stage frame styling.

### `PRODUCT_INPUT_BRIEF.md`

Input form for future projects.

Use this before changing the template for a new product.

### `README.md`

Prototype purpose and run instructions.

Update it when the template becomes a new product page.

### `PROTOTYPE_NOTES.md`

Research notes and decisions.

Keep this for reasoning, not marketing copy.

## How Input Maps To Code

```text
Product / project name
  -> hero title, page metadata, final call to action

Core capabilities
  -> chapters array

Story shape
  -> chapter order and Film Mode timing

Visual style
  -> styles.css, lighting, material colors, camera distance

Existing GLB model
  -> replace EcoSenseDevice with useGLTF model component

No GLB model
  -> keep procedural placeholder, geometric object, or layered screenshots

Output target
  -> interactive page only, Film Mode, or later recording/publishing package
```

## Replacing The Demo Product With A GLB

For a production product:

1. Add the model to `public/models/your-product.glb`.
2. Import `useGLTF` from `@react-three/drei`.
3. Replace `EcoSenseDevice` with a product model component.
4. Keep the model rendered inside `ScrollScene`.
5. Use `scrollState.progress` and `scrollState.visibility` to drive:
   - position;
   - rotation;
   - scale;
   - material emphasis;
   - exploded detail views;
   - annotation visibility;
   - caption timing.

The important rule:

```text
Do not put 3D next to the page.
Bind it to the page.
```

## Chapter Design Pattern

Use 4-6 chapters. More than that usually becomes hard to follow.

Recommended structure:

```text
1. Establish
   Show what the product is and where it lives.

2. Sync
   Make scroll progress visibly affect the 3D object.

3. Capability
   Show the first important feature.

4. Inspect
   Reveal details, structure, internals, or system logic.

5. Proof / Scenario
   Show the product in use or show a result.

6. Film / Call To Action
   Hold a final hero view and prepare for recording or next step.
```

For smaller pages, use 4 chapters:

```text
establish -> capability -> inspect -> final
```

## Film Mode

Current `Film Mode` is a directed auto-scroll prototype.

It proves that the same page can become a video timeline:

```text
chapter sections
  -> timed scroll steps
  -> stable 3D states
  -> captions / voiceover / music later
```

Current location:

```text
runFilm() in src/App.jsx
```

Future film features:

- timeline metadata for each chapter;
- subtitles bound to chapter timing;
- voiceover script;
- background music cue points;
- `MediaRecorder` capture;
- MP4 conversion and cover image export.

## Quality Checklist

Before calling a generated page useful, check:

- The first screen clearly says what the product is.
- Each chapter changes the 3D state for a reason.
- The 3D object is not merely rotating forever.
- Scroll progress is visible in the experience or explainable through the mechanism panel.
- The product keeps believable scale and grounding.
- Mobile layout does not hide the core story.
- Film Mode has a clear beginning, middle, and end.
- The page can be explained in one sentence.

## Reuse Workflow

```text
1. Fill PRODUCT_INPUT_BRIEF.md.
2. Convert core capabilities into chapters.
3. Decide whether to use GLB, screenshots, or procedural placeholder.
4. Update src/App.jsx.
5. Update src/styles.css for style and responsive layout.
6. Run npm run dev and inspect the page.
7. Add Film Mode timing.
8. If publishing is needed, add recording, captions, voiceover, music, and cover workflow.
```

## Skill Learning

This prototype adds a second pattern to `webgl-product-film`:

```text
Standalone 3D demo
  -> cinematic product film

Scroll-driven 3D website
  -> interactive story page
  -> recordable product film
```

The reusable skill is not one visual effect. It is the ability to convert a WebGL project into a structured demonstration system.
