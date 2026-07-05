# r3f-scroll-rig 项目分析

研究日期：2026-07-05

项目：`14islands/r3f-scroll-rig`

仓库：https://github.com/14islands/r3f-scroll-rig

本地源码：`webgl-product-research/projects/r3f-scroll-rig`

当前克隆 commit：`123663599e4b31af56f1845a19132d17e6a9b81f`

## 一句话结论

`r3f-scroll-rig` 不是一个单纯的视觉特效库，而是一个把普通 React/HTML 页面和单个 React Three Fiber 全局 Canvas 对齐的基础设施。它解决的是“网页内容在哪里，3D 对象就准确出现在哪里，并且随滚动同步运动”的问题。

它非常适合作为我们研究 Samsy Ninja 类沉浸式官网、3D 个人作品页、产品故事页的第一个案例。

## 为什么值得研究

它正好补足了 GrassSystemThreeJS 没有覆盖的方向：

- GrassSystemThreeJS 重点是一个完整 3D 场景内部的草、土壤、风、模型、镜头、视频化。
- `r3f-scroll-rig` 重点是普通网页和 WebGL 场景如何融合。

也就是说，前者回答“3D 场景怎么做”，后者回答“3D 场景怎么服务网页叙事”。

这对我们后续产品方向很关键，因为沉浸式官网和产品展示页通常不是全屏 3D 游戏，而是：

```text
HTML 内容
  + 滚动叙事
  + 局部 3D 模型/图片/文字
  + 镜头或物体跟随页面节奏
```

## 技术栈

- 框架：React
- 3D 层：Three.js + `@react-three/fiber`
- 辅助生态：`@react-three/drei`
- 滚动：Lenis
- 状态管理：Zustand
- DOM 观测：IntersectionObserver、ResizeObserver
- 构建：microbundle
- 主要语言：TypeScript / TSX

`package.json` 中的关键依赖包括：

- `@react-three/fiber`
- `three`
- `lenis`
- `zustand`
- `react-intersection-observer`
- `@juggle/resize-observer`
- `vecn`

## 核心能力地图

### 1. 单个全局 Canvas

核心文件：

- `src/components/GlobalCanvas.tsx`
- `src/components/GlobalRenderer.tsx`
- `src/components/GlobalChildren.tsx`

它不是给每个组件创建一个 WebGL canvas，而是在页面里放一个固定定位的全局 Canvas：

```text
position: fixed
top: 0
left: 0
right: 0
height: 100vh
```

这样做的意义：

- 避免多个 WebGL context 的浏览器限制。
- 3D 资源可以共享。
- 页面跳转时 Canvas 可以保持挂载。
- 3D 内容可以像 HUD 或全局层一样覆盖/融合到页面中。

### 2. DOM 元素作为 3D 定位代理

核心文件：

- `src/hooks/useTracker.ts`
- `src/components/ScrollScene.tsx`
- `src/components/ViewportScrollScene.tsx`

它的本质机制：

1. HTML 页面正常排版。
2. 给某个 DOM 元素绑定 `ref`。
3. `useTracker()` 读取这个元素的 `getBoundingClientRect()`。
4. 根据当前滚动位置计算元素在视口中的中心点。
5. 把像素坐标转换为 3D world position。
6. 把对应的 Three.js group/scene 移动到同一个位置。

这会制造一个视觉错觉：

> 看起来 3D 对象嵌在 HTML 页面里，实际上它是在一个固定 Canvas 中被精确移动到 DOM 对应位置。

### 3. 避免每帧读取 DOM

这是它很重要的性能设计。

`useTracker.ts` 中的策略是：

- 布局/重排时读取一次 `getBoundingClientRect()`。
- 滚动时不用每帧重新读 DOM。
- 通过 scroll delta 更新 bounds 和 position。
- 使用 IntersectionObserver 判断是否在视口内。
- 使用 ResizeObserver 或 pageReflow 触发布局重算。

这比“每一帧都读取 DOM 尺寸”更适合复杂页面。

### 4. 3D 内容隧道传送到 Canvas

核心文件：

- `src/components/UseCanvas.tsx`
- `src/hooks/useCanvas.ts`
- `src/store.ts`
- `src/components/GlobalChildren.tsx`

页面组件中写的 3D 子组件并不真的渲染在 DOM 所在位置，而是通过 `useCanvas()` 注册到全局 store：

```text
React DOM component
  -> UseCanvas/useCanvas
  -> Zustand canvasChildren
  -> GlobalChildren
  -> GlobalCanvas
```

这让普通 React 页面组件可以“声明”自己需要一个 3D 对象，而真实渲染统一发生在全局 Canvas 中。

### 5. 滚动由 Lenis 驱动并同步 R3F 渲染

核心文件：

- `src/scrollbar/SmoothScrollbar.tsx`
- `src/components/R3FSmoothScrollbar.tsx`

Lenis 负责平滑滚动，并把滚动状态写入全局 store：

- `scroll.y`
- `scroll.x`
- `velocity`
- `progress`
- `direction`
- `scrollDirection`

