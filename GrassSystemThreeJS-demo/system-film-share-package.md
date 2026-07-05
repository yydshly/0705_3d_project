# System Film Share Package

当前目标：16:9、1920x1080、60fps、MP4（H.264/AAC），用于直接发布到视频平台。

## 推荐流程

1. 打开演示页面。
2. 点击 `Record System Film` 录制源 WebM。
3. 运行 `npm run publish:film -- <source.webm>` 生成发布包。
4. 发布包会包含 MP4、封面、字幕、源文件备份和发布文案。

## 输出内容

- `system-film-16x9.mp4`：最终发布视频。
- `cover-title.png`：平台封面。
- `cover-raw.png`：无额外处理的封面帧。
- `system-film-captions.srt`：中文字幕。
- `source.webm`：浏览器录制源文件备份。
- `publish-notes.md`：标题、简介、标签和规格说明。

## 中文旁白脚本

1. 这是一个实时 WebGL 草地系统。
2. 土壤先出现，废弃汽车落在地面上。
3. 苔藓在潮湿阴影处生长，草叶从不均匀的区域逐渐铺开。
4. 数千根草叶由 GPU 实例化渲染，密度、高度和风向都由参数控制。
5. 风场推动草、云和光影一起变化，形成一个完整的实时三维场景。
6. 这就是 Three.js 和 WebGL 可以表达的产品级沉浸式展示能力。

## 推荐标题

用 Three.js 做了一个实时 GPU 草地系统

## 推荐简介

这是一个基于 Three.js 和 WebGL 的实时草地系统演示。场景结合了 GPU 实例化草叶、Shader 生长、局部苔藓、土壤材质、风场模拟、体积云和电影化镜头，用浏览器实时渲染出一个从无到有的 3D 生态场景。

## 推荐标签

Three.js, WebGL, Shader, GPU渲染, 3D网页, 前端可视化, 草地系统, 实时渲染
