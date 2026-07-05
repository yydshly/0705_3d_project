# Technical Principles

Use this when explaining how a browser 3D project works.

## Mental Model

```text
Application code
  -> Three.js scene/camera/material/model abstractions
  -> WebGL or WebGPU graphics API
  -> shader programs
  -> GPU parallel execution
  -> pixels in a browser canvas
```

## Three.js

Three.js is a high-level JavaScript 3D library. It organizes scenes, cameras, lights, meshes, materials, loaders, controls, render loops, and post-processing. It is not the GPU layer itself.

## WebGL

WebGL is the browser graphics API that lets JavaScript submit drawing work to the GPU. It is based on OpenGL ES concepts, but runs inside the browser security and canvas environment.

## Shader

A shader is a small GPU program. A vertex shader decides how vertices move or deform. A fragment shader decides how pixels are shaded. Many impressive WebGL effects are parameter changes driving shader math over time.

## CPU vs GPU

The CPU usually runs app logic: loading files, updating state, scheduling animation, handling UI, and sending uniforms or buffers. The GPU performs highly parallel drawing work: vertex transforms, instancing, texture sampling, lighting, particles, terrain displacement, post-processing, and millions of similar calculations.

## What To Look For In Code

- `WebGLRenderer`, `WebGPURenderer`, `EffectComposer`
- `ShaderMaterial`, `RawShaderMaterial`, `onBeforeCompile`
- GLSL strings with `vertexShader` or `fragmentShader`
- `InstancedMesh`, `InstancedBufferGeometry`, custom attributes
- `GLTFLoader`, texture loaders, HDR/EXR environment maps
- `requestAnimationFrame`, `renderer.setAnimationLoop`
- GUI controls that update uniforms, material values, density, speed, color, wind, growth, or camera settings
