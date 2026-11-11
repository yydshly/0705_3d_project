import './styles.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import {
  GUIDE_BEAT,
  MOUTH_SHAPES,
  beatDuration,
  cueAt,
  cueIndexAt,
  isBeatComplete,
  mouthAt,
} from './captionBeat.js';

const VRM_URL = '/models/VRM1_Constraint_Twist_Sample.vrm';

const canvas = document.querySelector('#avatar-canvas');
const statusEl = document.querySelector('#asset-status');
const expressionStatusEl = document.querySelector('#expression-status');
const assetNameEl = document.querySelector('#asset-name');
const runtimeRouteEl = document.querySelector('#runtime-route');
const stateButtons = [...document.querySelectorAll('[data-state]')];
const expressionButtons = [...document.querySelectorAll('[data-expression]')];
const playBeatButton = document.querySelector('#play-beat');
const stageCaptionEl = document.querySelector('#stage-caption');
const beatStatusEl = document.querySelector('#beat-status');
const beatProgressEl = document.querySelector('#beat-progress-bar');
const mouthStatusEl = document.querySelector('#mouth-status');
const voiceStatusEl = document.querySelector('#voice-status');
const guideAudio = document.querySelector('#guide-audio');

const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x081018);
scene.fog = new THREE.Fog(0x081018, 5, 18);

const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
camera.position.set(0, 1.35, 4.1);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.08, 0);
controls.enableDamping = true;
controls.minDistance = 2.15;
controls.maxDistance = 6.2;
controls.maxPolarAngle = Math.PI * 0.52;

const hemiLight = new THREE.HemisphereLight(0xbddcff, 0x24301f, 1.4);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
keyLight.position.set(2.6, 4.3, 2.4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x7df0c2, 1.4);
rimLight.position.set(-3.2, 1.8, -2.4);
scene.add(rimLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(2.4, 96),
  new THREE.MeshStandardMaterial({
    color: 0x172234,
    roughness: 0.68,
    metalness: 0.08,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.18, 0.012, 12, 160),
  new THREE.MeshBasicMaterial({ color: 0x7df0c2, transparent: true, opacity: 0.55 }),
);
ring.position.y = 0.012;
ring.rotation.x = Math.PI / 2;
scene.add(ring);

const grid = new THREE.GridHelper(8, 32, 0x31516b, 0x1a2a3a);
grid.position.y = 0.018;
scene.add(grid);

const gazeTarget = new THREE.Object3D();
gazeTarget.position.set(0, 1.45, 2.2);
scene.add(gazeTarget);

let currentVrm = null;
let activeState = 'idle';
let activeExpression = 'neutral';
let loadStartedAt = performance.now();
let beatPlayback = null;

function setStatus(text) {
  statusEl.textContent = text;
}

function setActiveButton(buttons, value, attr) {
  buttons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset[attr] === value);
  });
}

function setExpression(name) {
  activeExpression = name;
  setActiveButton(expressionButtons, name, 'expression');

  const manager = currentVrm?.expressionManager;
  if (!manager) {
    expressionStatusEl.textContent = '当前 VRM 未暴露 expression manager';
    return;
  }

  const names = Object.keys(manager.expressionMap ?? {});
  names.forEach((expressionName) => manager.setValue(expressionName, 0));

  if (names.includes(name)) {
    manager.setValue(name, 1);
    expressionStatusEl.textContent = `已切换: ${name}`;
  } else {
    const fallback = names.find((item) => item.toLowerCase().includes(name));
    if (fallback) {
      manager.setValue(fallback, 1);
      expressionStatusEl.textContent = `已切换近似表情: ${fallback}`;
    } else {
      expressionStatusEl.textContent = `未找到 ${name}，可用: ${names.join(', ') || '无'}`;
    }
  }
}

function setState(name, { silent = false } = {}) {
  activeState = name;
  setActiveButton(stateButtons, name, 'state');
  const copy = {
    idle: 'Idle: 角色保持呼吸和微动，适合观察资产质量。',
    greet: 'Greet: 镜头和视线靠近用户，模拟问候状态。',
    explain: 'Explain: 角色转向说明面板，适合产品导览。',
    think: 'Think: 节奏放慢，模拟思考/等待响应。',
  };
  if (!silent) setStatus(copy[name]);
}

