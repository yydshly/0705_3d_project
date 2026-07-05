import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Environment, Html, PerspectiveCamera, useAnimations, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import './styles.css'

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

const beats = [
  {
    id: 'presence',
    eyebrow: '01 / Presence',
    title: '它先成为桌面上的存在',
    body: '角色常驻在你的工作空间边缘，轻量提醒、安静等待，不打断你的节奏。',
    animation: 'Wave',
    tone: '#7ee7dc',
    screenTitle: '早上好，我在',
    screenRows: ['检测到桌面空闲', '同步今日任务', '等待你的第一句话'],
  },
  {
    id: 'listen',
    eyebrow: '02 / Understand',
    title: '它听懂当前状态',
    body: '一句“今天有点累”，会被放进工作时长、情绪和任务上下文里理解。',
    animation: 'Yes',
    tone: '#ffd08a',
    screenTitle: '你看起来有点累',
    screenRows: ['输入：今天有点累', '识别：连续工作 47 分钟', '回应：先休息 5 分钟'],
  },
  {
    id: 'organize',
    eyebrow: '03 / Organize',
    title: '它把对话整理成行动',
    body: '聊天内容变成待办、提醒和复盘计划，桌面从混乱进入可执行状态。',
    animation: 'ThumbsUp',
    tone: '#93b8ff',
    screenTitle: '我帮你整理一下',
    screenRows: ['任务：整理未完成事项', '提醒：5 分钟后休息', '复盘：晚上回顾计划'],
  },
  {
    id: 'memory',
    eyebrow: '04 / Memory',
    title: '它沉淀长期偏好',
    body: '偏好、习惯和目标从对话里被保存，下一次陪伴会更贴近你的节奏。',
    animation: 'Sitting',
    tone: '#a3d982',
    screenTitle: '我记得你的习惯',
    screenRows: ['偏好：晚上少打扰', '习惯：周日整理计划', '目标：减少久坐'],
  },
  {
    id: 'workspace',
    eyebrow: '05 / Workspace',
    title: '最后形成个人工作区',
    body: '角色、任务、提醒、记忆与状态聚合在同一个桌面空间，成为一个完整产品画面。',
    animation: 'Wave',
    tone: '#ff9fbd',
    screenTitle: '今天我陪你慢慢来',
    screenRows: ['模式：温和陪伴', '任务：3 项已整理', '记忆：偏好持续沉淀'],
  },
]

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function ease(value) {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}

function useScrollStory() {
  const [state, setState] = useState({ index: 0, progress: 0 })

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const sections = [...document.querySelectorAll('[data-beat]')]
      const center = window.innerHeight * 0.52
      let nextIndex = 0
      let nextProgress = 0
      let best = Number.POSITIVE_INFINITY

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        const distance = Math.abs(rect.top + rect.height * 0.5 - center)
        if (rect.bottom > 0 && rect.top < window.innerHeight && distance < best) {
          best = distance
          nextIndex = index
          nextProgress = clamp((center - rect.top) / rect.height)
        }
      })

      setState((current) => (
        current.index === nextIndex && Math.abs(current.progress - nextProgress) < 0.015
          ? current
          : { index: nextIndex, progress: nextProgress }
      ))
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return state
}

function Companion({ beat }) {
  const group = useRef()
  const gltf = useGLTF('/models/RobotExpressive.glb')
  const scene = useMemo(() => clone(gltf.scene), [gltf.scene])
  const { actions } = useAnimations(gltf.animations, group)

  useEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
      if (object.material) object.material.roughness = Math.min(0.78, object.material.roughness ?? 0.5)
    })
  }, [scene])

  useEffect(() => {
    Object.values(actions).forEach((action) => action?.fadeOut(0.2))
    const selected = actions[beat.animation] || actions.Idle
    selected?.reset().fadeIn(0.32).play()
    return () => selected?.fadeOut(0.2)
  }, [actions, beat.animation])

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = -0.58 + Math.sin(state.clock.elapsedTime * 0.45) * 0.06
    group.current.position.y = -1.22 + Math.sin(state.clock.elapsedTime * 1.2) * 0.025
  })

  return (
    <group ref={group} position={[2.2, -1.22, 0.42]} rotation={[0, -0.58, 0]} scale={0.62}>
      <primitive object={scene} />
    </group>
  )
}

