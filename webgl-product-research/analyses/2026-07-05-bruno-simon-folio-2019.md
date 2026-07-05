# Bruno Simon Folio 2019 源码分析

研究对象：

- GitHub: https://github.com/brunosimon/folio-2019
- 本地目录：`webgl-product-research/projects/folio-2019/`
- 类型：游戏化 3D 个人作品集 / 可驾驶空间作品展示

## 研究目的

这是第三个研究样本，用来补齐前两个样本没有覆盖的能力：

```text
GrassSystemThreeJS
  -> 独立 3D 场景、shader、GPU 实例化、视频化展示

r3f-scroll-rig
  -> 普通网页滚动驱动 3D 状态、DOM + WebGL 同步

Bruno Simon Folio 2019
  -> 游戏化 3D 世界、物理交互、空间作品集、声音反馈、可探索叙事
```

它的价值不在于“网页里放了一个 3D 模型”，而在于把作品集变成一个可以驾驶、碰撞、探索、触发的 3D 空间。

## 当前运行状态

已完成：

- 克隆项目到 `webgl-product-research/projects/folio-2019/`；
- 安装依赖；
- 修复现代 Vite 对旧 `cannon` 包的解析问题；
- `npm run build` 构建通过；
- 本地 dev server 验证通过：`http://127.0.0.1:5177/`；
- 浏览器中已看到 `START` 交互区，并能进入真实 3D 场景。

兼容补丁：

```text
原始依赖：cannon@0.6.2
问题：package.json 指向 ./build/cannon.js，但当前 npm 安装包缺少 build/ 目录
处理：替换为 cannon-es，并把两个 import 改为 import * as CANNON from 'cannon-es'
```

涉及文件：

- `package.json`
- `src/javascript/World/Physics.js`
- `src/javascript/World/Car.js`

仓库处理：

- `static/` 下的 GLB、贴图、音频等运行资产会保留；
- `resources/3d/` 下的 Blender 源工程和备份文件体积较大，不是运行必需文件，已通过 `.gitignore` 排除；
- 后续如果要研究建模流程，可以从上游仓库重新获取这些源工程。

## 入口链路

项目入口很清晰：

```text
src/index.js
  -> new Application()
  -> setRenderer()
  -> setCamera()
  -> setPasses()
  -> setWorld()
```

`Application` 是全局装配器，负责创建：

- `Time`：统一 tick；
- `Sizes`：视口变化；
- `Resources`：GLB、贴图、音频资源；
- `THREE.WebGLRenderer`：WebGL 渲染；
- `Camera`：跟随车辆的相机；
- `EffectComposer`：后处理；
- `World`：真实 3D 世界。

## 世界结构

`World/index.js` 把作品集拆成多个系统：

```text
World
  -> Sounds
  -> Controls
  -> Floor
  -> Areas
  -> Materials
  -> Shadows
  -> Physics
  -> Zones
  -> Objects
  -> Car
  -> Tiles
  -> Walls
  -> Sections
  -> EasterEggs
```

这个结构说明：它不是普通页面叠加 3D 背景，而是一个小型游戏场景。

## 启动流程

页面不是加载后直接进入，而是先进入一个 3D 启动区：

```text
资源加载
  -> 显示 loading label
  -> loading 完成后显示 START
  -> 用户点击或进入交互区域
  -> World.start()
  -> reveal.go()
  -> 场景材质、阴影、车辆、声音逐渐出现
```

这一点值得借鉴：好的 3D 展示不是瞬间把所有东西铺出来，而是把加载、进入、显现做成体验的一部分。

## 物理与交互

项目使用物理引擎驱动车辆和碰撞：

```text
Physics.js
  -> CANNON.World
  -> gravity
  -> floor body
  -> RaycastVehicle
  -> chassis body
  -> wheel bodies
  -> contact material
```

车辆不是假动画，而是由物理世界控制：

- 键盘控制加速、刹车、转向、boost；
- 车体和轮子有独立物理体；
- 碰撞会触发声音；
- 车辆位置反过来驱动相机目标。

这就是“空间作品集”的核心：用户不是在滚动页面，而是在驾驶一个实体进入不同作品区域。

## 相机设计

`Camera.js` 的本质是跟随车辆的平滑相机：

```text
car position
  -> camera.target
  -> targetEased
  -> angle + zoom
  -> lookAt(targetEased)
```

它还有：

- 鼠标滚轮缩放；
- 鼠标拖拽平移；
- 不同区域切换相机角度；
- OrbitControls 只作为 debug/备用能力。

对我们有启发的是：高级 3D 展示里的镜头不是简单绕模型旋转，而是绑定场景内的主角或路径。

## 作品展示方式

`ProjectsSection.js` 和 `Project.js` 把作品集从卡片列表变成空间展板：

```text
project list
  -> 每个项目生成一组 board
  -> board 加载作品截图
  -> floorTexture 作为项目地面
  -> distinctions 作为奖项实体
  -> link area 作为可交互跳转区域
```

这和普通作品集差异很大：

```text
普通作品集：图片 + 标题 + 链接
Folio 2019：地面区域 + 展板 + 奖杯 + 可驾驶访问 + 空间交互
```

## 资源组织

资源不是零散加载，而是在 `Resources.js` 里集中声明：

- matcap 材质贴图；
- intro 区域模型；
- crossroads 区域模型；
- 车辆模型；
- 项目展板模型；
- 项目截图；
- contact/information 区域资源；
- playground 资源；
- 声音资源。

这说明高质量 3D 页面很依赖资产组织能力。代码只是入口，资产、命名、碰撞模型、阴影贴图、声音反馈一起决定最终质感。

## 和前两个项目的本质差异

```text
GrassSystemThreeJS
  -> 重点是渲染能力：草、风、材质、shader、GPU 实例化

r3f-scroll-rig
  -> 重点是网页叙事：滚动进度驱动 3D 状态

Bruno Simon Folio
  -> 重点是空间体验：用户控制实体在 3D 世界里探索内容
```

所以第三个样本补的是：

- 游戏化空间；
- 物理交互；
- 声音反馈；
- 场景分区；
- 作品内容的空间化组织；
- 从“页面观看”到“用户进入”的体验转变。

## 对 webgl-product-film skill 的启发

后续 skill 应该增加一个分支：

```text
如果目标是个人作品集 / 产品集合 / 多案例展示：
  不一定只做滚动官网
  可以设计为可探索 3D 空间
```

输入可以从：

```text
产品/作品列表
```

升级为：

```text
空间地图
  -> 区域
  -> 入口
  -> 可交互物体
  -> 展板
  -> 奖项/标签/链接
  -> 角色或载具
```

## 后续研究问题

下一步不急着复刻完整项目，应先拆解三个关键点：

1. 车辆控制和相机跟随如何组成“探索感”；
2. 项目数据如何映射为空间展板；
3. 如果把这个模式用于“桌面 AI 伴侣产品”，应该是用户驾驶/漫游，还是让 AI 角色带用户参观。

## 初步结论

Bruno Simon Folio 的本质是：

```text
用 Three.js + WebGL 渲染一个 3D 世界
用 cannon-es / cannon 物理引擎让用户拥有可控制实体
用项目展板、区域、碰撞和声音把作品集空间化
```

它对我们的意义是帮助建立第三类能力：

```text
游戏化 3D 产品/作品集展示
```

这类能力适合：

- 个人作品集；
- 多产品陈列；
- AI 工具能力展厅；
- 品牌互动官网；
- 虚拟展览；
- 教育/技术演示空间。
