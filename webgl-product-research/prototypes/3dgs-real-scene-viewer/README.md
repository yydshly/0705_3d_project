# 3DGS Real Scene Viewer

This prototype closes the gap between the 3DGS research notes and something visible.

It is intentionally a lightweight local page that embeds public Gaussian Splatting viewer examples. The goal is not to train a splat model yet. The goal is to understand the viewer experience, the asset formats, and the difference between captured splat scenes and GLB product models.

## View Directly

This prototype can be opened directly in a browser because it has no build dependencies:

```text
D:\claude_code\20260704_opendesign\webgl-product-research\prototypes\3dgs-real-scene-viewer\index.html
```

## Optional Local Server

```powershell
cd D:\claude_code\20260704_opendesign\webgl-product-research\prototypes\3dgs-real-scene-viewer
node server.mjs
```

Open:

```text
http://127.0.0.1:5181/
```

If you want to run the checks on Windows PowerShell, use:

```powershell
node scripts\check-static.mjs
node scripts\check-server.mjs
```

or:

```powershell
npm.cmd run build
```

The embedded viewer uses public samples from `https://antimatter15.com/splat/`, so the page needs internet access for the 3DGS iframe. If the iframe is blocked, use the "open viewer" link in the page.

## What To Look For

- 3DGS looks like a captured real scene, not like a hand-authored product mesh.
- Natural details such as plants, outdoor clutter, and irregular surfaces can look convincing.
- Close or side views may reveal capture artifacts, missing geometry, floaters, or blur.
- The scene does not automatically provide collision, editable surfaces, material variants, product parts, or AR-ready geometry.
- A mature product page would often use a hybrid route:

```text
3DGS captured environment
  + GLB product or character
  + proxy mesh for collision / occlusion when needed
  + DOM hotspots and explanation
  + guided camera path
```

## Why This Prototype Exists

The previous 3DGS work produced:

```text
analyses/2026-07-06-3dgs-real-scenes.md
templates/3dgs-capability-checklist.md
```

This prototype adds runtime evidence:

```text
public splat scene
  -> embedded WebGL viewer
  -> scene switching
  -> explanation of splat vs mesh
  -> route decision for future projects
```

## Not Yet Covered

- Training a splat from our own photos or video.
- Hosting local `.splat`, `.ksplat`, `.spz`, or `.ply` assets.
- Integrating Spark directly into a Three.js scene.
- Adding proxy collision geometry.
- Mixing a GLB product or character into the splat scene.

Those are later steps if we decide to turn 3DGS from capability research into a full production pattern.
