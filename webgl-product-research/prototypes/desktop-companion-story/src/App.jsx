import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Environment, Float, Html, PerspectiveCamera, useAnimations, useGLTF } from '@react-three/drei'
import { GlobalCanvas, ScrollScene, SmoothScrollbar, UseCanvas } from '@14islands/r3f-scroll-rig'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

const storyBeats = [
  {
    id: 'wake',
    eyebrow: '01 / Wake',
    title: '她不是一个聊天框',
    line: '桌面亮起，角色从工作区边缘醒来。',
    caption: '第一步，让 AI 成为桌面上的可见存在。',
    cue: 'presence boot',
    panelTitle: '早上好，我在。',
    screen: ['检测到桌面空闲', '同步今日任务', '等待你的第一句话'],
    chips: ['常驻桌面', '轻量提醒', '视线跟随'],
    tone: '#8bd6d1',
  },
  {
    id: 'listen',
    eyebrow: '02 / Listen',
    title: '她听懂当前状态',
    line: '用户说累了，系统把情绪和工作流放在同一个场景里。',
    caption: '她听见的不只是文字，还有你的状态。',
    cue: 'voice to context',
    panelTitle: '你看起来有点累。',
    screen: ['输入：今天有点累', '理解：连续工作 47 分钟', '回应：先休息 5 分钟'],
    chips: ['实时对话', '情绪识别', '低打扰'],
    tone: '#ffd29a',
  },
  {
    id: 'organize',
    eyebrow: '03 / Organize',
    title: '她把混乱变成任务',
    line: '聊天内容转成待办，窗口、提醒和优先级被整理出来。',
    caption: '对话被转成任务，桌面开始变得有秩序。',
    cue: 'context to tasks',
    panelTitle: '我帮你整理一下。',
    screen: ['归档：3 个未完成任务', '生成：休息提醒', '标记：晚间复盘'],
    chips: ['任务提取', '窗口整理', '行动建议'],
    tone: '#8fb7ff',
  },
  {
    id: 'remember',
    eyebrow: '04 / Remember',
    title: '她记住长期偏好',
    line: '偏好、习惯和目标不再只是文本，而是可回看的记忆轨道。',
    caption: '长期记忆让陪伴越来越像你的个人空间。',
    cue: 'memory orbit',
    panelTitle: '我记得你的习惯。',
    screen: ['偏好：晚上少打扰', '习惯：周日整理计划', '目标：减少久坐'],
    chips: ['长期记忆', '偏好沉淀', '上下文回看'],
    tone: '#95d17c',
  },
  {
    id: 'finish',
    eyebrow: '05 / Finish',
    title: '最后形成个人桌面空间',
    line: '角色、情绪、任务、记忆和桌面窗口收束成一个完整产品画面。',
    caption: '最后，它不只是工具，而是一个可持续陪伴的工作区。',
    cue: 'personal workspace',
    panelTitle: '今天我陪你慢慢来。',
    screen: ['当前模式：温和陪伴', '下一步：5 分钟休息', '状态：任务已整理'],
    chips: ['个性化', '陪伴感', '产品闭环'],
    tone: '#ff9fbd',
  },
]

const capabilityContent = {
  wake: {
    title: '桌面常驻',
    eyebrow: 'Presence',
    rows: ['检测桌面空闲', '同步今日任务', '等待第一句话'],
    result: '角色不是聊天窗口，而是工作区里的可见存在。',
  },
  listen: {
    title: '听懂状态',
    eyebrow: 'Voice + Context',
    rows: ['用户：今天有点累', '识别：连续工作 47 分钟', '建议：先休息 5 分钟'],
    result: '把语言、情绪和当前工作节奏放在同一个场景里。',
  },
  organize: {
    title: '自动整理',
    eyebrow: 'Task Flow',
    rows: ['提取 3 个未完成任务', '生成休息提醒', '标记晚间复盘'],
    result: '对话不是结束在聊天框里，而是变成可执行动作。',
  },
  remember: {
    title: '长期记忆',
    eyebrow: 'Memory',
    rows: ['偏好：晚上少打扰', '习惯：周日整理计划', '目标：减少久坐'],
    result: '系统逐渐沉淀你的个人节奏，而不是每次重新认识你。',
  },
  finish: {
    title: '产品闭环',
    eyebrow: 'Workspace',
    rows: ['当前模式：温和陪伴', '下一步：5 分钟休息', '状态：任务已整理'],
    result: '角色、任务、记忆、情绪状态收束成一个个人桌面空间。',
  },
}

