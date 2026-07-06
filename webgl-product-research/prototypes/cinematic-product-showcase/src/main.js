import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import './styles.css'

const canvas = document.querySelector('#scene-canvas')
const timelineInput = document.querySelector('#timeline')
const playToggle = document.querySelector('#play-toggle')
const resetButton = document.querySelector('#reset-button')
const explodeToggle = document.querySelector('#explode-toggle')
const chapterIndex = document.querySelector('#chapter-index')
const chapterTitle = document.querySelector('#chapter-title')
const chapterCopy = document.querySelector('#chapter-copy')
const stepItems = [...document.querySelectorAll('[data-step]')]

const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0x06080b, 8, 22)

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 2.4, 8)

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.08
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const clock = new THREE.Clock()
const materials = {
  shell: new THREE.MeshPhysicalMaterial({
    color: 0xf1f4ef,
    roughness: 0.24,
    metalness: 0.04,
    clearcoat: 0.78,
    clearcoatRoughness: 0.16
  }),
  satin: new THREE.MeshPhysicalMaterial({
    color: 0xe6ece8,
    roughness: 0.38,
    metalness: 0.02,
    clearcoat: 0.38,
    clearcoatRoughness: 0.28
  }),
  graphite: new THREE.MeshStandardMaterial({
    color: 0x111820,
    roughness: 0.48,
    metalness: 0.45
  }),
  softRubber: new THREE.MeshStandardMaterial({
    color: 0x080d12,
    roughness: 0.72,
    metalness: 0.02
  }),
  grille: new THREE.MeshStandardMaterial({
    color: 0x1b242d,
    roughness: 0.38,
    metalness: 0.64
  }),
  mint: new THREE.MeshStandardMaterial({
    color: 0x77f0c2,
    emissive: 0x1f8a67,
    emissiveIntensity: 0.7,
    roughness: 0.24,
    metalness: 0.18
  }),
  copper: new THREE.MeshStandardMaterial({
    color: 0xd9904f,
    emissive: 0x3a1808,
    emissiveIntensity: 0.35,
    roughness: 0.32,
    metalness: 0.52
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x0c1118,
    roughness: 0.12,
    metalness: 0.2,
    transmission: 0.12,
    thickness: 0.2
  }),
  wave: new THREE.MeshBasicMaterial({
    color: 0x77f0c2,
    transparent: true,
    opacity: 0.24,
    depthWrite: false
  }),
  energy: new THREE.MeshBasicMaterial({
    color: 0xffc16d,
    transparent: true,
    opacity: 0.92,
    depthWrite: false
  })
}

const chapters = [
  {
    id: 'entrance',
    label: '01',
    start: 0,
    end: 0.14,
    title: '产品入场',
    copy: '产品从暗场进入，先建立轮廓和高级感。这一步证明它不是普通 3D 查看器，而是有时间线的产品影片。'
  },
  {
    id: 'hero',
    label: '02',
    start: 0.14,
    end: 0.28,
    title: '导演镜头',
    copy: '镜头围绕耳机和充电盒移动，产品保持主角位置。这里证明镜头运动是被设计的，不是用户随手旋转。'
  },
  {
    id: 'waves',
    label: '03',
    start: 0.28,
    end: 0.43,
    title: '空间音频可视化',
    copy: '声波从左右耳机扩散，表达降噪、空间音频或通信能力。功能点由 3D 效果承载，而不是只靠文字解释。'
  },
  {
    id: 'explode',
    label: '04',
    start: 0.43,
    end: 0.62,
    title: '部件拆分',
    copy: '耳机、驱动单元、耳塞和充电盒盖分离，展示结构层次。这是 model-viewer 很难自然完成的动画控制。'
  },
  {
    id: 'energy',
    label: '05',
    start: 0.62,
    end: 0.78,
    title: '能量流',
    copy: '粒子沿着充电盒到耳机的路径流动，用来表达续航、快充、连接或设备联动。'
  },
  {
    id: 'finish',
    label: '06',
    start: 0.78,
    end: 1,
    title: '最终英雄镜头',
    copy: '所有部件回到完整产品，形成可截图、可录制、可作为官网首屏的最终记忆点。'
  }
]

const product = new THREE.Group()
const caseGroup = new THREE.Group()
const leftBud = new THREE.Group()
const rightBud = new THREE.Group()
const soundWaves = new THREE.Group()
const energyParticles = new THREE.Group()
const stageGroup = new THREE.Group()

