import React, { useMemo, useRef, useState } from 'react'
import { Environment, Float, Html, PerspectiveCamera } from '@react-three/drei'
import { GlobalCanvas, ScrollScene, SmoothScrollbar, UseCanvas } from '@14islands/r3f-scroll-rig'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const chapters = [
  {
    id: 'presence',
    eyebrow: '01 / Presence',
    title: 'AI 不再只是聊天框',
    body: '桌面女友把 AI 变成一个持续存在的桌面陪伴。她会在你的工作区旁边醒来，成为一个可见、可感知的个人界面。',
    label: '角色出现',
    metric: 'presence online',
    signal: 'companion appears',
    effect: '角色从桌面中醒来',
    tone: '#8bd6d1',
  },
  {
    id: 'conversation',
    eyebrow: '02 / Real-time Talk',
    title: '对话发生在你的工作流旁边',
    body: '用户消息和回应不再被藏在单一窗口里，而是变成围绕角色出现的空间卡片。滚动推动对话节奏，角色朝向当前问题。',
    label: '实时对话',
    metric: 'response pulse',
    signal: 'scroll -> chat cards',
    effect: '聊天卡片进入空间',
    tone: '#ffd29a',
  },
  {
    id: 'emotion',
    eyebrow: '03 / Emotion State',
    title: '情绪状态可以被看见',
    body: '陪伴感来自细节：呼吸、光环、颜色和动作强度。情绪不是一段文字，而是一个随上下文变化的环境状态。',
    label: '情绪反馈',
    metric: 'mood aura',
    signal: 'visibility -> aura',
    effect: '情绪光环扩散',
    tone: '#c7a3ff',
  },
  {
    id: 'memory',
    eyebrow: '04 / Long-term Memory',
    title: '长期记忆变成可回看的片段',
    body: '偏好、目标、习惯、过去的对话会被组织成记忆卡片。它们围绕角色形成时间线，让“记得你”变成可理解的视觉结构。',
    label: '长期记忆',
    metric: 'memory orbit',
    signal: 'progress -> memory orbit',
    effect: '记忆片段形成轨道',
    tone: '#95d17c',
  },
  {
    id: 'desktop',
    eyebrow: '05 / Desktop Action',
    title: '她和真实桌面发生关系',
    body: '提醒、窗口、文件和任务都可以成为交互对象。3D 页面用层叠窗口和任务卡片说明：陪伴不是离开工作流，而是贴近工作流。',
    label: '桌面互动',
    metric: 'workspace linked',
    signal: 'chapter -> windows',
    effect: '窗口层叠并被标注',
    tone: '#8fb7ff',
  },
  {
    id: 'growth',
    eyebrow: '06 / Personal Growth',
    title: '她会变得越来越像你的伙伴',
    body: '换装、性格、场景和习惯会逐渐沉淀成个人化体验。最终画面把对话、情绪、记忆和桌面互动合成一个完整的个人空间。',
    label: '个性成长',
    metric: 'personalized',
    signal: 'final hero state',
    effect: '所有能力收束成英雄画面',
    tone: '#ff9fbd',
  },
]

function clamp01(value) {
  return Math.max(0, Math.min(1, value || 0))
}

function smooth(value) {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

function useOrbitItems(count, radius, height = 0) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2
      return {
        angle,
        position: [Math.cos(angle) * radius, height + (index % 3) * 10, Math.sin(angle) * radius],
      }
    })
  }, [count, radius, height])
}

