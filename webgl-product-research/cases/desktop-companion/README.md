# Desktop Companion 3D Story Case

This case validates whether the `scroll-product-story` template can serve a real product-like project instead of only explaining `r3f-scroll-rig`.

The selected product direction is a desktop AI companion: an assistant that appears as a persistent presence on the user's desktop, with conversation, memory, emotion, interaction, and customization.

## Why This Case

Desktop Companion is a good first real case because it has:

- a clear subject: a companion character or presence;
- a natural environment: the user's desktop;
- visible interaction: chat, reminders, files, windows, mood changes;
- emotional value: warmth, memory, companionship;
- video potential: it can be explained as a short narrative, not only as UI.

It tests whether our template can move from:

```text
library research
  -> reusable template
  -> real product story
```

## Case Goals

1. Convert a product idea into a structured 3D scroll story.
2. Use the existing `r3f-scroll-rig` pattern without modifying the original template.
3. Create an isolated prototype under `prototypes/desktop-companion-story/`.
4. Keep the product thinking under `cases/desktop-companion/`.
5. Prepare the page for a later Film Mode and shareable video.

## Directory Isolation

```text
webgl-product-research/cases/desktop-companion/
  Product input, storyboard, and implementation notes.

webgl-product-research/prototypes/desktop-companion-story/
  Isolated runnable webpage prototype.

webgl-product-research/prototypes/scroll-product-story/
  Original reusable template. Do not edit it for this case.
```

## Current Phase

This case starts with product definition and storyboard before visual implementation.

The first implementation should use a procedural placeholder scene:

- a desk plane;
- a monitor or floating window;
- a simple companion avatar/presence;
- chat bubbles;
- memory cards;
- emotion light ring;
- customization swatches.

Real GLB/Live2D/character assets can be added later.

## Files

- `PRODUCT_INPUT_BRIEF.md`: filled product brief for Desktop Companion.
- `STORYBOARD.md`: page chapters and Film Mode story beats.
- `IMPLEMENTATION_NOTES.md`: implementation boundaries and template mapping.