scene.add(stageGroup)
stageGroup.add(product, soundWaves, energyParticles)
product.add(caseGroup, leftBud, rightBud)

function createMesh(geometry, material, parent, position, rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.scale.set(...scale)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function makeEarbud(side) {
  const group = side < 0 ? leftBud : rightBud
  group.position.set(side * 1.05, 0.95, 0.25)
  group.rotation.set(0.2, side * -0.18, side * 0.08)

  const body = createMesh(
    new THREE.SphereGeometry(0.42, 64, 36),
    materials.shell,
    group,
    [0, 0.36, 0],
    [0.02, side * -0.18, side * -0.08],
    [1.15, 0.78, 0.9]
  )
  const faceplate = createMesh(
    new RoundedBoxGeometry(0.52, 0.36, 0.055, 8, 0.12),
    materials.satin,
    group,
    [side * 0.23, 0.38, 0.16],
    [0.06, side * -0.32, side * -0.05]
  )
  const acousticPort = createMesh(
    new THREE.CylinderGeometry(0.18, 0.2, 0.2, 48),
    materials.grille,
    group,
    [side * -0.28, 0.25, 0.2],
    [Math.PI / 2, 0, side * 0.18]
  )
  const siliconeTip = createMesh(
    new THREE.SphereGeometry(0.22, 40, 22),
    materials.softRubber,
    group,
    [side * -0.42, 0.2, 0.32],
    [0, side * 0.25, 0],
    [1, 0.68, 0.76]
  )
  const driverRing = createMesh(
    new THREE.TorusGeometry(0.17, 0.014, 10, 48),
    materials.mint,
    group,
    [side * -0.45, 0.2, 0.335],
    [Math.PI / 2, 0, 0]
  )
  const stem = createMesh(
    new THREE.CapsuleGeometry(0.13, 0.86, 18, 36),
    materials.shell,
    group,
    [side * 0.15, -0.21, 0.02],
    [0.08, 0, side * 0.08],
    [0.82, 1, 0.78]
  )
  const touchStrip = createMesh(
    new RoundedBoxGeometry(0.045, 0.44, 0.012, 5, 0.012),
    materials.satin,
    group,
    [side * 0.24, -0.25, 0.14],
    [0.08, 0, side * 0.08]
  )
  const mic = createMesh(new THREE.SphereGeometry(0.038, 18, 12), materials.copper, group, [side * 0.14, -0.66, 0.16])

  for (let i = 0; i < 3; i += 1) {
    createMesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.012, 14),
      materials.grille,
      group,
      [side * (0.1 + i * 0.045), -0.62, 0.18],
      [Math.PI / 2, 0, 0]
    )
  }

  group.userData.parts = { body, faceplate, acousticPort, siliconeTip, driverRing, stem, touchStrip, mic }
  return group
}

function makeCase() {
  const base = createMesh(new RoundedBoxGeometry(2.45, 0.86, 0.98, 10, 0.18), materials.shell, caseGroup, [0, -0.28, 0])
  const lid = createMesh(new RoundedBoxGeometry(2.5, 0.3, 1, 10, 0.16), materials.shell, caseGroup, [0, 0.34, -0.08], [-0.05, 0, 0])
  const seam = createMesh(new RoundedBoxGeometry(2.34, 0.035, 1.01, 5, 0.018), materials.graphite, caseGroup, [0, 0.1, 0.02])
  const hinge = createMesh(new THREE.CylinderGeometry(0.055, 0.055, 2.15, 28), materials.graphite, caseGroup, [0, 0.14, -0.62], [0, 0, Math.PI / 2])
  const light = createMesh(new THREE.SphereGeometry(0.05, 18, 12), materials.mint, caseGroup, [0, -0.12, 0.54])
  const innerLeft = createMesh(new THREE.CylinderGeometry(0.33, 0.36, 0.075, 56), materials.glass, caseGroup, [-0.55, 0.24, 0.12], [Math.PI / 2, 0, 0])
  const innerRight = createMesh(new THREE.CylinderGeometry(0.33, 0.36, 0.075, 56), materials.glass, caseGroup, [0.55, 0.24, 0.12], [Math.PI / 2, 0, 0])
  const leftChrome = createMesh(new THREE.TorusGeometry(0.28, 0.01, 8, 56), materials.grille, caseGroup, [-0.55, 0.28, 0.12], [Math.PI / 2, 0, 0])
  const rightChrome = createMesh(new THREE.TorusGeometry(0.28, 0.01, 8, 56), materials.grille, caseGroup, [0.55, 0.28, 0.12], [Math.PI / 2, 0, 0])

  caseGroup.position.set(0, -0.25, 0)
  caseGroup.userData.parts = { base, lid, seam, hinge, light, innerLeft, innerRight, leftChrome, rightChrome }
}

