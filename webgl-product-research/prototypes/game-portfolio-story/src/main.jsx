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
    exhibit: '自然场景生成',
    outcome: '把 GPU 草地系统包装成可发布的产品短片和技术说明。',
    useCase: '适合园林、游戏地形、数字孪生、自然产品展示。',
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
    exhibit: '沉浸式官网',
    outcome: '把滚动条变成 3D 时间轴，让文字、模型和镜头同步推进。',
    useCase: '适合品牌官网、个人作品页、产品发布页、故事型落地页。',
    position: [0, 0, -8],
    color: '#4d8df7',
    accent: '#b9d1ff',
    body: '把网页滚动进度变成 3D 状态控制器：章节、镜头、模型变化、文字说明同时推进。',
    tags: ['Scroll', 'R3F', 'Website'],
    detail: {
      title: '滚动 3D 官网详情层',
      subtitle: '把传统页面滚动变成镜头、模型和章节的统一时间轴。',
      intro:
        '这一层说明 r3f-scroll-rig 类项目给我们的启发：DOM 仍然负责文本和排版，WebGL 负责空间、材质和镜头，滚动进度成为两者同步的控制器。',
      metrics: [
        { label: '页面层', value: 'DOM Sections' },
        { label: '空间层', value: 'R3F Scene' },
        { label: '同步轴', value: 'Scroll Progress' }
      ],
      layers: [
        '页面内容不是消失，而是变成 3D 镜头推进的章节脚本',
        '模型位置、透明度、旋转、材质变化都可以被滚动进度驱动',
        '适合官网、个人作品集、产品故事页和技术解释型页面',
        '关键风险是节奏过载：文字、镜头和模型变化必须有主次'
      ],
      links: [
        'webgl-product-research/prototypes/r3f-scroll-rig-study/',
        'IMMERSIVE_WEBSITE_CAPABILITY_NOTES.md',
        'README.md#research-map'
      ]
    }
  },
  {
    id: 'spatial',
    title: '游戏化空间作品集',
    short: '小车、展区、展板、交互区域',
    exhibit: '空间作品集',
    outcome: '把项目列表变成可探索空间，用移动和触发替代普通导航。',
    useCase: '适合个人作品集、线上展览、能力地图、教育导览。',
    position: [9, 0, -2],
    color: '#f2a65a',
    accent: '#ffd7aa',
    body: '把作品集从卡片列表改造成可以进入的空间。用户不是翻页面，而是在展厅里移动、靠近、触发。',
    tags: ['World', 'Vehicle', 'Area'],
    detail: {
      title: '空间作品集详情层',
      subtitle: '把项目列表改造成可以探索的空间地图。',
      intro:
        '这一层对应 Bruno Simon Folio 这类作品的核心价值：作品不再只是内容块，而是空间里的可达地点。移动、碰撞、触发、镜头跟随共同形成记忆点。',
      metrics: [
        { label: '组织方式', value: 'World Map' },
        { label: '输入方式', value: 'WASD / Touch' },
        { label: '触发方式', value: 'Area Trigger' }
      ],
      layers: [
        '用路线和空间距离表达信息层级，而不是只靠导航菜单',
        '用可控制角色或载具增强参与感，但不能盖过内容本身',
        '每个节点可以继续展开为项目页、视频、代码、说明或购买入口',
        '适合个人作品集、品牌活动页、展览导览和产品能力地图'
      ],
      links: [
        'webgl-product-research/projects/folio-2019/',
        'game-like-portfolio-capability-checklist.md',
        'src/main.jsx'
      ]
    }
  },
  {
    id: 'product',
    title: '产品展示视频化',
    short: '导演节奏、字幕、旁白、封面',
    exhibit: '演示视频工厂',
    outcome: '把 WebGL 页面转成带字幕、旁白、封面和发布说明的视频资产。',
    useCase: '适合抖音、B 站、官网案例、产品演示、技术传播。',
    position: [3, 0, 7],
    color: '#d65a7a',
    accent: '#ffc0cf',
    body: '把互动页面进一步变成可录制的产品影片：自动导览、重点镜头、字幕旁白和发布素材。',
    tags: ['Camera', 'Voice', 'Publish'],
    detail: {
      title: '产品视频化详情层',
      subtitle: '把可交互场景转成可发布、可讲解、可复用的视频资产。',
      intro:
        '这一层沉淀 GrassSystemThreeJS 视频化过程：不是把页面快速录下来，而是用导演节奏安排远景、近景、转场、字幕、旁白、音乐和封面。',
      metrics: [
        { label: '镜头', value: 'Wide / Close' },
        { label: '音频', value: 'Voice + Music' },
        { label: '发布', value: 'MP4 + Cover' }
      ],
      layers: [
        '先确定故事：从无到有、参数变化、能力展示、最终成片',
        '镜头运动要服务理解，避免全程前推或无意义旋转',
        '字幕和旁白解释技术价值，背景音乐只托氛围不抢内容',
        '最终产物包括 WebM、MP4、封面、字幕、发布说明和源码入口'
      ],
      links: [
        'GrassSystemThreeJS-demo/outputs/',
        'system-film-share-package.md',
        'webgl-product-film/SKILL.md'
      ]
    }
  },
  {
    id: 'skill',
    title: '可复用 Skill',
    short: '分析、原型、沉淀、复用',
    exhibit: '方法论资产',
    outcome: '把一次研究沉淀为下次能直接调用的工作流。',
    useCase: '适合持续研究开源项目、生成产品原型、复用视频化流程。',
    position: [-7, 0, 6],
    color: '#8b72e6',
    accent: '#d4c8ff',
    body: '每个研究样本都必须形成证据链：源码证据、运行证据、边界结论、可复用流程。',
    tags: ['Workflow', 'Evidence', 'Reuse'],
    detail: {
      title: '可复用 Skill 详情层',
      subtitle: '把一次探索沉淀为下次能直接调用的工作流。',
      intro:
        '这一层强调我们做技术研究的最终目的：不是收藏项目，而是把“如何分析、如何原型、如何视频化、如何文档化”变成可复用能力。',
      metrics: [
        { label: '输入', value: 'Repo / Idea' },
        { label: '过程', value: 'Evidence Chain' },
        { label: '输出', value: 'Demo + Docs' }
      ],
      layers: [
        '先看源码和运行证据，再下结论，避免纯理论更新 skill',
        '每个样本都要区分底层能力、展示手法和可迁移场景',
        '原型必须隔离目录，避免研究样本互相污染',
        '后续可以服务官网、产品视频、交互作品集和生活场景演示'
      ],
      links: [
        'C:/Users/yun68/.codex/skills/webgl-product-film/SKILL.md',
        'webgl-product-research/README.md',
        'docs/research-roadmap.md'
      ]
    }
  }
]

