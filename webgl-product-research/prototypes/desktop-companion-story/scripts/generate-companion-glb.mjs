import fs from 'node:fs/promises'
import path from 'node:path'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

class NodeFileReader {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer()
    this.onloadend?.()
  }

  async readAsDataURL(blob) {
    const buffer = Buffer.from(await blob.arrayBuffer())
    this.result = `data:${blob.type || 'application/octet-stream'};base64,${buffer.toString('base64')}`
    this.onloadend?.()
  }
}

globalThis.FileReader = NodeFileReader

const outputDir = path.resolve('public/models')
const outputFile = path.join(outputDir, 'desktop-companion.glb')

function material(name, color, options = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    color,
    roughness: options.roughness ?? 0.42,
    metalness: options.metalness ?? 0.02,
    clearcoat: options.clearcoat ?? 0.25,
    emissive: options.emissive ?? '#000000',
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
  })
  mat.name = name
  return mat
}

function mesh(name, geometry, mat, position, rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const item = new THREE.Mesh(geometry, mat)
  item.name = name
  item.position.set(...position)
  item.rotation.set(...rotation)
  item.scale.set(...scale)
  item.castShadow = true
  item.receiveShadow = true
  return item
}

const root = new THREE.Group()
root.name = 'DesktopCompanionCharacter'

const skin = material('warm_porcelain_skin', '#f4eee7', { roughness: 0.36, clearcoat: 0.36 })
const dress = material('soft_lilac_desktop_hoodie', '#d8c8f0', { roughness: 0.5, clearcoat: 0.18 })
const hair = material('ink_soft_hair', '#2a2428', { roughness: 0.62, clearcoat: 0.08 })
const dark = material('deep_screen_detail', '#10171a', { roughness: 0.34, metalness: 0.12 })
const accent = material('companion_teal_emission', '#8bd6d1', {
  roughness: 0.28,
  emissive: '#8bd6d1',
  emissiveIntensity: 0.28,
})
const pink = material('soft_blush_emission', '#ff9fbd', {
  roughness: 0.36,
  emissive: '#ff9fbd',
  emissiveIntensity: 0.12,
})
const glass = material('translucent_face_panel', '#1c2528', {
  roughness: 0.22,
  metalness: 0.08,
  emissive: '#8bd6d1',
  emissiveIntensity: 0.1,
  transparent: true,
  opacity: 0.48,
})

root.add(mesh('body_hoodie', new THREE.CapsuleGeometry(18, 42, 12, 36), skin, [0, -2, 0]))
root.add(mesh('dress_shell', new THREE.CapsuleGeometry(22, 20, 10, 28), dress, [0, -32, -1]))
root.add(mesh('head_round', new THREE.SphereGeometry(17, 40, 24), skin, [0, 24, 0]))
root.add(mesh('hair_cap', new THREE.SphereGeometry(18.5, 40, 20), hair, [0, 34, -2], [0, 0, 0], [1.06, 0.56, 0.88]))
root.add(mesh('left_side_hair', new THREE.CapsuleGeometry(4.2, 24, 8, 16), hair, [-16, 21, -1], [0, 0, -0.12]))
root.add(mesh('right_side_hair', new THREE.CapsuleGeometry(4.2, 24, 8, 16), hair, [16, 21, -1], [0, 0, 0.12]))
root.add(mesh('face_panel', new THREE.BoxGeometry(28, 15, 1.2), glass, [0, 17, 16.6], [0, 0, 0], [1.15, 0.48, 1]))
root.add(mesh('left_eye', new THREE.SphereGeometry(2.2, 18, 12), accent, [-7, 22, 17.4]))
root.add(mesh('right_eye', new THREE.SphereGeometry(2.2, 18, 12), accent, [7, 22, 17.4]))
root.add(mesh('smile_led', new THREE.BoxGeometry(13, 1.8, 1), accent, [0, 12, 17.8]))
root.add(mesh('left_blush', new THREE.SphereGeometry(2.4, 16, 10), pink, [-12, 15, 17.2], [0, 0, 0], [1.2, 0.55, 0.3]))
root.add(mesh('right_blush', new THREE.SphereGeometry(2.4, 16, 10), pink, [12, 15, 17.2], [0, 0, 0], [1.2, 0.55, 0.3]))
root.add(mesh('left_arm', new THREE.CapsuleGeometry(3.7, 32, 8, 16), skin, [-21, -14, 2], [0, 0, -0.5]))
root.add(mesh('right_arm', new THREE.CapsuleGeometry(3.7, 32, 8, 16), skin, [21, -14, 2], [0, 0, 0.5]))
root.add(mesh('left_sleeve_ring', new THREE.TorusGeometry(5, 0.8, 10, 24), dress, [-18, -25, 4], [Math.PI / 2, 0, -0.5]))
root.add(mesh('right_sleeve_ring', new THREE.TorusGeometry(5, 0.8, 10, 24), dress, [18, -25, 4], [Math.PI / 2, 0, 0.5]))
root.add(mesh('left_antenna', new THREE.CapsuleGeometry(1.1, 18, 6, 10), accent, [-10, 48, 0], [0, 0, -0.28]))
root.add(mesh('right_antenna', new THREE.CapsuleGeometry(1.1, 18, 6, 10), accent, [10, 48, 0], [0, 0, 0.28]))
root.add(mesh('left_antenna_tip', new THREE.SphereGeometry(2.6, 16, 10), accent, [-13, 57, 0]))
root.add(mesh('right_antenna_tip', new THREE.SphereGeometry(2.6, 16, 10), accent, [13, 57, 0]))
root.add(mesh('chest_status_core', new THREE.BoxGeometry(20, 8, 1.6), dark, [0, -8, 17.2]))
root.add(mesh('chest_status_line', new THREE.BoxGeometry(14, 1.4, 1), accent, [0, -8, 18.4]))

const baseRing = mesh('floating_emotion_ring', new THREE.TorusGeometry(36, 1.1, 14, 120), accent, [0, -2, 0], [Math.PI / 2, 0, 0])
baseRing.castShadow = false
baseRing.receiveShadow = false
root.add(baseRing)

root.traverse((item) => {
  if (item.isMesh) {
    item.geometry.computeBoundingBox()
    item.geometry.computeBoundingSphere()
  }
})

const exporter = new GLTFExporter()
const arrayBuffer = await exporter.parseAsync(root, {
  binary: true,
  trs: false,
  onlyVisible: true,
})

await fs.mkdir(outputDir, { recursive: true })
await fs.writeFile(outputFile, Buffer.from(arrayBuffer))
console.log(`Wrote ${outputFile}`)
