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

## V1.1 Showcase Upgrade

This version moves the prototype from a rough movement test toward a readable research showroom:

- Five research nodes now have real second-level detail content.
- Each node has a distinct 3D mini installation so the space is easier to read visually.
- The central hub explains the research pipeline: repo -> prototype -> film -> skill.
- The guided tour moves more slowly and pauses near stations to feel more like a walkthrough.
- The right-side research path can open each node directly for faster review.

## V1.2 Branded Portfolio Upgrade

This version moves closer to an immersive portfolio pattern inspired by sites like Samsy Ninja:

- Adds a branded first-view layer: `3D Capability Atlas`.
- Adds portfolio-style exhibit data for every node: exhibit type, outcome, and use case.
- Adds a 3D cover card to each station so the scene reads more like a project gallery.
- Adds a detail focus stage for every node, so opening details changes both the UI and the 3D scene.
- Keeps the project positioned as a research portfolio, not a clone of any specific website.

## V1.3 Experience Polish

This version reduces visual noise after screenshot review:

- The center brand panel is lighter and works as a status layer instead of blocking the scene.
- Detail panels now show summary first, with technical notes hidden behind an expand action.
- The right-side research path highlights one focused node instead of mixing proximity and detail states.
- 3D station boards use fewer small text lines; detailed explanation stays in the DOM panel.
- The 3D detail focus stage uses short exhibit labels, while longer use-case text stays readable in the UI.

## Controls

- `WASD` or arrow keys: move the rover.
- `自动导览`: let the rover travel through the research stations.
- `进入节点详情`: available when the rover is near a research station.
- Right-side research path: open a station detail layer directly.
- `返回主展厅`: close the second-level detail layer.
- `重置观察`: reset camera framing.

## Current Deep Node

All five nodes now support a detail layer:

- `Shader 草地系统`
- `滚动驱动 3D 官网`
- `游戏化空间作品集`
- `产品展示视频化`
- `可复用 Skill`

They validate this structure:

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
