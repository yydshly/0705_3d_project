import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

const outputPath = resolve('public/models/lumadock-ai-companion.glb')

const scene = new THREE.Scene()

globalThis.FileReader = class NodeFileReader {
  result = null
  onloadend = null

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

const materials = {
  shell: new THREE.MeshStandardMaterial({
    name: 'Shell Warm White',
    color: 0xf1f4ee,
    roughness: 0.48,
    metalness: 0.08
  }),
  shellAccent: new THREE.MeshStandardMaterial({
    name: 'Shell Accent',
    color: 0xcfd8d3,
    roughness: 0.44,
    metalness: 0.12
  }),
  glass: new THREE.MeshStandardMaterial({
    name: 'Glass Display',
    color: 0x111821,
    roughness: 0.18,
    metalness: 0.2
  }),
  glow: new THREE.MeshStandardMaterial({
    name: 'Soft Status Glow',
    color: 0x70f0c8,
    emissive: 0x38d6a4,
    emissiveIntensity: 1.8,
    roughness: 0.3
  }),
  dark: new THREE.MeshStandardMaterial({
    name: 'Graphite Detail',
    color: 0x242a32,
    roughness: 0.6,
    metalness: 0.25
  })
}

function mesh(geometry, material, position, rotation = [0, 0, 0], scale = [1, 1, 1], name = '') {
  const object = new THREE.Mesh(geometry, material)
  object.name = name
  object.position.set(...position)
  object.rotation.set(...rotation)
  object.scale.set(...scale)
  object.castShadow = true
  object.receiveShadow = true
  scene.add(object)
  return object
}

mesh(new THREE.CylinderGeometry(0.82, 0.95, 0.18, 48), materials.shellAccent, [0, 0.09, 0], [0, 0, 0], [1, 1, 0.78], 'Weighted Desk Base')
mesh(new THREE.BoxGeometry(1.2, 1.55, 0.62), materials.shell, [0, 0.94, 0], [0, 0, 0], [1, 1, 1], 'Main AI Dock Body')
mesh(new THREE.BoxGeometry(0.92, 0.56, 0.035), materials.glass, [0, 1.18, 0.329], [0, 0, 0], [1, 1, 1], 'Front Expression Display')
mesh(new THREE.TorusGeometry(0.16, 0.022, 12, 36), materials.glow, [0, 1.73, 0.332], [0, 0, 0], [1, 1, 1], 'Sensor Halo')
mesh(new THREE.SphereGeometry(0.07, 24, 16), materials.dark, [0, 1.73, 0.345], [0, 0, 0], [1, 1, 1], 'Center Camera Lens')

for (let i = 0; i < 5; i += 1) {
  const x = -0.36 + i * 0.18
  mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.025, 18), materials.dark, [x, 1.84, 0.12], [Math.PI / 2, 0, 0], [1, 1, 1], `Microphone ${i + 1}`)
}

for (let i = 0; i < 4; i += 1) {
  mesh(new THREE.BoxGeometry(0.035, 0.16, 0.018), materials.dark, [-0.63, 0.68 + i * 0.14, 0.05], [0, 0, 0], [1, 1, 1], `Speaker Slot ${i + 1}`)
}

mesh(new THREE.BoxGeometry(0.07, 0.26, 0.24), materials.dark, [0.64, 0.78, 0.04], [0, 0, 0], [1, 1, 1], 'Side USB-C Port')
mesh(new THREE.BoxGeometry(0.06, 0.18, 0.18), materials.glow, [0.64, 1.08, 0.04], [0, 0, 0], [1, 1, 1], 'Status Light Strip')

mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.48, 32), materials.shellAccent, [0, 0.38, -0.42], [Math.PI / 2, 0, 0], [1, 1, 1], 'Rear Cable Dock')
mesh(new THREE.TorusGeometry(0.24, 0.035, 12, 36), materials.dark, [0, 0.38, -0.7], [Math.PI / 2, 0, 0], [1, 1, 1], 'Magnetic Cable Loop')

const exporter = new GLTFExporter()
const glb = await exporter.parseAsync(scene, { binary: true })

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, Buffer.from(glb))

console.log(`Generated ${outputPath}`)
