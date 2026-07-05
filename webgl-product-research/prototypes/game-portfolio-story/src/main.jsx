import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Float, Html, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import './styles.css'

const stations = [
  {
    id: 'grass',
    title: 'Shader 草地系统',
    short: 'GPU 实例化、风、草高、密度',
    position: [-9, 0, -3],
    color: '#7cb342',
    accent: '#d8f3a2',
    body: '把技术参数变成可感知的自然场景：草的密度、风、土壤、光影和镜头共同构成一个可发布的演示短片。',
    tags: ['GPU', 'Shader', 'Film'],
    detail: {
      title: 'Shader 草地系统详情层',
      subtitle: '一个节点可以继续打开技术说明、参数、演示和产物入口。',
      intro:
        '这一层模拟把 GrassSystemThreeJS 节点展开成一个小型项目详情页：左边仍是 3D 空间，右侧承载技术拆解和可跳转资源。',
      metrics: [
        { label: '渲染核心', value: 'GPU Instancing' },
        { label: '动态来源', value: 'Vertex Shader' },
        { label: '展示目标', value: '可发布短片' }
      ],
      layers: [
        '能力说明：草地、风、土壤、光影、镜头如何形成完整场景',
        '实现原理：同一个草叶几何被大量实例化，再由 shader 控制摆动',
        '参数入口：密度、风强、草高、颜色、镜头节奏都可以作为演示变量',
        '产物入口：源码、README、视频、封面、字幕、旁白可以被挂到同一节点'
      ],
      links: [
        'GrassSystemThreeJS-demo/',
        'THREEJS_GRASS_SYSTEM_CAPABILITY_GUIDE.md',
        'system-film-share-package.md'
      ]
    }
  },
  {
    id: 'scroll',
    title: '滚动驱动 3D 官网',
    short: 'DOM + WebGL 同步叙事',
    position: [0, 0, -8],
    color: '#4d8df7',
    accent: '#b9d1ff',
    body: '把网页滚动进度变成 3D 状态控制器：章节、镜头、模型变化、文字说明同时推进。',
    tags: ['Scroll', 'R3F', 'Website']
  },
  {
    id: 'spatial',
    title: '游戏化空间作品集',
    short: '小车、展区、展板、交互区域',
    position: [9, 0, -2],
    color: '#f2a65a',
    accent: '#ffd7aa',
    body: '把作品集从卡片列表改造成可以进入的空间。用户不是翻页面，而是在展厅里移动、靠近、触发。',
    tags: ['World', 'Vehicle', 'Area']
  },
  {
    id: 'product',
    title: '产品展示视频化',
    short: '导演节奏、字幕、旁白、封面',
    position: [3, 0, 7],
    color: '#d65a7a',
    accent: '#ffc0cf',
    body: '把互动页面进一步变成可录制的产品影片：自动导览、重点镜头、字幕旁白和发布素材。',
    tags: ['Camera', 'Voice', 'Publish']
  },
  {
    id: 'skill',
    title: '可复用 Skill',
    short: '分析、原型、沉淀、复用',
    position: [-7, 0, 6],
    color: '#8b72e6',
    accent: '#d4c8ff',
    body: '每个研究样本都必须形成证据链：源码证据、运行证据、边界结论、可复用流程。',
    tags: ['Workflow', 'Evidence', 'Reuse']
  }
]

const tourPath = [
  new THREE.Vector3(-10, 0, -3),
  new THREE.Vector3(-1, 0, -8),
  new THREE.Vector3(8.5, 0, -2),
  new THREE.Vector3(3, 0, 7),
  new THREE.Vector3(-7, 0, 6),
  new THREE.Vector3(0, 0, 0)
]

