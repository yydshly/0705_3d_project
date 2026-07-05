import React, { useMemo, useRef, useState } from 'react'
import { Environment, Float, Html, PerspectiveCamera } from '@react-three/drei'
import { GlobalCanvas, ScrollScene, SmoothScrollbar, UseCanvas } from '@14islands/r3f-scroll-rig'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const chapters = [
  {
    id: 'anchor',
    eyebrow: '01 / DOM Anchor',
    title: '普通网页区块，变成 3D 的锚点',
    body: 'r3f-scroll-rig 的第一层能力不是生成模型，而是追踪页面里的 DOM 区块。右侧这个边框就是一个网页元素，3D 产品会被绑定到它的位置上。',
    label: 'DOM 锚点',
    metric: 'track = section ref',
    signal: 'getBoundingClientRect',
    effect: '3D 对齐网页区域',
    tone: '#73c69b',
  },
  {
    id: 'scroll',
    eyebrow: '02 / Scroll Progress',
    title: '滚动进度，驱动 3D 状态变化',
    body: '当你继续滚动，库会计算当前区块的 progress、visibility、viewport 等状态。模型的旋转、位置、数据光点和强调色都可以由这些状态控制。',
    label: '滚动时间线',
    metric: 'progress -> transform',
    signal: 'scrollState.progress',
    effect: '位置、旋转、材质变化',
    tone: '#7cc7e8',
  },
  {
    id: 'inspect',
    eyebrow: '03 / Product Inspection',
    title: '网页章节，可以控制产品结构展开',
    body: '这里不是简单横向旋转模型，而是把章节语义映射到 3D 状态：太阳能板抬起、传感器探头展开、内部能力被解释出来。',
    label: '结构解释',
    metric: 'chapter -> product state',
    signal: 'visibility + chapter index',
    effect: '结构展开与能力说明',
    tone: '#f0b75a',
  },
  {
    id: 'film',
    eyebrow: '04 / Film Mode',
    title: '同一套滚动页面，可以变成演示视频',
    body: '当滚动路径、章节节奏和 3D 状态稳定后，自动滚动就可以变成导演时间线，再接字幕、旁白、音乐和录制流程。',
    label: '视频化演示',
    metric: 'auto scroll timeline',
    signal: 'directed scroll steps',
    effect: '网页 -> 产品短片',
    tone: '#c690e8',
  },
]

function clamp01(value) {
  return Math.max(0, Math.min(1, value || 0))
}

function smooth(value) {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

function useGrassLayout(count) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, index) => {
      const angle = index * 2.399963
      const radius = 26 + (index % 19) * 5.4
      const height = 12 + (index % 7) * 3.5
      return {
        position: [Math.cos(angle) * radius, -73, Math.sin(angle) * radius],
        rotation: [0, angle + (index % 5) * 0.2, 0],
        height,
        color: index % 5 === 0 ? '#8baa60' : index % 3 === 0 ? '#5f9660' : '#4f7f53',
      }
    })
  }, [count])
}

function useDataPoints(count) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, index) => {
      const angle = index * 1.618
      const radius = 82 + (index % 5) * 15
      const height = -8 + (index % 9) * 14
      return [Math.cos(angle) * radius, height, Math.sin(angle) * radius]
    })
  }, [count])
}

function GrassPatch({ wind }) {
  const blades = useGrassLayout(88)

  return (
    <group>
      {blades.map((blade, index) => (
        <mesh
          key={index}
          position={blade.position}
          rotation={[blade.rotation[0], blade.rotation[1] + Math.sin(wind + index * 0.41) * 0.06, blade.rotation[2]]}
        >
          <boxGeometry args={[2.1, blade.height, 1.15]} />
          <meshStandardMaterial color={blade.color} roughness={0.88} metalness={0.02} />
        </mesh>
      ))}
    </group>
  )
}

function DataCloud({ tone, visibility, active }) {
  const points = useDataPoints(38)
  const color = useMemo(() => new THREE.Color(tone), [tone])

  return (
    <group visible={visibility > 0.08}>
      {points.map((position, index) => (
        <mesh key={index} position={position} scale={(0.55 + (index % 4) * 0.16) * (active ? 1.22 : 0.68)}>
          <sphereGeometry args={[2.1, 12, 8]} />
          <meshStandardMaterial
            color={index % 3 === 0 ? color : '#edf4ef'}
            emissive={color}
            emissiveIntensity={active ? 0.3 : 0.1}
            transparent
            opacity={0.18 + visibility * 0.48}
          />
        </mesh>
      ))}
    </group>
  )
}

