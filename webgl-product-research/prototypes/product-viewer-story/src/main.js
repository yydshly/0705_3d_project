import '@google/model-viewer'
import './styles.css'

const viewer = document.querySelector('#product-viewer')
const title = document.querySelector('#detail-title')
const copy = document.querySelector('#detail-copy')
const tourTitle = document.querySelector('#tour-title')
const tourCopy = document.querySelector('#tour-copy')
const tourItems = [...document.querySelectorAll('[data-tour-item]')]
const hotspotButtons = [...document.querySelectorAll('.hotspot')]

const details = {
  hero: {
    title: 'AI 桌面中枢',
    copy:
      '整机展示适合放在官网首屏、众筹页或电商详情顶部，让用户先建立产品形态和桌面尺度印象。'
  },
  front: {
    title: '正面交互',
    copy:
      '正面视角适合展示表情屏、状态反馈和用户最常接触的交互区域。'
  },
  side: {
    title: '侧面接口',
    copy:
      '侧面视角适合说明接口、扩展、散热和桌面占用空间，是硬件产品页常见检查角度。'
  },
  detail: {
    title: '感知细节',
    copy:
      '细节视角配合热点标注，可以把传感器、麦克风阵列和状态灯等卖点固定到模型部位上。'
  },
  sensor: {
    title: '感知光环',
    copy:
      '顶部感知光环代表麦克风阵列、摄像头和状态灯，让用户理解它如何感知环境与回应用户。'
  },
  core: {
    title: '表情屏',
    copy:
      '正面表情屏用于显示状态、情绪、提醒和轻量反馈，是 AI 伴侣产品最有记忆点的区域。'
  },
  dock: {
    title: '扩展接口',
    copy:
      '侧面接口和后部磁吸区用于表达充电、外设、底座和模块化扩展能力。'
  }
}

const views = {
  hero: {
    orbit: '35deg 66deg 4.4m',
    target: '0m 0.98m 0m',
    fov: '30deg',
    focus: 'hero'
  },
  front: {
    orbit: '0deg 66deg 4.1m',
    target: '0m 1m 0m',
    fov: '28deg',
    focus: 'front'
  },
  side: {
    orbit: '72deg 64deg 4.2m',
    target: '0m 0.95m 0m',
    fov: '29deg',
    focus: 'side'
  },
  detail: {
    orbit: '-24deg 52deg 2.8m',
    target: '0m 1.56m 0.05m',
    fov: '24deg',
    focus: 'detail'
  }
}

const toneMap = {
  original: null,
  mint: {
    color: [0.62, 0.95, 0.82, 1],
    metallic: 0.08,
    roughness: 0.5
  },
  graphite: {
    color: [0.28, 0.31, 0.34, 1],
    metallic: 0.35,
    roughness: 0.46
  }
}

const tourSteps = [
  {
    id: 'hero',
    view: 'hero',
    detail: 'hero',
    tone: 'original',
    title: '01 整体印象',
    copy: '先让用户看清产品比例、桌面占位和主要轮廓。这里证明的是模型加载、旋转和首屏展示能力。',
    hold: 2200
  },
  {
    id: 'sensor',
    view: 'detail',
    detail: 'sensor',
    tone: 'original',
    title: '02 感知模块',
    copy: '镜头靠近顶部热点，说明传感器和麦克风阵列。这里证明热点标注能绑定到模型具体部位。',
    hold: 2600
  },
  {
    id: 'core',
    view: 'front',
    detail: 'core',
    tone: 'mint',
    title: '03 正面交互',
    copy: '切到正面并换成晨雾绿配色，展示表情屏和运行时材质切换能力。',
    hold: 2600
  },
  {
    id: 'dock',
    view: 'side',
    detail: 'dock',
    tone: 'graphite',
    title: '04 扩展连接',
    copy: '转到侧面接口，表达硬件扩展和设备联动。这里适合产品详情页解释参数和结构。',
    hold: 2500
  },
  {
    id: 'finish',
    view: 'hero',
    detail: 'hero',
    tone: 'original',
    title: '05 回到产品记忆点',
    copy: '最终回到完整产品，让用户带着卖点理解重新观看模型。这个结构可以复用到其他硬件产品。',
    hold: 2200
  }
]

let originalShellColors = []
let isTouring = false

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function setDetail(name) {
  const detail = details[name] || details.hero
  title.textContent = detail.title
  copy.textContent = detail.copy
}

function setTourStatus(step) {
  tourTitle.textContent = step.title
  tourCopy.textContent = step.copy
  tourItems.forEach((item) => {
    item.classList.toggle('is-active', item.dataset.tourItem === step.id)
  })
  hotspotButtons.forEach((hotspot) => {
    hotspot.classList.toggle('is-active', hotspot.dataset.point === step.detail)
  })
}

function setView(name) {
  const view = views[name]
  if (!view) return
  viewer.cameraOrbit = view.orbit
  viewer.cameraTarget = view.target
  viewer.fieldOfView = view.fov
  viewer.autoRotate = name === 'hero' && !isTouring
  setDetail(view.focus)
}

function getShellMaterials() {
  return (viewer.model?.materials || []).filter((material) =>
    material.name?.toLowerCase().includes('shell')
  )
}

function setTone(name) {
  const tone = toneMap[name]
  const materials = getShellMaterials()

  materials.forEach((material, index) => {
    const pbr = material.pbrMetallicRoughness
    if (!pbr) return
    if (tone) {
      pbr.setBaseColorFactor(tone.color)
      pbr.setRoughnessFactor(tone.roughness)
      pbr.setMetallicFactor(tone.metallic)
    } else if (originalShellColors[index]) {
      pbr.setBaseColorFactor(originalShellColors[index])
      pbr.setRoughnessFactor(0.48)
      pbr.setMetallicFactor(0.08)
    }
  })
}

async function applyTourStep(step) {
  setTourStatus(step)
  setView(step.view)
  setDetail(step.detail)
  setTone(step.tone)
  await wait(step.hold)
}

async function runTour() {
  if (isTouring) return
  isTouring = true
  viewer.autoRotate = false
  document.body.classList.add('is-touring')

  for (const step of tourSteps) {
    await applyTourStep(step)
  }

  isTouring = false
  document.body.classList.remove('is-touring')
  viewer.autoRotate = true
}

viewer.addEventListener('load', () => {
  originalShellColors = getShellMaterials().map((material) => {
    const factor = material.pbrMetallicRoughness?.baseColorFactor
    return Array.isArray(factor) ? [...factor] : [1, 1, 1, 1]
  })
})

document.addEventListener('click', (event) => {
  const view = event.target.closest('[data-view]')?.dataset.view
  const tone = event.target.closest('[data-tone]')?.dataset.tone
  const action = event.target.closest('[data-action]')?.dataset.action
  const point = event.target.closest('[data-point]')?.dataset.point

  if (view) setView(view)
  if (point) setDetail(point)
  if (tone) setTone(tone)
  if (action === 'reset') {
    setTone('original')
    setView('hero')
    setTourStatus(tourSteps[0])
  }
  if (action === 'tour') runTour()
})
