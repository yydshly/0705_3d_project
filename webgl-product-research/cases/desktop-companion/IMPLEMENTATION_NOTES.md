# Desktop Companion Implementation Notes

## Isolation Rule

Do not modify the original template when implementing this case.

Original reusable template:

```text
webgl-product-research/prototypes/scroll-product-story/
```

Desktop Companion prototype:

```text
webgl-product-research/prototypes/desktop-companion-story/
```

Product thinking and planning:

```text
webgl-product-research/cases/desktop-companion/
```

## Implementation Strategy

Start with a code-native procedural prototype.

Do not wait for a real GLB model.

The first version should use:

- desk plane;
- monitor/window panels;
- companion avatar placeholder;
- chat bubbles;
- memory cards;
- emotion ring;
- customization swatches.

This keeps the template testable before asset production.

## Mapping To Template Components

```text
chapters
  -> Desktop Companion story beats

EcoSenseDevice
  -> DesktopCompanionRig

GrassPatch / DataCloud
  -> DesktopPanels / MemoryOrbit / EmotionAura

MechanismPanel
  -> keep for template debugging, but rename labels to product-facing terms later

runFilm
  -> Desktop Companion Film Mode timing
```

## First Prototype Scope

Included:

- new isolated Vite/R3F prototype directory;
- product-specific chapters;
- procedural 3D desktop scene;
- scroll-driven state changes;
- Film Mode button;
- Chinese product-facing copy;
- build verification.

Not included yet:

- real GLB or Live2D character;
- recording/export pipeline;
- subtitles and voiceover;
- music;
- MP4 packaging;
- deployment.

## Visual Direction

Use a warm light-sci-fi palette:

```text
background: deep charcoal
primary glow: soft cyan
warm accent: peach
secondary accent: muted violet
text: warm white
```

Avoid:

- heavy cyberpunk neon;
- one-note purple gradient;
- purely abstract 3D shapes;
- generic SaaS card overload.

## Technical Notes

Continue using:

- `GlobalCanvas`
- `SmoothScrollbar`
- `UseCanvas`
- `ScrollScene`
- `scrollState.progress`
- `scrollState.visibility`

The point of this case is to prove the DOM/WebGL synchronization pattern against a real product story.

## Verification

Before calling the prototype useful:

- run `npm run build`;
- open the local page;
- verify there is one WebGL canvas;
- verify no mojibake in visible Chinese copy;
- verify Film Mode advances through all chapters;
- verify the original `scroll-product-story` template remains untouched.