const overviewTags = ['Research Map', '3D Navigation', 'Reusable Skill']
const brandStats = [
  ['03', 'Research Samples'],
  ['05', 'Capability Nodes'],
  ['01', 'Reusable Workflow']
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

function FollowCamera({ target, tourMode }) {
  const { camera } = useThree()
  const desired = useMemo(() => new THREE.Vector3(), [])
  const lookAt = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const distance = tourMode ? 10.6 : 8.8
    const height = tourMode ? 10.4 : 9
    desired.set(target.current.x + distance * 0.72, target.current.y + height, target.current.z + distance)
    camera.position.lerp(desired, tourMode ? 0.045 : 0.065)
    lookAt.set(target.current.x, tourMode ? 1.1 : 0.8, target.current.z)
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
  const tourHold = useRef(0)
  const targetRef = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((_, delta) => {
    const dir = new THREE.Vector3()
    const pressed = keys.current

    if (tourMode) {
      const target = tourPath[tourIndex.current]
      if (tourHold.current > 0) {
        tourHold.current -= delta
      } else {
        dir.subVectors(target, position.current)
        dir.y = 0
        if (dir.length() < 0.35) {
          tourIndex.current += 1
          tourHold.current = tourIndex.current === tourPath.length ? 0.4 : 1.15
          if (tourIndex.current >= tourPath.length) {
            tourIndex.current = 0
            onTourDone()
          }
        } else {
          dir.normalize()
        }
      }
    } else {
      tourIndex.current = 0
      tourHold.current = 0
      if (pressed.KeyW || pressed.ArrowUp) dir.z -= 1
      if (pressed.KeyS || pressed.ArrowDown) dir.z += 1
      if (pressed.KeyA || pressed.ArrowLeft) dir.x -= 1
      if (pressed.KeyD || pressed.ArrowRight) dir.x += 1
      if (dir.length() > 0) dir.normalize()
    }

    const targetSpeed = tourMode ? 3.25 : 5.5
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
      <FollowCamera target={position} tourMode={tourMode} />
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

function StationInstallation({ station, active }) {
  if (station.id === 'grass') {
    return (
      <group position={[0, 0.08, -1.25]}>
        {Array.from({ length: 18 }, (_, index) => {
          const x = (index % 6) * 0.22 - 0.55
          const z = Math.floor(index / 6) * 0.22 - 0.22
          const height = 0.28 + (index % 4) * 0.08
          return (
            <mesh key={index} position={[x, height * 0.5, z]} rotation={[0, index * 0.41, active ? 0.12 : 0.03]}>
              <boxGeometry args={[0.035, height, 0.05]} />
              <meshStandardMaterial color={index % 2 ? '#b7ef7a' : '#7cc75a'} roughness={0.8} />
            </mesh>
          )
        })}
      </group>
    )
  }

  if (station.id === 'scroll') {
    return (
      <group position={[0, 0.48, -1.22]}>
        {[0, 1, 2].map((index) => (
          <RoundedBox key={index} args={[0.76, 0.48, 0.08]} position={[index * 0.46 - 0.46, index * 0.22, 0]} radius={0.04}>
            <meshStandardMaterial color={index === 1 ? '#4d8df7' : '#17233a'} emissive="#244b8f" emissiveIntensity={active ? 0.3 : 0.12} />
          </RoundedBox>
        ))}
        <mesh position={[0.6, 0.48, 0.05]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.12, 0.45, 3]} />
          <meshStandardMaterial color="#b9d1ff" emissive="#4d8df7" emissiveIntensity={active ? 0.7 : 0.25} />
        </mesh>
      </group>
    )
  }

  if (station.id === 'spatial') {
    return (
      <group position={[0, 0.12, -1.18]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.62, 0.72, 48]} />
          <meshBasicMaterial color="#ffd7aa" transparent opacity={active ? 0.9 : 0.45} />
        </mesh>
        <RoundedBox args={[0.55, 0.24, 0.78]} position={[0, 0.22, 0]} radius={0.06}>
          <meshStandardMaterial color="#f2a65a" roughness={0.5} />
        </RoundedBox>
      </group>
    )
  }

  if (station.id === 'product') {
    return (
      <group position={[0, 0.55, -1.2]}>
        {[-0.42, 0, 0.42].map((x, index) => (
          <RoundedBox key={x} args={[0.32, 0.58, 0.08]} position={[x, index * 0.08, 0]} radius={0.04}>
            <meshStandardMaterial color={index === 1 ? '#d65a7a' : '#2a1520'} emissive="#d65a7a" emissiveIntensity={active ? 0.42 : 0.16} />
          </RoundedBox>
        ))}
        <Text position={[0, -0.52, 0.08]} fontSize={0.13} anchorX="center" color="#ffc0cf">
          FILM
        </Text>
      </group>
    )
  }

  return (
    <group position={[0, 0.56, -1.18]}>
      {[0, 1, 2].map((index) => (
        <mesh key={index} position={[index * 0.36 - 0.36, index * 0.18, 0]} rotation={[0.3, 0.3, 0.4]}>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color={index === 1 ? '#8b72e6' : '#221b3f'} emissive="#8b72e6" emissiveIntensity={active ? 0.45 : 0.15} />
        </mesh>
      ))}
      <Text position={[0, -0.5, 0.08]} fontSize={0.12} anchorX="center" color="#d4c8ff">
        SKILL
      </Text>
    </group>
  )
}

function StationCover({ station, active }) {
  return (
    <group position={[0, 0.92, 1.65]} rotation={[-0.08, 0, 0]}>
      <RoundedBox args={[2.55, 1.1, 0.16]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color={active ? station.color : '#101827'}
          emissive={station.color}
          emissiveIntensity={active ? 0.34 : 0.1}
          roughness={0.5}
          metalness={0.08}
        />
      </RoundedBox>
      <Text position={[0, 0.22, 0.11]} fontSize={0.18} maxWidth={2.25} anchorX="center" textAlign="center" color="#ffffff">
        {station.exhibit}
      </Text>
      <Text position={[0, -0.16, 0.11]} fontSize={0.1} maxWidth={2.15} anchorX="center" textAlign="center" lineHeight={1.25} color="#e2e8f0">
        {station.tags.join(' / ')}
      </Text>
    </group>
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
        <Text position={[0, -0.18, 0.13]} fontSize={0.15} maxWidth={3.15} textAlign="center" anchorX="center" color={station.accent}>
          {station.exhibit}
        </Text>
      </group>
      <StationInstallation station={station} active={active} />
      <StationCover station={station} active={active} />
      <Float speed={active ? 2.1 : 1.1} floatIntensity={active ? 0.32 : 0.12}>
        <mesh position={[0, 3.1, 0]}>
          <octahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial color={station.color} emissive={station.color} emissiveIntensity={active ? 1.4 : 0.4} />
        </mesh>
      </Float>
    </group>
  )
}

function Atmosphere() {
  const points = useMemo(() => {
    const values = []
    for (let index = 0; index < 140; index += 1) {
      const radius = 10 + Math.random() * 16
      const angle = Math.random() * Math.PI * 2
      values.push(Math.cos(angle) * radius, 3 + Math.random() * 7, Math.sin(angle) * radius)
    }
    return new Float32Array(values)
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#9fb7d9" size={0.055} transparent opacity={0.52} sizeAttenuation />
    </points>
  )
}

function ExhibitFloor() {
  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[34, 28, 1, 1]} />
        <meshStandardMaterial color="#111a2a" roughness={0.9} metalness={0.04} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <circleGeometry args={[13.6, 128]} />
        <meshStandardMaterial color="#172235" roughness={0.86} metalness={0.07} transparent opacity={0.84} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026, 0]}>
        <ringGeometry args={[3.2, 13.2, 160]} />
        <meshBasicMaterial color="#31435f" transparent opacity={0.36} />
      </mesh>
      <gridHelper args={[30, 30, '#41536e', '#263244']} position={[0, 0.035, 0]} />
      {stations.map((station) => (
        <mesh key={station.id} rotation={[-Math.PI / 2, 0, 0]} position={[station.position[0], 0.032, station.position[2]]}>
          <ringGeometry args={[2.9, 3.05, 96]} />
          <meshBasicMaterial color={station.accent} transparent opacity={0.26} />
        </mesh>
      ))}
    </>
  )
}

