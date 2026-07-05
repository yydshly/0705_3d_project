# Project Map

This map groups projects by the capability they represent. Research should focus on what each project teaches us, not on star counts alone.

## Layer 1: Immersive Website / Portfolio

### brunosimon/folio-2019

Link: https://github.com/brunosimon/folio-2019

Core capability:

- Turn a personal portfolio into an explorable 3D world.
- Use a physics-driven car as the user's navigation entity.
- Represent projects as spatial boards, floors, trophies, links, and interactive zones.
- Combine Three.js, cannon/cannon-es physics, sound, post-processing, custom shaders, and authored GLB assets.

Why it matters:

- Complements scroll-driven websites with a game-like spatial showcase pattern.
- Helps us understand why some 3D websites feel like real spaces instead of ordinary pages with decorative models.
- Useful for future personal portfolios, product museums, AI tool showrooms, and virtual exhibitions.

Research focus:

- Vehicle control and camera-follow design.
- Project data mapped into spatial boards and areas.
- Asset organization: GLB, collision meshes, matcaps, floor shadows, sounds.
- How to decide between scroll-driven storytelling and free exploration.

### 14islands/r3f-scroll-rig

Link: https://github.com/14islands/r3f-scroll-rig

Core capability:

- Sync React DOM layout with React Three Fiber 3D objects.
- Turn page scrolling into camera/object storytelling.
- Let a normal website progressively become a WebGL experience.

Why it matters:

- Closest to Samsy Ninja-style personal/product showcase pages.
- Helps us understand how to combine text, layout, scroll, camera, and 3D objects.
- Good second case for testing `webgl-product-film`.

Research focus:

- DOM-to-3D coordinate synchronization.
- Scroll timeline and camera control.
- Page performance and fallback behavior.
- How to package a 3D effect as a reusable website capability.

## Layer 2: Modern Three.js Ecosystem

### pmndrs/react-three-fiber

Link: https://github.com/pmndrs/react-three-fiber

Core capability:

- Use React components to describe Three.js scenes.
- Connect 3D rendering with React state and component architecture.

Research focus:

- How React components map to Three.js objects.
- How `useFrame`, events, suspense, and loaders structure an app.
- How product-grade 3D apps are organized compared with plain Three.js.

### pmndrs/drei

Link: https://github.com/pmndrs/drei

Core capability:

- Common helpers for R3F: controls, loaders, cameras, environment, text, HTML overlays.

Research focus:

- Which helpers accelerate product/showcase development.
- Which abstractions reduce repeated Three.js boilerplate.
- Which helpers should appear in our future templates.

### pmndrs/postprocessing

Link: https://github.com/pmndrs/postprocessing

Core capability:

- Bloom, depth of field, color grading, antialiasing, and other final-image effects.

Research focus:

- How cinematic finishing is applied.
- How to avoid using post-processing to hide weak scene design.
- Which effects belong in a product film template.

### pmndrs/react-three-rapier

Link: https://github.com/pmndrs/react-three-rapier

Core capability:

- Real-time physics in R3F through Rapier.

Research focus:

- When physics adds product value.
- Whether demos need interaction, collisions, gravity, or object manipulation.

## Layer 3: Product 3D Display

### google/model-viewer

Link: https://github.com/google/model-viewer

Core capability:

- Display interactive 3D models on the web and in AR with a simple web component.

Why it matters:

- Very practical product showcase reference.
- Good for ecommerce, education, object inspection, and AR preview.

Research focus:

- Model loading, camera controls, annotations, AR, lighting, environment.
- What a "boring but useful" product viewer does better than a flashy demo.
- How to design default controls for non-technical users.

Current local artifacts:

- `analyses/2026-07-05-google-model-viewer.md`
- `projects/model-viewer/README.md`
- `templates/product-viewer-capability-checklist.md`

## Layer 4: Real-World Scene / 3D Gaussian Splatting

### sparkjsdev/spark

Link: https://github.com/sparkjsdev/spark

Core capability:

- Advanced 3D Gaussian Splatting renderer for Three.js.
- Mix splats and mesh objects.
- Support dynamic splat editing, animation, displacement, and shader graph workflows.

Why it matters:

- Represents a newer direction: real scanned spaces and spatial storytelling in the browser.
- Strong candidate for future product demos based on real places, rooms, objects, or scenes.

Research focus:

- How splats integrate with a normal Three.js pipeline.
- How real-world captures change the product display experience.
- What it means to make a browser-native spatial scene.

### playcanvas/supersplat

Link: https://github.com/playcanvas/supersplat

Core capability:

- Browser-based editor for inspecting, editing, optimizing, and publishing 3D Gaussian Splats.

Why it matters:

- It is closer to a tool/product than a rendering demo.
- Useful for understanding import, edit, optimize, publish workflows.

Research focus:

- Tool UI design for 3D assets.
- Asset optimization and publishing.
- How an advanced rendering capability becomes an actual workflow.

### antimatter15/splat

Link: https://github.com/antimatter15/splat

Core capability:

- Minimal WebGL 3D Gaussian Splat viewer.

Research focus:

- The simplest possible implementation path.
- Low-level rendering and controls without a large framework.
- Good contrast against Spark and SuperSplat.

## Layer 5: Low-Level GPU Foundation

### mrdoob/three.js

Link: https://github.com/mrdoob/three.js

Core capability:

- Core JavaScript 3D library with WebGL and WebGPU renderers.

Research focus:

- Official examples.
- Renderer, material, geometry, shader, and post-processing patterns.
- How low-level concepts surface in real apps.

### webgpu/webgpu-samples

Link: https://github.com/webgpu/webgpu-samples

Core capability:

- Official-style WebGPU samples demonstrating next-generation browser GPU rendering.

Research focus:

- WebGPU concepts: device, pipeline, bind groups, WGSL shaders.
- How WebGPU differs from Three.js/WebGL usage.
- Which concepts are worth adding to the Skill as future-facing notes.
