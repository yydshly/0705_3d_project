---
name: webgl-product-film
description: Analyze Three.js/WebGL/interactive 3D repositories and turn them into understandable, cinematic, publishable product-demo films. Use when the user wants to understand a WebGL or Three.js project, identify shaders/GPU rendering capabilities, redesign a 3D demo into a guided scene, add camera direction, recording controls, captions, voiceover, music, MP4 export, cover images, README guidance, or a reusable publishing workflow for immersive websites, 3D portfolios, product showcases, visual effects demos, or technical showreels.
---

# WebGL Product Film

Use this skill to convert a WebGL/Three.js demo from "it runs" into "it explains itself and can be published."

## Core Workflow

1. Inspect the project before changing it:
   - Find the framework, entry file, render loop, renderer, scene, camera, controls, assets, shaders, GUI controls, and build scripts.
   - Run `scripts/probe-threejs-project.mjs <project-root>` when a quick static scan is useful.
   - Read `references/technical-principles.md` when the user asks conceptual questions about Three.js, WebGL, shaders, GPU, or CPU.

2. Build a capability map:
   - Identify what the project can show: geometry, materials, instancing, particles, terrain, vegetation, models, animation, post-processing, lighting, audio, interaction, capture, and export.
   - Separate true engine capability from one-off visual decoration.
   - Read `references/workflow.md` for the capability-map format.

3. Design the demonstration before editing heavily:
   - Turn parameters into a story: initial state, construction/growth/change, interaction, close inspection, final hero view.
   - Prefer a coherent scene over disconnected feature clips.
   - Mix wide shots, medium shots, close-ups, orbit, push/pull, and calm hold shots.
   - Read `references/visual-review-checklist.md` before finalizing camera or scene changes.

4. Implement in the local project:
   - Follow existing project style and dependencies.
   - Keep demo controls explicit: play full demo, record film, captions, voiceover, music, reset.
   - Avoid hardcoding secrets or platform-specific credentials in source.
   - Keep user-made changes intact.

5. Package for publishing:
   - Record WebM from the browser or project pipeline.
   - Convert to MP4 with H.264/AAC for broad platform compatibility.
   - Add captions, voiceover, background music, cover image, and publish notes.
   - Read `references/publishing.md` when audio, subtitles, ffmpeg, cover, or platform delivery matters.

6. Document the result:
   - Add a README entry that answers: how to run, how to view the demo, how to record/export, where outputs are.
   - Add a capability guide only when the user wants reusable learning notes.
   - Keep project docs separate from this skill.

## Quality Bar

- The demo should teach the capability visually, not merely rotate the camera.
- Camera motion should feel motivated; avoid continuous forward pushes and abrupt unrelated cuts.
- Models should keep correct scale, grounding, proportions, and contact shadows.
- Growth, wind, particles, clouds, and material changes should follow believable timing.
- The final video package should include MP4, cover image, captions, and publish notes when the user asks for shareable output.

## Case Reference

For a concrete previous pattern, read `references/case-grasssystem.md`. Treat it as an example, not a template to copy blindly.
