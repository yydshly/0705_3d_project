# Mainline Reset: Desktop Companion Product Direction

This document records the current project mainline after the WebGL / Three.js research phase.

## Mainline Is Not 3D Research

The project mainline is not:

```text
keep researching 3D libraries
keep making visual demos
keep polishing placeholder models
```

3D is now a supporting capability. It helps express a product, but it is not the product goal by itself.

## Current Mainline

The mainline is:

```text
Desktop Companion / AI companion product direction
  -> product positioning
  -> usable demo
  -> 3D product expression when helpful
  -> publishable website or video
  -> reusable workflow
```

This matches the existing implementation plan:

```text
docs/superpowers/plans/2026-07-05-desktop-companion-v1-product-demo.md
```

## What The 3D Research Gave Us

The research phase produced a toolbox:

| Capability | Use For Mainline |
| --- | --- |
| GrassSystem film pipeline | Record and package product demo videos later |
| Scroll-driven 3D website | Build immersive product landing pages |
| Game-like portfolio / showroom | Explain a product ecosystem or research map |
| Product viewer | Inspect a real product model when one exists |
| Cinematic showcase | Animate product entrance, feature beats, and launch-style shots |

These are not the mainline. They are reusable techniques.

## What We Should Stop

Stop:

- continuing abstract 3D technical exploration without a product goal;
- polishing procedural placeholder models;
- treating missing asset quality as a code problem;
- switching between demo types without choosing a product outcome;
- recording videos before the product story and assets are strong enough.

## What We Should Do Next

Return to the Desktop Companion V1 product demo.

Next useful work:

1. Re-read the existing implementation plan.
2. Inspect the current `desktop-companion-story` prototype.
3. Decide whether the existing plan still matches the product direction.
4. Execute the plan in the isolated prototype directory.
5. Verify the result as a product demo, not just a 3D experiment.

## Success Criteria

The next milestone is successful if it answers:

```text
What is this companion product?
Why would someone want it?
What does the demo show?
How does 3D make the story clearer?
What can be published or reused after this?
```

It is not successful merely because:

- a canvas renders;
- a model moves;
- the page has visual effects;
- the demo looks technically impressive.

## Next Action

Use this plan as the immediate execution anchor:

```text
docs/superpowers/plans/2026-07-05-desktop-companion-v1-product-demo.md
```

The next implementation should happen under:

```text
webgl-product-research/prototypes/desktop-companion-story/
```

Keep all future 3D choices subordinate to the product story.
