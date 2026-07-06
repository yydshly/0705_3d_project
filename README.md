# WebGL / Three.js 3D Research Workspace

这个仓库是一个 3D Web 技术研究与 skill 沉淀工作区。

主线不是某一个具体产品，也不是只做 AI 女友 / AI 伴侣页面。主线是：

```text
研究 3D Web 技术
  -> 理解优秀项目如何实现
  -> 提炼可复用模式
  -> 做小型原型验证
  -> 沉淀文档、模板和 Codex skill
  -> 后续用这些能力生成产品页、作品集、演示视频或交互官网
```

## Start Here

建议先读这两个入口：

```text
docs/mainline/2026-07-05-mainline-reset.md
docs/mainline/2026-07-05-3d-research-skill-roadmap.md
```

它们说明：

- 当前主线是什么；
- AI 女友 / 桌面伴侣为什么只是展示案例；
- 3D 技术研究如何沉淀成 `webgl-product-film` skill；
- 下一步应该如何继续推进。

## Core Question

这个仓库要长期回答的问题是：

```text
一个 3D Web 项目，如何被理解、拆解、复用、演示、录制，并最终沉淀成可再次调用的工作流？
```

不是只看“效果酷不酷”，而是要知道：

- 它用了什么底层技术；
- 它的 3D 能力边界是什么；
- 它适合什么应用场景；
- 它有哪些可复用实现模式；
- 它是否应该进入 skill；
- 以后如何让 Codex 按这个流程生成新项目。

## Main Research Directory

```text
webgl-product-research/
```

重要文档：

| File | Purpose |
| --- | --- |
| `01-project-map.md` | 候选 3D 项目地图 |
| `02-research-roadmap.md` | 分阶段研究路线 |
| `03-skill-upgrade-plan.md` | `webgl-product-film` skill 升级计划 |
| `06-research-case-matrix.md` | 当前案例覆盖度和缺口 |
| `08-mainline-return.md` | 从零散 demo 回到研究主线的交接说明 |
| `templates/` | 后续生成/分析 3D 项目的输入模板 |

## Current Case Map

| Case | What It Teaches |
| --- | --- |
| `GrassSystemThreeJS-demo/` | shader、GPU 草地、风、场景导演、录制与发布视频 |
| `webgl-product-research/prototypes/scroll-product-story/` | 滚动驱动 3D 官网，DOM 与 WebGL 同步 |
| `webgl-product-research/prototypes/game-portfolio-story/` | 类 Samsy Ninja 的空间化作品集、节点、详情层、Film Mode |
| `webgl-product-research/prototypes/product-viewer-story/` | `model-viewer` 产品模型展示、热点、相机、AR 思路 |
| `webgl-product-research/prototypes/cinematic-product-showcase/` | 产品动画、镜头、特性展示、拆解式表达 |
| `webgl-product-research/prototypes/desktop-companion-story/` | AI 伴侣作为角色/产品故事验证案例 |

## How To Run A Prototype

每个 prototype 都是独立 Vite 项目。进入对应目录后安装并运行：

```powershell
cd D:\claude_code\20260704_opendesign\webgl-product-research\prototypes\game-portfolio-story
npm install
npm run dev
```

然后打开终端显示的本地地址，例如：

```text
http://127.0.0.1:5178/
```

常用入口：

| Goal | Directory |
| --- | --- |
| 看草地/汽车/技术视频案例 | `GrassSystemThreeJS-demo/` |
| 看滚动 3D 官网能力 | `webgl-product-research/prototypes/scroll-product-story/` |
| 看 3D 作品集/研究展厅 | `webgl-product-research/prototypes/game-portfolio-story/` |
| 看产品模型查看器 | `webgl-product-research/prototypes/product-viewer-story/` |
| 看产品动画原型 | `webgl-product-research/prototypes/cinematic-product-showcase/` |
| 看 AI 伴侣产品故事案例 | `webgl-product-research/prototypes/desktop-companion-story/` |

## Current Skill

当前沉淀中的 Codex skill：

```text
C:\Users\yun68\.codex\skills\webgl-product-film
```

它的目标是帮助 Codex：

1. 分析 WebGL / Three.js / R3F 项目；
2. 解释 shader、GPU、模型、动画、交互、录制等能力；
3. 把 demo 改造成可理解、可演示、可发布的产品表达；
4. 生成文档、模板、字幕、旁白、封面、发布说明；
5. 将经过验证的模式沉淀成后续可复用流程。

## Evidence Rule

不要只靠理论更新 skill。

每次研究应该形成证据链：

```text
source evidence
  -> runtime / prototype evidence
  -> bounded conclusion
  -> docs / template / skill update
```

## Next Step

当前下一步不是继续随机做页面，也不是把 AI 伴侣当成主线。

下一步是研究沉淀：

1. 校准 `webgl-product-research/06-research-case-matrix.md`。
2. 校准 `webgl-product-research/03-skill-upgrade-plan.md`。
3. 新增或完善 prototype usage guide，说明每个原型适合什么场景。
4. 判断 `webgl-product-film` skill 还缺哪些能力。
5. 再选择下一个研究项目或验证案例。

## Project Principle

```text
Demo 是证据。
Prototype 是验证。
Document 是沉淀。
Skill 是复用入口。
真实产品只是后续应用，不是当前唯一主线。
```