function Desk({ beat, progress }) {
  const accent = useMemo(() => new THREE.Color(beat.tone), [beat.tone])
  const keys = useMemo(() => Array.from({ length: 24 }, (_, index) => {
    const row = Math.floor(index / 8)
    const col = index % 8
    return [-2.45 + col * 0.18, -1.2, 0.55 + row * 0.16]
  }), [])

  return (
    <group>
      <mesh receiveShadow position={[0, -1.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[5.6, 3.2, 0.16]} />
        <meshStandardMaterial color="#2f2927" roughness={0.78} />
      </mesh>
      <mesh receiveShadow position={[0, -1.27, -0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, 2.55]} />
        <meshStandardMaterial color="#151b1f" roughness={0.62} metalness={0.04} />
      </mesh>
      <mesh position={[0, -1.255, -0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.16, 96]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.26} transparent opacity={0.13 + progress * 0.08} />
      </mesh>

      <mesh castShadow position={[0, -0.18, -0.82]}>
        <boxGeometry args={[2.45, 1.32, 0.12]} />
        <meshPhysicalMaterial color="#0e1519" roughness={0.34} metalness={0.16} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, -0.18, -0.745]}>
        <planeGeometry args={[2.15, 1.05]} />
        <meshStandardMaterial color="#101d22" emissive={accent} emissiveIntensity={0.08 + progress * 0.1} />
      </mesh>
      <Html transform center distanceFactor={4.8} position={[0, -0.18, -0.675]} className="screen-ui">
        <div className="screen-top">
          <span>Companion OS</span>
          <b>{Math.round((0.45 + progress * 0.55) * 100)}%</b>
        </div>
        <strong>{beat.screenTitle}</strong>
        {beat.screenRows.map((row) => <p key={row}>{row}</p>)}
      </Html>
      <mesh castShadow position={[0, -0.98, -0.82]}>
        <boxGeometry args={[0.18, 0.62, 0.14]} />
        <meshStandardMaterial color="#151b1e" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, -1.26, -0.78]}>
        <boxGeometry args={[1.45, 0.12, 0.68]} />
        <meshStandardMaterial color="#151b1e" roughness={0.62} />
      </mesh>

      <mesh castShadow position={[-1.7, -1.18, 0.72]} rotation={[-Math.PI / 2, 0, 0.08]}>
        <boxGeometry args={[1.35, 0.38, 0.08]} />
        <meshStandardMaterial color="#d8d0c5" roughness={0.55} />
      </mesh>
      {keys.map(([x, y, z], index) => (
        <mesh key={index} castShadow position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0.08]}>
          <boxGeometry args={[0.12, 0.08, 0.025]} />
          <meshStandardMaterial color={index % 7 === 0 ? beat.tone : '#eee1d4'} emissive={index % 7 === 0 ? beat.tone : '#000000'} emissiveIntensity={0.15} />
        </mesh>
      ))}
      <mesh castShadow position={[1.25, -1.2, 0.78]} rotation={[-Math.PI / 2, 0, -0.18]}>
        <capsuleGeometry args={[0.16, 0.48, 8, 20]} />
        <meshStandardMaterial color="#222b30" roughness={0.48} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[-2.2, -1.13, -0.58]} rotation={[0, 0, -0.18]}>
        <cylinderGeometry args={[0.045, 0.055, 0.76, 16]} />
        <meshStandardMaterial color="#303b42" metalness={0.16} roughness={0.42} />
      </mesh>
      <mesh position={[-2.0, -0.77, -0.68]} rotation={[0.38, 0, -0.48]}>
        <coneGeometry args={[0.24, 0.36, 32]} />
        <meshStandardMaterial color={beat.tone} emissive={beat.tone} emissiveIntensity={0.28} transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