function EcoSenseDevice({ progress, visibility, tone, chapterIndex, metric }) {
  const accent = useMemo(() => new THREE.Color(tone), [tone])
  const open = chapterIndex === 2 ? smooth(progress) : 0
  const film = chapterIndex === 3 ? smooth(progress) : 0
  const active = chapterIndex > 0

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, -18, 0]}>
        <boxGeometry args={[76, 96, 34]} />
        <meshPhysicalMaterial
          color="#1e2926"
          metalness={0.25}
          roughness={0.43}
          clearcoat={0.5}
          clearcoatRoughness={0.24}
        />
      </mesh>

      <mesh castShadow position={[0, 4, 18.4]}>
        <boxGeometry args={[55, 38, 3]} />
        <meshPhysicalMaterial color="#111819" metalness={0.12} roughness={0.26} clearcoat={0.4} />
      </mesh>

      <mesh position={[0, 4, 20.3]}>
        <boxGeometry args={[44, 24, 1.2]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={active ? 0.3 : 0.11} />
      </mesh>

      <mesh castShadow position={[0, 43 + open * 24, -2]} rotation={[open * -0.55, 0, 0]}>
        <boxGeometry args={[82, 18, 5]} />
        <meshPhysicalMaterial color="#27415a" metalness={0.3} roughness={0.3} clearcoat={0.42} />
      </mesh>

      <mesh castShadow position={[-30 - open * 26, -14, 24 + open * 10]}>
        <cylinderGeometry args={[6, 6, 30, 24]} />
        <meshStandardMaterial color="#1b2525" roughness={0.52} metalness={0.22} />
      </mesh>

      <mesh castShadow position={[30 + open * 26, -14, 24 + open * 10]}>
        <cylinderGeometry args={[6, 6, 30, 24]} />
        <meshStandardMaterial color="#1b2525" roughness={0.52} metalness={0.22} />
      </mesh>

      <mesh castShadow position={[0, -72, 0]}>
        <cylinderGeometry args={[16, 21, 70, 32]} />
        <meshStandardMaterial color="#2c3731" roughness={0.76} metalness={0.12} />
      </mesh>

      <mesh position={[0, -108, 0]}>
        <cylinderGeometry args={[52, 68, 10, 48]} />
        <meshStandardMaterial color="#3b3528" roughness={0.94} metalness={0.02} />
      </mesh>

      <mesh position={[0, -18, -32 - open * 28]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[64 + film * 14, 1.6, 12, 96]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.14 + visibility * 0.24} />
      </mesh>

      <Html center transform distanceFactor={820} position={[0, -132, 0]} className="canvas-label">
        <strong>{metric}</strong>
      </Html>
    </group>
  )
}

function ProductScene({ scale, scrollState, chapter, chapterIndex, onSceneState }) {
  const root = useRef()
  const lastReport = useRef({ progress: -1, visibility: -1 })
  const progress = clamp01(scrollState.progress)
  const visibility = clamp01(scrollState.visibility)
  const width = scale?.[0] || 360
  const height = scale?.[1] || 360
  const base = Math.max(0.58, Math.min(width, height) / 430)

  useFrame((state) => {
    if (!root.current) return

    const time = state.clock.elapsedTime
    const targetY = chapterIndex === 0 ? -0.34 + progress * 0.4 : chapterIndex === 2 ? 0.58 : 0.18 + progress * 0.38
    const targetX = chapterIndex === 2 ? -0.16 : -0.05 + progress * 0.1
    const liveScale = 0.9 + visibility * 0.13 + Math.sin(time * 1.05) * 0.018

    root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, targetY, 0.045)
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, targetX, 0.04)
    root.current.position.z = THREE.MathUtils.lerp(root.current.position.z, -12 + visibility * 12, 0.04)
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
      <Float speed={0.7} rotationIntensity={0.04} floatIntensity={0.12}>
        <mesh receiveShadow position={[0, -116, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[145, 96]} />
          <meshStandardMaterial color="#3c3327" roughness={0.96} metalness={0.02} />
        </mesh>
        <GrassPatch wind={progress * 3 + chapterIndex} />
        <EcoSenseDevice
          progress={progress}
          visibility={visibility}
          tone={chapter.tone}
          chapterIndex={chapterIndex}
          metric={chapter.metric}
        />
        <DataCloud tone={chapter.tone} visibility={visibility} active={chapterIndex > 0} />
        <Html center transform distanceFactor={900} position={[0, 112, 0]} className="scene-tag">
          {chapter.label}
        </Html>
      </Float>
    </group>
  )
}