function useKeyboard() {
  const keys = useRef({})

  useEffect(() => {
    const down = (event) => {
      keys.current[event.code] = true
    }
    const up = (event) => {
      keys.current[event.code] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return keys
}

function FollowCamera({ target }) {
  const { camera } = useThree()
  const desired = useMemo(() => new THREE.Vector3(), [])
  const lookAt = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    desired.set(target.current.x + 7.5, target.current.y + 9, target.current.z + 9.5)
    camera.position.lerp(desired, 0.065)
    lookAt.set(target.current.x, 0.8, target.current.z)
    camera.lookAt(lookAt)
  })

  return null
}

function Rover({ activeStation, setActiveStation, tourMode, onTourDone }) {
  const group = useRef()
  const marker = useRef()
  const keys = useKeyboard()
  const position = useRef(new THREE.Vector3(0, 0, 0))
  const velocity = useRef(new THREE.Vector3())
  const angle = useRef(0)
  const tourIndex = useRef(0)
  const targetRef = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((_, delta) => {
    const dir = new THREE.Vector3()
    const pressed = keys.current

    if (tourMode) {
      const target = tourPath[tourIndex.current]
      dir.subVectors(target, position.current)
      dir.y = 0
      if (dir.length() < 0.35) {
        tourIndex.current += 1
        if (tourIndex.current >= tourPath.length) {
          tourIndex.current = 0
          onTourDone()
        }
      } else {
        dir.normalize()
      }
    } else {
      tourIndex.current = 0
      if (pressed.KeyW || pressed.ArrowUp) dir.z -= 1
      if (pressed.KeyS || pressed.ArrowDown) dir.z += 1
      if (pressed.KeyA || pressed.ArrowLeft) dir.x -= 1
      if (pressed.KeyD || pressed.ArrowRight) dir.x += 1
      if (dir.length() > 0) dir.normalize()
    }

    const targetSpeed = tourMode ? 4 : 5.5
    const desiredVelocity = dir.multiplyScalar(targetSpeed)
    velocity.current.lerp(desiredVelocity, 0.12)
    position.current.addScaledVector(velocity.current, delta)
    position.current.x = THREE.MathUtils.clamp(position.current.x, -13, 13)
    position.current.z = THREE.MathUtils.clamp(position.current.z, -11, 10)

    if (velocity.current.length() > 0.05) {
      angle.current = Math.atan2(velocity.current.x, velocity.current.z)
    }

    group.current.position.copy(position.current)
    group.current.rotation.y = angle.current
    marker.current.rotation.y += delta * (tourMode ? 2.4 : 1.2)

    let nearest = null
    let nearestDistance = Infinity
    for (const station of stations) {
      targetRef.current.set(station.position[0], 0, station.position[2])
      const distance = targetRef.current.distanceTo(position.current)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearest = station
      }
    }
    const nextActive = nearestDistance < 3.4 ? nearest.id : 'overview'
    if (nextActive !== activeStation) setActiveStation(nextActive)
  })

  return (
    <>
      <FollowCamera target={position} />
      <group ref={group} position={[0, 0, 0]}>
        <group position={[0, 0.36, 0]}>
          <RoundedBox args={[1.4, 0.48, 2.05]} radius={0.12} smoothness={6}>
            <meshStandardMaterial color="#e7eef7" roughness={0.44} metalness={0.18} />
          </RoundedBox>
          <RoundedBox args={[0.88, 0.42, 0.92]} position={[0, 0.35, -0.15]} radius={0.14} smoothness={6}>
            <meshStandardMaterial color="#56667d" roughness={0.32} metalness={0.28} />
          </RoundedBox>
          <mesh position={[0, 0.68, -0.6]} ref={marker}>
            <torusGeometry args={[0.48, 0.025, 8, 48]} />
            <meshStandardMaterial color="#80ffd8" emissive="#2adbb4" emissiveIntensity={1.3} />
          </mesh>
        </group>
        {[-0.72, 0.72].map((x) =>
          [-0.72, 0.72].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.25, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 0.22, 24]} />
              <meshStandardMaterial color="#111827" roughness={0.65} />
            </mesh>
          ))
        )}
        <pointLight color="#8ef7ff" intensity={1.6} distance={5} position={[0, 1.6, 0]} />
      </group>
    </>
  )
}

