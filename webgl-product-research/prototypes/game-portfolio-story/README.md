# Game Portfolio Story Prototype

This prototype validates the third research sample inspired by `brunosimon/folio-2019`.

It does not copy the original project. It extracts the reusable pattern:

```text
3D world map
  + controllable navigation entity
  + camera follow
  + project / capability stations
  + interaction areas
  + guided tour mode
```

## Run

```bash
npm install
npm run dev
```

Then open the Vite URL.

Static preview after build:

```bash
npm run build
npm run serve:dist
```

Default URL:

```text
http://127.0.0.1:5178/
```

## What This Tests

- Whether a product or research portfolio can be organized as a 3D space.
- Whether moving near a station is a better interaction than scrolling for multi-topic exploration.
- How station boards, camera follow, and guided tour mode can explain a capability map.
- How a future product showroom could combine free exploration with a directed film mode.
- How a station can open a second-level detail layer with technical notes, resource links, and a focused 3D mini demo.

## Controls

- `WASD` or arrow keys: move the rover.
- `自动导览`: let the rover travel through the research stations.
- `进入节点详情`: available when the rover is near the Shader grass station.
- `返回主展厅`: close the second-level detail layer.
- `重置观察`: reset camera framing.

## Current Deep Node

The first deep node is `Shader 草地系统`.

It validates this structure:

```text
main 3D hub
  -> station trigger
  -> second-level detail panel
  -> focused 3D mini demo
  -> resource links
  -> return to hub
```

## Research Link

See:

- `../../analyses/2026-07-05-bruno-simon-folio-2019.md`
- `../../templates/game-like-portfolio-capability-checklist.md`
