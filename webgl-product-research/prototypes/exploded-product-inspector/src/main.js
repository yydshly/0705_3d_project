import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

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
renderer.toneMappingExposure = 1.18;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x243041);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();

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
      group.add(rounded(1.64, 0.86, 0.74, 0.08, metal("#2b323c", 0.34, 0.78, 0.55)));
      const deck = rounded(1.36, 0.1, 0.58, 0.04, metal("#4c5666", 0.28, 0.84, 0.35));
      deck.position.set(0.02, 0.46, -0.04);
      group.add(deck);
      const finder = rounded(0.46, 0.2, 0.32, 0.04, metal("#242a33", 0.3, 0.7, 0.2));
      finder.position.set(-0.24, 0.58, -0.08);
      group.add(finder);
      const windowPane = cylinderZ(0.08, 0.08, 0.03, metal("#1b3c4c", 0.08, 0.4, 1));
      windowPane.position.set(-0.24, 0.6, 0.09);
      group.add(windowPane);
      const grip = rounded(0.22, 0.78, 0.66, 0.06, rubber("#1c2128"));
      grip.position.set(-0.8, -0.02, 0.01);
      group.add(grip);
      const recess = cylinderZ(0.28, 0.28, 0.05, rubber("#14181e"));
      recess.position.set(0, 0.02, 0.36);
      group.add(recess);
      const mount = torusZ(0.34, 0.045, metal("#d5dde6", 0.16, 1, 0.2));
      mount.position.set(0, 0.02, 0.4);
      group.add(mount);
    },
  });

  addPart(list, parent, {
    id: "lens",
    name: "镜头",
    copy: "前面的圆柱，负责对准画面。",
    home: new THREE.Vector3(0, 0.02, 0.86),
    exploded: new THREE.Vector3(0, 0.08, 2.15),
    focusDistance: 2.25,
    build(group) {
      group.add(place(cylinderZ(0.33, 0.31, 0.38, metal("#2a313b", 0.3, 0.86)), 0, 0, -0.16));
      group.add(place(cylinderZ(0.37, 0.37, 0.12, rubber("#242a32")), 0, 0, 0.08));
      group.add(place(cylinderZ(0.34, 0.33, 0.16, metal("#343c48", 0.24, 0.9)), 0, 0, 0.2));
      group.add(place(cylinderZ(0.4, 0.4, 0.045, metal("#d5dde6", 0.14, 1, 0.2)), 0, 0, 0.31));
      group.add(place(cylinderZ(0.28, 0.28, 0.04, metal("#102833", 0.08, 0.35, 1)), 0, 0, 0.33));
      const pupil = place(cylinderZ(0.14, 0.14, 0.02, rubber("#07090c")), 0, 0, 0.355);
      pupil.castShadow = false;
      group.add(pupil);
    },
  });

  addPart(list, parent, {
    id: "shutter",
    name: "快门",
    copy: "顶部的按钮。点一下，就完成一次拍照。",
    home: new THREE.Vector3(0.28, 0.62, 0.02),
    exploded: new THREE.Vector3(0.28, 1.48, 0.02),
    focusDistance: 1.65,
    build(group) {
      const collar = cylinderY(0.16, 0.17, 0.07, metal("#b7c0cb", 0.2, 1, 0.25));
      collar.position.y = -0.05;
      group.add(collar);
      const button = cylinderY(0.125, 0.125, 0.09, metal("#e24b3a", 0.32, 0.15, 0.7));
      button.position.y = 0.035;
      group.add(button);
    },
  });

  addPart(list, parent, {
    id: "battery",
    name: "电池仓",
    copy: "右侧的盖板。打开后可以更换电池。",
    home: new THREE.Vector3(0.86, -0.02, 0),
    exploded: new THREE.Vector3(1.95, 0.04, 0),
    focusDistance: 1.9,
    build(group) {
      group.add(rounded(0.07, 0.6, 0.48, 0.03, metal("#8d8474", 0.38, 0.72, 0.25)));
      const seam = rounded(0.03, 0.5, 0.38, 0.02, metal("#6f685c", 0.46, 0.55));
      seam.position.x = 0.025;
      group.add(seam);
      const latch = rounded(0.035, 0.1, 0.14, 0.015, metal("#e4ded2", 0.28, 0.65));
      latch.position.set(0.04, 0.16, 0);
      group.add(latch);
      group.add(place(cylinderX(0.025, 0.025, 0.02, metal("#f2eee6", 0.22, 0.8)), 0.04, -0.16, 0.12));
      group.add(place(cylinderX(0.025, 0.025, 0.02, metal("#f2eee6", 0.22, 0.8)), 0.04, -0.16, -0.12));
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

function metal(color, roughness, metalness, clearcoat = 0) {
  return { color, roughness, metalness, clearcoat, clearcoatRoughness: 0.24 };
}

function rubber(color) {
  return { color, roughness: 0.92, metalness: 0.02, clearcoat: 0 };
}

function torusZ(radius, tube, params) {
  return shadedMesh(new THREE.TorusGeometry(radius, tube, 20, 64), params);
}

function rounded(width, height, depth, radius, params) {
  return shadedMesh(new RoundedBoxGeometry(width, height, depth, 3, radius), params);
}

function cylinderZ(radiusTop, radiusBottom, height, params) {
  const mesh = shadedMesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 64), params);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function cylinderY(radiusTop, radiusBottom, height, params) {
  return shadedMesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 48), params);
}

function cylinderX(radiusTop, radiusBottom, height, params) {
  const mesh = shadedMesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 24), params);
  mesh.rotation.z = Math.PI / 2;
  return mesh;
}

function place(mesh, x, y, z) {
  mesh.position.set(x, y, z);
  return mesh;
}

function shadedMesh(geometry, params) {
  const material = new THREE.MeshPhysicalMaterial({
    color: params.color,
    roughness: params.roughness,
    metalness: params.metalness,
    clearcoat: params.clearcoat ?? 0,
    clearcoatRoughness: params.clearcoatRoughness ?? 0.3,
    transmission: params.transmission ?? 0,
    thickness: params.thickness ?? 0.2,
    ior: params.ior ?? 1.5,
    envMapIntensity: params.envMapIntensity ?? 1,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addStudio() {
  scene.add(new THREE.HemisphereLight(0xf4f7fb, 0x6a6258, 0.55));

  const key = new THREE.DirectionalLight(0xfff6ea, 3.1);
  key.position.set(3.4, 5.6, 4.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 16;
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xc5dcff, 2.4);
  rim.position.set(-4.5, 3.2, -3.5);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0xd5e4f5, 0.85);
  fill.position.set(-2.5, 1.4, 3.5);
  scene.add(fill);

  const backdrop = new THREE.Mesh(
    new THREE.SphereGeometry(18, 48, 32),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        top: { value: new THREE.Color(0x243041) },
        bottom: { value: new THREE.Color(0xd5dbe3) },
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPos;
        uniform vec3 top;
        uniform vec3 bottom;
        void main() {
          float h = smoothstep(-1.5, 6.0, vPos.y);
          gl_FragColor = vec4(mix(bottom, top, h), 1.0);
        }
      `,
    }),
  );
  scene.add(backdrop);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(12, 80),
    new THREE.MeshStandardMaterial({ color: 0xd7dde4, roughness: 0.86, metalness: 0.04 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.56;
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
  for (const part of parts) {
    const active = part.id === id;
    for (const material of part.materials) {
      material.emissive.set(active ? 0xfff6e8 : 0x000000);
      material.emissiveIntensity = active ? 0.07 : 0;
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