function createWaves() {
  for (let i = 0; i < 8; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48 + i * 0.18, 0.006, 8, 96), materials.wave.clone())
    ring.rotation.set(Math.PI / 2, 0, 0)
    ring.userData.offset = i / 8
    soundWaves.add(ring)
  }
}

function createEnergyParticles() {
  const geometry = new THREE.SphereGeometry(0.035, 12, 8)
  for (let i = 0; i < 34; i += 1) {
    const particle = new THREE.Mesh(geometry, materials.energy.clone())
    particle.userData.offset = i / 34
    particle.castShadow = false
    energyParticles.add(particle)
  }
}

function createEnvironment() {
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(7.5, 96),
    new THREE.MeshStandardMaterial({
      color: 0x0a0d10,
      roughness: 0.58,
      metalness: 0.28
    })
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.02
  floor.receiveShadow = true
  scene.add(floor)

  const grid = new THREE.GridHelper(14, 32, 0x2f4255, 0x17222d)
  grid.position.y = -1
  grid.material.transparent = true
  grid.material.opacity = 0.28
  scene.add(grid)

  const key = new THREE.DirectionalLight(0xffffff, 4.8)
  key.position.set(4.5, 6.4, 5.2)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 18
  key.shadow.camera.left = -5
  key.shadow.camera.right = 5
  key.shadow.camera.top = 5
  key.shadow.camera.bottom = -5
  scene.add(key)

  const fill = new THREE.PointLight(0x77f0c2, 12, 10)
  fill.position.set(-3.4, 2.3, 3.5)
  scene.add(fill)

  const rim = new THREE.PointLight(0xffb26d, 18, 9)
  rim.position.set(3.2, 1.4, -3.5)
  scene.add(rim)

  const softTop = new THREE.RectAreaLight(0xffffff, 8, 5, 2.2)
  softTop.position.set(0, 4.2, 1.4)
  softTop.lookAt(0, 0, 0)
  scene.add(softTop)

  scene.add(new THREE.HemisphereLight(0xbad7ff, 0x12100d, 1.25))
}

makeCase()
makeEarbud(-1)
makeEarbud(1)
createWaves()
createEnergyParticles()
createEnvironment()

const initial = {
  case: caseGroup.position.clone(),
  left: leftBud.position.clone(),
  right: rightBud.position.clone(),
  lidRotation: caseGroup.userData.parts.lid.rotation.clone()
}

let progress = 0
let isPlaying = true
let forcedExplode = false
const duration = 30

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1)
}

function smoothstep(edge0, edge1, value) {
  const x = clamp01((value - edge0) / (edge1 - edge0))
  return x * x * (3 - 2 * x)
}

function mix(a, b, t) {
  return a + (b - a) * t
}

function setActiveChapter() {
  const chapter = chapters.find((item) => progress >= item.start && progress < item.end) || chapters.at(-1)
  chapterIndex.textContent = chapter.label
  chapterTitle.textContent = chapter.title
  chapterCopy.textContent = chapter.copy
  stepItems.forEach((item) => {
    item.classList.toggle('is-active', item.dataset.step === chapter.id)
  })
}

function updateCamera() {
  const entrance = smoothstep(0, 0.14, progress)
  const waves = smoothstep(0.28, 0.43, progress)
  const explode = smoothstep(0.43, 0.62, progress)
  const finish = smoothstep(0.78, 1, progress)

  const angle = mix(-0.55, 0.85, progress) + Math.sin(progress * Math.PI * 2) * 0.12
  const radius = mix(9.2, 6.25, entrance) + waves * -0.65 + explode * 1.2 + finish * -0.55
  const height = mix(3.1, 2.25, entrance) + waves * 0.35 + explode * 0.62

  camera.position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius)
  camera.lookAt(0, 0.25 + waves * 0.42 + explode * 0.22, 0)
}

