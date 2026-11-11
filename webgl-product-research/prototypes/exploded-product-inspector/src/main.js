import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const DEFAULT_COPY = "拖拽旋转，滚轮拉近。点「拉开」把零件分开，再点某一块查看说明。";
const HOME_POSITION = new THREE.Vector3(2.75, 1.55, 3.55);
const HOME_TARGET = new THREE.Vector3(0.05, 0.08, 0.2);
const VIEW_DIRECTION = new THREE.Vector3(1.15, 0.72, 1.45).normalize();

const canvas = document.querySelector("#scene-canvas");
const partNameEl = document.querySelector("#part-name");
const partCopyEl = document.querySelector("#part-copy");
const explodeButton = document.querySelector("#explode");
const collapseButton = document.querySelector("#collapse");
const resetButton = document.querySelector("#reset");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x10151c);
scene.fog = new THREE.Fog(0x10151c, 8, 16);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 40);
camera.position.copy(homePose().position);

const controls = new OrbitControls(camera, canvas);
controls.target.copy(homePose().target);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 1.35;
controls.maxDistance = 8;
controls.maxPolarAngle = Math.PI * 0.85;
controls.update();

const assembly = new THREE.Group();
scene.add(assembly);

const parts = createCamera(assembly);
const explode = { current: 0, target: 0 };
let selectedId = null;
let cameraMotion = null;
let pointerTracking = null;
let userMovedCamera = false;

addStudio();
bindUi();
window.addEventListener("resize", resize);
renderer.setAnimationLoop(animate);

function createCamera(parent) {
  const list = [];

  addPart(list, parent, {
    id: "body",
    name: "机身",
    copy: "承托镜头和快门的主体。拉开后它留在中间。",
    home: new THREE.Vector3(0, 0, 0),
    exploded: new THREE.Vector3(0, -0.08, -0.2),
    focusDistance: 3.15,
    build(group) {
      group.add(box(1.7, 0.92, 0.78, "#2c333c", 0.46, 0.42));
      const top = box(1.42, 0.12, 0.62, "#3d4652", 0.4, 0.5);
      top.position.set(0, 0.5, -0.02);
      group.add(top);
      const finder = box(0.46, 0.22, 0.34, "#23282f", 0.35, 0.55);
      finder.position.set(-0.28, 0.62, -0.08);
      group.add(finder);
      const grip = box(0.18, 0.78, 0.7, "#23282f", 0.62, 0.2);
      grip.position.set(-0.78, -0.04, 0);
      group.add(grip);
    },
  });

  addPart(list, parent, {
    id: "lens",
    name: "镜头",
    copy: "前面的圆柱，负责对准画面。",
    home: new THREE.Vector3(0, 0.02, 0.78),
    exploded: new THREE.Vector3(0, 0.15, 1.48),
    focusDistance: 2.25,
    build(group) {
      group.add(cylinderZ(0.4, 0.36, 0.62, "#1a1e24", 0.32, 0.7));
      const ring = cylinderZ(0.44, 0.44, 0.08, "#8d97a6", 0.28, 0.85);
      ring.position.z = 0.28;
      group.add(ring);
      const glass = cylinderZ(0.3, 0.3, 0.06, "#102433", 0.08, 0.9);
      glass.position.z = 0.34;
      group.add(glass);
    },
  });

  addPart(list, parent, {
    id: "shutter",
    name: "快门",
    copy: "顶部的按钮。点一下，就完成一次拍照。",
    home: new THREE.Vector3(0.28, 0.62, 0.02),
    exploded: new THREE.Vector3(0.28, 1.28, 0.02),
    focusDistance: 1.65,
    build(group) {
      const collar = cylinderY(0.16, 0.16, 0.08, "#8d97a6", 0.3, 0.8);
      collar.position.y = -0.04;
      group.add(collar);
      const button = cylinderY(0.13, 0.13, 0.1, "#c4564a", 0.42, 0.25);
      button.position.y = 0.05;
      group.add(button);
    },
  });

  addPart(list, parent, {
    id: "battery",
    name: "电池仓",
    copy: "右侧的盖板。打开后可以更换电池。",
    home: new THREE.Vector3(0.9, -0.02, 0.02),
    exploded: new THREE.Vector3(1.58, 0.05, 0.02),
    focusDistance: 1.9,
    build(group) {
      group.add(box(0.08, 0.62, 0.5, "#8a8474", 0.4, 0.55));
      const latch = box(0.04, 0.12, 0.16, "#d7d2c6", 0.35, 0.4);
      latch.position.set(0.05, 0.16, 0);
      group.add(latch);
    },
  });

  return list;
}

function addPart(list, parent, spec) {
  const group = new THREE.Group();
  group.position.copy(spec.home);
  group.userData.partId = spec.id;
  spec.build(group);
  parent.add(group);
  list.push({
    id: spec.id,
    name: spec.name,
    copy: spec.copy,
    home: spec.home,
    exploded: spec.exploded,
    focusDistance: spec.focusDistance,
    group,
    materials: collectMaterials(group),
  });
}

function collectMaterials(group) {
  const materials = [];
  group.traverse((object) => {
    if (object.isMesh && object.material) materials.push(object.material);
  });
  return materials;
}

function box(width, height, depth, color, roughness, metalness) {
  return shadedMesh(new THREE.BoxGeometry(width, height, depth), color, roughness, metalness);
}

function cylinderZ(radiusTop, radiusBottom, height, color, roughness, metalness) {
  const mesh = shadedMesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 40),
    color,
    roughness,
    metalness,
  );
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function cylinderY(radiusTop, radiusBottom, height, color, roughness, metalness) {
  return shadedMesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32),
    color,
    roughness,
    metalness,
  );
}

