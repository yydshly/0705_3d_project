# Prototype Notes

Date: 2026-07-05

## Status

The prototype has been implemented and the production build passes.

Verified:

```bash
npm install
npm run build
```

Build result:

- Vite build completed successfully.
- Output generated in `dist/`.
- Bundle warning: main JS chunk is larger than 500 kB, expected for a Three/R3F prototype before code splitting.

Foreground dev command also starts successfully:

```bash
npm run dev -- --port 5174
```

Vite reported:

```text
Local: http://127.0.0.1:5174/
```

## Environment Note

Starting Vite as a persistent background process from this Codex shell was unreliable in this Windows environment.

Observed issues:

- PowerShell `Start-Process` fails because the process environment contains duplicate `Path`/`PATH` keys.
- Detached `cmd`/Node/WSH launch attempts did not leave a listening process on port `5174`.
- Foreground Vite startup works, but the tool timeout terminates the process.

This is an environment/process-launch limitation, not a Vite build failure.

## What The Prototype Validates

This prototype tests the architecture learned from `r3f-scroll-rig`:

```text
HTML content sections
  -> DOM anchor refs
  -> ScrollScene tracking
  -> UseCanvas tunneling
  -> GlobalCanvas rendering
  -> scroll-driven 3D product object
```

Implemented:

- Four narrative content sections.
- A fixed global WebGL canvas.
- A procedural EcoSense ecology monitoring device.
- DOM-aligned 3D stage per section.
- Scroll-driven rotation, depth, visibility, and material tone changes.
- A first `Play Film Mode` button that auto-advances through sections.

2026-07-05 refinement:

- Replaced mojibake UI text with readable Chinese copy.
- Changed the demo from a generic technical page into a reusable product story page.
- Added visual states for establishment, scroll synchronization, structural inspection, and recordable flow.
- Switched the WebGL canvas back to continuous rendering so the product has a subtle live presence.
- Added `TEMPLATE_GUIDE.md` to explain how to replace the procedural object with a real GLB model and how to extend Film Mode.

Second refinement:

- Replaced the abstract placeholder product with a specific `EcoSense` outdoor ecology monitoring device case.
- Added a soil/grass base, monitoring device body, screen, solar panel, sensor probes, data particles, and structural expansion state.
- Reframed the page around four concrete story beats: field setup, live sensing, inside the product, and publishable demo.

## Product Learning

The important shift is:

```text
3D demo
  -> immersive product story page
  -> recordable product film
```

This confirms that `webgl-product-film` v2 should cover immersive websites, not just standalone 3D scenes.

## Next Improvements

1. Add reliable local run instructions and stop script for Windows.
2. Add browser visual QA once the dev server can persist.
3. Add `MediaRecorder` capture.
4. Add captions and timeline metadata.
5. Replace the procedural object with a GLB product model.
6. Extract an `immersive-website.md` reference into the Skill.
