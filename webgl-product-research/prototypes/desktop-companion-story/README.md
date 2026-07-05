# Desktop Companion Story Prototype

This is an isolated real-case prototype derived from `scroll-product-story`.

It validates whether the r3f-scroll-rig template can support a real product story: a desktop AI companion that appears in the user's workspace, responds in real time, remembers context, shows emotional state, interacts with desktop objects, and grows through customization.

## Isolation

Original reusable template:

```text
../scroll-product-story/
```

This real case:

```text
../desktop-companion-story/
```

Case planning documents:

```text
../../cases/desktop-companion/
```

Do not edit the original template when working on this case.

## Goal

Create a scroll-driven 3D product page that can later become a short product film.

The first version started with procedural 3D placeholders. The current iteration uses the animated `RobotExpressive.glb` model as the visible companion, so the product presence now has a real GLB asset, skeleton animations, lighting, and camera integration:

- desk scene;
- monitor or floating desktop window;
- companion presence;
- chat bubbles;
- memory cards;
- emotion aura;
- customization swatches;
- Film Mode auto progression.
- animated GLB desktop companion character on the desk.

See `ASSET_CREDITS.md` for generated asset notes and active model references.

## Run

```bash
npm install
npm run dev
```

Then open the Vite URL.

## Source Documents

- `../../cases/desktop-companion/PRODUCT_INPUT_BRIEF.md`
- `../../cases/desktop-companion/STORYBOARD.md`
- `../../cases/desktop-companion/IMPLEMENTATION_NOTES.md`

## Current Status

This directory now contains a Desktop Companion product story built from the `scroll-product-story` skeleton. The next step is to make the task extraction, memory capture, and desktop organization effects behave more like real product actions instead of explanatory overlays.
