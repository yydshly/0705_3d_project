# Model Quality Gate

Use this gate to judge whether a `.glb`, `.gltf`, generated model, or procedural asset is ready for a 3D web page or video.

## Gate Summary

```text
Model:
Source:
File format:
File size:
Target output:
Reviewer:
Date:
```

## Level Definitions

| Level | Meaning | Suitable Output |
| --- | --- | --- |
| L0 Missing | No usable 3D asset exists. | Do not build 3D output yet. |
| L1 Placeholder | Simple procedural or rough generated geometry. | Internal prototype only. |
| L2 Inspectable | Loads in browser, has recognizable shape, can rotate/zoom. | Product viewer prototype. |
| L3 Presentable | Correct scale, plausible materials, acceptable textures, stable lighting. | Public website section or medium shots. |
| L4 Cinematic | High-quality geometry, close-up detail, separated parts, polished materials. | Product launch page, hero video, close-up film. |
| L5 Production | Optimized, licensed, compressed, tested on target devices, documented. | Real deployment and publishing package. |

## 1. Browser Loading

```text
Loads without console errors:
  [ ] pass
  [ ] fail
  [ ] not tested

Format:
  [ ] GLB
  [ ] glTF + external buffers/textures
  [ ] other:

File size:
  [ ] under 5 MB
  [ ] 5-15 MB
  [ ] 15-50 MB
  [ ] over 50 MB

Compression:
  [ ] Draco
  [ ] Meshopt
  [ ] KTX2 / Basis textures
  [ ] none
  [ ] unknown
```

Guideline:

- Small product viewers should usually aim for a compact first load.
- Larger hero scenes need progressive loading or a fallback.
- Video-only capture can tolerate heavier local assets, but publishable web pages cannot.

## 2. Geometry

```text
Shape accuracy:
  [ ] accurate
  [ ] recognizable
  [ ] rough
  [ ] wrong

Proportions:
  [ ] correct
  [ ] slightly off
  [ ] stretched / compressed

Mesh quality:
  [ ] clean topology
  [ ] acceptable
  [ ] noisy / broken
  [ ] unknown

Normals:
  [ ] correct
  [ ] visible artifacts
  [ ] broken / inverted

Part separation:
  [ ] separate useful parts
  [ ] partly separated
  [ ] single mesh
```

Decision:

- Single-mesh models can work for inspection.
- Exploded views and cinematic product films usually need separated parts.

## 3. Materials And Textures

```text
Material type:
  [ ] PBR
  [ ] simple material
  [ ] flat colors
  [ ] missing

Texture coverage:
  [ ] albedo / base color
  [ ] normal
  [ ] roughness
  [ ] metalness
  [ ] emission
  [ ] alpha

Texture quality:
  [ ] supports close-up
  [ ] supports medium shot
  [ ] only wide shot
  [ ] not usable

Material plausibility:
  [ ] realistic
  [ ] stylized but intentional
  [ ] toy-like
  [ ] broken
```

Decision:

- If the model looks weak in close-up, do not solve it with camera motion alone.
- Either improve materials/textures or avoid close-up shots.

## 4. Scale, Orientation, Grounding

```text
Scale:
  [ ] correct
  [ ] needs normalization
  [ ] unknown

Orientation:
  [ ] forward/up axes correct
  [ ] needs rotation
  [ ] unknown

Pivot / origin:
  [ ] good for orbit
  [ ] needs adjustment
  [ ] bad

Ground contact:
  [ ] grounded
  [ ] floats
  [ ] sinks
  [ ] not applicable
```

Decision:

- Wrong scale and pivot make product viewers feel broken.
- Bad grounding makes cinematic scenes look fake even with good lighting.

## 5. Animation Readiness

```text
Animation clips:
  [ ] available
  [ ] none
  [ ] not needed

Rig / skeleton:
  [ ] available
  [ ] none
  [ ] not needed

Parts can animate independently:
  [ ] yes
  [ ] partly
  [ ] no

Suitable for:
  [ ] orbit inspection
  [ ] hotspots
  [ ] exploded view
  [ ] character motion
  [ ] cinematic reveal
```

Decision:

- Product inspection can work without animation.
- Product films usually need part separation or authored transform targets.
- Character projects need rigging, expressions, and idle behavior.

## 6. Publishing Readiness

```text
License:
  [ ] publishable
  [ ] internal only
  [ ] unknown

Mobile performance:
  [ ] tested
  [ ] likely OK
  [ ] risky
  [ ] not suitable

Fallback:
  [ ] poster image
  [ ] static render
  [ ] low-poly model
  [ ] none

Documentation:
  [ ] source recorded
  [ ] optimization notes
  [ ] usage constraints
  [ ] missing
```

## Final Decision

```text
Quality level:
  [ ] L0 Missing
  [ ] L1 Placeholder
  [ ] L2 Inspectable
  [ ] L3 Presentable
  [ ] L4 Cinematic
  [ ] L5 Production

Approved use:
  [ ] no 3D output yet
  [ ] internal prototype
  [ ] product viewer prototype
  [ ] public web section
  [ ] cinematic video
  [ ] production deployment

Main blocker:
  [ ] no model
  [ ] geometry quality
  [ ] materials / textures
  [ ] scale / orientation
  [ ] animation / part separation
  [ ] file size / compression
  [ ] license
  [ ] runtime performance
```

## Recommended Response Pattern

When the model fails the gate, state it directly:

```text
The current asset is L1/L2. It can prove the interaction, but it should not be used for final cinematic product presentation.
```

Then recommend the smallest useful next step:

```text
Use model-viewer for inspection now.
Improve the GLB before cinematic animation.
Generate or source a better asset before public launch.
```
