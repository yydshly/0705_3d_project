# Avatar Character Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated VRM-first character runtime prototype that proves avatar loading, scene grounding, camera inspection, expression/motion controls, and documentation.

**Architecture:** Create a standalone Vite + Three.js project under `webgl-product-research/prototypes/avatar-character-viewer/`. The app loads a clearly sourced VRM sample with `GLTFLoader` and `VRMLoaderPlugin`, then exposes state controls and a quality panel. Documentation links the prototype back to the P1 Avatar evidence chain.

**Tech Stack:** Vite, Three.js, `@pixiv/three-vrm`, plain JavaScript, local README documentation.

---

### Task 1: Scaffold Prototype

**Files:**
- Create: `webgl-product-research/prototypes/avatar-character-viewer/package.json`
- Create: `webgl-product-research/prototypes/avatar-character-viewer/index.html`
- Create: `webgl-product-research/prototypes/avatar-character-viewer/src/main.js`
- Create: `webgl-product-research/prototypes/avatar-character-viewer/src/styles.css`

- [ ] Create a Vite app shell with a canvas mount, left explanation panel, and right runtime panel.
- [ ] Add npm dependencies: `vite`, `three`, `@pixiv/three-vrm`.
- [ ] Keep the prototype isolated from existing demos.

### Task 2: Implement VRM Runtime

**Files:**
- Modify: `webgl-product-research/prototypes/avatar-character-viewer/src/main.js`

- [ ] Set up renderer, scene, perspective camera, lights, ground grid, orbit-like pointer camera controls, and resize handling.
- [ ] Load `https://raw.githubusercontent.com/pixiv/three-vrm/release/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm`.
- [ ] Register `VRMLoaderPlugin` on `GLTFLoader`.
- [ ] Add idle breathing, gaze target, expression buttons when expression manager exists, and a fallback status if the sample exposes limited expressions.

### Task 3: Add Runtime Evidence Docs

**Files:**
- Create: `webgl-product-research/prototypes/avatar-character-viewer/README.md`
- Modify: `webgl-product-research/README.md`
- Modify: `webgl-product-research/10-missing-capability-backlog.md`

- [ ] Document how to run the prototype.
- [ ] Document what the prototype proves and what it does not prove.
- [ ] Mark the Avatar branch as having first runtime evidence, while still not production-ready.

### Task 4: Verify

**Files:**
- Run project checks only.

- [ ] Run `npm install`.
- [ ] Run `npm run build`.
- [ ] Start the dev server and verify the local page responds.
- [ ] Check Git status and commit.