function DeskSurface() {
  return (
    <group>
      <mesh receiveShadow position={[0, -96, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[260, 170, 7]} />
        <meshStandardMaterial color="#342d29" roughness={0.78} metalness={0.04} />
      </mesh>
      <mesh receiveShadow position={[0, -88, -18]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 120]} />
        <meshStandardMaterial color="#1e2326" roughness={0.62} metalness={0.08} />
      </mesh>
      <mesh castShadow position={[-72, -82, 46]} rotation={[-Math.PI / 2, 0, 0.08]}>
        <boxGeometry args={[58, 18, 3]} />
        <meshStandardMaterial color="#d8cfc2" roughness={0.52} metalness={0.02} />
      </mesh>
      <mesh castShadow position={[-76, -78, 50]} rotation={[-Math.PI / 2, 0, 0.08]}>
        <boxGeometry args={[40, 1.4, 1.2]} />
        <meshStandardMaterial color="#8bd6d1" emissive="#8bd6d1" emissiveIntensity={0.12} />
      </mesh>
      <mesh castShadow position={[78, -82, 48]} rotation={[-Math.PI / 2, 0, -0.1]}>
        <capsuleGeometry args={[8, 24, 8, 18]} />
        <meshStandardMaterial color="#20272a" roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[96, -78, -42]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <boxGeometry args={[30, 24, 2.4]} />
        <meshStandardMaterial color="#ffd29a" roughness={0.74} metalness={0.01} />
      </mesh>
      <mesh castShadow position={[104, -76, -38]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <boxGeometry args={[18, 1.3, 1]} />
        <meshStandardMaterial color="#7f5c32" roughness={0.68} />
      </mesh>
    </group>
  )
}

function MonitorRig({ progress, tone }) {
  const accent = useMemo(() => new THREE.Color(tone), [tone])
  const open = smooth(0.28 + progress * 0.72)

  return (
    <group position={[0, -24, -42]}>
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[112, 66, 5]} />
        <meshPhysicalMaterial color="#11171a" roughness={0.38} metalness={0.25} clearcoat={0.45} />
      </mesh>
      <mesh position={[0, 0, 3.2]}>
        <boxGeometry args={[94, 48, 1]} />
        <meshStandardMaterial color="#142126" emissive={accent} emissiveIntensity={0.08 + open * 0.2} />
      </mesh>
      <Html center transform distanceFactor={760} position={[0, 0, 5.2]} className="monitor-ui">
        <div className="monitor-top">
          <span>Companion Online</span>
          <b>{Math.round(open * 100)}%</b>
        </div>
        <div className="monitor-chat">
          <i />
          <span>识别到：连续工作 47 分钟</span>
        </div>
        <div className="monitor-task">
          <span>建议</span>
          <strong>整理任务 · 休息提醒 · 情绪安抚</strong>
        </div>
      </Html>
      <mesh castShadow position={[0, -43, 0]}>
        <boxGeometry args={[12, 34, 7]} />
        <meshStandardMaterial color="#171d1f" roughness={0.55} metalness={0.18} />
      </mesh>
      <mesh castShadow position={[0, -64, 0]}>
        <boxGeometry args={[70, 8, 34]} />
        <meshStandardMaterial color="#171d1f" roughness={0.62} metalness={0.16} />
      </mesh>
    </group>
  )
}