function setBeatUi({ pressed, caption = '', status }) {
  playBeatButton.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  playBeatButton.textContent = pressed ? '停止导览' : '播放导览';
  stageCaptionEl.hidden = caption === '';
  stageCaptionEl.textContent = caption;
  if (status) beatStatusEl.textContent = status;
}

function setBeatProgress(elapsed) {
  const progress = Math.max(0, Math.min(1, elapsed / beatDuration(GUIDE_BEAT)));
  beatProgressEl.style.transform = `scaleX(${progress})`;
}

function stopGuideAudio() {
  guideAudio.pause();
  guideAudio.currentTime = 0;
}

function cancelBeat(status) {
  if (!beatPlayback) return;
  beatPlayback = null;
  stopGuideAudio();
  setBeatProgress(0);
  setBeatUi({ pressed: false, status });
  voiceStatusEl.textContent = '已停止';
  mouthStatusEl.textContent = '闭合';
}

function stopBeat(status, { progress = null } = {}) {
  beatPlayback = null;
  stopGuideAudio();
  setBeatProgress(progress ?? beatDuration(GUIDE_BEAT));
  setBeatUi({ pressed: false, status });
  setState('idle', { silent: true });
  setExpression('neutral');
  voiceStatusEl.textContent = progress === 0 ? '已停止' : '朗读结束';
  mouthStatusEl.textContent = '闭合';
}

function beatElapsed() {
  if (!beatPlayback) return 0;
  if (beatPlayback.useAudio && Number.isFinite(guideAudio.currentTime)) {
    return guideAudio.currentTime * 1000;
  }
  return performance.now() - beatPlayback.startedAt;
}

function toggleBeat() {
  if (beatPlayback) {
    stopBeat('导览已停止，回到 Idle', { progress: 0 });
    setStatus('导览已停止，角色回到 Idle。');
    return;
  }

  beatPlayback = { startedAt: performance.now(), cueIndex: -1, useAudio: true };
  guideAudio.src = GUIDE_BEAT.audio;
  guideAudio.currentTime = 0;
  setBeatUi({ pressed: true, status: '导览准备开始' });
  setStatus('导览播放中。语音、字幕、表情和嘴型使用同一条时间轴。');
  const playback = guideAudio.play();
  playback
    ?.then(() => {
      voiceStatusEl.textContent = '正在朗读生成语音';
    })
    .catch(() => {
      if (!beatPlayback) return;
      beatPlayback.useAudio = false;
      beatPlayback.startedAt = performance.now();
      voiceStatusEl.textContent = '语音被拦截，字幕和口型继续走';
    });
}

function updateBeat() {
  if (!beatPlayback) return;

  const elapsed = beatElapsed();
  setBeatProgress(elapsed);
  if (isBeatComplete(GUIDE_BEAT, elapsed)) {
    stopBeat('导览已结束，回到 Idle');
    setStatus('导览结束。语音和字幕已走完，角色回到 Idle。');
    voiceStatusEl.textContent = '朗读结束';
    return;
  }

  const cueIndex = cueIndexAt(GUIDE_BEAT, elapsed);
  if (cueIndex === beatPlayback.cueIndex || cueIndex < 0) return;

  const cue = GUIDE_BEAT.cues[cueIndex];
  beatPlayback.cueIndex = cueIndex;
  setState(cue.state, { silent: true });
  setExpression(cue.expression);
  setBeatUi({
    pressed: true,
    caption: cue.caption,
    status: `${cueIndex + 1} / ${GUIDE_BEAT.cues.length} · ${cue.state} / ${cue.expression}`,
  });
  setStatus(`导览 ${cueIndex + 1}/${GUIDE_BEAT.cues.length}`);
}

function applyMouth(elapsed) {
  const manager = currentVrm?.expressionManager;
  const cue = beatPlayback ? cueAt(GUIDE_BEAT, elapsed) : null;
  const mouth = mouthAt(cue, elapsed);

  if (manager) {
    for (const shape of MOUTH_SHAPES) {
      if (!manager.expressionMap?.[shape]) continue;
      manager.setValue(shape, mouth.shape === shape ? mouth.weight : 0);
    }
  }

  mouthStatusEl.textContent = mouth.shape ? `${mouth.shape} ${mouth.weight.toFixed(2)}` : '闭合';
  return mouth.weight;
}

