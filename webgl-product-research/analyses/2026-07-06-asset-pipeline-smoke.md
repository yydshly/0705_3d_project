# Asset Pipeline Smoke Check

Date: 2026-07-06

## Question

Can the current product prototypes prove production-quality 3D product assets?

Short answer: no.

They prove useful WebGL / Three.js display mechanics, but they do not prove that we can make a rough model look like a polished commercial product. That requires a separate asset pipeline.

## Evidence 1: Product Viewer Story

Prototype:

```text
webgl-product-research/prototypes/product-viewer-story/
```

Observed assets:

| Asset | Size | Meaning |
| --- | ---: | --- |
| `public/assets/lumadock-ai-companion.glb` | 122,964 bytes | Browser-loadable procedural product asset |
| `public/assets/RobotExpressive.glb` | 463,988 bytes | External character sample asset |
| `public/assets/poster.svg` | 1,109 bytes | Static poster fallback |

Source evidence:

```text
webgl-product-research/prototypes/product-viewer-story/scripts/generate-lumadock-glb.mjs
webgl-product-research/prototypes/product-viewer-story/src/main.js
```

The product model is generated from procedural Three.js primitives such as:

```text
CylinderGeometry
BoxGeometry
TorusGeometry
SphereGeometry
MeshStandardMaterial
```

The runtime uses `@google/model-viewer` for:

- GLB loading;
- orbit inspection;
- camera presets;
- hotspots;
- material tone switching;
- AR-style affordance.

Bounded conclusion:

```text
Quality level: L2 Inspectable
Suitable route: product viewer prototype
Main blocker: not a real product model and not close-up/cinematic quality
```

This prototype is good evidence for model-viewer workflow, not for final product asset quality.

## Evidence 2: Cinematic Product Showcase

Prototype:

```text
webgl-product-research/prototypes/cinematic-product-showcase/
```

Source evidence:

```text
webgl-product-research/prototypes/cinematic-product-showcase/src/main.js
webgl-product-research/prototypes/cinematic-product-showcase/README.md
```

The cinematic product is also procedural. It uses primitives and materials such as:

```text
RoundedBoxGeometry
CylinderGeometry
TorusGeometry
SphereGeometry
MeshPhysicalMaterial
MeshStandardMaterial
```

The prototype validates:

- product entrance timing;
- directed camera beats;
- feature visualization;
- exploded-view transforms;
- particles and final hero framing.

The README already records the key limitation: the product is procedural geometry, not a real industrial model. Its purpose is capability validation, not final commercial polish.

Bounded conclusion:

```text
Quality level: L1-L2 prototype asset
Suitable route: cinematic mechanics prototype
Main blocker: no real industrial model, weak close-up detail, no true product asset intake
```

This prototype is good evidence for motion and camera direction, not for real product modeling, UVs, textures, or launch-grade visual fidelity.

## Skill Recommendation

`webgl-product-film` should contain a real asset pipeline branch.

When the user says a model looks rough, stretched, floating, toy-like, or placeholder-like, Codex should inspect the asset before polishing camera motion.

Reusable artifacts now exist:

```text
webgl-product-research/templates/asset-intake-checklist.md
webgl-product-research/templates/model-quality-gate.md
C:\Users\yun68\.codex\skills\webgl-product-film\references\asset-pipeline.md
```

## Next Use

Use this sequence for real product cases:

```text
asset intake
  -> model quality gate
  -> choose product viewer / cinematic film / avatar / 3DGS route
  -> only then polish camera, lighting, animation, and publishing
```

The reusable rule is:

```text
The current bottleneck may be asset quality, not WebGL implementation.
```
