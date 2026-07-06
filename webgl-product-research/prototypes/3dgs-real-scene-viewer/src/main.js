const scenes = [
  {
    id: 'garden',
    label: 'Garden',
    title: 'Garden Scene',
    type: 'Real-space splat',
    format: '.splat',
    use: '真实空间、植物、自然环境观察',
    limit: '有视觉真实感，但不是可编辑地形或 mesh',
    description:
      '花园类 splat 能很好展示 3DGS 的核心优势：复杂植物、自然光和碎片化细节不需要手工建模成大量 mesh。',
    url: 'https://antimatter15.com/splat/?url=garden.splat'
  },
  {
    id: 'truck',
    label: 'Truck',
    title: 'Truck Capture',
    type: 'Object-in-scene splat',
    format: '.splat',
    use: '真实物体捕获、空间观看',
    limit: '不能像 GLB 产品那样拆件、换材质或做精确 AR',
    description:
      '这个样例适合理解“拍摄重建的物体”和“建模产品”的区别：看起来像真实采样，但产品控制能力弱。',
    url: 'https://antimatter15.com/splat/?url=truck.splat'
  },
  {
    id: 'treehill',
    label: 'Tree Hill',
    title: 'Tree Hill',
    type: 'Outdoor splat',
    format: '.splat',
    use: '户外空间、真实地点导览',
    limit: '侧面和近距离可能暴露捕获空洞或浮点噪声',
    description:
      '户外场景能帮助判断 3DGS 是否适合旅游、场地展示、园区导览和真实地点记忆。',
    url: 'https://antimatter15.com/splat/?url=treehill.splat'
  },
  {
    id: 'stump',
    label: 'Stump',
    title: 'Stump Detail',
    type: 'Detail capture',
    format: '.splat',
    use: '复杂细节、表面纹理、自然物体',
    limit: '细节好不代表有可交互表面或碰撞体',
    description:
      '这个样例适合观察近景细节：3DGS 可以保留复杂视觉质感，但仍需要 proxy mesh 才能做可靠碰撞。',
    url: 'https://antimatter15.com/splat/?url=stump.splat#[-0.86,-0.23,0.45,0,0.27,0.54,0.8,0,-0.43,0.81,-0.4,0,0.92,-2.02,4.1,1]'
  }
];

const sceneList = document.querySelector('#sceneList');
const frame = document.querySelector('#splatFrame');
const reloadFrame = document.querySelector('#reloadFrame');
const openExternal = document.querySelector('#openExternal');
const fields = {
  type: document.querySelector('#sceneType'),
  title: document.querySelector('#sceneTitle'),
  description: document.querySelector('#sceneDescription'),
  format: document.querySelector('#sceneFormat'),
  use: document.querySelector('#sceneUse'),
  limit: document.querySelector('#sceneLimit'),
  viewerName: document.querySelector('#viewerName')
};

let activeScene = scenes[0];

function setScene(scene) {
  activeScene = scene;
  frame.src = scene.url;
  openExternal.href = scene.url;
  fields.type.textContent = scene.type;
  fields.title.textContent = scene.title;
  fields.description.textContent = scene.description;
  fields.format.textContent = scene.format;
  fields.use.textContent = scene.use;
  fields.limit.textContent = scene.limit;
  fields.viewerName.textContent = scene.label;

  for (const button of sceneList.querySelectorAll('button')) {
    button.classList.toggle('is-active', button.dataset.sceneId === scene.id);
  }
}

function renderSceneButtons() {
  sceneList.innerHTML = '';
  for (const scene of scenes) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.sceneId = scene.id;
    button.innerHTML = `<strong>${scene.label}</strong><span>${scene.type}</span>`;
    button.addEventListener('click', () => setScene(scene));
    sceneList.append(button);
  }
}

reloadFrame.addEventListener('click', () => {
  frame.src = activeScene.url;
});

renderSceneButtons();
setScene(activeScene);
