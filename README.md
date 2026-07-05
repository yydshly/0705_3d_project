# WebGL / Three.js Product Research Guide

这个工作区用于研究 WebGL、Three.js、React Three Fiber 和沉浸式 3D 网页项目，并把研究结果沉淀成可复用的产品展示能力。

我们的目标不是收藏炫酷 demo，而是回答一个更实际的问题：

```text
一个 3D 技术项目，如何被理解、改造、演示、录制，并最终服务于真实产品或内容发布？
```

## 快速启动

这个仓库不是单一应用，而是一个 3D 项目研究工作区。每个可运行 demo 都在自己的子目录里独立安装依赖、独立启动。

推荐先看最终成品 demo：

```powershell
cd D:\claude_code\20260704_opendesign\webgl-product-research\prototypes\desktop-ai-companion-site
npm install
npm run dev
```

然后打开终端里显示的 Vite 地址，通常是：

```text
http://127.0.0.1:5173/
```

如果想看构建后的正式静态版本：

```powershell
cd D:\claude_code\20260704_opendesign\webgl-product-research\prototypes\desktop-ai-companion-site
npm install
npm run build
npm run serve:dist
```

然后打开：

```text
http://127.0.0.1:5176/
```

其他可运行入口：

| 目标 | 目录 | 启动方式 |
| --- | --- | --- |
| GrassSystemThreeJS 草地/汽车/视频演示 | `GrassSystemThreeJS-demo/` | `npm install` 后执行 `npm run dev` |
| r3f-scroll-rig 滚动 3D 产品页原型 | `webgl-product-research/prototypes/scroll-product-story/` | `npm install` 后执行 `npm run dev` |
| 桌面 AI 伴侣 3D 官网 Demo | `webgl-product-research/prototypes/desktop-ai-companion-site/` | `npm install` 后执行 `npm run dev` |
| 游戏化 3D 作品集展厅原型 | `webgl-product-research/prototypes/game-portfolio-story/` | `npm install` 后执行 `npm run dev` |
| Product Viewer / model-viewer 产品检查原型 | `webgl-product-research/prototypes/product-viewer-story/` | `npm install` 后执行 `npm run dev` |

说明：

- 根目录本身不是一个统一的 npm monorepo，不需要在根目录执行 `npm install`。
- `node_modules/`、`dist/`、录制视频和发布产物默认不提交，需要时在对应子项目里重新生成。
- 如果只是想理解项目意义和沉淀方法，直接从本 README 往下阅读即可。

## 项目意义

很多开源 WebGL 项目有很强的技术能力，但普通人很难快速判断：

- 它到底能做什么；
- 底层原理是什么；
- 哪些能力可以复用；
- 如何把 demo 改成产品展示；
- 如何进一步生成发布视频、官网、作品集或商业演示。

这个工作区就是为了解决这件事。我们把每个项目拆成三层：

```text
技术原理
  -> 可感知演示
  -> 可复用流程
```

最终希望形成一套能力：

- 看懂一个 WebGL / Three.js 项目的实现方式；
- 分析它的 GPU、shader、模型、动画、交互和渲染能力；
- 把原始 demo 改造成有故事感的产品展示；
- 生成可发布的视频、封面、字幕和说明文案；
- 把有效流程沉淀进 `webgl-product-film` skill，后续持续复用。

## 当前两条主线

### 1. GrassSystemThreeJS：独立 3D 场景如何变成技术展示短片

目录：

```text
GrassSystemThreeJS-demo/
```

这条线研究的是“一个独立 WebGL 场景如何被产品化展示”。

已经沉淀的能力：

- GPU 实例化草地；
- shader 驱动的草、苔藓、土壤和风；
- 模型、云、光影、镜头、氛围的组合；
- 从自由 demo 改成有导演节奏的完整场景；
- 浏览器录制 WebM；
- 转成 MP4；
- 添加封面、字幕、旁白、背景音乐和发布说明。

适合学习：

- Three.js / WebGL / shader 的视觉能力；
- 如何把技术 demo 改造成一个可发布的视频；
- 如何为抖音、B 站、YouTube 等平台准备发布素材。

重要入口：

- `GrassSystemThreeJS-demo/README.md`
- `GrassSystemThreeJS-demo/THREEJS_GRASS_SYSTEM_CAPABILITY_GUIDE.md`
- `GrassSystemThreeJS-demo/system-film-share-package.md`
- `GrassSystemThreeJS-demo/publish/`

### 2. r3f-scroll-rig：普通网页如何控制 3D

目录：

```text
webgl-product-research/
webgl-product-research/prototypes/scroll-product-story/
```

这条线研究的是“沉浸式 3D 官网 / 作品集 / 产品页如何实现”。

它的核心不是生成模型，而是建立这种关系：

```text
网页 section
  -> DOM 位置追踪
  -> 滚动进度
  -> 全局 WebGL Canvas
  -> 3D 物体状态变化
  -> 自动演示 / Film Mode
```

已经沉淀的能力：

- 识别一个页面是否用了全局 WebGL canvas；
- 判断 DOM 区块是否在控制 3D 物体位置；
- 理解 scroll progress / visibility 如何进入 3D 状态；
- 把滚动页面改造成 3D 产品故事页；
- 把滚动路径进一步变成可录制的导演时间线。

适合学习：

