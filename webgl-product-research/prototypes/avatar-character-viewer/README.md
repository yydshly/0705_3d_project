# Avatar Character Viewer

This prototype is the first runtime evidence for the P1 Avatar / VRM / Live2D / character motion branch.

It is not a finished character product page. It is a focused viewer that proves the browser runtime route:

```text
VRM sample asset
  -> Three.js
  -> GLTFLoader
  -> VRMLoaderPlugin
  -> VRM scene object
  -> idle state / gaze / expression entry points
  -> quality evidence panel
```

## How To Run

```powershell
cd D:\claude_code\20260704_opendesign\webgl-product-research\prototypes\avatar-character-viewer
npm install
npm run dev
```

The project fixes the development port to `5181` so it matches the browser route used during research. Open:

```text
http://127.0.0.1:5181/
```

If the port is occupied, stop the other local server or run `npm run dev -- --port <another-port>` and open the URL printed by Vite.

## What It Proves

- A VRM character asset can be loaded through `GLTFLoader` with `VRMLoaderPlugin`.
- The scene can ground the character, light it, and expose camera inspection.
- The UI can expose behavior states such as idle, greet, explain, and think.
- The runtime can query and attempt to drive VRM expression data.
- Avatar work needs a dedicated route, not a normal product model viewer route.

## What It Does Not Prove Yet

- It does not prove production-grade character art direction.
- It does not include authored motion clips.
- It does not include speech audio, lip sync, or captions.
- It does not include Live2D runtime evidence.
- It does not include Ready Player Me integration.

## Asset Source

The prototype loads a local copy of the public `three-vrm` sample asset:

```text
public/models/VRM1_Constraint_Twist_Sample.vrm
```

Project reference:

```text
https://github.com/pixiv/three-vrm
```

Original source:

```text
https://github.com/pixiv/three-vrm/tree/release/packages/three-vrm/examples/models
```

This is suitable for runtime evidence, not for a final branded product.

## Quality Level

Current level:

```text
C2 Inspectable -> C3 Presentable baseline
```

The prototype can prove loading, viewing, grounding, and control entry points. A real product page still needs a product-specific character asset, authored motions, expression tuning, voice/caption timing, and production optimization.