const companionAnimationByBeat = {
  wake: 'Wave',
  listen: 'Yes',
  organize: 'ThumbsUp',
  remember: 'Sitting',
  finish: 'Wave',
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value || 0))
}

function ease(value) {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

function DeskCompanionBot({ tone, awake }) {
  const bot = useRef()
  const accent = useMemo(() => new THREE.Color(tone), [tone])

  useFrame((state) => {
    if (!bot.current) return
    const time = state.clock.elapsedTime
    bot.current.position.y = -54 + awake * 4 + Math.sin(time * 1.25) * 1.1
    bot.current.rotation.y = -0.08 + Math.sin(time * 0.55) * 0.06
  })

  return (
    <group ref={bot} position={[118, -54, 70]} rotation={[0, -0.08, 0]} scale={[0.72, 0.72, 0.72]}>
      <mesh receiveShadow position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.55, 0.82, 1]}>
        <circleGeometry args={[24, 48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>

      <mesh castShadow position={[0, 7, 0]}>
        <capsuleGeometry args={[12, 34, 10, 24]} />
        <meshStandardMaterial color="#f1e7dc" roughness={0.38} metalness={0.04} emissive={accent} emissiveIntensity={0.035 + awake * 0.045} />
      </mesh>

      <mesh castShadow position={[0, 39, 0]} scale={[1.22, 0.9, 0.72]}>
        <sphereGeometry args={[18, 36, 22]} />
        <meshPhysicalMaterial color="#f8efe6" roughness={0.28} metalness={0.02} clearcoat={0.45} emissive={accent} emissiveIntensity={0.045 + awake * 0.05} />
      </mesh>

      <mesh position={[0, 39, 13.5]} scale={[1.08, 0.6, 0.08]}>
        <sphereGeometry args={[14, 32, 16]} />
        <meshPhysicalMaterial color="#061115" roughness={0.12} metalness={0.04} clearcoat={0.82} emissive="#061115" emissiveIntensity={0.55} />
      </mesh>

      {[-5.6, 5.6].map((x) => (
        <mesh key={x} position={[x, 41.5, 24]}>
          <sphereGeometry args={[2.7, 16, 10]} />
          <meshBasicMaterial color="#73fff1" toneMapped={false} />
        </mesh>
      ))}

      <mesh position={[0, 35.8, 24.2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[4.6, 0.55, 8, 28, Math.PI]} />
        <meshBasicMaterial color="#73fff1" toneMapped={false} />
      </mesh>

      <mesh position={[0, 10, 12.6]} scale={[1, 1.45, 0.12]}>
        <sphereGeometry args={[5.6, 20, 12]} />
        <meshBasicMaterial color={tone} toneMapped={false} transparent opacity={0.85} />
      </mesh>

      {[-18.5, 18.5].map((x) => (
        <mesh key={x} castShadow position={[x, 39, 0]} rotation={[0, 0, Math.sign(x) * 0.08]}>
          <sphereGeometry args={[5.6, 18, 12]} />
          <meshStandardMaterial color="#e7ded5" roughness={0.34} metalness={0.08} emissive={accent} emissiveIntensity={0.035} />
        </mesh>
      ))}

      <mesh castShadow position={[-16, 12, 3]} rotation={[0, 0, -0.55]}>
        <capsuleGeometry args={[3.6, 30, 8, 14]} />
        <meshStandardMaterial color="#f1e7dc" roughness={0.42} metalness={0.04} />
      </mesh>
      <mesh castShadow position={[17, 12, 3]} rotation={[0, 0, 0.42]}>
        <capsuleGeometry args={[3.6, 25, 8, 14]} />
        <meshStandardMaterial color="#f1e7dc" roughness={0.42} metalness={0.04} />
      </mesh>

      <mesh position={[0, -3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[25 + awake * 3, 1.1, 10, 80]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.14 + awake * 0.14} transparent opacity={0.42} />
      </mesh>
    </group>
  )
}

function AnimatedCompanion({ beatId, tone, awake }) {
  const group = useRef()
  const gltf = useGLTF('/models/RobotExpressive.glb')
  const scene = useMemo(() => clone(gltf.scene), [gltf.scene])
  const { actions } = useAnimations(gltf.animations, group)
  const accent = useMemo(() => new THREE.Color(tone), [tone])
  const animationName = companionAnimationByBeat[beatId] || 'Idle'

  useEffect(() => {
    Object.values(actions).forEach((action) => {
      action?.fadeOut(0.25)
    })

    const next = actions[animationName] || actions.Idle
    next?.reset().fadeIn(0.35).play()

    return () => {
      next?.fadeOut(0.25)
    }
  }, [actions, animationName])

  useEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
      if (object.material) {
        object.material.roughness = Math.min(0.82, object.material.roughness ?? 0.55)
      }
    })
  }, [scene])

  useFrame((state) => {
    if (!group.current) return
    const time = state.clock.elapsedTime
    group.current.position.y = -103 + awake * 2.5 + Math.sin(time * 1.05) * 0.8
    group.current.rotation.y = -0.38 + Math.sin(time * 0.42) * 0.08
  })

  return (
    <group ref={group} position={[116, -103, 72]} rotation={[0, -0.38, 0]} scale={[23, 23, 23]}>
      <primitive object={scene} />
      <mesh receiveShadow position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 0.62, 1]}>
        <circleGeometry args={[1.05, 48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>
      <mesh position={[0, 1.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.92 + awake * 0.1, 0.025, 8, 72]} />
        <meshBasicMaterial color={accent} transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </group>
  )
}