- Samsy Ninja 式 3D 个人作品页；
- 滚动式产品官网；
- DOM + WebGL 混合页面；
- 普通网页如何升级成沉浸式 3D 页面。

当前可看原型：

```text
http://127.0.0.1:5174/
```

重要入口：

- `webgl-product-research/README.md`
- `webgl-product-research/analyses/2026-07-05-r3f-scroll-rig-evidence-chain.md`
- `webgl-product-research/prototypes/scroll-product-story/README.md`
- `webgl-product-research/prototypes/scroll-product-story/TEMPLATE_GUIDE.md`

### 3. Samsy Ninja / Bruno Simon 启发：3D 作品集如何讲故事

目录：

```text
webgl-product-research/prototypes/game-portfolio-story/
webgl-product-research/05-story-driven-3d-portfolio-framework.md
```

这条线研究的是“3D 页面为什么不只是把模型放进网页，而是用空间讲故事”。

我们当前的结论是：

```text
节点是素材
故事是主线
镜头是表达
交互是参与
资产是质感
```

`game-portfolio-story` 原型已经验证：

- 内容可以变成 3D 空间节点；
- 节点可以展开成详情层；
- 右侧路径可以作为研究/作品导航；
- Film Mode 可以成为导演脚本；
- 节点封面、发布封面和发布说明可以被挂到同一个原型里。

但它仍然只是“3D 作品集生成能力的骨架”，不是 Samsy Ninja 级别的高完成度作品。要继续接近成熟作品，关键不再是证明 3D 能不能跑，而是补：

- 品牌故事；
- 真实视觉资产；
- 主视觉记忆点；
- 更强镜头语言；
- 每个节点的真实项目证明。

重要入口：

- `webgl-product-research/05-story-driven-3d-portfolio-framework.md`
- `webgl-product-research/templates/story-driven-3d-website-input-brief.md`
- `webgl-product-research/prototypes/game-portfolio-story/README.md`
- `webgl-product-research/prototypes/game-portfolio-story/PUBLISHING.md`
- `webgl-product-research/templates/game-like-portfolio-capability-checklist.md`

## 如何选择下一步

如果你的目标是“发布一个视频”：

```text
进入 GrassSystemThreeJS-demo
  -> 查看 publish/
  -> 使用 system-film-16x9.mp4、cover-title.png、publish-notes.md
```

如果你的目标是“理解沉浸式 3D 官网怎么做”：

```text
打开 http://127.0.0.1:5174/
  -> 滚动查看机制面板
  -> 阅读 r3f-scroll-rig evidence chain
  -> 看 scroll-product-story 模板
```

如果你的目标是“以后生成自己的产品展示页”：

```text
复制 scroll-product-story 模板
  -> 替换产品内容
  -> 替换 3D 模型或程序化对象
  -> 设计 4-6 个章节
  -> 添加 Film Mode
  -> 后续接录制、字幕、旁白、封面
```

如果你的目标是“以后生成 3D 个人作品集 / 品牌官网 / 产品空间展厅”：

```text
先读 webgl-product-research/05-story-driven-3d-portfolio-framework.md
  -> 按 templates/story-driven-3d-website-input-brief.md 准备品牌、主视觉、3-5 个节点和素材
  -> 选择 scroll-driven / free exploration / guided tour
  -> 基于 game-portfolio-story 或 scroll-product-story 生成原型
  -> 用 Film Mode 检查故事是否讲得通
  -> 再替换真实资产和发布封面
```

如果你的目标是“继续研究新项目”：

```text
先用 webgl-product-research/templates/project-analysis-template.md
  -> 分析项目能力
  -> 做证据链
  -> 做一个最小原型
  -> 再决定是否更新 skill
```

## 当前沉淀的方法论

每个项目都按同一条证据链推进：

```text
源码证据
  -> 运行或原型证据
  -> 有边界的结论
  -> skill / 文档 / 模板更新
```

这样可以避免只凭感觉总结，也避免把一个库吹成它做不到的东西。

## 当前产物地图

```text
.
├─ README.md
│  总入口：项目意义、当前主线、下一步路径
│
├─ GrassSystemThreeJS-demo/
│  独立 3D 场景 -> 产品展示短片
│
└─ webgl-product-research/
   3D 网页、作品集、产品页研究与模板
```

## 推荐后续路线

短期先做三件事：

1. 把 `webgl-product-film` skill 升级为“WebGL demo / 沉浸式官网 / 故事型 3D 作品集”都能处理的工作流。
2. 基于 `05-story-driven-3d-portfolio-framework.md` 增加一个输入模板，让后续生成 3D 官网时不再从零沟通。
3. 选择一个真实主题或产品，用 `game-portfolio-story` 的结构生成第一个真实资产版，而不是继续堆抽象节点。

中期目标：

```text
输入一个产品或个人项目
  -> 自动形成 3D 产品故事页
  -> 自动形成可发布演示视频
  -> 输出 README、封面、字幕、旁白、发布文案
```

这就是本工作区的核心方向：把 WebGL 技术能力转化为可理解、可展示、可发布、可复用的产品表达能力。
## Research Case Matrix

To judge whether the `webgl-product-film` skill and the current research samples are mature enough, read:

```text
webgl-product-research/06-research-case-matrix.md
```

This matrix records:

- which case types are already covered;
- which capability areas are still missing;
- what each future case must produce;
- which research direction should come next.