function FlowLayer({ beat, progress }) {
  const accent = beat.tone
  if (beat.id === 'listen') {
    return (
      <Html transform center distanceFactor={5.2} position={[-2.25, 0.34, 0.18]} className="floating-panel">
        <div style={{ '--tone': accent }}>
          <b>实时理解</b>
          <p><span>输入</span>今天有点累</p>
          <p><span>状态</span>连续工作 47 分钟</p>
          <p><span>建议</span>先休息 5 分钟</p>
        </div>
      </Html>
    )
  }

  if (beat.id === 'organize') {
    const cards = [
      ['任务', '整理未完成事项'],
      ['提醒', '5 分钟后休息'],
      ['复盘', '晚上回顾计划'],
    ]
    return (
      <Html transform center distanceFactor={5.2} position={[-2.2, 0.18, 0.15]} className="task-flow">
        <div style={{ '--tone': accent }}>
          <b>对话转成行动</b>
          <small>“今天有点累，还有几个事没收尾。”</small>
          {cards.map(([kind, text], index) => (
            <p key={kind} style={{ transform: `translateX(${(1 - ease(progress - index * 0.16)) * 1.8}rem)`, opacity: 0.36 + ease(progress - index * 0.16) * 0.64 }}>
              <i>{kind}</i><span>{text}</span><em>{index === 0 ? '已归类' : index === 1 ? '已设置' : '已安排'}</em>
            </p>
          ))}
        </div>
      </Html>
    )
  }

  if (beat.id === 'memory') {
    return (
      <Html transform center distanceFactor={5.4} position={[1.9, 0.36, 0.06]} className="memory-flow">
        <div style={{ '--tone': accent }}>
          <b>记忆沉淀</b>
          <p>偏好：晚上少打扰</p>
          <p>习惯：周日整理计划</p>
          <p>目标：减少久坐</p>
        </div>
      </Html>
    )
  }

  if (beat.id === 'workspace') {
    return (
      <Html transform center distanceFactor={5.2} position={[-2.15, 0.46, 0.05]} className="summary-flow">
        <div style={{ '--tone': accent }}>
          <b>个人工作区已就绪</b>
          <p><span>角色</span>温和陪伴</p>
          <p><span>任务</span>3 项已整理</p>
          <p><span>记忆</span>偏好持续沉淀</p>
        </div>
      </Html>
    )
  }

  return null
}

function SignalEffects({ beat, progress }) {
  const accent = useMemo(() => new THREE.Color(beat.tone), [beat.tone])
  const group = useRef()

  useFrame((state) => {
    if (!group.current) return
    group.current.children.forEach((child, index) => {
      child.rotation.z = state.clock.elapsedTime * (0.18 + index * 0.04)
    })
  })

  return (
    <group ref={group} position={[0, -1.05, 0.05]} scale={0.82 + progress * 0.16}>
      {[0, 1, 2].map((index) => (
        <mesh key={index} rotation={[Math.PI / 2, 0, index * 0.7]}>
          <torusGeometry args={[1.1 + index * 0.38, 0.01, 8, 96]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.38} transparent opacity={0.2 - index * 0.035} />
        </mesh>
      ))}
    </group>
  )
}