function Station({ station, active }) {
  const pulse = useRef()

  useFrame(({ clock }) => {
    if (pulse.current) {
      const scale = active ? 1 + Math.sin(clock.elapsedTime * 4) * 0.04 : 1
      pulse.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group position={station.position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} ref={pulse}>
        <circleGeometry args={[2.25, 72]} />
        <meshStandardMaterial
          color={station.color}
          emissive={station.color}
          emissiveIntensity={active ? 0.34 : 0.08}
          transparent
          opacity={active ? 0.42 : 0.22}
        />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.45, 2.55, 96]} />
        <meshBasicMaterial color={station.accent} transparent opacity={active ? 0.95 : 0.34} />
      </mesh>
      <group position={[0, 1.6, 0.2]} rotation={[0, -0.4, 0]}>
        <RoundedBox args={[3.8, 2.35, 0.2]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color="#111827" roughness={0.5} metalness={0.15} />
        </RoundedBox>
        <Text
          position={[0, 0.42, 0.13]}
          fontSize={0.28}
          maxWidth={3.1}
          textAlign="center"
          anchorX="center"
          color="#f8fafc"
        >
          {station.title}
        </Text>
        <Text
          position={[0, -0.08, 0.13]}
          fontSize={0.15}
          maxWidth={3.15}
          lineHeight={1.25}
          textAlign="center"
          anchorX="center"
          color={station.accent}
        >
          {station.short}
        </Text>
        <Text position={[0, -0.68, 0.13]} fontSize={0.12} maxWidth={3.1} textAlign="center" color="#cbd5e1">
          {station.tags.join(' / ')}
        </Text>
      </group>
      <Float speed={active ? 2.1 : 1.1} floatIntensity={active ? 0.32 : 0.12}>
        <mesh position={[0, 3.1, 0]}>
          <octahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial color={station.color} emissive={station.color} emissiveIntensity={active ? 1.4 : 0.4} />
        </mesh>
      </Float>
    </group>
  )
}

function ResearchWorld({ activeStation, setActiveStation, tourMode, onTourDone }) {
  return (
    <>
      <color attach="background" args={['#0a0f1b']} />
      <fog attach="fog" args={['#0a0f1b', 16, 35]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[8, 12, 8]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-9, 3, -6]} color="#87ff9f" intensity={3} distance={11} />
      <pointLight position={[9, 3, -4]} color="#ffb46b" intensity={2.5} distance={11} />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[32, 26, 1, 1]} />
        <meshStandardMaterial color="#1b2638" roughness={0.86} metalness={0.05} />
      </mesh>
      <gridHelper args={[30, 30, '#38485f', '#263244']} position={[0, 0.012, 0]} />
      <CentralHub />
      <PathLines />
      {stations.map((station) => (
        <Station key={station.id} station={station} active={activeStation === station.id} />
      ))}
      <Rover
        activeStation={activeStation}
        setActiveStation={setActiveStation}
        tourMode={tourMode}
        onTourDone={onTourDone}
      />
      <ContactShadows position={[0, 0.02, 0]} opacity={0.45} scale={28} blur={2.8} far={9} />
    </>
  )
}

function GrassDetailStage({ visible }) {
  const group = useRef()
  const blades = useMemo(() => {
    return Array.from({ length: 96 }, (_, index) => {
      const ring = Math.sqrt(index / 96) * 2.1
      const angle = index * 2.399963
      return {
        x: Math.cos(angle) * ring,
        z: Math.sin(angle) * ring,
        height: 0.34 + ((index * 17) % 31) / 100,
        phase: index * 0.37,
        color: index % 3 === 0 ? '#b7ef7a' : index % 3 === 1 ? '#7cc75a' : '#d5f6a2'
      }
    })
  }, [])

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.visible = visible
    group.current.children.forEach((child, index) => {
      if (child.userData.blade) {
        child.rotation.z = Math.sin(clock.elapsedTime * 1.4 + child.userData.phase) * 0.16
        child.position.y = child.userData.height * 0.5 + Math.sin(clock.elapsedTime * 0.8 + index) * 0.015
      }
    })
  })

  return (
    <group ref={group} position={[-9, 0.08, 1.2]} visible={visible}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.45, 72]} />
        <meshStandardMaterial color="#26321f" roughness={0.86} metalness={0.04} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[2.5, 2.62, 96]} />
        <meshBasicMaterial color="#d8f3a2" transparent opacity={0.72} />
      </mesh>
      {blades.map((blade, index) => (
        <mesh
          key={index}
          userData={{ blade: true, phase: blade.phase, height: blade.height }}
          position={[blade.x, blade.height * 0.5, blade.z]}
          rotation={[0, blade.phase, 0]}
        >
          <boxGeometry args={[0.035, blade.height, 0.055]} />
          <meshStandardMaterial color={blade.color} roughness={0.76} />
        </mesh>
      ))}
      <Text position={[0, 2.25, -2.2]} fontSize={0.24} maxWidth={4.2} anchorX="center" color="#f7fee7">
        节点详情：草地参数小实验区
      </Text>
      {[
        ['Density', '-1.7', '#b7ef7a'],
        ['Wind', '0', '#80ffd8'],
        ['Height', '1.7', '#fef08a']
      ].map(([label, x, color]) => (
        <group key={label} position={[Number(x), 1.15, 2.15]}>
          <RoundedBox args={[1.2, 0.46, 0.12]} radius={0.05} smoothness={4}>
            <meshStandardMaterial color="#111827" roughness={0.48} />
          </RoundedBox>
          <Text position={[0, 0, 0.08]} fontSize={0.13} anchorX="center" color={color}>
            {label}
          </Text>
        </group>
      ))}
    </group>
  )
}

