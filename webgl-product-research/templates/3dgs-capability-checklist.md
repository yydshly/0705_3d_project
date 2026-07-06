# 3DGS Capability Checklist

Use this checklist when evaluating 3D Gaussian Splatting, scanned spaces, splat viewers, real-scene demos, digital twins, or browser-based splat publishing.

The goal is to decide whether 3DGS is the right representation, what evidence exists, and what limits must be explained before building a product demo.

## 1. Target Use

```text
Scene / project name:
Target output:
  [ ] real-space viewer
  [ ] digital twin
  [ ] venue / room / exhibition showcase
  [ ] tourism / real-estate / retail scene
  [ ] memory / personal space
  [ ] product-in-environment story
  [ ] game-like scene
  [ ] video render / film
```

## 2. Input State

```text
Input available:
  [ ] many photos
  [ ] video capture
  [ ] already trained splat
  [ ] .ply
  [ ] .splat
  [ ] .ksplat
  [ ] .spz
  [ ] .sogs
  [ ] no capture yet
```

Capture notes:

```text
Scene type:
Lighting:
Camera path:
Number of images / video length:
Moving objects:
Reflective / transparent surfaces:
Rights / privacy concerns:
```

## 3. Representation Decision

| Goal | Prefer 3DGS When | Prefer Mesh / GLB When |
| --- | --- | --- |
| Real room or venue | Need photoreal visual memory of a captured space | Need clean collision, editing, relighting, or CAD-like control |
| Product showcase | Product is shown inside a real environment | Product itself needs materials, variants, exploded views, or AR |
| Portfolio / story world | Scene is a scanned space or immersive memory | Scene is designed, stylized, or needs authored interaction |
| Game-like interaction | Visual background can be splat, interaction uses separate collision mesh | Full world needs dynamic lighting, destruction, physics, or editing |
| Video | Camera path through real scene matters | Product/character animation is the focus |

## 4. Runtime And Viewer

```text
Viewer / runtime:
  [ ] SuperSplat / PlayCanvas
  [ ] WebGL splat viewer
  [ ] Spark / Three.js renderer
  [ ] custom WebGL
  [ ] custom WebGPU
  [ ] native viewer only

Browser support:
  [ ] desktop Chrome
  [ ] desktop Safari / Firefox
  [ ] mobile Chrome
  [ ] mobile Safari
  [ ] unknown

Interaction:
  [ ] orbit
  [ ] first-person navigation
  [ ] saved camera views
  [ ] guided tour
  [ ] hotspots / annotations
  [ ] mixed mesh overlays
```

## 5. File And Performance

```text
Format:
  [ ] PLY
  [ ] SPLAT
  [ ] KSPLAT
  [ ] SPZ
  [ ] SOGS

Size:
  [ ] under 25 MB
  [ ] 25-100 MB
  [ ] 100-500 MB
  [ ] over 500 MB

Optimization:
  [ ] compressed
  [ ] progressive loading
  [ ] LOD
  [ ] cropped / cleaned
  [ ] mobile fallback
```

Performance risks:

- Too many splats for mobile.
- Slow initial load.
- Browser memory pressure.
- Sorting cost or render instability.
- No progressive loading or fallback.

## 6. Visual Quality

```text
Coverage:
  [ ] complete room / space
  [ ] partial capture
  [ ] holes / missing surfaces

View quality:
  [ ] strong from all key views
  [ ] strong only on capture path
  [ ] breaks from side / close views

Artifacts:
  [ ] floaters
  [ ] blur
  [ ] ghosting
  [ ] noisy edges
  [ ] transparent / reflective failures
  [ ] scale ambiguity
```

## 7. Interaction Limits

Check whether the demo requires things splats do not naturally provide:

- Collision geometry.
- Editable mesh surfaces.
- Product part separation.
- PBR material variants.
- Dynamic lighting.
- Physics response.
- Character navigation.
- Occlusion with inserted mesh objects.

If these are required, plan a hybrid scene:

```text
splat background / captured space
  + proxy mesh for collision / occlusion
  + GLB products or characters
  + DOM or WebGL hotspots
```

## 8. Decision

```text
Quality level:
  [ ] S0 no capture
  [ ] S1 raw / unoptimized
  [ ] S2 viewable
  [ ] S3 presentable
  [ ] S4 guided showcase
  [ ] S5 production package

Recommended route:
  [ ] capture first
  [ ] edit / clean / crop first
  [ ] compress / convert first
  [ ] viewer prototype
  [ ] guided tour prototype
  [ ] hybrid splat + mesh prototype
  [ ] not a good 3DGS case

Main blocker:
  [ ] no capture
  [ ] weak visual quality
  [ ] file size / loading
  [ ] mobile performance
  [ ] missing collision / mesh proxy
  [ ] privacy / rights
  [ ] wrong representation
```

## 9. Reusable Conclusion

Use this sentence when relevant:

```text
3DGS is strongest when the product is a real space, real memory, venue, room, or environment. It is weaker when the goal is clean product parts, editable geometry, AR product inspection, or material configurators.
```