function Scene({ beat, progress }) {
  const { viewport } = useThree()
  const compact = viewport.width < 7
  const scenePosition = compact ? [0.98, -0.62, 0] : [0.18, 0, 0]
  const sceneScale = compact ? 0.82 : 1

  return (
    <>
      <ambientLight intensity={0.58} />
      <directionalLight position={[4, 5, 5]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-3.5, 0.8, 2.4]} intensity={1.8} color={beat.tone} />
      <pointLight position={[3, 2.2, 1.5]} intensity={0.75} color="#ffe3c7" />
      <PerspectiveCamera makeDefault position={[0, 0.35, 6.3]} fov={42} />
      <Environment preset="city" />
      <group rotation={[0.05, -0.2 + progress * 0.16, 0]} position={scenePosition} scale={sceneScale}>
        <SignalEffects beat={beat} progress={progress} />
        <Desk beat={beat} progress={progress} />
        <Suspense fallback={null}>
          <Companion beat={beat} />
        </Suspense>
        <FlowLayer beat={beat} progress={progress} />
      </group>
    </>
  )
}

function App() {
  const story = useScrollStory()
  const [autoPlaying, setAutoPlaying] = useState(false)
  const beat = beats[story.index] || beats[0]

  useEffect(() => {
    if (window.location.hash) {
      const scrollToHash = () => {
        document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'auto', block: 'start' })
      }
      window.setTimeout(scrollToHash, 180)
      window.setTimeout(scrollToHash, 520)
      window.setTimeout(scrollToHash, 980)
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' })
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 120)
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 420)
    }
  }, [])

  const playDemo = async () => {
    if (autoPlaying) return
    setAutoPlaying(true)
    for (const item of beats) {
      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      await new Promise((resolve) => setTimeout(resolve, 2100))
    }
    setAutoPlaying(false)
  }

  return (
    <>
      <Canvas shadows gl={{ antialias: true, alpha: true }} className="stage-canvas">
        <Scene beat={beat} progress={story.progress} />
      </Canvas>

      <nav className="topbar">
        <a href="#hero" className="brand">桌面 AI 伴侣</a>
        <div>
          {beats.map((item, index) => (
            <a key={item.id} href={`#${item.id}`} className={index === story.index ? 'active' : ''}>{String(index + 1).padStart(2, '0')}</a>
          ))}
        </div>
      </nav>

      <aside className="director">
        <span>{autoPlaying ? 'Demo Playing' : 'Live Demo'}</span>
        <strong>{beat.title}</strong>
        <i><b style={{ width: `${Math.round(story.progress * 100)}%` }} /></i>
      </aside>

      <main>
        <section className="hero" id="hero">
          <div className="hero-copy">
            <span>3D Product Website Demo</span>
            <h1>桌面 AI 伴侣</h1>
            <p>一个能常驻桌面、理解状态、整理任务并沉淀记忆的个人工作空间。这里展示的是第二个研究项目的完整能力：网页内容和 3D 场景同步演出一个产品故事。</p>
            <div className="actions">
              <button type="button" onClick={playDemo}>{autoPlaying ? '演示推进中' : '播放完整演示'}</button>
              <a href="#presence">查看能力</a>
            </div>
          </div>
        </section>

        <section className="capability-strip">
          <article><b>01</b><strong>滚动驱动</strong><span>页面推进时 3D 状态同步变化</span></article>
          <article><b>02</b><strong>GLB 动画</strong><span>角色根据阶段切换动作</span></article>
          <article><b>03</b><strong>DOM + 3D</strong><span>真实产品 UI 嵌入场景</span></article>
          <article><b>04</b><strong>视频预备</strong><span>可继续接录制、旁白、字幕</span></article>
        </section>

        {beats.map((item) => (
          <section className="story-section" id={item.id} data-beat key={item.id}>
            <div className="story-copy">
              <span>{item.eyebrow}</span>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </div>
          </section>
        ))}

        <section className="final-section">
          <span>Ready for film</span>
          <h2>这个 Demo 可以继续扩展为产品视频</h2>
          <p>下一步可以加入 Minimax 生成的专属角色、中文旁白、背景音乐、封面和 MP4 导出，让它从网页演示变成发布素材。</p>
        </section>
      </main>
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