function updateCharacterMotion(elapsed) {
  if (!currentVrm) return;

  const root = currentVrm.scene;
  const breathing = Math.sin(elapsed * 1.6) * 0.018;
  const sway = Math.sin(elapsed * 0.72) * 0.035;

  root.position.y = breathing;

  if (activeState === 'greet') {
    root.rotation.y = Math.sin(elapsed * 1.9) * 0.08;
    gazeTarget.position.set(Math.sin(elapsed * 1.2) * 0.2, 1.46, 2.1);
  } else if (activeState === 'explain') {
    root.rotation.y = -0.22 + Math.sin(elapsed * 0.9) * 0.025;
    gazeTarget.position.set(-1.1, 1.25, 1.4);
  } else if (activeState === 'think') {
    root.rotation.y = 0.12 + Math.sin(elapsed * 0.45) * 0.02;
    gazeTarget.position.set(0.35, 1.72, 1.65);
  } else {
    root.rotation.y = sway;
    gazeTarget.position.set(Math.sin(elapsed * 0.55) * 0.28, 1.48, 2.05);
  }

  if (currentVrm.lookAt) {
    currentVrm.lookAt.target = gazeTarget;
  }
}

function normalizeVrm(vrm) {
  VRMUtils.removeUnnecessaryVertices(vrm.scene);
  VRMUtils.removeUnnecessaryJoints(vrm.scene);

  vrm.scene.traverse((object) => {
    object.frustumCulled = false;
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  const box = new THREE.Box3().setFromObject(vrm.scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 1.62 / Math.max(size.y, 0.001);
  vrm.scene.scale.setScalar(scale);
  vrm.scene.position.x -= center.x * scale;
  vrm.scene.position.z -= center.z * scale;
  vrm.scene.position.y -= box.min.y * scale;
}

function loadVrm() {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  setStatus('正在加载 VRM sample...');

  loader.load(
    VRM_URL,
    (gltf) => {
      currentVrm = gltf.userData.vrm;
      normalizeVrm(currentVrm);
      scene.add(currentVrm.scene);

      const meta = currentVrm.meta ?? {};
      const expressionNames = Object.keys(currentVrm.expressionManager?.expressionMap ?? {});
      const elapsed = ((performance.now() - loadStartedAt) / 1000).toFixed(1);

      assetNameEl.textContent = meta.name || 'VRM1 Constraint Twist Sample';
      runtimeRouteEl.textContent = 'Three.js GLTFLoader + VRMLoaderPlugin';
      expressionStatusEl.textContent = expressionNames.length
        ? `可用: ${expressionNames.join(', ')}`
        : '未暴露表情列表，保留状态入口';
      setStatus(`VRM 加载完成，用时 ${elapsed}s。`);
      setExpression(activeExpression);
    },
    (progress) => {
      if (progress.total) {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        setStatus(`正在加载 VRM sample... ${percent}%`);
      }
    },
    (error) => {
      console.error(error);
      setStatus('VRM 加载失败：请检查网络或远程资产访问。');
      expressionStatusEl.textContent = '模型未加载，无法验证表情';
    },
  );
}

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  camera.aspect = rect.width / Math.max(rect.height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height, false);
}

stateButtons.forEach((button) => {
  button.addEventListener('click', () => {
    cancelBeat('已改用手动状态');
    setState(button.dataset.state);
  });
});

expressionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    cancelBeat('已改用手动表情');
    setExpression(button.dataset.expression);
  });
});

playBeatButton.addEventListener('click', toggleBeat);
guideAudio.addEventListener('ended', () => {
  if (!beatPlayback?.useAudio) return;
  stopBeat('导览已结束，回到 Idle');
  setStatus('导览结束。语音和字幕已走完，角色回到 Idle。');
});

window.addEventListener('resize', resize);

function animate() {
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;

  updateBeat();
  applyMouth(beatElapsed());
  updateCharacterMotion(elapsed);
  currentVrm?.update(delta);
  ring.rotation.z += delta * 0.16;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
setState('idle');
loadStartedAt = performance.now();
loadVrm();
animate();
