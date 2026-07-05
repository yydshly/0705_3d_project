# Desktop AI Companion Site

正式版桌面 AI 伴侣 3D 官网 Demo，用于完整展示第二个研究项目沉淀出的能力：

- React 页面和 Three.js 场景融合；
- `r3f-scroll-rig` 滚动驱动 3D 叙事；
- GLB 模型加载与骨骼动画切换；
- DOM 产品 UI 和 3D 场景同步；
- 从“状态理解”到“任务整理”再到“长期记忆”的完整产品演示；
- 后续可扩展为视频录制、封面、字幕、旁白与发布素材。

## Quick Start

开发模式：

```bash
npm install
npm run dev
```

打开终端显示的 Vite 地址，通常是：

```text
http://127.0.0.1:5173/
```

构建并预览正式静态版本：

```bash
npm install
npm run build
npm run serve:dist
```

默认打开：

```text
http://127.0.0.1:5176/
```

这个静态预览方式更接近最终发布效果，也方便在 Codex in-app browser 里稳定查看。

## Asset

- `public/models/RobotExpressive.glb`: three.js examples, CC0 1.0.
- `public/models/desktop-companion.glb`: local/reference fallback model.