function StoryScene({ track, chapter, index, onSceneState }) {
  return (
    <UseCanvas>
      <ScrollScene track={track} hideOffscreen={false}>
        {({ scale, scrollState }) => (
          <ProductScene
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
  const percent = Math.round(progress * 100)
  const visible = Math.round(visibility * 100)

  return (
    <aside className="mechanism-panel" aria-label="r3f-scroll-rig mechanism monitor">
      <div className="panel-head">
        <span>实时机制面板</span>
        <strong>{filmRunning ? 'Film Mode' : chapter.label}</strong>
      </div>
      <div className="panel-row">
        <span>DOM Anchor</span>
        <strong>{chapter.signal}</strong>
      </div>
      <div className="panel-row">
        <span>Scroll Progress</span>
        <strong>{percent}%</strong>
      </div>
      <div className="meter" aria-hidden="true">
        <i style={{ width: `${percent}%` }} />
      </div>
      <div className="panel-row">
        <span>Visibility</span>
        <strong>{visible}%</strong>
      </div>
      <div className="panel-row">
        <span>3D State</span>
        <strong>{chapter.effect}</strong>
      </div>
      <ol>
        <li className="active">页面区块</li>
        <li className={progress > 0.12 ? 'active' : ''}>滚动状态</li>
        <li className={visibility > 0.2 ? 'active' : ''}>全局 Canvas</li>
        <li className={progress > 0.42 ? 'active' : ''}>3D 变化</li>
      </ol>
    </aside>
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
            <dt>网页侧</dt>
            <dd>{chapter.signal}</dd>
          </div>
          <div>
            <dt>3D 侧</dt>
            <dd>{chapter.effect}</dd>
          </div>
        </dl>
      </div>

      <div className="stage" ref={anchorRef} aria-hidden="true">
        <div className="stage-frame">
          <span>{chapter.label}</span>
          <b>DOM TRACK TARGET</b>
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
        <span>全局 WebGL 画布</span>
        <b>ONE FIXED CANVAS</b>
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

    const steps = refs.current.map((ref, index) => ({
      ref,
      delay: index === 0 ? 900 : index === 2 ? 3900 : 3100,
    }))

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay))
      step.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    await new Promise((resolve) => setTimeout(resolve, 3600))
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
        <ambientLight intensity={0.48} />
        <directionalLight position={[260, 260, 260]} intensity={2.05} castShadow />
        <pointLight position={[-170, -60, 160]} intensity={1.25} color="#73c69b" />
        <pointLight position={[220, 130, 80]} intensity={0.78} color="#7cc7e8" />
        <PerspectiveCamera makeDefault position={[0, 0, 900]} fov={42} />
        <Environment preset="forest" />
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
            <span>r3f-scroll-rig / DOM + WebGL Sync</span>
            <h1>把普通网页滚动，变成可导演的 3D 产品叙事</h1>
            <p>
              这个原型用一个生态监测设备演示第二个项目的核心价值：网页区块负责内容和节奏，固定 WebGL
              画布负责 3D 呈现，滚动状态把两者连接成同一条时间线。
            </p>
            <div className="hero-actions">
              <button type="button" onClick={runFilm} disabled={filmRunning}>
                {filmRunning ? '演示推进中' : '播放导演模式'}
              </button>
              <a href="#capability-map">查看能力地图</a>
            </div>
          </div>
          <div className="hero-side">
            <HeroPreview onSceneState={setSceneState} />
          </div>
        </header>

        <section className="capability-map" id="capability-map">
          <span>能力地图</span>
          <h2>它沉淀的是网页与 3D 的组织能力</h2>
          <div className="flow">
            <div>HTML 内容层</div>
            <div>DOM 追踪层</div>
            <div>滚动时间线</div>
            <div>全局 WebGL Canvas</div>
            <div>3D 物体与材质状态</div>
            <div>Film Mode</div>
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
          <span>下一步：把这套结构抽成模板，输入一个产品或作品，输出沉浸式 3D 官网和可录制演示视频。</span>
        </footer>
      </main>
    </>
  )
}