function updateProduct() {
  const entrance = smoothstep(0, 0.14, progress)
  const waves = smoothstep(0.28, 0.43, progress)
  const explode = Math.max(smoothstep(0.43, 0.56, progress) - smoothstep(0.72, 0.86, progress), forcedExplode ? 1 : 0)
  const finish = smoothstep(0.78, 1, progress)
  const materialShift = smoothstep(0.68, 0.78, progress) - smoothstep(0.86, 0.96, progress)

  product.position.y = mix(-2.2, 0.05, entrance) + Math.sin(clock.elapsedTime * 1.2) * 0.03
  product.rotation.y = mix(-0.45, 0.12, entrance) + progress * 0.72 + waves * -0.28 + finish * 0.38
  product.scale.setScalar(mix(0.58, 0.78, entrance))

  leftBud.position.copy(initial.left).add(new THREE.Vector3(mix(0, -1.18, explode), mix(0, 0.68, explode), mix(0, 0.24, explode)))
  rightBud.position.copy(initial.right).add(new THREE.Vector3(mix(0, 1.18, explode), mix(0, 0.68, explode), mix(0, 0.24, explode)))
  leftBud.rotation.z = -0.12 - explode * 0.42
  rightBud.rotation.z = 0.12 + explode * 0.42

  caseGroup.position.copy(initial.case)
  caseGroup.userData.parts.lid.rotation.x = initial.lidRotation.x - explode * 0.98
  caseGroup.userData.parts.innerLeft.position.y = 0.24 + explode * 0.12
  caseGroup.userData.parts.innerRight.position.y = 0.24 + explode * 0.12

  const shellColor = new THREE.Color(0xf1f4ef).lerp(new THREE.Color(0x232b32), materialShift)
  materials.shell.color.copy(shellColor)
  materials.shell.roughness = mix(0.34, 0.5, materialShift)
  materials.shell.metalness = mix(0.08, 0.28, materialShift)
}

function updateWaves() {
  const visibility = smoothstep(0.28, 0.35, progress) - smoothstep(0.48, 0.56, progress)
  soundWaves.visible = visibility > 0.01
  soundWaves.position.set(0, 1.28, 0.18)
  soundWaves.rotation.y = product.rotation.y

  soundWaves.children.forEach((ring) => {
    const phase = (progress * 4 + ring.userData.offset) % 1
    const scale = 0.45 + phase * 2.7
    ring.scale.setScalar(scale)
    ring.material.opacity = visibility * (1 - phase) * 0.34
  })
}

function updateEnergy() {
  const visibility = smoothstep(0.62, 0.68, progress) - smoothstep(0.8, 0.88, progress)
  energyParticles.visible = visibility > 0.01

  energyParticles.children.forEach((particle, index) => {
    const phase = (progress * 5.2 + particle.userData.offset) % 1
    const side = index % 2 === 0 ? -1 : 1
    const x = mix(0, side * 1.05, phase)
    const y = -0.18 + Math.sin(phase * Math.PI) * 1.25
    const z = 0.42 + Math.sin(phase * Math.PI * 2 + side) * 0.16
    particle.position.set(x, y, z)
    particle.scale.setScalar(0.55 + Math.sin(phase * Math.PI) * 1.05)
    particle.material.opacity = visibility * (0.3 + Math.sin(phase * Math.PI) * 0.7)
  })
}

function renderFrame() {
  if (isPlaying) {
    progress = (progress + clock.getDelta() / duration) % 1
  } else {
    clock.getDelta()
  }

  timelineInput.value = String(Math.round(progress * 1000))
  setActiveChapter()
  updateCamera()
  updateProduct()
  updateWaves()
  updateEnergy()

  renderer.render(scene, camera)
  requestAnimationFrame(renderFrame)
}

function resetTimeline() {
  progress = 0
  isPlaying = true
  forcedExplode = false
  playToggle.textContent = '暂停'
  explodeToggle.textContent = '拆分视图'
}

playToggle.addEventListener('click', () => {
  isPlaying = !isPlaying
  playToggle.textContent = isPlaying ? '暂停' : '播放'
})

resetButton.addEventListener('click', resetTimeline)

explodeToggle.addEventListener('click', () => {
  forcedExplode = !forcedExplode
  isPlaying = false
  progress = forcedExplode ? 0.52 : 0.84
  playToggle.textContent = '播放'
  explodeToggle.textContent = forcedExplode ? '收回产品' : '拆分视图'
})

timelineInput.addEventListener('input', () => {
  progress = Number(timelineInput.value) / 1000
  isPlaying = false
  playToggle.textContent = '播放'
})

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

renderFrame()