function DeskSceneBase({ tone, awake, beatId }) {
  const accent = useMemo(() => new THREE.Color(tone), [tone])
  const keys = useMemo(() => {
    return Array.from({ length: 18 }, (_, index) => {
      const row = Math.floor(index / 6)
      const col = index % 6
      return [-118 + col * 12, -86, 36 + row * 8]
    })
  }, [])

  return (
    <group>
      <mesh receiveShadow position={[0, -110, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[340, 210, 8]} />
        <meshStandardMaterial color="#2a2523" roughness={0.82} metalness={0.03} />
      </mesh>
      <mesh receiveShadow position={[0, -101, -18]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[285, 165]} />
        <meshStandardMaterial color="#171c1e" roughness={0.6} metalness={0.08} />
      </mesh>
      <mesh receiveShadow position={[0, -99, -18]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[92, 106, 96]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.08 + awake * 0.08} transparent opacity={0.18} />
      </mesh>
      <mesh castShadow position={[-78, -94, 54]} rotation={[-Math.PI / 2, 0, 0.08]}>
        <boxGeometry args={[82, 24, 4]} />
        <meshStandardMaterial color="#d8d0c5" roughness={0.55} />
      </mesh>
      {keys.map(([x, y, z], index) => (
        <mesh key={index} castShadow position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0.08]}>
          <boxGeometry args={[8, 5, 1.4]} />
          <meshStandardMaterial color={index % 5 === 0 ? accent : '#ede2d5'} roughness={0.48} emissive={index % 5 === 0 ? accent : '#000000'} emissiveIntensity={index % 5 === 0 ? 0.1 : 0} />
        </mesh>
      ))}
      <mesh castShadow position={[96, -94, 58]} rotation={[-Math.PI / 2, 0, -0.1]}>
        <capsuleGeometry args={[9, 28, 8, 22]} />
        <meshStandardMaterial color="#1f272b" roughness={0.48} metalness={0.12} />
      </mesh>
      <AnimatedCompanion beatId={beatId} tone={tone} awake={awake} />
      <mesh castShadow position={[124, -90, -46]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <boxGeometry args={[42, 32, 3]} />
        <meshStandardMaterial color="#ffd29a" roughness={0.7} emissive="#5f3e17" emissiveIntensity={0.04} />
      </mesh>
      <mesh castShadow position={[-118, -88, -42]} rotation={[-Math.PI / 2, 0, -0.12]}>
        <cylinderGeometry args={[11, 11, 18, 32]} />
        <meshStandardMaterial color="#29343a" roughness={0.46} metalness={0.08} />
      </mesh>
      <mesh position={[-118, -76, -42]} rotation={[-Math.PI / 2, 0, -0.12]}>
        <torusGeometry args={[11, 1.2, 10, 36]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.08 + awake * 0.18} />
      </mesh>
      <mesh castShadow position={[-138, -67, -56]} rotation={[0, 0, 0.18]}>
        <cylinderGeometry args={[2.5, 3.5, 48, 16]} />
        <meshStandardMaterial color="#28353a" roughness={0.42} metalness={0.18} />
      </mesh>
      <mesh position={[-126, -42, -52]} rotation={[0.4, 0, -0.35]}>
        <coneGeometry args={[15, 22, 32]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.18 + awake * 0.16} transparent opacity={0.86} />
      </mesh>
      <mesh position={[0, -106, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[240, 132]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

function Monitor({ beat, progress }) {
  const accent = useMemo(() => new THREE.Color(beat.tone), [beat.tone])
  const active = ease(0.35 + progress * 0.65)

  return (
    <group position={[0, -34, -44]}>
      <mesh castShadow>
        <boxGeometry args={[132, 76, 6]} />
        <meshPhysicalMaterial color="#101518" roughness={0.36} metalness={0.22} clearcoat={0.45} />
      </mesh>
      <mesh position={[0, 0, 3.6]}>
        <boxGeometry args={[113, 58, 1]} />
        <meshStandardMaterial color="#101d21" emissive={accent} emissiveIntensity={0.08 + active * 0.18} />
      </mesh>
      <Html center transform distanceFactor={700} position={[0, 0, 5]} className="screen-ui">
        <div className="screen-head">
          <span>Desktop Companion</span>
          <b>{Math.round(active * 100)}%</b>
        </div>
        <strong>{beat.panelTitle}</strong>
        <div className="screen-lines">
          {beat.screen.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </Html>
      <mesh castShadow position={[0, -49, 0]}>
        <boxGeometry args={[13, 38, 8]} />
        <meshStandardMaterial color="#151b1e" roughness={0.56} metalness={0.16} />
      </mesh>
      <mesh castShadow position={[0, -73, 2]}>
        <boxGeometry args={[82, 9, 40]} />
        <meshStandardMaterial color="#151b1e" roughness={0.62} metalness={0.14} />
      </mesh>
    </group>
  )
}

function CapabilityPanels({ beat, progress }) {
  const content = capabilityContent[beat.id] || capabilityContent.wake
  const accent = useMemo(() => new THREE.Color(beat.tone), [beat.tone])
  const p = ease(0.18 + progress * 0.82)
  const positions = {
    wake: [106, 58, 10, -0.16],
    listen: [-112, 56, 20, 0.18],
    organize: [112, 50, 18, -0.16],
    remember: [-112, 64, 8, 0.18],
  }
  const [panelX, panelY, panelZ, rot] = positions[beat.id] || positions.wake

  if (beat.id === 'finish') return null

  return (
    <group position={[panelX * p, panelY, panelZ]} rotation={[0, rot * p, 0]} scale={[0.82 + p * 0.1, 0.82 + p * 0.1, 1]}>
      <mesh castShadow>
        <boxGeometry args={[78, 56, 2.2]} />
        <meshStandardMaterial color="#121b20" emissive={accent} emissiveIntensity={0.05 + p * 0.1} roughness={0.42} transparent opacity={0.86} />
      </mesh>
      <Html center transform distanceFactor={620} position={[0, 0, 1.8]} className="capability-ui">
        <div className="cap-card" style={{ '--tone': beat.tone }}>
          <span>{content.eyebrow}</span>
          <strong>{content.title}</strong>
          <div className="cap-rows">
            {content.rows.map((row, index) => (
              <p key={row}>
                <i>{String(index + 1).padStart(2, '0')}</i>
                {row}
              </p>
            ))}
          </div>
          <small>{content.result}</small>
        </div>
      </Html>
    </group>
  )
}

function StageActionEffect({ beat, progress }) {
  const root = useRef()
  const accent = useMemo(() => new THREE.Color(beat.tone), [beat.tone])
  const p = ease(progress)

  useFrame((state) => {
    if (!root.current) return
    const time = state.clock.elapsedTime
    root.current.children.forEach((child, index) => {
      if (child.userData.kind === 'voice') {
        child.scale.y = 0.55 + Math.abs(Math.sin(time * 2.4 + index * 0.7)) * 1.55
      }
      if (child.userData.kind === 'pulse') {
        child.rotation.z = time * 0.25 + index * 0.5
      }
    })
  })

  if (beat.id === 'wake') {
    return (
      <group ref={root} position={[104, -70, 54]} scale={p}>
        {[0, 1, 2].map((index) => (
          <mesh key={index} userData={{ kind: 'pulse' }} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[18 + index * 10, 0.7, 8, 72]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.18} transparent opacity={0.24 - index * 0.04} />
          </mesh>
        ))}
      </group>
    )
  }

  if (beat.id === 'listen') {
    return (
      <group ref={root} scale={[p, p, p]}>
        <group position={[-92, -24, 54]}>
          {Array.from({ length: 13 }, (_, index) => (
            <mesh key={index} userData={{ kind: 'voice' }} position={[-36 + index * 6, 0, 0]}>
              <boxGeometry args={[2.2, 15, 2.2]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.18} transparent opacity={0.68} />
            </mesh>
          ))}
        </group>
        <Html center transform distanceFactor={600} position={[82, -14, 48]} className="behavior-ui">
          <div className="behavior-panel listen-flow" style={{ '--tone': beat.tone }}>
            <b>实时理解</b>
            <p><i>输入</i><span>今天有点累</span></p>
            <p><i>识别</i><span>连续工作 47 分钟</span></p>
            <p><i>回应</i><span>先休息 5 分钟</span></p>
          </div>
        </Html>
      </group>
    )
  }

  if (beat.id === 'organize') {
    return (
      <group position={[-106 * p, 18, 24]} rotation={[0, 0.16 * p, 0]} scale={[p, p, p]}>
        <mesh castShadow>
          <boxGeometry args={[74, 48, 2]} />
          <meshStandardMaterial color="#121b20" emissive={accent} emissiveIntensity={0.1} roughness={0.44} transparent opacity={0.84} />
        </mesh>
        <Html center transform distanceFactor={600} position={[0, 0, 1.5]} className="task-board-ui">
          <div className="task-board" style={{ '--tone': beat.tone }}>
            <b>自动整理执行中</b>
            <span>✓ 提取未完成任务</span>
            <span>✓ 生成休息提醒</span>
            <span>✓ 安排晚间复盘</span>
          </div>
        </Html>
      </group>
    )
  }

  if (beat.id === 'finish') {
    return (
      <group ref={root} position={[0, -66, 42]} scale={[p, p, p]}>
        {[0, 1, 2, 3].map((index) => (
          <mesh key={index} userData={{ kind: 'pulse' }} rotation={[Math.PI / 2, 0, (index / 4) * Math.PI]}>
            <torusGeometry args={[30 + index * 13, 0.55, 8, 96]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.16} transparent opacity={0.18 - index * 0.02} />
          </mesh>
        ))}
      </group>
    )
  }

  return null
}

function ProductBehaviorLayer({ beat, progress }) {
  const p = ease(progress)

  if (beat.id === 'organize') {
    const cards = [
      ['任务', '整理未完成事项', 0.08],
      ['提醒', '5 分钟后休息', 0.22],
      ['复盘', '晚上回顾计划', 0.36],
    ]

    return (
      <Html center transform distanceFactor={560} position={[-96 * p, 28, 44]} className="workflow-ui">
        <div className="workflow-board" style={{ '--tone': beat.tone }}>
          <b>对话转成行动</b>
          <div className="source-message">“今天有点累，还有几个事没收尾。”</div>
          {cards.map(([kind, text, delay], index) => {
            const cardP = ease(progress - delay)
            return (
              <div
                className="workflow-card"
                key={kind}
                style={{
                  opacity: 0.35 + cardP * 0.65,
                  transform: `translateX(${(1 - cardP) * 2.4}rem) translateY(${(1 - cardP) * -0.4}rem)`,
                }}
              >
                <i>{kind}</i>
                <span>{text}</span>
                <small>{index === 0 ? '已归类' : index === 1 ? '已设置' : '已安排'}</small>
              </div>
            )
          })}
        </div>
      </Html>
    )
  }

  if (beat.id === 'remember') {
    return (
      <Html center transform distanceFactor={600} position={[82 * p, 6, 44]} className="memory-capture-ui">
        <div className="memory-capture" style={{ '--tone': beat.tone }}>
          <b>从对话沉淀为记忆</b>
          <p><i>偏好</i><span>晚上少打扰</span></p>
          <p><i>习惯</i><span>周日整理计划</span></p>
          <p><i>目标</i><span>减少久坐</span></p>
        </div>
      </Html>
    )
  }

  if (beat.id === 'finish') {
    return (
      <Html center transform distanceFactor={680} position={[-152 * p, 34, 48]} className="workspace-summary-ui">
        <div className="workspace-summary" style={{ '--tone': beat.tone }}>
          <b>个人工作区已形成</b>
          <div><span>角色</span><strong>温和陪伴</strong></div>
          <div><span>任务</span><strong>3 项已整理</strong></div>
          <div><span>记忆</span><strong>偏好持续沉淀</strong></div>
        </div>
      </Html>
    )
  }

  return null
}

function MemoryOrbit({ beat, progress }) {
  const visible = beat.id === 'remember' || beat.id === 'finish'
  const accent = useMemo(() => new THREE.Color(beat.tone), [beat.tone])
  const ring = useRef()
  const items = useMemo(() => {
    const labels = [
      ['偏好', '晚上少打扰'],
      ['节奏', '连续工作 47 分钟'],
      ['目标', '减少久坐'],
      ['提醒', '5 分钟休息'],
      ['复盘', '周日整理计划'],
      ['状态', '温和陪伴模式'],
    ]

    return labels.map(([title, detail], index) => {
      const angle = (index / labels.length) * Math.PI * 2
      return {
        title,
        detail,
        x: Math.cos(angle) * 102,
        y: 18 + (index % 3) * 10,
        z: Math.sin(angle) * 70,
        angle,
      }
    })
  }, [])

  useFrame((state) => {
    if (!ring.current) return
    ring.current.rotation.y = state.clock.elapsedTime * 0.1 + progress * Math.PI * 0.45
  })

  if (!visible) return null

  return (
    <group ref={ring}>
      {items.map((item, index) => {
        const p = ease(progress - index * 0.025)
        return (
          <group key={item.title} position={[item.x * p, item.y * p, item.z * p]} rotation={[0, -item.angle + Math.PI, 0]} scale={[0.75 + p * 0.25, 0.75 + p * 0.25, 1]}>
            <mesh castShadow>
              <boxGeometry args={[36, 17, 1.5]} />
              <meshStandardMaterial color="#131d20" emissive={accent} emissiveIntensity={0.04 + p * 0.12} roughness={0.46} transparent opacity={0.78} />
            </mesh>
            <Html center transform distanceFactor={560} position={[0, 0, 1.4]} className="memory-chip-ui">
              <div className="memory-chip" style={{ '--tone': beat.tone }}>
                <b>{item.title}</b>
                <span>{item.detail}</span>
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

function AmbientWorkspace({ beat, progress }) {
  const accent = useMemo(() => new THREE.Color(beat.tone), [beat.tone])
  const active = ease(0.2 + progress * 0.8)
  const panels = [
    [-118, 38, -78, 0.24, 54, 82],
    [122, 28, -62, -0.22, 64, 92],
    [0, 80, -92, 0, 118, 36],
  ]

  return (
    <group>
      {panels.map(([x, y, z, rot, w, h], index) => (
        <mesh key={index} position={[x, y, z]} rotation={[0, rot, 0]}>
          <boxGeometry args={[w, h, 1.1]} />
          <meshStandardMaterial
            color="#10181c"
            emissive={accent}
            emissiveIntensity={0.02 + active * 0.05}
            transparent
            opacity={0.22}
            roughness={0.36}
          />
        </mesh>
      ))}
      <mesh position={[0, -2, -96]}>
        <boxGeometry args={[168, 2.5, 1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.22 + active * 0.18} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 70, -96]}>
        <boxGeometry args={[96, 1.8, 1]} />
        <meshStandardMaterial color="#f8efe6" emissive={accent} emissiveIntensity={0.08 + active * 0.08} transparent opacity={0.42} />
      </mesh>
    </group>
  )
}

function DataFlow({ beat, progress }) {
  const accent = useMemo(() => new THREE.Color(beat.tone), [beat.tone])
  const nodes = useMemo(() => {
    return Array.from({ length: 9 }, (_, index) => {
      const t = index / 8
      return {
        x: -88 + t * 176,
        y: -18 + Math.sin(t * Math.PI) * 52,
        z: 18 - t * 58,
        phase: t,
      }
    })
  }, [])

  return (
    <group visible={progress > 0.04}>
      {nodes.map((node, index) => {
        const pulse = ease(progress - node.phase * 0.32)
        return (
          <group key={index} position={[node.x, node.y, node.z]} scale={0.55 + pulse * 0.75}>
            <mesh>
              <sphereGeometry args={[3.2, 18, 12]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.16 + pulse * 0.34} transparent opacity={0.34 + pulse * 0.5} />
            </mesh>
            {index < nodes.length - 1 && (
              <mesh position={[11, 3, -4]} rotation={[0, -0.22, 0]}>
                <boxGeometry args={[24, 0.8, 0.8]} />
                <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.1 + pulse * 0.18} transparent opacity={0.18 + pulse * 0.32} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

function ProductScene({ scale, scrollState, beat, index, onSceneState }) {
  const root = useRef()
  const last = useRef({ progress: -1, visibility: -1 })
  const progress = clamp01(scrollState.progress)
  const visibility = clamp01(scrollState.visibility)
  const width = scale?.[0] || 520
  const height = scale?.[1] || 520
  const base = Math.max(0.68, Math.min(width, height) / 530)

  useFrame((state) => {
    if (!root.current) return
    const time = state.clock.elapsedTime
    const targetY = -0.34 + index * 0.14 + progress * 0.22
    const targetX = index === 3 ? -0.1 : 0.03 + Math.sin(time * 0.48) * 0.018
    root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, targetY, 0.04)
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, targetX, 0.04)
    root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, 66 + visibility * 8, 0.04)
    root.current.position.z = THREE.MathUtils.lerp(root.current.position.z, -18 + visibility * 14, 0.04)
    root.current.scale.setScalar(0.94 + visibility * 0.08)

    if (visibility > 0.05 && (Math.abs(last.current.progress - progress) > 0.03 || Math.abs(last.current.visibility - visibility) > 0.08)) {
      last.current = { progress, visibility }
      onSceneState?.({ index, progress, visibility })
    }
  })

  return (
    <group ref={root} scale={[base, base, base]}>
      <Float speed={0.55} rotationIntensity={0.025} floatIntensity={0.08}>
        <AmbientWorkspace beat={beat} progress={progress} />
        <DeskSceneBase tone={beat.tone} awake={progress} beatId={beat.id} />
        <Monitor beat={beat} progress={progress} />
        <DataFlow beat={beat} progress={progress} />
        <StageActionEffect beat={beat} progress={progress} />
        <ProductBehaviorLayer beat={beat} progress={progress} />
        <CapabilityPanels beat={beat} progress={progress} />
        <MemoryOrbit beat={beat} progress={progress} />
      </Float>
    </group>
  )
}

function CanvasScene({ track, beat, index, onSceneState }) {
  return (
    <UseCanvas>
      <ScrollScene track={track} hideOffscreen>
        {({ scale, scrollState }) => (
          <ProductScene scale={scale} scrollState={scrollState} beat={beat} index={index} onSceneState={onSceneState} />
        )}
      </ScrollScene>
    </UseCanvas>
  )
}

function ProductStage({ beat, index, registerRef, onSceneState, hero = false }) {
  const stageRef = useRef(null)

  if (!hero) {
    registerRef(index, stageRef)
  }

  return (
    <div className={hero ? 'product-stage hero-stage' : 'product-stage'} ref={stageRef} aria-hidden="true">
      <div className="stage-glass">
        <div className="stage-status">
          <span>{beat.cue}</span>
          <b>{beat.id}</b>
        </div>
        <div className="stage-chips">
          {beat.chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      </div>
      <CanvasScene track={stageRef} beat={beat} index={index} onSceneState={onSceneState} />
    </div>
  )
}

function StorySection({ beat, index, registerRef, onSceneState }) {
  return (
    <section className={`story-section story-${beat.id}`} id={beat.id}>
      <div className="story-copy">
        <span>{beat.eyebrow}</span>
        <h2>{beat.title}</h2>
        <p>{beat.line}</p>
      </div>
      <ProductStage beat={beat} index={index} registerRef={registerRef} onSceneState={onSceneState} />
    </section>
  )
}

function DirectorBadge({ beat, progress, visibility, running }) {
  return (
    <aside className="director-badge" aria-label="demo progress">
      <span>{running ? 'Demo Running' : 'Live Scene'}</span>
      <strong>{beat.cue}</strong>
      <div className="badge-meter">
        <i style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <small>{Math.round(visibility * 100)}% visible</small>
    </aside>
  )
}

function StoryCaption({ beat }) {
  return (
    <aside className="story-caption" aria-label="current story caption">
      <span>{beat.eyebrow}</span>
      <strong>{beat.caption}</strong>
    </aside>
  )
}

function ProgressTimeline({ beats, activeIndex }) {
  return (
    <nav className="progress-timeline" aria-label="demo story timeline">
      {beats.map((beat, index) => (
        <a key={beat.id} href={`#${beat.id}`} className={index === activeIndex ? 'active' : ''}>
          <i>{String(index + 1).padStart(2, '0')}</i>
          <span>{beat.cue}</span>
        </a>
      ))}
    </nav>
  )
}

export function App() {
  const refs = useRef([])
  const [running, setRunning] = useState(false)
  const [sceneState, setSceneState] = useState({ index: 0, progress: 0, visibility: 0 })
  const activeBeat = storyBeats[sceneState.index] || storyBeats[0]

  const registerRef = (index, ref) => {
    refs.current[index] = ref
  }

  useEffect(() => {
    let frame = 0

    const updateActiveSection = () => {
      frame = 0
      const sections = Array.from(document.querySelectorAll('.story-section'))
      const viewportCenter = window.innerHeight * 0.5
      let bestIndex = 0
      let bestDistance = Number.POSITIVE_INFINITY

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        const sectionCenter = rect.top + rect.height * 0.5
        const distance = Math.abs(sectionCenter - viewportCenter)
        const isVisible = rect.bottom > 0 && rect.top < window.innerHeight
        if (isVisible && distance < bestDistance) {
          bestDistance = distance
          bestIndex = index
        }
      })

      setSceneState((current) => (current.index === bestIndex ? current : { ...current, index: bestIndex }))
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateActiveSection)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateActiveSection()

    const hash = window.location.hash
    if (hash) {
      window.setTimeout(() => {
        const target = document.querySelector(hash)
        target?.scrollIntoView({ behavior: 'auto', block: 'center' })
        updateActiveSection()
      }, 250)
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const runDemo = async () => {
    if (running) return
    setRunning(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const delays = [900, 2800, 3400, 3400, 3400]

    for (let index = 0; index < refs.current.length; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, delays[index] || 3200))
      refs.current[index]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    await new Promise((resolve) => setTimeout(resolve, 3600))
    setRunning(false)
  }

  return (
    <>
      <GlobalCanvas shadows camera={{ fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none', zIndex: 2 }}>
        <ambientLight intensity={0.56} />
        <directionalLight position={[260, 280, 260]} intensity={1.9} castShadow />
        <pointLight position={[-190, -30, 150]} intensity={1.1} color="#8bd6d1" />
        <pointLight position={[220, 130, 90]} intensity={0.8} color="#ffd29a" />
        <PerspectiveCamera makeDefault position={[0, 0, 900]} fov={40} />
        <Environment preset="city" />
      </GlobalCanvas>

      <SmoothScrollbar />

      <main className="page-shell">
        <DirectorBadge beat={activeBeat} progress={sceneState.progress} visibility={sceneState.visibility} running={running} />
        <StoryCaption beat={activeBeat} />
        <ProgressTimeline beats={storyBeats} activeIndex={sceneState.index} />

        <header className="hero">
          <div className="hero-copy">
            <span>Desktop Companion / Product Demo</span>
            <h1>把 AI 放进你的桌面生活里</h1>
            <p>一个滚动驱动的 3D 产品展示：角色醒来、听懂状态、整理任务、沉淀记忆，最后形成个人工作空间。</p>
            <div className="hero-actions">
              <button type="button" onClick={runDemo} disabled={running}>
                {running ? '演示推进中' : '播放完整演示'}
              </button>
              <a href="#story">进入故事</a>
            </div>
          </div>
          <ProductStage beat={storyBeats[0]} index={0} registerRef={() => {}} onSceneState={setSceneState} hero />
        </header>

        <section className="film-map" id="story">
          <span>Storyline</span>
          <h2>不是展示功能列表，而是展示一次真实使用过程。</h2>
          <div className="film-steps">
            {storyBeats.map((beat, index) => (
              <div key={beat.id}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <strong>{beat.title}</strong>
                <small>{beat.cue}</small>
              </div>
            ))}
          </div>
        </section>

        {storyBeats.map((beat, index) => (
          <StorySection key={beat.id} beat={beat} index={index} registerRef={registerRef} onSceneState={setSceneState} />
        ))}

        <footer className="final-note">
          <span>下一步可以接入真实角色模型、录制时间线、旁白字幕和 MP4 发布包。</span>
        </footer>
      </main>
    </>
  )
}