滚动发生时会触发 R3F 的 `invalidate()`，让 `frameloop="demand"` 也能在滚动时刷新。

### 6. WebGL 图片、视差、粘性场景这些 Powerups

核心目录：

- `powerups/WebGLImage.tsx`
- `powerups/WebGLText.tsx`
- `powerups/ParallaxScrollScene.tsx`
- `powerups/StickyScrollScene.tsx`

这里对我们很有启发。

`WebGLImage` 把 DOM 图片加载为 WebGL texture，并把滚动状态写入 shader uniforms：

- `u_time`
- `u_progress`
- `u_visibility`
- `u_viewport`
- `u_velocity`
- `u_texture`

这说明它不仅能“让 3D 跟随 DOM”，还可以让滚动进度驱动 shader 效果，比如图片扭曲、折射、波纹、转场。

`ParallaxScrollScene` 和 `StickyScrollScene` 则把网页常见的视差和 sticky 行为变成 3D 场景能力。

## 本质实现图

```text
普通 React 页面
  |
  |  DOM 元素 ref
  v
useTracker()
  |
  |  读取初始 DOM rect
  |  监听 scroll / resize / inView
  v
计算 bounds / position / scale / scrollState
  |
  v
ScrollScene / ViewportScrollScene
  |
  |  把 3D group 移动到 DOM 对应位置
  v
UseCanvas / useCanvas
  |
  |  注册到 Zustand canvasChildren
  v
GlobalCanvas
  |
  v
单个 Three.js / R3F Canvas 渲染所有 3D 内容
```

## 和 Samsy Ninja 类作品页的关系

Samsy Ninja 这类页面通常不是单一技术，而是一组能力的组合：

- 页面内容叙事
- 3D 模型或视觉对象
- 滚动驱动状态变化
- 鼠标/触摸微交互
- shader 或后期效果
- 音乐/转场/加载体验

`r3f-scroll-rig` 主要覆盖其中最关键的一层：

> 如何让 WebGL 视觉对象和网页内容保持空间/滚动同步。

它本身不是完整的作品页生成器，但它可以作为这类页面的底座。

## 对 webgl-product-film Skill 的升级启发

当前 `webgl-product-film` Skill 已经擅长分析“一个 3D demo 如何变成视频展示”。

这个项目提示我们 v2 需要增加一个新分支：

```text
Immersive Website Analysis
```

应该新增的检查点：

1. 是否有全局 Canvas。
2. DOM 和 3D 是否通过代理元素绑定。
3. 滚动状态如何传入 3D 场景。
4. 相机是全局运动，还是每个对象局部对齐。
5. 是否使用 IntersectionObserver / ResizeObserver 做性能优化。
6. 是否有移动端/弱 GPU fallback。
7. 3D 是服务内容，还是只是装饰。
8. 是否能从交互页面切换为可录制的 Film Mode。

建议新增 Skill 参考文件：

```text
references/immersive-website.md
```

建议新增内容：

- DOM/WebGL 同步机制解释。
- 滚动叙事分析清单。
- 沉浸式官网常见结构。
- 从网页交互到视频导演模式的转换方法。

## 对我们产品方向的启发

它支持我们后续做一个很清晰的小原型：

```text
Immersive 3D Product Story Page
```

这个原型可以包含：

- 普通 HTML 内容作为叙事主体。
- 一个或多个 3D 模型跟随页面滚动出现。
- 滚动驱动模型旋转、拆解、材质变化或镜头变化。
- 图片或海报变成 WebGL shader 平面。
- 页面模式和 Film Mode 共存。
- 最后能录制成产品展示视频。

这比直接做“全屏 3D 大场景”更适合产品化。

## 是否值得运行

当前判断：

- 这个仓库本身是库，不是完整 demo 应用。
- `package.json` 主要脚本是构建库：`build`、`dev`。
- README 提供了多个 CodeSandbox 示例。

所以短期不建议只为了“看效果”而运行这个库本体。

更合理的下一步是：

1. 继续读 README 和 docs。
2. 选一个最小示例重建到我们自己的 workspace。
3. 做一个“HTML 卡片 + 3D 模型跟随滚动”的小原型。
4. 再基于原型测试 Film Mode。

## 研究决策

选择：

```text
Clone and study source.
Then build a small derivative prototype.
```

原因：

- 它不是一个可直接展示的完整产品页。
- 它的价值在架构，不在单个视觉效果。
- 我们需要通过自己的小原型验证“DOM + 3D + 滚动 + 录制视频”的闭环。

## 下一步建议

下一步不要急着研究第二个项目。

建议先做一个非常小的验证项目：

```text
webgl-product-research/prototypes/scroll-product-story/
```

目标：

- React + R3F + r3f-scroll-rig。
- 三个 HTML 内容区块。
- 一个 3D 产品对象跟随区块位置。
- 滚动时对象有旋转、缩放或材质变化。
- 加一个 Film Mode 按钮，自动滚动/驱动演示。

如果这个跑通，我们的 `webgl-product-film` Skill 就可以升级到 v2，因为它会从“3D demo 视频化”扩展到“沉浸式网页 + 视频化”。