function ResearchWorld({ activeStation, visualStationId, setActiveStation, tourMode, onTourDone }) {
  return (
    <>
      <color attach="background" args={['#070b13']} />
      <fog attach="fog" args={['#070b13', 17, 42]} />
      <ambientLight intensity={0.62} />
      <hemisphereLight color="#c7ddff" groundColor="#111827" intensity={0.52} />
      <directionalLight position={[8, 12, 8]} intensity={2.35} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-9, 3, -6]} color="#87ff9f" intensity={3} distance={11} />
      <pointLight position={[9, 3, -4]} color="#ffb46b" intensity={2.5} distance={11} />
      <Atmosphere />
      <ExhibitFloor />
      <CentralHub />
      <PathLines />
      {stations.map((station) => (
        <Station key={station.id} station={station} active={(visualStationId || activeStation) === station.id} />
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

function DetailFocusStage({ stationId }) {
  const station = stations.find((item) => item.id === stationId)
  const group = useRef()

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.45) * 0.06
    }
  })

  if (!station) return null

  return (
    <group ref={group} position={[station.position[0], 0.1, station.position[2] + 3.35]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.35, 1.48, 72]} />
        <meshBasicMaterial color={station.accent} transparent opacity={0.72} />
      </mesh>
      <RoundedBox args={[3.1, 0.62, 0.14]} position={[0, 1.08, 0]} radius={0.07} smoothness={4}>
        <meshStandardMaterial color="#0f172a" emissive={station.color} emissiveIntensity={0.2} roughness={0.48} />
      </RoundedBox>
      <Text position={[0, 1.12, 0.1]} fontSize={0.16} maxWidth={2.75} anchorX="center" textAlign="center" color="#f8fafc">
        {station.exhibit}
      </Text>
      {[
        ['Outcome', -1.05],
        ['Use Case', 0],
        ['Resources', 1.05]
      ].map(([label, x]) => (
        <group key={label} position={[x, 0.38, 0]}>
          <mesh>
            <boxGeometry args={[0.72, 0.18, 0.72]} />
            <meshStandardMaterial color={station.color} emissive={station.color} emissiveIntensity={0.18} roughness={0.58} />
          </mesh>
          <Text position={[0, 0.22, 0]} fontSize={0.095} anchorX="center" color="#ffffff">
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
        <meshStandardMaterial color="#24314a" emissive="#182238" emissiveIntensity={0.38} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.95, 3.08, 96]} />
        <meshBasicMaterial color="#80ffd8" transparent opacity={0.55} />
      </mesh>
      <Text position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.38} color="#dbeafe" anchorX="center">
        3D Research Hub
      </Text>
      <Text position={[0, 0.1, 0.8]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.16} color="#93c5fd" anchorX="center">
        {'repo -> prototype -> film -> skill'}
      </Text>
      <group position={[0, 1.65, 0]}>
        <RoundedBox args={[3.25, 0.72, 0.18]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color="#0f172a" emissive="#14b8a6" emissiveIntensity={0.22} roughness={0.42} />
        </RoundedBox>
        <Text position={[0, 0.08, 0.12]} fontSize={0.18} color="#f8fafc" anchorX="center">
          3D Capability Atlas
        </Text>
        <Text position={[0, -0.18, 0.12]} fontSize={0.085} color="#80ffd8" anchorX="center">
          Interactive WebGL research portfolio
        </Text>
      </group>
      {[0, 1, 2].map((index) => {
        const angle = (index / 3) * Math.PI * 2 + 0.35
        return (
          <group key={index} position={[Math.cos(angle) * 1.95, 0.48, Math.sin(angle) * 1.95]}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.12, 0.9, 6]} />
              <meshStandardMaterial color="#1e293b" emissive="#38bdf8" emissiveIntensity={0.18} roughness={0.48} />
            </mesh>
            <mesh position={[0, 0.52, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#80ffd8" emissive="#14b8a6" emissiveIntensity={1.1} />
            </mesh>
          </group>
        )
      })}
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
  const [expandedDetail, setExpandedDetail] = useState(false)
  const station = stations.find((item) => item.id === activeStation)
  const detailStation = stations.find((item) => item.id === detailStationId)
  const detail = detailStation?.detail
  const focusedStationId = detailStationId || activeStation

  useEffect(() => {
    setExpandedDetail(false)
  }, [detailStationId])

  return (
    <div className="interface">
      <header className="topbar">
        <div>
          <p className="eyebrow">V1.3 Experience Polish</p>
          <h1>3D 能力研究作品集</h1>
        </div>
        <div className="actions">
          <button className={tourMode ? 'active' : ''} onClick={() => setTourMode((value) => !value)}>
            {tourMode ? '停止导览' : '自动导览'}
          </button>
          <button onClick={() => setResetSignal(resetSignal + 1)}>重置观察</button>
        </div>
      </header>

      <section className="brand-panel">
        <p className="eyebrow">3D Capability Atlas</p>
        <h2>{'源码研究 -> 原型验证 -> 视频化表达 -> Skill 沉淀'}</h2>
        <div>{brandStats.map(([value, label]) => <span key={label}><strong>{value}</strong>{label}</span>)}</div>
      </section>

      <aside className="panel">
        {detail ? (
          <>
            <p className="panel-kicker">节点详情层</p>
            <h2>{detail.title}</h2>
            <p className="panel-subtitle">{detail.subtitle}</p>
            <div className="outcome-box primary">
              <strong>{detailStation.exhibit}</strong>
              <span>{detailStation.outcome}</span>
            </div>
            <div className="metric-grid">
              {detail.metrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
            <p className="use-case">应用场景：{detailStation.useCase}</p>
            {expandedDetail && (
              <>
                <p>{detail.intro}</p>
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
              </>
            )}
            <button className="secondary-button" onClick={() => setExpandedDetail((value) => !value)}>
              {expandedDetail ? '收起详细说明' : '展开技术细节'}
            </button>
            <button className="panel-button" onClick={() => setDetailStationId(null)}>
              返回主展厅
            </button>
          </>
        ) : (
          <>
            <p className="panel-kicker">{station ? '当前展区' : '空间总览'}</p>
            <h2>{station ? station.title : '用空间组织能力，而不是只放模型'}</h2>
            {!station && <p className="panel-subtitle">一个 WebGL / Three.js 研究路线图：源码样本、原型验证、视频化表达、Skill 沉淀。</p>}
            <p>
              {station
                ? station.body
                : '驾驶小车靠近不同展区，观察 3D 展板、区域触发、相机跟随和自动导览如何组成一个可探索作品集。'}
            </p>
            {station && (
              <div className="outcome-box">
                <strong>{station.exhibit}</strong>
                <span>{station.outcome}</span>
              </div>
            )}
            <div className="tags">
              {(station ? station.tags : overviewTags).map((tag) => (
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

      <aside className="journey">
        <p className="panel-kicker">研究路径</p>
        {stations.map((item, index) => (
          <button
            key={item.id}
            className={focusedStationId === item.id ? 'journey-step active' : 'journey-step'}
            onClick={() => {
              setTourMode(false)
              setDetailStationId(item.detail ? item.id : null)
            }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{item.title}</strong>
          </button>
        ))}
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
  const viewedStationId = detailStationId || activeStation

  return (
    <main>
      <Canvas shadows camera={{ position: [8, 10, 11], fov: 45, near: 0.1, far: 80 }}>
        <Suspense fallback={<Html center>Loading 3D research hub...</Html>}>
          <ResetBridge signal={resetSignal} />
          <ResearchWorld
            activeStation={activeStation}
            visualStationId={viewedStationId}
            setActiveStation={setActiveStation}
            tourMode={tourMode}
            onTourDone={() => setTourMode(false)}
          />
          <DetailFocusStage stationId={detailStationId} />
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