function CentralHub() {
  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.8, 72]} />
        <meshStandardMaterial color="#24314a" emissive="#182238" emissiveIntensity={0.25} />
      </mesh>
      <Text position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.38} color="#dbeafe" anchorX="center">
        3D Research Hub
      </Text>
    </group>
  )
}

function PathLines() {
  const curves = useMemo(() => {
    return stations.map((station) => {
      const end = new THREE.Vector3(station.position[0], 0.04, station.position[2])
      return new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.04, 0), end.multiplyScalar(0.54), end])
    })
  }, [])

  return curves.map((curve, index) => (
    <line key={stations[index].id}>
      <bufferGeometry setFromPoints={curve.getPoints(42)} />
      <lineBasicMaterial color={stations[index].accent} transparent opacity={0.42} />
    </line>
  ))
}

function Interface({
  activeStation,
  tourMode,
  setTourMode,
  resetSignal,
  setResetSignal,
  detailStationId,
  setDetailStationId
}) {
  const station = stations.find((item) => item.id === activeStation)
  const detailStation = stations.find((item) => item.id === detailStationId)
  const detail = detailStation?.detail

  return (
    <div className="interface">
      <header className="topbar">
        <div>
          <p className="eyebrow">Research Prototype 03</p>
          <h1>游戏化 3D 作品集展厅</h1>
        </div>
        <div className="actions">
          <button className={tourMode ? 'active' : ''} onClick={() => setTourMode((value) => !value)}>
            {tourMode ? '停止导览' : '自动导览'}
          </button>
          <button onClick={() => setResetSignal(resetSignal + 1)}>重置观察</button>
        </div>
      </header>

      <aside className="panel">
        {detail ? (
          <>
            <p className="panel-kicker">节点详情层</p>
            <h2>{detail.title}</h2>
            <p>{detail.intro}</p>
            <div className="metric-grid">
              {detail.metrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
            <ul className="detail-list">
              {detail.layers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="resource-list">
              {detail.links.map((link) => (
                <code key={link}>{link}</code>
              ))}
            </div>
            <button className="panel-button" onClick={() => setDetailStationId(null)}>
              返回主展厅
            </button>
          </>
        ) : (
          <>
            <p className="panel-kicker">{station ? '当前展区' : '空间总览'}</p>
            <h2>{station ? station.title : '用空间组织能力，而不是只放模型'}</h2>
            <p>
              {station
                ? station.body
                : '驾驶小车靠近不同展区，观察 3D 展板、区域触发、相机跟随和自动导览如何组成一个可探索作品集。'}
            </p>
            <div className="tags">
              {(station ? station.tags : ['WASD', 'Camera Follow', 'Interaction Area']).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            {station?.detail && (
              <button
                className="panel-button"
                onClick={() => {
                  setTourMode(false)
                  setDetailStationId(station.id)
                }}
              >
                进入节点详情
              </button>
            )}
          </>
        )}
      </aside>

      <div className="controls">
        <span>WASD / 方向键移动</span>
        <span>{detail ? '详情层可承载子内容、资源和演示' : '靠近圆形展区触发说明'}</span>
        <span>自动导览会按研究路径巡游</span>
      </div>
    </div>
  )
}

function ResetBridge({ signal }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(8, 10, 11)
    camera.lookAt(0, 0, 0)
  }, [camera, signal])
  return null
}

function App() {
  const [activeStation, setActiveStation] = useState('overview')
  const [tourMode, setTourMode] = useState(false)
  const [resetSignal, setResetSignal] = useState(0)
  const [detailStationId, setDetailStationId] = useState(null)

  return (
    <main>
      <Canvas shadows camera={{ position: [8, 10, 11], fov: 45, near: 0.1, far: 80 }}>
        <Suspense fallback={<Html center>Loading 3D research hub...</Html>}>
          <ResetBridge signal={resetSignal} />
          <ResearchWorld
            activeStation={activeStation}
            setActiveStation={setActiveStation}
            tourMode={tourMode}
            onTourDone={() => setTourMode(false)}
          />
          <GrassDetailStage visible={detailStationId === 'grass'} />
        </Suspense>
      </Canvas>
      <Interface
        activeStation={activeStation}
        tourMode={tourMode}
        setTourMode={setTourMode}
        resetSignal={resetSignal}
        setResetSignal={setResetSignal}
        detailStationId={detailStationId}
        setDetailStationId={setDetailStationId}
      />
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