function CompanionAvatar({ progress, tone, chapterIndex }) {
  const accent = useMemo(() => new THREE.Color(tone), [tone])
  const awake = smooth(progress)
  const emotion = chapterIndex === 2 ? awake : 0.35 + awake * 0.35

  return (
    <group position={[0, -28 + awake * 16, 36]}>
      <mesh castShadow>
        <capsuleGeometry args={[18, 38, 8, 28]} />
        <meshPhysicalMaterial
          color="#f3eee8"
          roughness={0.45}
          metalness={0.03}
          clearcoat={0.34}
          emissive={accent}
          emissiveIntensity={0.02 + emotion * 0.08}
        />
      </mesh>
      <mesh position={[-7, 8, 17]}>
        <sphereGeometry args={[2.2, 16, 12]} />
        <meshStandardMaterial color="#111416" emissive={accent} emissiveIntensity={0.3 + emotion * 0.3} />
      </mesh>
      <mesh position={[7, 8, 17]}>
        <sphereGeometry args={[2.2, 16, 12]} />
        <meshStandardMaterial color="#111416" emissive={accent} emissiveIntensity={0.3 + emotion * 0.3} />
      </mesh>
      <mesh position={[0, -3, 19]} scale={[1 + emotion * 0.3, 1, 1]}>
        <boxGeometry args={[14, 2, 1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.22 + emotion * 0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[33 + emotion * 10, 1.2, 12, 96]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.18 + emotion * 0.22} transparent opacity={0.72} />
      </mesh>
    </group>
  )
}

function ChatCards({ progress, tone, visible }) {
  const accent = useMemo(() => new THREE.Color(tone), [tone])
  const items = [
    ['今天有点累。', -78, 30, 18],
    ['我帮你整理一下任务。', 78, 46, 10],
    ['先休息 5 分钟也可以。', 18, 78, -4],
  ]

  return (
    <group visible={visible > 0.06}>
      {items.map(([text, x, y, z], index) => {
        const p = smooth(progress - index * 0.12)
        return (
          <group key={text} position={[x * p, y - 22 + p * 22, z]} scale={[0.85 + p * 0.15, 0.85 + p * 0.15, 1]}>
            <mesh>
              <boxGeometry args={[74, 24, 2]} />
              <meshStandardMaterial color={index % 2 ? '#20292d' : '#f2eee8'} emissive={accent} emissiveIntensity={0.03 + p * 0.08} />
            </mesh>
            <mesh position={[0, 4, 2.2]}>
              <boxGeometry args={[42, 2.2, 0.7]} />
              <meshStandardMaterial color={index % 2 ? '#f7f2ea' : '#22282b'} emissive={accent} emissiveIntensity={0.06 + p * 0.12} />
            </mesh>
            <mesh position={[-9, -3, 2.2]}>
              <boxGeometry args={[30, 1.5, 0.7]} />
              <meshStandardMaterial color={index % 2 ? '#f7f2ea' : '#22282b'} transparent opacity={0.72} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function MemoryOrbit({ progress, tone, visible }) {
  const cards = useOrbitItems(10, 88, 18)
  const accent = useMemo(() => new THREE.Color(tone), [tone])

  return (
    <group visible={visible > 0.06} rotation={[0, progress * Math.PI * 0.65, 0]}>
      {cards.map((card, index) => {
        const p = smooth(progress - index * 0.035)
        return (
          <mesh key={index} position={[card.position[0] * p, card.position[1] * p, card.position[2] * p]} rotation={[0, -card.angle, 0]}>
            <boxGeometry args={[26, 15, 1.4]} />
            <meshStandardMaterial color={index % 2 ? '#24302f' : '#f0eadf'} emissive={accent} emissiveIntensity={0.04 + p * 0.08} />
          </mesh>
        )
      })}
    </group>
  )
}

function DesktopWindows({ progress, tone, visible }) {
  const accent = useMemo(() => new THREE.Color(tone), [tone])
  const windows = [
    [-70, -10, -16, -0.22],
    [70, 6, -4, 0.22],
    [0, 38, 8, 0],
  ]

  return (
    <group visible={visible > 0.06}>
      {windows.map(([x, y, z, rot], index) => {
        const p = smooth(progress - index * 0.1)
        return (
          <mesh key={index} position={[x * p, y, z]} rotation={[0, rot * p, 0]}>
            <boxGeometry args={[72, 42, 2]} />
            <meshStandardMaterial color="#171f24" emissive={accent} emissiveIntensity={0.05 + p * 0.08} roughness={0.46} />
          </mesh>
        )
      })}
    </group>
  )
}

function CustomSwatches({ progress, visible }) {
  const colors = ['#8bd6d1', '#ffd29a', '#c7a3ff', '#95d17c', '#ff9fbd']
  return (
    <group visible={visible > 0.06}>
      {colors.map((color, index) => {
        const angle = (index / colors.length) * Math.PI * 2 + progress
        const radius = 76
        return (
          <mesh key={color} position={[Math.cos(angle) * radius, 58, Math.sin(angle) * radius]} scale={0.8 + smooth(progress) * 0.25}>
            <sphereGeometry args={[7, 24, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.16} />
          </mesh>
        )
      })}
    </group>
  )
}

function DesktopCompanionScene({ scale, scrollState, chapter, chapterIndex, onSceneState }) {
  const root = useRef()
  const lastReport = useRef({ progress: -1, visibility: -1 })
  const progress = clamp01(scrollState.progress)
  const visibility = clamp01(scrollState.visibility)
  const width = scale?.[0] || 360
  const height = scale?.[1] || 360
  const base = Math.max(0.56, Math.min(width, height) / 440)

  useFrame((state) => {
    if (!root.current) return
    const time = state.clock.elapsedTime
    const targetY = -0.28 + progress * 0.42 + chapterIndex * 0.045
    const targetX = chapterIndex === 3 ? -0.12 : 0.02 + Math.sin(time * 0.55) * 0.025
    const liveScale = 0.9 + visibility * 0.11 + Math.sin(time * 0.9) * 0.012

    root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, targetY, 0.045)
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, targetX, 0.04)
    root.current.position.z = THREE.MathUtils.lerp(root.current.position.z, -18 + visibility * 12, 0.045)
    root.current.scale.setScalar(liveScale)

    const changed =
      Math.abs(lastReport.current.progress - progress) > 0.025 ||
      Math.abs(lastReport.current.visibility - visibility) > 0.08

    if (changed && visibility > 0.04) {
      lastReport.current = { progress, visibility }
      onSceneState?.({ index: chapterIndex, progress, visibility })
    }
  })

  return (
    <group ref={root} scale={[base, base, base]}>
      <Float speed={0.62} rotationIntensity={0.035} floatIntensity={0.1}>
        <DeskSurface />
        <MonitorRig progress={progress} tone={chapter.tone} />
        <CompanionAvatar progress={progress} tone={chapter.tone} chapterIndex={chapterIndex} />
        <ChatCards progress={chapterIndex === 1 ? progress : 0.08} tone={chapter.tone} visible={chapterIndex === 1 ? visibility : 0} />
        <MemoryOrbit progress={chapterIndex === 3 ? progress : 0.1} tone={chapter.tone} visible={chapterIndex === 3 ? visibility : 0} />
        <DesktopWindows progress={chapterIndex === 4 ? progress : 0.08} tone={chapter.tone} visible={chapterIndex === 4 ? visibility : 0} />
        <CustomSwatches progress={chapterIndex === 5 ? progress * Math.PI : 0} visible={chapterIndex === 5 ? visibility : 0} />
        <Html center transform distanceFactor={900} position={[0, 108, 0]} className="scene-tag">
          {chapter.label}
        </Html>
        <Html center transform distanceFactor={830} position={[0, -126, 0]} className="canvas-label">
          <strong>{chapter.metric}</strong>
        </Html>
      </Float>
    </group>
  )
}

function StoryScene({ track, chapter, index, onSceneState }) {
  return (
    <UseCanvas>
      <ScrollScene track={track} hideOffscreen>
        {({ scale, scrollState }) => (
          <DesktopCompanionScene
            scale={scale}
            scrollState={scrollState}
            chapter={chapter}
            chapterIndex={index}
            onSceneState={onSceneState}
          />
        )}
      </ScrollScene>
    </UseCanvas>
  )
}

function MechanismPanel({ chapter, progress, visibility, filmRunning }) {
  return (
    <aside className="mechanism-panel" aria-label="desktop companion film monitor">
      <div className="panel-head">
        <span>实时导演面板</span>
        <strong>{filmRunning ? 'Film Mode' : chapter.label}</strong>
      </div>
      <div className="panel-row">
        <span>Story Beat</span>
        <strong>{chapter.signal}</strong>
      </div>
      <div className="panel-row">
        <span>Scroll Progress</span>
        <strong>{Math.round(progress * 100)}%</strong>
      </div>
      <div className="meter" aria-hidden="true">
        <i style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <div className="panel-row">
        <span>Visibility</span>
        <strong>{Math.round(visibility * 100)}%</strong>
      </div>
      <div className="panel-row">
        <span>3D State</span>
        <strong>{chapter.effect}</strong>
      </div>
    </aside>
  )
}

function StageInterface({ chapter }) {
  const panels = {
    presence: {
      title: '桌面陪伴已唤醒',
      rows: ['状态：常驻桌面边缘', '输入：语音 / 文本 / 点击', '输出：表情、提醒、轻量动作'],
      chips: ['呼吸动画', '视线跟随', '在线状态'],
    },
    conversation: {
      title: '实时对话流',
      rows: ['用户：今天有点累', 'AI：先休息 5 分钟，我帮你整理任务', '系统：生成待办摘要'],
      chips: ['低延迟回复', '上下文理解', '任务提取'],
    },
    emotion: {
      title: '情绪与氛围状态',
      rows: ['疲劳指数：72%', '陪伴策略：降低刺激、柔和提醒', '视觉反馈：光环变暖、动作放慢'],
      chips: ['情绪识别', '氛围灯效', '动作强度'],
    },
    memory: {
      title: '长期记忆片段',
      rows: ['偏好：晚上少打扰', '习惯：周日整理计划', '目标：减少连续久坐'],
      chips: ['偏好沉淀', '记忆回看', '个性化建议'],
    },
    desktop: {
      title: '桌面工作区联动',
      rows: ['窗口：文档 / 日历 / 待办', '动作：提醒、整理、标记重点', '边界：不替用户提交敏感操作'],
      chips: ['窗口感知', '任务卡片', '操作边界'],
    },
    growth: {
      title: '个性成长配置',
      rows: ['外观：浅色睡衣 / 科技桌面', '性格：温和、低打扰、会鼓励', '场景：工作、休息、复盘'],
      chips: ['换装', '性格参数', '场景模板'],
    },
  }
  const data = panels[chapter.id] || panels.presence

  return (
    <div className={`stage-interface stage-interface-${chapter.id}`}>
      <div className="interface-window primary-window">
        <div className="window-bar">
          <span />
          <span />
          <span />
          <strong>{data.title}</strong>
        </div>
        <div className="window-body">
          {data.rows.map((row) => (
            <p key={row}>{row}</p>
          ))}
        </div>
      </div>
      <div className="interface-dock">
        {data.chips.map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </div>
      <div className="interface-status">
        <b>LIVE</b>
        <span>{chapter.metric}</span>
      </div>
    </div>
  )
}

function Chapter({ chapter, index, registerRef, onSceneState }) {
  const anchorRef = useRef(null)
  registerRef(index, anchorRef)

  return (
    <section className={`chapter chapter-${chapter.id}`}>
      <div className="copy">
        <span>{chapter.eyebrow}</span>
        <h2>{chapter.title}</h2>
        <p>{chapter.body}</p>
        <dl className="chapter-facts">
          <div>
            <dt>故事动作</dt>
            <dd>{chapter.signal}</dd>
          </div>
          <div>
            <dt>3D 状态</dt>
            <dd>{chapter.effect}</dd>
          </div>
        </dl>
      </div>

      <div className="stage" ref={anchorRef} aria-hidden="true">
        <div className="stage-frame">
          <span>{chapter.label}</span>
          <StageInterface chapter={chapter} />
          <b>LIVE PRODUCT DEMO</b>
        </div>
      </div>

      <StoryScene track={anchorRef} chapter={chapter} index={index} onSceneState={onSceneState} />
    </section>
  )
}

function HeroPreview({ onSceneState }) {
  const previewRef = useRef(null)
  return (
    <div className="hero-preview" ref={previewRef} aria-hidden="true">
      <div className="stage-frame">
        <span>桌面陪伴预览</span>
        <StageInterface chapter={chapters[0]} />
        <b>ONE FIXED WEBGL CANVAS</b>
      </div>
      <StoryScene track={previewRef} chapter={chapters[0]} index={0} onSceneState={onSceneState} />
    </div>
  )
}

export function App() {
  const refs = useRef([])
  const [filmRunning, setFilmRunning] = useState(false)
  const [sceneState, setSceneState] = useState({ index: 0, progress: 0, visibility: 0 })
  const activeChapter = chapters[sceneState.index] || chapters[0]

  const registerRef = (index, ref) => {
    refs.current[index] = ref
  }

  const runFilm = async () => {
    if (filmRunning) return
    setFilmRunning(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const delays = [900, 3000, 3200, 3400, 3400, 3600]
    for (let index = 0; index < refs.current.length; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, delays[index] || 3200))
      refs.current[index]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    await new Promise((resolve) => setTimeout(resolve, 3800))
    setFilmRunning(false)
  }

  return (
    <>
      <GlobalCanvas
        shadows
        camera={{ fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'none', zIndex: 2 }}
      >
        <ambientLight intensity={0.52} />
        <directionalLight position={[250, 260, 260]} intensity={1.85} castShadow />
        <pointLight position={[-180, -50, 150]} intensity={1.15} color="#8bd6d1" />
        <pointLight position={[220, 130, 80]} intensity={0.82} color="#ffd29a" />
        <PerspectiveCamera makeDefault position={[0, 0, 900]} fov={42} />
        <Environment preset="city" />
      </GlobalCanvas>

      <SmoothScrollbar />

      <main>
        <MechanismPanel
          chapter={activeChapter}
          progress={sceneState.progress}
          visibility={sceneState.visibility}
          filmRunning={filmRunning}
        />

        <header className="hero">
          <div className="hero-copy">
            <span>Desktop Companion / Scroll Driven 3D Story</span>
            <h1>把 AI 从聊天框，变成桌面上的陪伴存在</h1>
            <p>
              这是基于 r3f-scroll-rig 模板生成的第一个真实案例。它用滚动页面展示桌面女友的陪伴、对话、情绪、记忆、桌面互动和个性成长。
            </p>
            <div className="hero-actions">
              <button type="button" onClick={runFilm} disabled={filmRunning}>
                {filmRunning ? '演示推进中' : '播放导演模式'}
              </button>
              <a href="#story-map">查看故事地图</a>
            </div>
          </div>
          <div className="hero-side">
            <HeroPreview onSceneState={setSceneState} />
          </div>
        </header>

        <section className="story-map" id="story-map">
          <span>故事地图</span>
          <h2>从聊天工具，到持续陪伴</h2>
          <div className="flow">
            {chapters.map((chapter) => (
              <div key={chapter.id}>
                <strong>{chapter.label}</strong>
                <small>{chapter.effect}</small>
              </div>
            ))}
          </div>
        </section>

        {chapters.map((chapter, index) => (
          <Chapter
            key={chapter.id}
            chapter={chapter}
            index={index}
            registerRef={registerRef}
            onSceneState={setSceneState}
          />
        ))}

        <footer>
          <span>下一步：接入真实角色资产、字幕、旁白、录制和发布包，让这个页面变成 60 秒产品介绍视频。</span>
        </footer>
      </main>
    </>
  )
}