function shadedMesh(geometry, color, roughness, metalness) {
  const material = new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addStudio() {
  scene.add(new THREE.HemisphereLight(0xd7e4f5, 0x1a140f, 1.15));
  const ambient = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(4.5, 6.5, 3.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 16;
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x9db7d6, 0.7);
  fill.position.set(-4, 2.2, -2);
  scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 64),
    new THREE.MeshStandardMaterial({ color: 0x171c24, roughness: 0.92, metalness: 0.04 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.62;
  floor.receiveShadow = true;
  scene.add(floor);
}

function bindUi() {
  explodeButton.addEventListener("click", () => {
    explode.target = 1;
    syncButtons();
    if (selectedId) framePart(selectedPart());
  });
  collapseButton.addEventListener("click", () => {
    explode.target = 0;
    syncButtons();
    if (selectedId) framePart(selectedPart());
  });
  resetButton.addEventListener("click", resetView);

  canvas.addEventListener("pointerdown", (event) => {
    pointerTracking = { x: event.clientX, y: event.clientY };
  });
  window.addEventListener("pointerup", (event) => {
    if (!pointerTracking) return;
    const start = pointerTracking;
    pointerTracking = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (dx * dx + dy * dy > 16) {
      cameraMotion = null;
      userMovedCamera = true;
      return;
    }
    if (event.target !== canvas) return;
    pick(event);
  });
}

function pick(event) {
  const rect = canvas.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(assembly.children, true);
  const hit = hits.find((item) => partIdFromObject(item.object));
  if (!hit) return;
  selectPart(partIdFromObject(hit.object));
}

function partIdFromObject(object) {
  let current = object;
  while (current) {
    if (current.userData.partId) return current.userData.partId;
    current = current.parent;
  }
  return null;
}

function selectPart(id) {
  selectedId = id;
  highlight(id);
  const part = selectedPart();
  partNameEl.textContent = part.name;
  partCopyEl.textContent = part.copy;
  framePart(part);
}

function selectedPart() {
  return parts.find((part) => part.id === selectedId);
}

function highlight(id) {
  const tint = new THREE.Color(0xd7ecff);
  for (const part of parts) {
    const active = part.id === id;
    for (const material of part.materials) {
      if (!material.userData.baseColor) material.userData.baseColor = material.color.clone();
      material.color.copy(material.userData.baseColor);
      material.emissive.set(0x000000);
      material.emissiveIntensity = 0;
      if (!active) continue;
      material.color.lerp(tint, 0.45);
      material.emissive.copy(material.userData.baseColor).lerp(tint, 0.5);
      material.emissiveIntensity = 0.22;
    }
  }
}

function framePart(part) {
  const local = new THREE.Vector3().lerpVectors(part.home, part.exploded, explode.target);
  const world = assembly.localToWorld(local);
  cameraMotion = {
    pos: world.clone().addScaledVector(VIEW_DIRECTION, part.focusDistance),
    target: world.clone(),
  };
}

function homePose() {
  if (window.innerWidth < 720) {
    return {
      position: new THREE.Vector3(2.4, 2.35, 6.4),
      target: new THREE.Vector3(0.05, -0.7, 0.15),
    };
  }
  return {
    position: HOME_POSITION.clone(),
    target: HOME_TARGET.clone(),
  };
}

function resetView() {
  selectedId = null;
  userMovedCamera = false;
  explode.target = 0;
  highlight(null);
  partNameEl.textContent = "整机";
  partCopyEl.textContent = DEFAULT_COPY;
  const pose = homePose();
  controls._sphericalDelta.set(0, 0, 0);
  controls._panOffset.set(0, 0, 0);
  controls._scale = 1;
  cameraMotion = { pos: pose.position, target: pose.target };
  syncButtons();
}

function syncButtons() {
  explodeButton.setAttribute("aria-pressed", String(explode.target === 1));
  collapseButton.setAttribute("aria-pressed", String(explode.target === 0));
}

function placeParts() {
  explode.current += (explode.target - explode.current) * 0.09;
  if (Math.abs(explode.target - explode.current) < 0.001) explode.current = explode.target;
  const t = explode.current;
  const eased = t * t * (3 - 2 * t);
  for (const part of parts) {
    part.group.position.lerpVectors(part.home, part.exploded, eased);
  }
}

function followSelectedPart() {
  if (!cameraMotion || !selectedId) return;
  if (Math.abs(explode.target - explode.current) < 0.001) return;
  const part = selectedPart();
  const world = new THREE.Vector3();
  part.group.getWorldPosition(world);
  cameraMotion.target.copy(world);
  cameraMotion.pos.copy(world).addScaledVector(VIEW_DIRECTION, part.focusDistance);
}

function settleCamera() {
  if (!cameraMotion) return;
  camera.position.lerp(cameraMotion.pos, 0.08);
  controls.target.lerp(cameraMotion.target, 0.08);
  const partMoving = selectedId && Math.abs(explode.target - explode.current) > 0.001;
  const arrived =
    camera.position.distanceTo(cameraMotion.pos) < 0.015 &&
    controls.target.distanceTo(cameraMotion.target) < 0.015;
  if (arrived && !partMoving) {
    camera.position.copy(cameraMotion.pos);
    controls.target.copy(cameraMotion.target);
    controls._sphericalDelta.set(0, 0, 0);
    controls._panOffset.set(0, 0, 0);
    controls._scale = 1;
    cameraMotion = null;
  }
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (!selectedId && !userMovedCamera && !cameraMotion) {
    const pose = homePose();
    camera.position.copy(pose.position);
    controls.target.copy(pose.target);
  }
}

function animate() {
  placeParts();
  followSelectedPart();
  settleCamera();
  controls.update();
  renderer.render(scene, camera);
}
