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

The first version uses procedural 3D placeholders instead of a real GLB character:

- desk scene;
- monitor or floating desktop window;
- companion presence;
- chat bubbles;
- memory cards;
- emotion aura;
- customization swatches;
- Film Mode auto progression.

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

This directory currently starts from the `scroll-product-story` code skeleton. The next step is to replace the EcoSense ecology device with a Desktop Companion scene.
