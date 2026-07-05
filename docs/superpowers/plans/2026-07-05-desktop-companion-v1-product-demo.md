# Desktop Companion V1 Product Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the isolated Desktop Companion prototype from a technical proof page into a more coherent scroll-driven 3D product demo.

**Architecture:** Keep the current `desktop-companion-story` Vite/R3F/r3f-scroll-rig app and replace the presentation layer. Archive the current source first, then rebuild `App.jsx` and `styles.css` around a single product story: companion wakes, listens, organizes, remembers, and settles into a finished desktop workspace.

**Tech Stack:** React, Three.js, React Three Fiber, Drei, r3f-scroll-rig, Vite.

---

### Task 1: Archive Current Prototype

**Files:**
- Create: `webgl-product-research/prototypes/_archives/desktop-companion-story-v0-technical-prototype/`

- [ ] Copy the current `src`, `README.md`, `CASE_LINKS.md`, `package.json`, `package-lock.json`, `index.html`, `scripts`, and `start-preview.cmd` into the archive directory.
- [ ] Leave `node_modules` and `dist` out of the archive.

### Task 2: Replace Product Demo Structure

**Files:**
- Modify: `webgl-product-research/prototypes/desktop-companion-story/src/App.jsx`

- [ ] Replace the current document-like chapter layout with a product film layout.
- [ ] Keep `GlobalCanvas`, `SmoothScrollbar`, `UseCanvas`, and `ScrollScene`.
- [ ] Build five story beats: wake, listen, organize, remember, finish.
- [ ] Use procedural 3D elements for desk, monitor, companion, conversation cards, task board, memory timeline, and ambient state.
- [ ] Keep a `Play Demo` button that scrolls through the story.

### Task 3: Replace Visual Style

**Files:**
- Modify: `webgl-product-research/prototypes/desktop-companion-story/src/styles.css`

- [ ] Remove the document-heavy layout feel.
- [ ] Use a darker immersive desktop scene with restrained panels and clearer visual hierarchy.
- [ ] Keep text short and product-oriented.
- [ ] Make mobile layout usable by reducing fixed overlays and avoiding text over the model.

### Task 4: Verify

**Commands:**
- Run: `npm.cmd run build`
- Expected: Vite build exits with code 0.

**Browser checks:**
- Open: `http://127.0.0.1:5175/`
- Confirm: one canvas, no console errors, Chinese text is readable, `Play Demo` progresses through the product story, and the page no longer looks like a placeholder explanation page.
