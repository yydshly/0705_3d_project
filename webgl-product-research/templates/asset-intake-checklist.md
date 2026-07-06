# Asset Intake Checklist

Use this checklist before starting a real 3D product page, cinematic product film, portfolio node, avatar demo, or immersive website.

The goal is to decide whether the current assets can support the requested output.

## 1. Request Summary

```text
Project / product / character name:
Target output:
  [ ] product viewer
  [ ] cinematic product page
  [ ] publishable video
  [ ] immersive website
  [ ] 3D portfolio / showroom
  [ ] avatar / AI companion
  [ ] technical demo explanation

Target platform:
  [ ] desktop web
  [ ] mobile web
  [ ] social video
  [ ] ecommerce / product page
  [ ] internal prototype
  [ ] other:
```

## 2. Current Inputs

Mark what exists now:

```text
3D model:
  [ ] GLB / glTF
  [ ] FBX / OBJ / USDZ / other
  [ ] Blender file
  [ ] generated procedural model
  [ ] no model yet

2D assets:
  [ ] product photos
  [ ] screenshots
  [ ] sketches
  [ ] logo / brand system
  [ ] UI screenshots
  [ ] texture images

Animation:
  [ ] model animation clips
  [ ] rig / skeleton
  [ ] product part separation
  [ ] character expressions
  [ ] no animation yet

Publishing assets:
  [ ] copy / script
  [ ] subtitles
  [ ] voiceover
  [ ] music / sound
  [ ] cover image
```

## 3. Asset Source

```text
Source type:
  [ ] user-provided
  [ ] open licensed asset
  [ ] generated asset
  [ ] procedural placeholder
  [ ] extracted from existing project
  [ ] still needs sourcing

License / permission status:
  [ ] owned by user
  [ ] open license checked
  [ ] unclear
  [ ] not usable for publishing yet
```

Do not treat an unclear-license asset as publishable.

## 4. Model Readiness

```text
Can the model be loaded in browser?
  [ ] yes
  [ ] unknown
  [ ] no

Does the model have correct scale and orientation?
  [ ] yes
  [ ] needs checking
  [ ] no

Does it have usable materials?
  [ ] PBR materials
  [ ] simple colors
  [ ] missing / weak materials

Does it have textures?
  [ ] color / albedo
  [ ] normal
  [ ] roughness / metalness
  [ ] emission
  [ ] no textures

Is it separated into useful parts?
  [ ] yes, product parts can animate
  [ ] partly
  [ ] no, single mesh

Does it support close-up shots?
  [ ] yes
  [ ] only medium / wide shots
  [ ] no
```

## 5. Output Routing

Choose the route based on available assets:

| Asset Situation | Recommended Route |
| --- | --- |
| High-quality GLB, inspection goal | `product-viewer-story` / model-viewer pattern |
| High-quality model with separated parts | `cinematic-product-showcase` pattern |
| Only product photos or concept art | asset creation or generated model step first |
| Character model with rig / expressions | avatar / character validation branch |
| No model, but story/demo needed | procedural placeholder only, label as prototype |
| Real room / scanned space | 3DGS / digital twin branch |
| Shader / procedural effect source | technical film branch |

## 6. Quality Risks

Check these before promising realism:

- Model looks toy-like or too simple.
- Object floats, sinks, stretches, or has wrong proportions.
- Materials are flat, plastic, or not physically plausible.
- Textures are blurry, missing, or too large.
- File size is too heavy for mobile.
- Product parts cannot separate for exploded view.
- No UVs or broken normals.
- No shadows, contact grounding, or environment lighting.
- Asset license is unclear.

## 7. Decision

```text
Current asset level:
  [ ] publishable
  [ ] prototype quality
  [ ] placeholder only
  [ ] not usable yet

Recommended next action:
  [ ] use current asset in product viewer
  [ ] use current asset in cinematic prototype
  [ ] optimize / compress model first
  [ ] improve materials / textures first
  [ ] source or generate a better model first
  [ ] lower output goal to prototype
  [ ] choose another 3D expression pattern
```

## 8. Skill Note

If the asset is not strong enough, do not keep polishing camera, lighting, or copy as if that will solve the core problem.

State the limitation clearly:

```text
The current bottleneck is asset quality, not WebGL implementation.
```
