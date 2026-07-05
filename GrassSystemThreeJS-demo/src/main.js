import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import GUI from 'lil-gui';
import { createPostFX } from './postfx.js';
import { createGrass } from './grass.js';
import { createModelSystem } from './model.js';

/* -------------------------------------------------------------------------- */
/*  Renderer                                                                   */
/* -------------------------------------------------------------------------- */
const canvas = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;

/* -------------------------------------------------------------------------- */
/*  Scene & Camera                                                             */
/* -------------------------------------------------------------------------- */
const scene = new THREE.Scene();
// Warm, hazy dusk so the bare earth reads with a little atmosphere. Fog blends
// each fragment toward the background by its distance FROM THE CAMERA, so keep
// it light (exposed in the GUI) and zooming won't read as a lighting change.
scene.background = new THREE.Color(0x171311);
scene.fog = new THREE.FogExp2(0x171311, 0.006);
const demoSkyColor = new THREE.Color();
const demoFogColor = new THREE.Color();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(6, 20, 32);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI * 0.495; // don't go below the ground
controls.minDistance = 2;
controls.maxDistance = 300;
controls.target.set(0, 0, 0);

/* -------------------------------------------------------------------------- */
/*  Image-based lighting (soft, neutral reflections)                          */
/* -------------------------------------------------------------------------- */
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.4;

/* -------------------------------------------------------------------------- */
/*  Cinematic lighting rig (warm key, cool fill, separating rim)               */
/* -------------------------------------------------------------------------- */
// Key light — warm, hard, casts the shadows.
const keyLight = new THREE.DirectionalLight(0xfff1dd, 3.0);
keyLight.position.set(8, 12, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 60;
keyLight.shadow.camera.left = -15;
keyLight.shadow.camera.right = 15;
keyLight.shadow.camera.top = 15;
keyLight.shadow.camera.bottom = -15;
keyLight.shadow.bias = -0.0002;
keyLight.shadow.normalBias = 0.02;
scene.add(keyLight);

// Fill light — cool, soft, lifts the shadows from the opposite side.
const fillLight = new THREE.DirectionalLight(0x6c8cff, 0.5);
fillLight.position.set(-9, 5, -4);
scene.add(fillLight);

// Rim / back light — separates the surface from the background.
const rimLight = new THREE.SpotLight(0xffd9a0, 110, 50, Math.PI * 0.25, 0.4, 1.2);
rimLight.position.set(-6, 8, -10);
rimLight.target.position.set(0, 0, 0);
scene.add(rimLight);
scene.add(rimLight.target);

// Gentle ambient so nothing reads as pure black.
const ambient = new THREE.AmbientLight(0x3a2f24, 0.4);
scene.add(ambient);

/* -------------------------------------------------------------------------- */
/*  Soil texture set (the PBR base the procedural shading sits on top of)      */
/* -------------------------------------------------------------------------- */
let SOIL_PREFIX = '/Ground036_1K-JPG_'; // dark loam / arable-soil PBR set
const loader = new THREE.TextureLoader();
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

let allMaps = []; // rebuilt by loadTextures(); applyTextureScale() reads it by ref

const material = new THREE.MeshStandardMaterial({
  normalMapType: THREE.TangentSpaceNormalMap, // textures are OpenGL (GL) normals
  roughness: 1.0,
  metalness: 0.0,
  aoMapIntensity: 1.12,
  normalScale: new THREE.Vector2(0.9, 0.9),
  displacementScale: 0.0, // texture displacement — off by default, GUI turns it up
  displacementBias: 0.0,
  envMapIntensity: 1.0,
});

function loadTextures() {
  const make = (suffix, srgb = false) => {
    const tex = loader.load(SOIL_PREFIX + suffix + '.jpg');
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = maxAnisotropy;
    return tex;
  };

  for (const m of allMaps) m.dispose();

  material.map = make('Color', true); // sRGB; the rest are linear data maps
  material.aoMap = make('AmbientOcclusion');
  material.roughnessMap = make('Roughness');
  material.normalMap = make('NormalGL');
  material.displacementMap = make('Displacement');
  material.needsUpdate = true;

  allMaps = [
    material.map,
    material.aoMap,
    material.roughnessMap,
    material.normalMap,
    material.displacementMap,
  ];
  applyTextureScale(params.textureScale);
}

/* -------------------------------------------------------------------------- */
/*  Shared time uniform                                                        */
/* -------------------------------------------------------------------------- */
const shared = { uTime: { value: 0 } };

/* -------------------------------------------------------------------------- */
/*  Procedural soil shaping & shading uniforms                                 */
/* -------------------------------------------------------------------------- */
//  A world-space noise field reshapes and re-colours the bare ground: broad
//  mounds rise the geometry, large-scale tone variation breaks up the flat
//  albedo, optional moisture darkens & glosses damp patches, and dry cracks
//  cut dark fissures — all driven from the same texture set so the look stays
//  consistent across the ground plane AND the extruded mound.
const soilUniforms = {
  // --- Shape (vertex displacement) ----------------------------------------
  uMoundScale: { value: 0.12 }, // mound noise frequency (smaller = broader)
  uSeed: { value: new THREE.Vector2(8.3, 2.1) }, // pan the whole field
  uMoundDepth: { value: 0.34 }, // height of the mounds (world units)
  uMoundCoverage: { value: 1.0 }, // how much of the surface is raised
  uMoundEdge: { value: 0.15 }, // mound coverage edge softness
  uBumpScale: { value: 0.92 }, // fine relief frequency
  uBumpStrength: { value: 0.62 }, // how lumpy the surface is
  uTillageStrength: { value: 0.42 }, // shallow cultivated ridges in the soil
  uTillageScale: { value: 1.15 }, // furrow spacing frequency
  uTillageAngle: { value: 0.35 }, // furrow direction in radians
  uTillageWarp: { value: 0.48 }, // organic bend in the furrows
  // --- Albedo / shading ----------------------------------------------------
  uSoilColor: { value: new THREE.Color(0xc0936b) }, // overall tint multiplier
  uVarScale: { value: 0.14 }, // tone-variation frequency
  uVarAmount: { value: 0.2 }, // dry/rich tone contrast
  uVarCoverage: { value: 1.0 }, // how much of the ground the variation covers
  uVarEdge: { value: 0.15 }, // variation patch edge softness
  uVarSeed: { value: new THREE.Vector2(2.0, 7.0) }, // pan the tone field
  uMoisture: { value: 0.16 }, // 0 = bone dry, 1 = soaked (fully covered)
  uMoistScale: { value: 0.18 }, // damp-patch frequency
  uMoistEdge: { value: 0.12 }, // damp-patch edge softness
  uMoistSeed: { value: new THREE.Vector2(5.0, 5.0) }, // pan the damp field
  uWetDarken: { value: 0.72 }, // how much wet soil darkens
  uWetRoughness: { value: 0.55 }, // wet soil is glossier
  uRootPresence: { value: 0.0 }, // dark, humid soil around mature vegetation
  uOrganicScatter: { value: 0.34 }, // fine organic flecks and crumb contrast
  uCrackEnabled: { value: 0.0 }, // master on/off for the cracks; off by default
  uCrackAmount: { value: 0.03 }, // dry-earth fissures (0 = none)
  uCrackScale: { value: 0.9 }, // plate size (bigger = smaller plates)
  uCrackWidth: { value: 0.035 }, // channel width between plates
  uCrackWarp: { value: 0.0 }, // organic meander of the plate edges
  uCrackDepth: { value: 0.7 }, // how deep the fissures groove the surface
  uCrackSeed: { value: new THREE.Vector2(11.0, 5.0) }, // pan the crack field
  uReliefShading: { value: 0.7 }, // strength of the mound shading normals
  // --- Vehicle contact -----------------------------------------------------
  uVehiclePos: { value: new THREE.Vector2(0, 0) },
  uVehicleYaw: { value: 0 },
  uVehicleInfluence: { value: 0 },
  uTime: shared.uTime,
};

/* -------------------------------------------------------------------------- */
/*  Moss cover (same principle as the SnowSystem accumulation)                 */
/* -------------------------------------------------------------------------- */
//  A world-space FBM mask decides where moss has grown over the soil — exactly
//  like the snow "settled" mask, but instead of a flat white blanket it lays a
//  real MOSS TEXTURE (colour, roughness, normal & AO) over the ground and gives
//  it HEIGHT VOLUME: the moss layer is folded into the shared terrain height
//  field, so it lifts the geometry (and the grass that sits on it) into a soft,
//  raised living carpet rather than a painted-on decal.
//
//  The height/relief uniforms below are read by the shared `groundHeightAt`
//  (so the grass follows the moss too); the texture/tint uniforms are read only
//  by the soil fragment shader.
const mossUniforms = {
  // --- Coverage & height volume (folded into groundHeightAt) ---------------
  uMossEnabled: { value: 0.0 }, // master on/off (0 = no moss anywhere); off by default
  uMossScale: { value: 0.14 }, // patch noise frequency (smaller = bigger patches)
  uMossSeed: { value: new THREE.Vector2(4.2, 6.6) }, // pan the moss field
  uMossCoverage: { value: 0.55 }, // 0 = bare soil, 1 = fully mossed
  uMossEdge: { value: 0.14 }, // patch edge softness
  uMossDepth: { value: 0.14 }, // thickness of the moss layer (world units)
  uMossBumpScale: { value: 0.9 }, // moss surface relief frequency
  uMossBumpStrength: { value: 0.7 }, // how lumpy the moss carpet is
  uMossLocality: { value: 0.0 }, // 0 = open field mask, 1 = sheltered growth near the vehicle
  uMossRadius: { value: 6.2 }, // radius of the sheltered moss ecology
  // --- Texture & shading (soil fragment only) ------------------------------
  uMossMap: { value: null },
  uMossRoughnessMap: { value: null },
  uMossNormalMap: { value: null },
  uMossAoMap: { value: null },
  uMossColor: { value: new THREE.Color(0xffffff) }, // tint multiplier
  uMossRoughness: { value: 1.0 }, // scales the sampled moss roughness
  uMossTextureScale: { value: 0.35 }, // moss tiles per world unit
  uMossNormalScale: { value: 1.0 }, // moss normal-map strength
  uMossAoStrength: { value: 1.0 }, // moss ambient-occlusion strength
};

let mossMaps = []; // rebuilt by loadMossTextures()
function loadMossTextures() {
  const make = (suffix) => {
    const tex = loader.load('/Moss002_1K-JPG_' + suffix + '.jpg');
    // Sampled through custom uniforms, so tiling is driven by uMossTextureScale
    // (world-space UVs) rather than the texture's own repeat.
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = maxAnisotropy;
    return tex;
  };
  for (const m of mossMaps) m.dispose();
  mossUniforms.uMossMap.value = make('Color'); // decoded to linear in-shader
  mossUniforms.uMossRoughnessMap.value = make('Roughness');
  mossUniforms.uMossNormalMap.value = make('NormalGL');
  mossUniforms.uMossAoMap.value = make('AmbientOcclusion');
  mossMaps = [
    mossUniforms.uMossMap.value,
    mossUniforms.uMossRoughnessMap.value,
    mossUniforms.uMossNormalMap.value,
    mossUniforms.uMossAoMap.value,
  ];
}

// Pure noise helpers (no uniforms).
const NOISE_FUNCTIONS = /* glsl */ `
// --- Ashima 2D simplex noise -------------------------------------------------
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal Brownian motion for organic, blotchy shapes.
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * snoise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return value;
}

// --- Cellular (Worley) noise -------------------------------------------------
// Returns the two nearest feature-point distances (F1, F2). The BORDER between
// two cells sits where F2-F1 -> 0, which traces the polygonal plate network of
// cracked, sun-baked soil.
vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}
vec2 worleyF1F2(vec2 x) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  float f1 = 8.0, f2 = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash22(n + g);           // jittered feature point in the cell
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < f1) { f2 = f1; f1 = d; }
      else if (d < f2) { f2 = d; }
    }
  }
  return vec2(sqrt(f1), sqrt(f2));
}
`;

// Terrain height field — SHARED by the soil material AND the grass (so blades
// sit exactly on the displaced ground, live, as the mound sliders move). Only
// the shaping uniforms it needs are declared here.
const HEIGHT_FUNCTIONS = /* glsl */ `
uniform float uMoundScale;
uniform vec2  uSeed;
uniform float uMoundDepth;
uniform float uMoundCoverage;
uniform float uMoundEdge;
uniform float uBumpScale;
uniform float uBumpStrength;
uniform float uTillageStrength;
uniform float uTillageScale;
uniform float uTillageAngle;
uniform float uTillageWarp;

// --- Moss height field (same "settled" principle as the snow accumulation) ---
uniform float uMossEnabled;
uniform float uMossScale;
uniform vec2  uMossSeed;
uniform float uMossCoverage;
uniform float uMossEdge;
uniform float uMossDepth;
uniform float uMossBumpScale;
uniform float uMossBumpStrength;
uniform float uMossLocality;
uniform float uMossRadius;

// Where moss has grown: a world-space FBM mask, 0 (bare soil) .. 1 (deep moss).
// coverage 0 -> nothing, 1 -> everywhere (soft, randomizable patches).
float mossMaskAt(vec2 worldXZ) {
  if (uMossEnabled < 0.5) return 0.0;                       // master switch (off)
  vec2 p = worldXZ * uMossScale + uMossSeed;
  float n = fbm(p) * 0.5 + 0.5;                            // 0..1
  float threshold = mix(1.0 + uMossEdge, -uMossEdge, uMossCoverage);
  float mossPatch = smoothstep(threshold - uMossEdge, threshold + uMossEdge, n);

  // Natural moss rarely conquers the whole field in this scene. When locality
  // is enabled, it gathers around the shaded/damp vehicle zone with a few
  // irregular nearby pockets, leaving the outer soil readable.
  vec2 shelteredXZ = worldXZ / vec2(1.38, 1.0);
  float core = 1.0 - smoothstep(uMossRadius * 0.42, uMossRadius, length(shelteredXZ));
  float pocketNoise = fbm(worldXZ * 0.42 + uMossSeed + vec2(19.1, 4.7)) * 0.5 + 0.5;
  float pocket = smoothstep(0.56, 0.92, pocketNoise);
  float outerFalloff = 1.0 - smoothstep(uMossRadius * 0.78, uMossRadius * 1.32, length(worldXZ));
  float localEcology = clamp(core + pocket * outerFalloff * 0.45, 0.0, 1.0);

  return mossPatch * mix(1.0, localEcology, uMossLocality);
}

// Thickness of the moss carpet above the soil, in world units. A base layer
// scaled by the coverage mask plus lumpy drift detail — the same single source
// of truth the snow used: the vertex stage lifts the geometry by it and the
// fragment stage differentiates it for shading, so silhouette and lighting agree.
float mossHeightAt(vec2 worldXZ) {
  float mask = mossMaskAt(worldXZ);
  float drift = fbm(worldXZ * uMossBumpScale + 31.7) * 0.5 + 0.5; // 0..1 lumps
  float h = mask * (1.0 - 0.4 * uMossBumpStrength + 0.4 * uMossBumpStrength * drift);
  vec2 edge = smoothstep(18.0, 14.5, abs(worldXZ));         // taper at the rim
  return uMossDepth * h * edge.x * edge.y;
}

float tillageHeightAt(vec2 worldXZ) {
  float ca = cos(uTillageAngle);
  float sa = sin(uTillageAngle);
  vec2 p = vec2(worldXZ.x * ca - worldXZ.y * sa, worldXZ.x * sa + worldXZ.y * ca);
  float warp = fbm(p * 0.18 + vec2(9.2, 4.1)) * uTillageWarp;
  float row = sin((p.y + warp) * 6.28318 * uTillageScale);
  float ridge = smoothstep(-0.12, 0.82, row);
  float trough = 1.0 - smoothstep(-0.78, 0.08, row);
  float crumbs = fbm(worldXZ * 2.8 + uSeed * 1.7) * 0.5 + 0.5;
  float edge = smoothstep(17.8, 12.5, max(abs(worldXZ.x), abs(worldXZ.y)));
  return ((ridge * 0.075 - trough * 0.052) + (crumbs - 0.5) * 0.055) * uTillageStrength * edge;
}

// Height of the soil surface above the flat plane, in world units. Broad mounds
// modulated by finer lumps. A coverage mask (driven by the same noise) flattens
// the low ground first, so lowering coverage leaves only the tallest peaks.
// Tapered to zero near the plane rim so the raised layer never
// leaves a floating cliff at the border. The moss carpet is laid on top so the
// ground (and any grass snapped to it) rises through the moss.
float groundHeightAt(vec2 worldXZ) {
  vec2 p = worldXZ * uMoundScale + uSeed;
  float base  = fbm(p) * 0.5 + 0.5;                       // 0..1 broad mounds
  float drift = fbm(worldXZ * uBumpScale + uSeed * 0.5) * 0.5 + 0.5;
  float h = base * (1.0 - 0.4 * uBumpStrength + 0.4 * uBumpStrength * drift);
  float mThresh = mix(1.0 + uMoundEdge, -uMoundEdge, uMoundCoverage);
  h *= smoothstep(mThresh - uMoundEdge, mThresh + uMoundEdge, base);
  vec2 edge = smoothstep(18.0, 14.5, abs(worldXZ));
  return uMoundDepth * h * edge.x * edge.y + tillageHeightAt(worldXZ) + mossHeightAt(worldXZ);
}
`;

// Soil-only shading uniforms + the normal-shading helper (fragment stage).
const SOIL_SHADE_FUNCTIONS = /* glsl */ `
uniform vec3  uSoilColor;
uniform float uVarScale;
uniform float uVarAmount;
uniform float uVarCoverage;
uniform float uVarEdge;
uniform vec2  uVarSeed;
uniform float uMoisture;
uniform float uMoistScale;
uniform float uMoistEdge;
uniform vec2  uMoistSeed;
uniform float uWetDarken;
uniform float uWetRoughness;
uniform float uRootPresence;
uniform float uOrganicScatter;
uniform float uCrackEnabled;
uniform float uCrackAmount;
uniform float uCrackScale;
uniform float uCrackWidth;
uniform float uCrackWarp;
uniform float uCrackDepth;
uniform vec2  uCrackSeed;
uniform float uReliefShading;
uniform vec2  uVehiclePos;
uniform float uVehicleYaw;
uniform float uVehicleInfluence;
uniform float uTime;

// Dry-soil crack network intensity (0 = intact plate .. 1 = deep channel). A
// warped cellular (Worley) field carves irregular polygonal plates separated by
// recessed fissures, with a finer second layer subdividing the big plates — the
// look of cracked, baked earth rather than the thin veins of a frozen lake.
float soilCrackAt(vec2 xz) {
  if (uCrackEnabled < 0.5) return 0.0;                      // master switch (off)
  vec2 warp = vec2(fbm(xz * uCrackScale * 0.5 + uCrackSeed + 3.1),
                   fbm(xz * uCrackScale * 0.5 + uCrackSeed + 7.7)) * uCrackWarp;
  vec2 cp = xz * uCrackScale + uCrackSeed + warp;
  float w = max(uCrackWidth, 0.001);
  vec2 f = worleyF1F2(cp);
  float primary = 1.0 - smoothstep(0.0, w, f.y - f.x);
  vec2 f2 = worleyF1F2(cp * 2.7 + 13.0);
  float secondary = (1.0 - smoothstep(0.0, w * 1.6, f2.y - f2.x)) * 0.5;
  return clamp(max(primary, secondary), 0.0, 1.0);
}

vec3 vehicleContactMasks(vec2 xz) {
  vec2 rel = xz - uVehiclePos;
  float cv = cos(uVehicleYaw);
  float sv = sin(uVehicleYaw);
  vec2 carLocal = vec2(rel.x * cv - rel.y * sv, rel.x * sv + rel.y * cv);

  vec2 bodyQ = abs(carLocal) - vec2(3.15, 1.08);
  float bodySdf = length(max(bodyQ, 0.0)) + min(max(bodyQ.x, bodyQ.y), 0.0);
  float underbody = 1.0 - smoothstep(-0.22, 0.85, bodySdf);

  float wheels = 0.0;
  wheels = max(wheels, 1.0 - smoothstep(0.18, 0.78, length(carLocal - vec2(-2.15, -0.96))));
  wheels = max(wheels, 1.0 - smoothstep(0.18, 0.78, length(carLocal - vec2( 2.15, -0.96))));
  wheels = max(wheels, 1.0 - smoothstep(0.18, 0.78, length(carLocal - vec2(-2.15,  0.96))));
  wheels = max(wheels, 1.0 - smoothstep(0.18, 0.78, length(carLocal - vec2( 2.15,  0.96))));

  float skirt = 1.0 - smoothstep(0.72, 1.22, length(carLocal / vec2(4.75, 2.25)));
  skirt = clamp(skirt - underbody * 0.42, 0.0, 1.0);

  return vec3(underbody, wheels, skirt) * uVehicleInfluence;
}

// Moss shading (albedo/roughness/normal/AO textures + look controls).
uniform sampler2D uMossMap;
uniform sampler2D uMossRoughnessMap;
uniform sampler2D uMossNormalMap;
uniform sampler2D uMossAoMap;
uniform vec3  uMossColor;
uniform float uMossRoughness;
uniform float uMossTextureScale;
uniform float uMossNormalScale;
uniform float uMossAoStrength;

// Analytic surface normal of the displaced ground (for shading the slopes).
vec3 groundSurfaceNormal(vec2 worldXZ) {
  float e = 0.08;
  float h0 = groundHeightAt(worldXZ);
  float hx = groundHeightAt(worldXZ + vec2(e, 0.0));
  float hz = groundHeightAt(worldXZ + vec2(0.0, e));
  vec2 grad = vec2(hx - h0, hz - h0) / e;
  return normalize(vec3(-grad.x, 1.0, -grad.y));
}
`;

const SOIL_INJECT = NOISE_FUNCTIONS + HEIGHT_FUNCTIONS + SOIL_SHADE_FUNCTIONS;

material.onBeforeCompile = (shader) => {
  Object.assign(shader.uniforms, soilUniforms, mossUniforms);

  // Vertex: inject the field, then raise the ground geometry by it.
  shader.vertexShader = shader.vertexShader
    .replace(
      '#include <common>',
      '#include <common>\nvarying vec3 vWorldPosition;\n' + SOIL_INJECT
    )
    .replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      vec2 groundXZ = (modelMatrix * vec4(transformed, 1.0)).xz;
      transformed += normalize(objectNormal) * groundHeightAt(groundXZ);
      vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`
    );

  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <common>',
      '#include <common>\nvarying vec3 vWorldPosition;\n' + SOIL_INJECT
    )
    // Albedo: large-scale tone variation, overall tint, wet patches and cracks.
    .replace(
      '#include <map_fragment>',
      `#include <map_fragment>
      vec2 sXZ = vWorldPosition.xz;

      // Broad dry/rich tone variation, confined to a randomizable coverage mask
      // (coverage 0 -> flat base, 1 -> variation everywhere).
      float tone = fbm(sXZ * uVarScale + uVarSeed) * 0.5 + 0.5;
      float tMaskN = fbm(sXZ * uVarScale * 0.7 + uVarSeed + 17.0) * 0.5 + 0.5;
      float tThresh = mix(1.0 + uVarEdge, -uVarEdge, uVarCoverage);
      float tMask = smoothstep(tThresh - uVarEdge, tThresh + uVarEdge, tMaskN);
      diffuseColor.rgb *= mix(1.0, mix(1.0 - uVarAmount, 1.0 + uVarAmount, tone), tMask);
      diffuseColor.rgb *= uSoilColor;
      diffuseColor.rgb *= vec3(1.08, 0.95, 0.82);

      // Fine loam granules: small, irregular organic speckles make the dark
      // soil read as loose planting earth instead of a smoothed mud road.
      float loamFine = fbm(sXZ * 5.5 + uVarSeed * 1.7) * 0.5 + 0.5;
      float loamMicro = fbm(sXZ * 18.0 + vec2(13.2, 4.7)) * 0.5 + 0.5;
      float loamGrain = smoothstep(0.52, 0.9, loamFine * 0.62 + loamMicro * 0.38);
      diffuseColor.rgb *= mix(0.88, 1.08, loamGrain);
      float organicFleck = smoothstep(0.62, 0.96, loamMicro) * uOrganicScatter;
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.62, 0.5, 0.38), organicFleck);
      float tillageTone = clamp(tillageHeightAt(sXZ) * 5.5, -0.45, 0.45);
      diffuseColor.rgb *= mix(1.0 - max(-tillageTone, 0.0) * 0.48, 1.0 + max(tillageTone, 0.0) * 0.12, uTillageStrength);

      // As vegetation matures, the soil around roots reads darker and more
      // humid, but it stays patchy so the field never becomes a flat stain.
      float rootPatch = fbm(sXZ * 0.52 + vec2(6.4, 12.1)) * 0.5 + 0.5;
      float rootFine = fbm(sXZ * 3.2 + vec2(1.7, 18.4)) * 0.5 + 0.5;
      float rootMask = smoothstep(0.38, 0.82, rootPatch * 0.72 + rootFine * 0.28) * uRootPresence;
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.52, 0.42, 0.32), rootMask);

      // Moisture: damp patches darken the soil (used again in the rough stage).
      // Coverage maps 0 -> dry everywhere, 1 -> damp everywhere (full coverage).
      float wn  = fbm(sXZ * uMoistScale + uMoistSeed) * 0.5 + 0.5;
      float wThresh = mix(1.0 + uMoistEdge, -uMoistEdge, uMoisture);
      float wet = smoothstep(wThresh - uMoistEdge, wThresh + uMoistEdge, wn);
      wet = clamp(wet + rootMask * 0.38, 0.0, 1.0);
      diffuseColor.rgb *= mix(1.0, uWetDarken, wet);

      // Vehicle contact: where the grass is crushed away, make the exposed
      // earth look compressed, slightly damp, and softly shadowed instead of
      // showing a raw cutout of ordinary ground.
      vec3 vehicleContact = vehicleContactMasks(sXZ);
      float contactDamp = clamp(vehicleContact.x * 0.42 + vehicleContact.y * 0.72 + vehicleContact.z * 0.24, 0.0, 1.0);
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.58, 0.50, 0.42), contactDamp);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.18, 0.145, 0.105), vehicleContact.y * 0.18);

      // Dry soil cracks: recessed channels of a warped cellular plate network.
      float cracks = soilCrackAt(sXZ) * uCrackAmount * (1.0 - contactDamp * 0.75);
      diffuseColor.rgb *= (1.0 - 0.7 * cracks);

      // Moss cover: lay the moss albedo (own tiling, tint & AO) over the soil
      // wherever the mask says it has grown. The moss's HEIGHT is added in the
      // vertex stage (groundHeightAt), so this only handles the surface look.
      float mossMask = mossMaskAt(sXZ);
      vec2  mossUv   = sXZ * uMossTextureScale;
      vec3  mossAlb  = pow(texture2D(uMossMap, mossUv).rgb, vec3(2.2)) * uMossColor;
      float mossAo   = mix(1.0, texture2D(uMossAoMap, mossUv).r, uMossAoStrength);
      mossAlb *= mossAo;
      diffuseColor.rgb = mix(diffuseColor.rgb, mossAlb, mossMask);`
    )
    // Wet soil is glossier; cracks read dull and matte; moss carries its own map.
    .replace(
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, uWetRoughness, wet);
      roughnessFactor = mix(roughnessFactor, 0.78, rootMask);
      roughnessFactor = mix(roughnessFactor, 0.48, contactDamp);
      roughnessFactor = mix(roughnessFactor, 1.0, cracks);
      float mossRough = texture2D(uMossRoughnessMap, sXZ * uMossTextureScale).g * uMossRoughness;
      roughnessFactor = mix(roughnessFactor, clamp(mossRough, 0.04, 1.0), mossMask);`
    )
    // Moss normal-map detail, then the displaced-mound relief normal on top.
    .replace(
      '#include <normal_fragment_maps>',
      `#include <normal_fragment_maps>
      vec3 mossN = texture2D(uMossNormalMap, sXZ * uMossTextureScale).xyz * 2.0 - 1.0;
      mossN.xy *= uMossNormalScale;
      vec3 mossViewN = normalize(tbn * mossN);
      normal = normalize(mix(normal, mossViewN, mossMask));
      vec3 gN = groundSurfaceNormal(vWorldPosition.xz);
      vec3 gView = normalize((viewMatrix * vec4(gN, 0.0)).xyz);
      normal = normalize(mix(normal, gView, uReliefShading));

      // Crack grooving: tilt the surface into each fissure so the walls catch
      // light and the plates read as raised, cracked crust (not a flat decal).
      float ce = 0.02;
      float c0 = soilCrackAt(sXZ);
      float cx = soilCrackAt(sXZ + vec2(ce, 0.0));
      float cz = soilCrackAt(sXZ + vec2(0.0, ce));
      vec2  cGrad = vec2(cx - c0, cz - c0) / ce;
      float cDepth = uCrackDepth * uCrackAmount;
      vec3  crackN = normalize(vec3(-cGrad.x * cDepth, 1.0, -cGrad.y * cDepth));
      vec3  crackView = normalize((viewMatrix * vec4(crackN, 0.0)).xyz);
      normal = normalize(mix(normal, crackView, smoothstep(0.02, 0.5, cracks)));`
    );
};
// Distinct cache key so this program isn't shared with a plain StandardMaterial.
material.customProgramCacheKey = () => 'soil-moss-v7-local-ecology';

/* -------------------------------------------------------------------------- */
/*  Ground plane                                                               */
/* -------------------------------------------------------------------------- */
// Segments give the displacement field something to push around.
const geometry = new THREE.PlaneGeometry(36, 36, 320, 320);
geometry.setAttribute('uv1', geometry.attributes.uv); // aoMap reads UV set 2

const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
plane.castShadow = true;
scene.add(plane);

/* -------------------------------------------------------------------------- */
/*  Wind field (shared by the grass; world-space gust direction & speed)       */
/* -------------------------------------------------------------------------- */
const windUniforms = {
  uWindDir: { value: new THREE.Vector2(1, 0.35).normalize() },
  uWindStrength: { value: 0.36 }, // how far the gust leans the blades
  uWindSpeed: { value: 0.9 }, // travel speed of the gust front
  uWindScale: { value: 0.16 }, // spatial frequency of the gust field
  uGust: { value: 0.26 }, // fine per-blade flutter amount
};
const windState = { strength: 0.36, speed: 0.9, scale: 0.16, gust: 0.26, direction: 35 };
function applyWind() {
  const a = THREE.MathUtils.degToRad(windState.direction);
  windUniforms.uWindDir.value.set(Math.cos(a), Math.sin(a)); // already unit-length
  windUniforms.uWindStrength.value = windState.strength;
  windUniforms.uWindSpeed.value = windState.speed;
  windUniforms.uWindScale.value = windState.scale;
  windUniforms.uGust.value = windState.gust;
}
applyWind();

/* -------------------------------------------------------------------------- */
/*  Grass — GPU-instanced, wind-reactive, curlable, glued to the terrain       */
/* -------------------------------------------------------------------------- */
const GROUND_SIZE = 20; // the 20×20 ground plane; grass + fog box share this
const DEMO_FIELD_SIZE = 36;
const grass = createGrass({
  sharedUniforms: shared,
  soilUniforms, // shares the terrain height field (blades follow the mounds)
  mossUniforms, // moss height is folded into groundHeightAt (blades ride the moss)
  windUniforms,
  noiseGLSL: NOISE_FUNCTIONS,
  heightGLSL: HEIGHT_FUNCTIONS,
  sunLight: keyLight,
  area: DEMO_FIELD_SIZE, // match the expanded presentation ground
});
grass.mesh.visible = false; // disabled by default (toggle in the Grass folder)
scene.add(grass.mesh);

/* -------------------------------------------------------------------------- */
/*  Model (default GLB + user import) — moss accumulates on its upward faces    */
/* -------------------------------------------------------------------------- */
const MODELS = {
  'Rusty Car': '/old_rusty_car_2.glb',
  'Porsche 911': '/porsche_911.glb',
};
let vehicleContactShadow = null;
const model = createModelSystem({
  scene,
  sharedUniforms: shared,
  mossUniforms, // shares the moss maps, tint & master enable (mosses when moss is on)
  defaultUrl: MODELS['Rusty Car'],
});

const vehicleContactShadowMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uOpacity: { value: 0.38 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
      vec2 p = (vUv - 0.5) * vec2(1.0, 2.8);
      float body = smoothstep(0.5, 0.0, length(p));
      vec2 axle = abs((vUv - 0.5) * vec2(2.7, 1.0));
      float wheel = smoothstep(0.38, 0.0, min(length(axle - vec2(0.92, 0.25)), length(axle - vec2(0.92, -0.25))));
      float alpha = max(body * 0.85, wheel) * uOpacity;
      if (alpha < 0.002) discard;
      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
    }
  `,
});
vehicleContactShadow = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 3.0), vehicleContactShadowMat);
vehicleContactShadow.renderOrder = 2;
vehicleContactShadow.visible = false;
scene.add(vehicleContactShadow);

/* -------------------------------------------------------------------------- */
/*  Cinematic post-processing & camera                                         */
/* -------------------------------------------------------------------------- */
const fx = createPostFX({ renderer, scene, camera });
// Point the clouds' in-scattering at the key light.
fx.fog.uniforms.uSunDir.value.copy(keyLight.position).normalize();
fx.fog.uniforms.uSunColor.value.copy(keyLight.color);
// Match the cloud box footprint to the grass/ground (no inset offset).
fx.fog.uniforms.uHalfXZ.value = DEMO_FIELD_SIZE / 2;

const cine = {
  autoOrbit: true,
  orbitSpeed: 1.0,
  fov: 24,
  letterbox: true,
};
controls.autoRotate = cine.autoOrbit;
controls.autoRotateSpeed = cine.orbitSpeed;
camera.fov = cine.fov;
camera.updateProjectionMatrix();

// Letterbox bars (CSS overlay).
const barTop = document.getElementById('bar-top');
const barBottom = document.getElementById('bar-bottom');
function applyLetterbox() {
  const h = cine.letterbox ? '8vh' : '0';
  barTop.style.height = h;
  barBottom.style.height = h;
}
applyLetterbox();

// --- Focus-plane visualizer (Unreal-style) ---------------------------------
// A translucent grid plane shown at the DoF focus distance while the user drags
// the Focus Distance slider, then it fades out on its own.
const focusPlaneMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  uniforms: {
    uOpacity: { value: 0 },
    uColor: { value: new THREE.Color(0xffc98f) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uOpacity;
    uniform vec3  uColor;
    varying vec2  vUv;
    void main() {
      vec2 grid = abs(fract(vUv * 12.0) - 0.5);
      vec2 d = grid / fwidth(vUv * 12.0);
      float line = 1.0 - clamp(min(d.x, d.y), 0.0, 1.0);
      vec2 c = abs(vUv - 0.5);
      float cross = step(c.x, 0.0015) + step(c.y, 0.0015); // center crosshair
      float a = (line * 0.55 + 0.05 + cross * 0.9) * uOpacity;
      if (a <= 0.001) discard;
      gl_FragColor = vec4(uColor, a);
    }
  `,
});
const focusPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), focusPlaneMat);
focusPlane.frustumCulled = false;
focusPlane.visible = false;
scene.add(focusPlane);

let focusTimer = 0;
const _focusDir = new THREE.Vector3();
function showFocusPlane() {
  focusTimer = 1.2; // seconds visible after the last change
  focusPlane.visible = true;
}
function updateFocusPlane(dt) {
  if (focusTimer <= 0) {
    if (focusPlane.visible) focusPlane.visible = false;
    return;
  }
  focusTimer -= dt;
  const dist = fx.bokeh.uniforms.focus.value;
  camera.getWorldDirection(_focusDir);
  focusPlane.position.copy(camera.position).addScaledVector(_focusDir, dist);
  focusPlane.quaternion.copy(camera.quaternion); // face the camera
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
  const halfW = halfH * camera.aspect;
  focusPlane.scale.set(halfW * 2 * 0.92, halfH * 2 * 0.92, 1);
  focusPlaneMat.uniforms.uOpacity.value = 0.9 * Math.min(1, focusTimer / 0.4);
}

/* -------------------------------------------------------------------------- */
/*  GUI controls                                                               */
/* -------------------------------------------------------------------------- */
const params = {
  textureScale: 10, // tiles across the plane
  normalIntensity: 0.9,
  aoIntensity: 1.18,
  roughnessIntensity: 1.0,
  displacementScale: 0.0,
};

function applyTextureScale(scale) {
  for (const map of allMaps) {
    map.repeat.set(scale, scale);
  }
}

// Initial build — textures and tiling.
loadTextures();
loadMossTextures();

const gui = new GUI({ title: '🪨 Soil Studio' });

/* --- Material -------------------------------------------------------------- */
const fMat = gui.addFolder('Material');
const groundParams = { material: 'Ground036' };
fMat
  .add(groundParams, 'material', ['Ground036', 'Ground066', 'Ground048', 'Ground103'])
  .name('Ground Texture')
  .onChange((v) => {
    SOIL_PREFIX = `/${v}_1K-JPG_`;
    loadTextures(); // rebuilds allMaps and re-applies the current texture scale
  });
fMat
  .add(params, 'textureScale', 0.5, 20, 0.1)
  .name('Texture Scale')
  .onChange(applyTextureScale);
fMat
  .add(params, 'normalIntensity', 0, 3, 0.01)
  .name('Normal Intensity')
  .onChange((v) => material.normalScale.set(v, v));
fMat
  .add(params, 'aoIntensity', 0, 3, 0.01)
  .name('AO Intensity')
  .onChange((v) => (material.aoMapIntensity = v));
fMat
  .add(params, 'roughnessIntensity', 0, 2, 0.01)
  .name('Roughness Intensity')
  .onChange((v) => (material.roughness = v));
fMat
  .add(params, 'displacementScale', 0, 1, 0.001)
  .name('Texture Displacement')
  .onChange((v) => (material.displacementScale = v));
fMat.close();

/* --- Soil shaping & shading ------------------------------------------------ */
const fSoil = gui.addFolder('Soil Surface');

const fShape = fSoil.addFolder('Mounds & Relief');
fShape.add(soilUniforms.uMoundScale, 'value', 0.02, 0.8, 0.001).name('Mound Scale');
fShape.add(soilUniforms.uSeed.value, 'x', -50, 50, 0.1).name('Seed X').listen();
fShape.add(soilUniforms.uSeed.value, 'y', -50, 50, 0.1).name('Seed Y').listen();
fShape
  .add(
    {
      randomize: () =>
        soilUniforms.uSeed.value.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ),
    },
    'randomize'
  )
  .name('🎲 Randomize Seed');
fShape.add(soilUniforms.uMoundDepth, 'value', 0, 3, 0.01).name('Mound Height');
fShape.add(soilUniforms.uMoundCoverage, 'value', 0, 1, 0.01).name('Coverage');
fShape.add(soilUniforms.uMoundEdge, 'value', 0.001, 0.4, 0.001).name('Coverage Softness');
fShape.add(soilUniforms.uBumpScale, 'value', 0.1, 3, 0.01).name('Relief Scale');
fShape.add(soilUniforms.uBumpStrength, 'value', 0, 2, 0.01).name('Relief Strength');
fShape.add(soilUniforms.uReliefShading, 'value', 0, 1, 0.01).name('Relief Shading');

const fTillage = fSoil.addFolder('Arable Structure');
fTillage.add(soilUniforms.uTillageStrength, 'value', 0, 1, 0.01).name('Furrow Strength');
fTillage.add(soilUniforms.uTillageScale, 'value', 0.2, 3, 0.01).name('Furrow Spacing');
fTillage.add(soilUniforms.uTillageAngle, 'value', -Math.PI, Math.PI, 0.01).name('Furrow Direction');
fTillage.add(soilUniforms.uTillageWarp, 'value', 0, 1.5, 0.01).name('Organic Bend');

const fLook = fSoil.addFolder('Tone & Color');
fLook
  .addColor({ c: '#c0936b' }, 'c')
  .name('Soil Tint')
  .onChange((v) => soilUniforms.uSoilColor.value.set(v));
fLook.add(soilUniforms.uVarAmount, 'value', 0, 1, 0.01).name('Tone Variation');
fLook.add(soilUniforms.uVarScale, 'value', 0.01, 0.5, 0.001).name('Variation Scale');
fLook.add(soilUniforms.uVarCoverage, 'value', 0, 1, 0.01).name('Coverage');
fLook.add(soilUniforms.uVarEdge, 'value', 0.001, 0.4, 0.001).name('Patch Softness');
fLook.add(soilUniforms.uOrganicScatter, 'value', 0, 1, 0.01).name('Organic Flecks');
fLook.add(soilUniforms.uRootPresence, 'value', 0, 1, 0.01).name('Root Darkening');
fLook.add(soilUniforms.uVarSeed.value, 'x', -50, 50, 0.1).name('Seed X').listen();
fLook.add(soilUniforms.uVarSeed.value, 'y', -50, 50, 0.1).name('Seed Y').listen();
fLook
  .add(
    {
      randomize: () =>
        soilUniforms.uVarSeed.value.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ),
    },
    'randomize'
  )
  .name('🎲 Randomize Seed');

const fWet = fSoil.addFolder('Moisture');
fWet.add(soilUniforms.uMoisture, 'value', 0, 1, 0.01).name('Coverage');
fWet.add(soilUniforms.uMoistEdge, 'value', 0.001, 0.4, 0.001).name('Patch Softness');
fWet.add(soilUniforms.uMoistScale, 'value', 0.02, 0.8, 0.001).name('Patch Scale');
fWet.add(soilUniforms.uMoistSeed.value, 'x', -50, 50, 0.1).name('Seed X').listen();
fWet.add(soilUniforms.uMoistSeed.value, 'y', -50, 50, 0.1).name('Seed Y').listen();
fWet
  .add(
    {
      randomize: () =>
        soilUniforms.uMoistSeed.value.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ),
    },
    'randomize'
  )
  .name('🎲 Randomize Seed');
fWet.add(soilUniforms.uWetDarken, 'value', 0.2, 1, 0.01).name('Wet Darkening');
fWet.add(soilUniforms.uWetRoughness, 'value', 0.05, 1, 0.01).name('Wet Gloss');

const fCrack = fSoil.addFolder('Dry Cracks');
const crackParams = { enabled: false }; // disabled by default
fCrack
  .add(crackParams, 'enabled')
  .name('Enabled')
  .onChange((v) => (soilUniforms.uCrackEnabled.value = v ? 1.0 : 0.0));
fCrack.add(soilUniforms.uCrackAmount, 'value', 0, 1, 0.01).name('Crack Amount');
fCrack.add(soilUniforms.uCrackScale, 'value', 0.1, 3, 0.01).name('Plate Density');
fCrack.add(soilUniforms.uCrackWidth, 'value', 0.01, 0.25, 0.001).name('Channel Width');
fCrack.add(soilUniforms.uCrackWarp, 'value', 0, 2, 0.01).name('Edge Meander');
fCrack.add(soilUniforms.uCrackDepth, 'value', 0, 2, 0.01).name('Crack Depth');
fCrack.add(soilUniforms.uCrackSeed.value, 'x', -50, 50, 0.1).name('Seed X').listen();
fCrack.add(soilUniforms.uCrackSeed.value, 'y', -50, 50, 0.1).name('Seed Y').listen();
fCrack
  .add(
    {
      randomize: () =>
        soilUniforms.uCrackSeed.value.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ),
    },
    'randomize'
  )
  .name('🎲 Randomize Seed');

fShape.close();
fTillage.close();
fLook.close();
fWet.close();
fCrack.close();
fSoil.close();

/* --- Moss cover ------------------------------------------------------------ */
const fMoss = gui.addFolder('🌿 Moss Cover');
const mossParams = { enabled: false }; // disabled by default
fMoss
  .add(mossParams, 'enabled')
  .name('Enabled')
  .onChange((v) => (mossUniforms.uMossEnabled.value = v ? 1.0 : 0.0));

const fMossMask = fMoss.addFolder('Coverage Mask');
fMossMask.add(mossUniforms.uMossCoverage, 'value', 0, 1, 0.01).name('Coverage');
fMossMask.add(mossUniforms.uMossScale, 'value', 0.02, 0.8, 0.001).name('Patch Scale');
fMossMask.add(mossUniforms.uMossEdge, 'value', 0.001, 0.4, 0.001).name('Patch Softness');
fMossMask.add(mossUniforms.uMossSeed.value, 'x', -50, 50, 0.1).name('Seed X').listen();
fMossMask.add(mossUniforms.uMossSeed.value, 'y', -50, 50, 0.1).name('Seed Y').listen();
fMossMask
  .add(
    {
      randomize: () =>
        mossUniforms.uMossSeed.value.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ),
    },
    'randomize'
  )
  .name('🎲 Randomize Seed');
fMossMask.close();

const fMossVol = fMoss.addFolder('Height Volume');
fMossVol.add(mossUniforms.uMossDepth, 'value', 0, 1, 0.005).name('Thickness');
fMossVol.add(mossUniforms.uMossBumpScale, 'value', 0.1, 3, 0.01).name('Relief Scale');
fMossVol.add(mossUniforms.uMossBumpStrength, 'value', 0, 2, 0.01).name('Relief Strength');
fMossVol.add(mossUniforms.uMossLocality, 'value', 0, 1, 0.01).name('Vehicle Locality');
fMossVol.add(mossUniforms.uMossRadius, 'value', 2, 12, 0.05).name('Local Radius');
fMossVol.close();

const fMossLook = fMoss.addFolder('Texture & Shading');
fMossLook.add(mossUniforms.uMossTextureScale, 'value', 0.05, 2, 0.005).name('Texture Scale');
fMossLook
  .addColor({ c: '#ffffff' }, 'c')
  .name('Moss Tint')
  .onChange((v) => mossUniforms.uMossColor.value.set(v));
fMossLook.add(mossUniforms.uMossRoughness, 'value', 0, 2, 0.01).name('Roughness');
fMossLook.add(mossUniforms.uMossNormalScale, 'value', 0, 3, 0.01).name('Normal Intensity');
fMossLook.add(mossUniforms.uMossAoStrength, 'value', 0, 2, 0.01).name('AO Intensity');
fMossLook.close();

fMoss.close();

/* --- Model + moss accumulation --------------------------------------------- */
const fModel = gui.addFolder('🚗 Model');
const modelState = { showModel: false };
fModel
  .add(modelState, 'showModel')
  .name('Load Model')
  .onChange((v) => {
    model.setVisible(v);
    syncVehicleGrassInteraction();
    if (vehicleContactShadow) vehicleContactShadow.visible = model.isVisible;
  });

const modelSelect = { active: 'Rusty Car' };
fModel
  .add(modelSelect, 'active', Object.keys(MODELS))
  .name('Model')
  .onChange((k) => model.loadModel(MODELS[k]));

const fileInput = document.getElementById('glb-input');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) model.importFile(file);
  fileInput.value = ''; // allow re-importing the same file
});
fModel.add({ import: () => fileInput.click() }, 'import').name('📂 Import GLB…');

// Transform — every change re-syncs the world->model matrix so the moss stays put.
const VEHICLE_GROUND_Y = 0.24;
const modelTransform = { scale: 1, posX: 0, posY: VEHICLE_GROUND_Y, posZ: 0, rotY: 0 };
const vehicleSceneParams = { grassCrush: 1 };
function vehicleRestY() {
  const mossLift = mossUniforms.uMossEnabled.value > 0.5 ? mossUniforms.uMossDepth.value * 0.22 : 0;
  const furrowLift = soilUniforms.uTillageStrength.value * 0.018;
  return VEHICLE_GROUND_Y + mossLift + furrowLift;
}
function syncVehicleGrassInteraction() {
  grass.uniforms.uVehiclePos.value.set(modelTransform.posX, modelTransform.posZ);
  grass.uniforms.uVehicleYaw.value = THREE.MathUtils.degToRad(modelTransform.rotY);
  grass.uniforms.uVehicleInfluence.value = model.isVisible ? vehicleSceneParams.grassCrush : 0;
  soilUniforms.uVehiclePos.value.set(modelTransform.posX, modelTransform.posZ);
  soilUniforms.uVehicleYaw.value = THREE.MathUtils.degToRad(modelTransform.rotY);
  soilUniforms.uVehicleInfluence.value = model.isVisible ? vehicleSceneParams.grassCrush : 0;
}
function applyModelTransform() {
  if (model.isVisible) modelTransform.posY = vehicleRestY();
  model.group.scale.setScalar(modelTransform.scale);
  model.group.position.set(modelTransform.posX, modelTransform.posY, modelTransform.posZ);
  model.group.rotation.y = THREE.MathUtils.degToRad(modelTransform.rotY);
  model.refreshMatrix();
  syncVehicleGrassInteraction();
  if (vehicleContactShadow) {
    vehicleContactShadow.position.set(modelTransform.posX, Math.max(0.06, modelTransform.posY - 0.025), modelTransform.posZ);
    vehicleContactShadow.rotation.set(-Math.PI / 2, 0, THREE.MathUtils.degToRad(modelTransform.rotY));
    vehicleContactShadow.scale.setScalar(modelTransform.scale);
    vehicleContactShadow.visible = model.isVisible;
  }
}

const modelMaterialBase = new WeakMap();
const agedVehicleTint = new THREE.Color(0x6b604f);
function applyModelAging(amount) {
  const t = smooth01(amount);
  model.group.traverse((object) => {
    if (!object.isMesh || !object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const mat of materials) {
      if (!mat) continue;
      if (!modelMaterialBase.has(mat)) {
        modelMaterialBase.set(mat, {
          color: mat.color ? mat.color.clone() : null,
          roughness: mat.roughness,
          metalness: mat.metalness,
          envMapIntensity: mat.envMapIntensity,
        });
      }
      const base = modelMaterialBase.get(mat);
      if (mat.color && base.color) mat.color.copy(base.color).lerp(agedVehicleTint, t * 0.28);
      if (typeof base.roughness === 'number') mat.roughness = THREE.MathUtils.lerp(base.roughness, 0.94, t);
      if (typeof base.metalness === 'number') mat.metalness = THREE.MathUtils.lerp(base.metalness, base.metalness * 0.42, t);
      if (typeof base.envMapIntensity === 'number') {
        mat.envMapIntensity = THREE.MathUtils.lerp(base.envMapIntensity, base.envMapIntensity * 0.55, t);
      }
    }
  });
}
fModel.add(modelTransform, 'scale', 0.05, 10, 0.01).name('Scale').onChange(applyModelTransform);
fModel.add(modelTransform, 'posX', -10, 10, 0.01).name('Position X').onChange(applyModelTransform);
fModel.add(modelTransform, 'posY', -5, 10, 0.01).name('Position Y').onChange(applyModelTransform);
fModel.add(modelTransform, 'posZ', -10, 10, 0.01).name('Position Z').onChange(applyModelTransform);
fModel.add(modelTransform, 'rotY', 0, 360, 1).name('Rotation Y°').onChange(applyModelTransform);

const fAccum = fModel.addFolder('Moss Accumulation');
// The master on/off lives in the Moss Cover folder (uMossEnabled, shared) — the
// model mosses over exactly when the ground moss is enabled.
fAccum.add(model.moss.uMossCoverage, 'value', 0, 1, 0.01).name('Coverage');
fAccum.add(model.moss.uMossThickness, 'value', 0, 0.3, 0.001).name('Thickness');
fAccum.add(model.moss.uMossScale, 'value', 0.1, 4, 0.01).name('Patch Scale');
fAccum.add(model.moss.uMossEdge, 'value', 0.01, 0.4, 0.005).name('Patch Softness');
fAccum.add(model.moss.uMossSeed.value, 'x', -50, 50, 0.1).name('Seed X').listen();
fAccum.add(model.moss.uMossSeed.value, 'y', -50, 50, 0.1).name('Seed Y').listen();
fAccum
  .add(
    {
      randomize: () =>
        model.moss.uMossSeed.value.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ),
    },
    'randomize'
  )
  .name('🎲 Randomize Seed');
fAccum.add(model.moss.uMossFlatThreshold, 'value', 0, 1, 0.01).name('Flatness Cutoff');
fAccum.add(model.moss.uMossTexScale, 'value', 0.2, 8, 0.05).name('Texture Scale');
fAccum.add(model.moss.uMossRoughness, 'value', 0, 2, 0.01).name('Roughness');
fAccum.add(model.moss.uMossAoStrength, 'value', 0, 2, 0.01).name('AO Intensity');
fAccum.add(model.moss.uMossBump, 'value', 0, 1.5, 0.01).name('Relief Strength');
fAccum.add(model.moss.uMossBumpScale, 'value', 0.5, 8, 0.05).name('Relief Scale');
fAccum.close();
fModel.close();

/* --- Grass ----------------------------------------------------------------- */
const grassParams = { enabled: false, density: 0.13 };
const fGrass = gui.addFolder('🌱 Grass');
fGrass
  .add(grassParams, 'enabled')
  .name('Enabled')
  .onChange((v) => (grass.mesh.visible = v));
fGrass
  .add(grassParams, 'density', 0, 1, 0.01)
  .name('Density')
  .onChange((v) => grass.setDensity(v));
fGrass
  .add(vehicleSceneParams, 'grassCrush', 0, 1, 0.01)
  .name('Vehicle Crush')
  .onChange(syncVehicleGrassInteraction);

const fGrassMask = fGrass.addFolder('Coverage Mask');
fGrassMask.add(grass.uniforms.uCoverage, 'value', 0, 1, 0.01).name('Coverage');
fGrassMask.add(grass.uniforms.uMaskScale, 'value', 0.02, 0.8, 0.001).name('Patch Scale');
fGrassMask.add(grass.uniforms.uMaskEdge, 'value', 0.001, 0.4, 0.001).name('Patch Softness');
fGrassMask.add(grass.uniforms.uMaskSeed.value, 'x', -50, 50, 0.1).name('Seed X').listen();
fGrassMask.add(grass.uniforms.uMaskSeed.value, 'y', -50, 50, 0.1).name('Seed Y').listen();
fGrassMask
  .add(
    {
      randomize: () =>
        grass.uniforms.uMaskSeed.value.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ),
    },
    'randomize'
  )
  .name('🎲 Randomize Seed');
fGrassMask.close();

fGrass.add(grass.uniforms.uHeight, 'value', 0.2, 2.5, 0.01).name('Blade Height');
fGrass.add(grass.uniforms.uWidth, 'value', 0.02, 0.25, 0.001).name('Blade Width');
fGrass.add(grass.uniforms.uCurl, 'value', 0, 2.2, 0.01).name('Curl');
fGrass
  .addColor({ c: '#33421b' }, 'c')
  .name('Base Color')
  .onChange((v) => grass.uniforms.uColorBase.value.set(v));
fGrass
  .addColor({ c: '#9bc24a' }, 'c')
  .name('Tip Color')
  .onChange((v) => grass.uniforms.uColorTip.value.set(v));
fGrass.add(grass.uniforms.uColorVarAmt, 'value', 0, 0.6, 0.01).name('Color Variation');
fGrass.add(grass.uniforms.uTranslucency, 'value', 0, 2, 0.01).name('Translucency');
fGrass.add(grass.material, 'roughness', 0, 1, 0.01).name('Roughness');
fGrass.close();

/* --- Wind ------------------------------------------------------------------ */
const fWind = gui.addFolder('🍃 Wind');
fWind.add(windState, 'strength', 0, 1.2, 0.01).name('Strength').onChange(applyWind);
fWind.add(windState, 'speed', 0, 3, 0.01).name('Speed').onChange(applyWind);
fWind.add(windState, 'direction', 0, 360, 1).name('Direction °').onChange(applyWind);
fWind.add(windState, 'scale', 0.05, 0.8, 0.01).name('Gust Size').onChange(applyWind);
fWind.add(windState, 'gust', 0, 0.8, 0.01).name('Flutter').onChange(applyWind);
fWind.close();

/* --- Lighting -------------------------------------------------------------- */
const fLight = gui.addFolder('Lighting');
fLight.add(renderer, 'toneMappingExposure', 0, 3, 0.01).name('Exposure');
fLight.add(keyLight, 'intensity', 0, 8, 0.01).name('Key');
fLight.add(fillLight, 'intensity', 0, 4, 0.01).name('Fill');
fLight.add(rimLight, 'intensity', 0, 400, 1).name('Rim');
fLight.add(scene, 'environmentIntensity', 0, 2, 0.01).name('Env / IBL');

const fogState = { enabled: true, density: scene.fog.density };
function applyFog() {
  scene.fog.density = fogState.enabled ? fogState.density : 0;
}
fLight.add(fogState, 'enabled').name('Atmos Fog').onChange(applyFog);
fLight.add(fogState, 'density', 0, 0.03, 0.0005).name('Atmos Density').onChange(applyFog);
fLight.close();

/* --- Clouds (volumetric) --------------------------------------------------- */
const cloudsParams = { enabled: false, driftDir: 17 };
const fGFog = gui.addFolder('☁️ Clouds');
fGFog.add(cloudsParams, 'enabled').name('Enabled').onChange((v) => fx.fog.setEnabled(v));

const fGShape = fGFog.addFolder('Shape');
fGShape.add(fx.fog.uniforms.uBase, 'value', -3, 20, 0.05).name('Layer Height');
fGShape.add(fx.fog.uniforms.uHeight, 'value', 0.2, 12, 0.1).name('Thickness');
fGShape.add(fx.fog.uniforms.uHeightFalloff, 'value', 0, 1, 0.01).name('Ground Hug');
fGShape.add(fx.fog.uniforms.uDensity, 'value', 0, 8, 0.02).name('Density');
fGShape.add(fx.fog.uniforms.uCoverage, 'value', 0, 1, 0.01).name('Coverage');
fGShape.add(fx.fog.uniforms.uCoverageEdge, 'value', 0.01, 0.5, 0.005).name('Billow Softness');
fGShape.add(fx.fog.uniforms.uNoiseScale, 'value', 0.02, 0.6, 0.005).name('Billow Scale');
fGShape.add(fx.fog.uniforms.uDetail, 'value', 0, 1, 0.01).name('Detail');
fGShape.add(fx.fog.uniforms.uDetailScale, 'value', 1, 12, 0.1).name('Detail Scale');
fGShape.add(fx.fog.uniforms.uEdgeFade, 'value', 0, 6, 0.1).name('Edge Fade');

const fGMove = fGFog.addFolder('Motion');
fGMove.add(fx.fog.uniforms.uWindSpeed, 'value', 0, 1, 0.005).name('Drift Speed');
fGMove
  .add(cloudsParams, 'driftDir', 0, 360, 1)
  .name('Drift Direction °')
  .onChange((v) => {
    const a = THREE.MathUtils.degToRad(v);
    fx.fog.uniforms.uWindDir.value.set(Math.cos(a), Math.sin(a));
  });

const fGLight = fGFog.addFolder('Lighting & Color');
fGLight.add(fx.fog.uniforms.uSunStrength, 'value', 0, 6, 0.02).name('Sun Scatter');
fGLight.add(fx.fog.uniforms.uAniso, 'value', 0, 0.95, 0.01).name('Backlight (HG)');
fGLight.add(fx.fog.uniforms.uAmbient, 'value', 0, 1, 0.01).name('Ambient Fill');
fGLight
  .addColor({ c: '#cdd6dd' }, 'c')
  .name('Body Color')
  .onChange((v) => fx.fog.uniforms.uFogColor.value.set(v));
fGLight
  .addColor({ c: '#ffe9c8' }, 'c')
  .name('Scatter Color')
  .onChange((v) => fx.fog.uniforms.uSunColor.value.set(v));

const fGPerf = fGFog.addFolder('Quality');
const fogRes = { scale: 0.5 };
fGPerf
  .add(fogRes, 'scale', { Full: 1, Half: 0.5, Quarter: 0.25 })
  .name('Resolution')
  .onChange((v) => fx.fog.setScale(Number(v)));
fGPerf.add(fx.fog.uniforms.uSteps, 'value', 8, 96, 1).name('Steps');
fGPerf.add(fx.fog.uniforms.uLightSteps, 'value', 0, 8, 1).name('Light Steps');
fGPerf.add(fx.fog.uniforms.uLightStepSize, 'value', 0.1, 2, 0.05).name('Light Step Size');

fGShape.close();
fGMove.close();
fGLight.close();
fGPerf.close();
fGFog.close();

/* --- Cinematic ------------------------------------------------------------- */
const fCine = gui.addFolder('🎬 Cinematic');

// Anti-aliasing: MSAA happens inside the composer (the renderer's own AA is
// bypassed by post-processing). Higher = smoother thin grass, a bit more cost.
const aaParams = { msaa: Math.min(4, fx.maxSamples) };
const aaOptions = { Off: 0, '2×': 2, '4×': 4, '8×': 8 };
fCine
  .add(aaParams, 'msaa', aaOptions)
  .name('Anti-aliasing')
  .onChange((v) => fx.setSamples(Number(v)));

const fCam = fCine.addFolder('Camera');
fCam.add(cine, 'autoOrbit').name('Auto Orbit').onChange((v) => (controls.autoRotate = v));
fCam
  .add(cine, 'orbitSpeed', -3, 3, 0.05)
  .name('Orbit Speed')
  .onChange((v) => (controls.autoRotateSpeed = v));
fCam.add(cine, 'fov', 18, 80, 1).name('Focal / FOV').onChange((v) => {
  camera.fov = v;
  camera.updateProjectionMatrix();
});
fCam.add(cine, 'letterbox').name('Letterbox').onChange(applyLetterbox);

const dofParams = { enabled: false };
fx.bokeh.enabled = dofParams.enabled; // off by default — opt in when framing
const fDof = fCine.addFolder('Depth of Field');
fDof.add(dofParams, 'enabled').name('Enable DoF').onChange((v) => (fx.bokeh.enabled = v));
fDof
  .add(fx.bokeh.uniforms.focus, 'value', 1, 40, 0.1)
  .name('Focus Distance')
  .onChange(showFocusPlane);
fDof.add(fx.bokeh.uniforms.aperture, 'value', 0, 0.004, 0.00005).name('Aperture');
fDof.add(fx.bokeh.uniforms.maxblur, 'value', 0, 0.02, 0.0005).name('Max Blur');

const fFx = fCine.addFolder('Effects');
fFx.add(fx.bloom, 'strength', 0, 2, 0.01).name('Bloom');
fFx.add(fx.bloom, 'radius', 0, 2, 0.01).name('Bloom Radius');
fFx.add(fx.bloom, 'threshold', 0, 1, 0.01).name('Bloom Threshold');
fFx.add(fx.grade.uniforms.uGrain, 'value', 0, 0.25, 0.005).name('Film Grain');
fFx.add(fx.grade.uniforms.uVignette, 'value', 0, 1.5, 0.01).name('Vignette');
fFx.add(fx.grade.uniforms.uChroma, 'value', 0, 0.01, 0.0001).name('Chromatic Aberration');
fFx.add(fx.grade.uniforms.uContrast, 'value', 0.7, 1.6, 0.01).name('Contrast');
fFx.add(fx.grade.uniforms.uSaturation, 'value', 0, 2, 0.01).name('Saturation');
fCine.close();

/* --- Capability demo ------------------------------------------------------ */
const demoOverlay = document.createElement('div');
demoOverlay.className = 'cap-overlay';
demoOverlay.innerHTML = `
  <div class="cap-kicker">Realtime WebGL Capability Demo</div>
  <div class="cap-title">Ready</div>
  <div class="cap-copy">Press Play Full Scene Demo to watch the scene build up in stages.</div>
  <div class="cap-meter"><span></span></div>
`;
Object.assign(demoOverlay.style, {
  position: 'fixed',
  left: '24px',
  top: '9vh',
  zIndex: '70',
  width: 'min(360px, calc(100vw - 48px))',
  padding: '18px 18px 16px',
  color: '#efe7dc',
  background: 'linear-gradient(180deg, rgba(18,15,12,0.68), rgba(18,15,12,0.34))',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  boxShadow: '0 22px 55px rgba(0,0,0,0.38)',
  backdropFilter: 'blur(14px) saturate(1.15)',
  pointerEvents: 'none',
  opacity: '0',
  transform: 'translateY(8px)',
  transition: 'opacity 0.35s ease, transform 0.35s ease',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
});
document.body.appendChild(demoOverlay);

const demoOverlayStyle = document.createElement('style');
demoOverlayStyle.textContent = `
  .cap-kicker { color: #d9a066; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 9px; }
  .cap-title { font-size: 24px; line-height: 1.08; font-weight: 650; margin-bottom: 8px; }
  .cap-copy { max-width: 31em; color: rgba(239,231,220,.74); font-size: 13px; line-height: 1.45; }
  .cap-meter { height: 3px; margin-top: 15px; overflow: hidden; border-radius: 99px; background: rgba(255,255,255,.13); }
  .cap-meter span { display: block; height: 100%; width: 0%; background: #d9a066; transition: width .12s linear; }
  .presentation-timeline {
    position: fixed;
    left: 50%;
    bottom: 28px;
    transform: translate(-50%, 12px);
    z-index: 80;
    width: min(760px, calc(100vw - 48px));
    padding: 12px 14px 13px;
    color: #efe7dc;
    background: linear-gradient(180deg, rgba(18,15,12,.72), rgba(18,15,12,.38));
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 10px;
    box-shadow: 0 22px 55px rgba(0,0,0,.34);
    backdrop-filter: blur(14px) saturate(1.15);
    opacity: 0;
    pointer-events: none;
    transition: opacity .28s ease, transform .28s ease;
    font-family: Inter, system-ui, -apple-system, sans-serif;
  }
  .presentation-timeline.is-active { opacity: 1; pointer-events: auto; transform: translate(-50%, 0); }
  .timeline-row { display: flex; align-items: center; gap: 10px; }
  .presentation-timeline input { width: 100%; accent-color: #d9a066; }
  .demo-exit {
    flex: 0 0 auto;
    height: 26px;
    padding: 0 10px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 6px;
    color: rgba(239,231,220,.86);
    background: rgba(255,255,255,.07);
    cursor: pointer;
  }
  .stage-jumpers { display: flex; gap: 5px; margin-top: 8px; overflow-x: auto; padding-bottom: 1px; }
  .stage-jumpers button {
    flex: 0 0 auto;
    min-width: 28px;
    height: 24px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 6px;
    color: rgba(239,231,220,.8);
    background: rgba(255,255,255,.06);
    cursor: pointer;
  }
  .stage-jumpers button.is-current { color: #171311; background: #d9a066; border-color: #d9a066; }
  .demo-advance {
    position: fixed;
    right: 24px;
    bottom: 28px;
    z-index: 90;
    height: 38px;
    min-width: 116px;
    padding: 0 16px;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 8px;
    color: #171311;
    background: #d9a066;
    box-shadow: 0 18px 45px rgba(0,0,0,.32);
    cursor: pointer;
    font: 650 13px/1 Inter, system-ui, -apple-system, sans-serif;
    transition: transform .25s ease, bottom .25s ease, background .2s ease;
  }
  .demo-advance:hover { background: #e8b27b; transform: translateY(-1px); }
  .demo-advance.is-running { bottom: 104px; }
  .video-actions {
    position: fixed;
    right: 24px;
    top: 24px;
    z-index: 95;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: Inter, system-ui, -apple-system, sans-serif;
  }
  .video-actions button {
    height: 34px;
    padding: 0 12px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 8px;
    color: #efe7dc;
    background: rgba(18,15,12,.64);
    box-shadow: 0 14px 35px rgba(0,0,0,.28);
    backdrop-filter: blur(12px) saturate(1.15);
    cursor: pointer;
    font: 650 12px/1 Inter, system-ui, -apple-system, sans-serif;
  }
  .video-actions button.primary {
    color: #171311;
    background: #d9a066;
    border-color: #d9a066;
  }
  .video-actions button:disabled { opacity: .45; cursor: default; }
  .video-status {
    min-width: 82px;
    color: rgba(239,231,220,.74);
    font-size: 11px;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  body.video-mode .cap-overlay,
  body.video-mode .presentation-timeline,
  body.video-mode .demo-advance,
  body.video-mode .lil-gui {
    opacity: 0 !important;
    pointer-events: none !important;
  }
  @media (max-width: 720px) {
    .demo-advance { right: 14px; bottom: 18px; min-width: 104px; }
    .demo-advance.is-running { bottom: 118px; }
    .video-actions { left: 14px; right: 14px; top: 14px; justify-content: flex-end; }
  }
`;
document.head.appendChild(demoOverlayStyle);

const videoActions = document.createElement('div');
videoActions.className = 'video-actions';
videoActions.innerHTML = `
  <button class="video-record primary" type="button">Record Video</button>
  <button class="video-douyin" type="button">Record System Film</button>
  <button class="video-stop" type="button" disabled>Stop</button>
  <span class="video-status">Ready</span>
`;
document.body.appendChild(videoActions);
const videoRecordButton = videoActions.querySelector('.video-record');
const videoDouyinButton = videoActions.querySelector('.video-douyin');
const videoStopButton = videoActions.querySelector('.video-stop');
const videoStatus = videoActions.querySelector('.video-status');

const demoAdvance = document.createElement('button');
demoAdvance.className = 'demo-advance';
demoAdvance.type = 'button';
demoAdvance.textContent = '开始演示';
document.body.appendChild(demoAdvance);

const demoControls = document.createElement('div');
demoControls.className = 'presentation-timeline';
demoControls.innerHTML = `
  <div class="timeline-row">
    <input class="demo-scrub" type="range" min="0" max="1000" value="0" />
    <button class="demo-exit" type="button">Exit</button>
  </div>
  <div class="stage-jumpers"></div>
`;
document.body.appendChild(demoControls);
const demoScrub = demoControls.querySelector('.demo-scrub');
const demoExit = demoControls.querySelector('.demo-exit');
const demoJumpers = demoControls.querySelector('.stage-jumpers');

const capabilityDemo = {
  active: false,
  elapsed: 0,
  speed: 1,
  loop: false,
  presentationMode: true,
  stage: 'Idle',
  progress: 0,
  play: () => startCapabilityDemo(),
  stop: () => stopCapabilityDemo(),
};

const demoCam = {
  position: new THREE.Vector3(),
  target: new THREE.Vector3(),
  previousPosition: new THREE.Vector3(),
  previousTarget: new THREE.Vector3(),
};

const demoStages = [
  {
    name: '1. Soil Forms First',
    copy: 'The scene starts with a wide terrain read: PBR soil maps, procedural mounds, and live height displacement establish the physical ground.',
    duration: 5,
    position: new THREE.Vector3(12.8, 8.2, 17.5),
    target: new THREE.Vector3(0, 0.2, 0),
    fov: 48,
    breathe: 0.28,
    apply: (t) => {
      modelState.showModel = false;
      model.setVisible(false);
      applyModelAging(0);
      mossParams.enabled = false;
      mossUniforms.uMossEnabled.value = 0;
      grassParams.enabled = false;
      grass.mesh.visible = false;
      grass.setDensity(0);
      grass.uniforms.uHeight.value = 0.35;
      grass.uniforms.uCoverage.value = 0;
      cloudsParams.enabled = false;
      fx.fog.setEnabled(false);
      soilUniforms.uMoundDepth.value = THREE.MathUtils.lerp(0.08, 0.34, t);
      soilUniforms.uBumpStrength.value = THREE.MathUtils.lerp(0.32, 0.64, t);
      soilUniforms.uTillageStrength.value = THREE.MathUtils.lerp(0.04, 0.42, t);
      soilUniforms.uRootPresence.value = 0;
      soilUniforms.uOrganicScatter.value = THREE.MathUtils.lerp(0.18, 0.36, t);
      soilUniforms.uCrackEnabled.value = 0;
      soilUniforms.uMoisture.value = 0.16;
      fx.bokeh.enabled = false;
    },
  },
  {
    name: '2. Wide Vehicle Panorama',
    copy: 'The car appears at real size in a wide product panorama, so the vehicle, soil platform, and sky atmosphere read as one scene.',
    duration: 6,
    position: new THREE.Vector3(13.6, 6.6, 16.2),
    target: new THREE.Vector3(0, 1.05, 0),
    fov: 50,
    breathe: 0.38,
    dragInspect: {
      radius: 17.2,
      start: -38,
      end: 82,
      height: 5.1,
      heightWave: 0.75,
    },
    apply: (t) => {
      modelState.showModel = true;
      model.setVisible(true);
      modelTransform.scale = 1;
      modelTransform.rotY = -8;
      modelTransform.posY = VEHICLE_GROUND_Y;
      applyModelAging(THREE.MathUtils.lerp(0, 0.04, t));
      mossUniforms.uMossEnabled.value = 0;
      mossParams.enabled = false;
      grass.setDensity(0);
      grass.mesh.visible = false;
      cloudsParams.enabled = true;
      fx.fog.setEnabled(true);
      scene.background = demoSkyColor.set(0x1c1914);
      scene.fog.color.copy(demoFogColor.set(0x1c1914));
      fx.fog.uniforms.uBase.value = THREE.MathUtils.lerp(10.5, 8.5, t);
      fx.fog.uniforms.uHeight.value = 4.8;
      fx.fog.uniforms.uDensity.value = THREE.MathUtils.lerp(0.03, 0.16, t);
      fx.fog.uniforms.uCoverage.value = THREE.MathUtils.lerp(0.04, 0.13, t);
      fx.fog.uniforms.uFogColor.value.set(0xc8c3a8);
      fx.fog.uniforms.uSunColor.value.set(0xffd7a1);
      fx.fog.uniforms.uWindSpeed.value = 0.035;
      fogState.enabled = true;
      fogState.density = 0.003;
      applyFog();
    },
  },
  {
    name: '3. Mouse Orbit Walkaround',
    copy: 'A wider mouse-like orbit checks front, side, rear, high, and low angles without pushing the camera into the model.',
    duration: 8,
    position: new THREE.Vector3(10.8, 5.8, 12.4),
    target: new THREE.Vector3(0, 1.05, 0),
    fov: 44,
    breathe: 0.32,
    dragInspect: {
      radius: 13.8,
      start: -52,
      end: 250,
      height: 4.0,
      heightWave: 1.15,
    },
    apply: (t) => {
      modelState.showModel = true;
      model.setVisible(true);
      modelTransform.scale = 1;
      modelTransform.rotY = -8;
      modelTransform.posY = VEHICLE_GROUND_Y;
      applyModelAging(THREE.MathUtils.lerp(0.04, 0.08, t));
      mossUniforms.uMossEnabled.value = 0;
      mossParams.enabled = false;
      grass.setDensity(0);
      grass.mesh.visible = false;
      fx.fog.setEnabled(true);
      scene.background = demoSkyColor.set(0x1d1a15);
      scene.fog.color.copy(demoFogColor.set(0x1d1a15));
      fx.fog.uniforms.uBase.value = 8.4;
      fx.fog.uniforms.uHeight.value = 5.4;
      fx.fog.uniforms.uDensity.value = 0.13;
      fx.fog.uniforms.uCoverage.value = 0.12;
      fx.fog.uniforms.uFogColor.value.set(0xc5c3ac);
      fx.fog.uniforms.uSunColor.value.set(0xffd8a8);
    },
  },
  {
    name: '4. Light + Shadow Sweep',
    copy: 'Key, fill, rim light, exposure, and shadows are animated to make the 3D volume and material response visible before nature takes over.',
    duration: 5,
    position: new THREE.Vector3(11.4, 5.4, 12.8),
    target: new THREE.Vector3(0, 1.0, 0),
    fov: 43,
    breathe: 0.24,
    dragInspect: {
      radius: 12.6,
      start: 34,
      end: -42,
      height: 4.0,
      heightWave: 0.72,
    },
    apply: (t) => {
      modelTransform.scale = 1;
      modelTransform.posY = VEHICLE_GROUND_Y;
      modelTransform.rotY = -8;
      applyModelAging(THREE.MathUtils.lerp(0.08, 0.18, t));
      keyLight.position.set(THREE.MathUtils.lerp(9, -5, t), 12, THREE.MathUtils.lerp(7, 4, t));
      keyLight.intensity = THREE.MathUtils.lerp(2.8, 5.8, Math.sin(t * Math.PI));
      fillLight.intensity = THREE.MathUtils.lerp(0.25, 1.15, t);
      rimLight.intensity = THREE.MathUtils.lerp(90, 240, t);
      renderer.toneMappingExposure = THREE.MathUtils.lerp(0.76, 1.08, Math.sin(t * Math.PI));
      scene.environmentIntensity = THREE.MathUtils.lerp(0.32, 0.72, t);
      mossUniforms.uMossEnabled.value = 0;
      grass.setDensity(0);
      grass.mesh.visible = false;
    },
  },
  {
    name: '5. Moss Spreads + Car Ages',
    copy: 'Moss grows first in sheltered, damp zones around the vehicle and across upward-facing car surfaces instead of covering the whole field.',
    duration: 6,
    position: new THREE.Vector3(10.6, 5.1, 12.2),
    target: new THREE.Vector3(0, 1.05, 0),
    fov: 42,
    breathe: 0.2,
    apply: (t) => {
      modelTransform.scale = 1;
      modelTransform.posY = VEHICLE_GROUND_Y;
      modelTransform.rotY = -8;
      applyModelAging(THREE.MathUtils.lerp(0.18, 0.38, t));
      mossParams.enabled = true;
      mossUniforms.uMossEnabled.value = 1;
      mossUniforms.uMossCoverage.value = THREE.MathUtils.lerp(0.05, 0.42, t);
      mossUniforms.uMossDepth.value = THREE.MathUtils.lerp(0.012, 0.095, t);
      mossUniforms.uMossLocality.value = THREE.MathUtils.lerp(0.55, 0.96, t);
      mossUniforms.uMossRadius.value = THREE.MathUtils.lerp(3.8, 5.4, t);
      mossUniforms.uMossTextureScale.value = 0.42;
      mossUniforms.uMossNormalScale.value = 1.35;
      model.moss.uMossCoverage.value = THREE.MathUtils.lerp(0.05, 0.64, t);
      model.moss.uMossThickness.value = THREE.MathUtils.lerp(0.006, 0.066, t);
      soilUniforms.uRootPresence.value = THREE.MathUtils.lerp(0.05, 0.18, t);
      grass.setDensity(0);
      grass.mesh.visible = false;
    },
  },
  {
    name: '6. Grass Germination',
    copy: 'Grass grows from short sprouts into a denser field. Density and blade height rise together to show growth, not a pop-in toggle.',
    duration: 6,
    position: new THREE.Vector3(9.4, 4.4, 11.0),
    target: new THREE.Vector3(0, 0.9, 0),
    fov: 42,
    breathe: 0.22,
    apply: (t) => {
      grassParams.enabled = true;
      modelTransform.scale = 1;
      modelTransform.posY = VEHICLE_GROUND_Y;
      modelTransform.rotY = -8;
      grass.mesh.visible = true;
      grassParams.density = THREE.MathUtils.lerp(0.025, 0.16, t);
      grass.setDensity(grassParams.density);
      grass.uniforms.uCoverage.value = THREE.MathUtils.lerp(0.32, 0.62, t);
      grass.uniforms.uHeight.value = THREE.MathUtils.lerp(0.28, 1.05, t);
      grass.uniforms.uWidth.value = THREE.MathUtils.lerp(0.026, 0.044, t);
      soilUniforms.uRootPresence.value = THREE.MathUtils.lerp(0.18, 0.44, t);
      soilUniforms.uMoisture.value = THREE.MathUtils.lerp(0.18, 0.26, t);
      applyModelAging(THREE.MathUtils.lerp(0.38, 0.48, t));
      windState.strength = 0.08;
      windState.speed = 0.45;
      windState.scale = 0.13;
      windState.gust = 0.08;
      applyWind();
    },
  },
  {
    name: '7. Uneven Wild Growth + Wind',
    copy: 'The middle section shows the best tall-and-short grass read: varied blade attributes, rising coverage, and a coherent wind field.',
    duration: 6,
    position: new THREE.Vector3(8.6, 4.2, 10.4),
    target: new THREE.Vector3(0, 1.05, 0),
    fov: 43,
    breathe: 0.24,
    apply: (t) => {
      modelTransform.scale = 1;
      modelTransform.posY = VEHICLE_GROUND_Y;
      modelTransform.rotY = -8;
      grass.mesh.visible = true;
      grassParams.density = THREE.MathUtils.lerp(0.16, 0.26, t);
      grass.setDensity(grassParams.density);
      grass.uniforms.uCoverage.value = THREE.MathUtils.lerp(0.62, 0.76, t);
      grass.uniforms.uHeight.value = THREE.MathUtils.lerp(1.05, 1.5, t);
      grass.uniforms.uWidth.value = THREE.MathUtils.lerp(0.044, 0.055, t);
      grass.uniforms.uCurl.value = THREE.MathUtils.lerp(0.7, 1.3, t);
      soilUniforms.uRootPresence.value = THREE.MathUtils.lerp(0.44, 0.68, t);
      applyModelAging(THREE.MathUtils.lerp(0.48, 0.62, t));
      windState.strength = THREE.MathUtils.lerp(0.16, 0.62, t);
      windState.speed = THREE.MathUtils.lerp(0.55, 1.25, t);
      windState.scale = THREE.MathUtils.lerp(0.13, 0.18, t);
      windState.gust = THREE.MathUtils.lerp(0.1, 0.34, t);
      windState.direction = THREE.MathUtils.lerp(34, 48, t);
      applyWind();
    },
  },
  {
    name: '8. Cloud + Atmosphere Pass',
    copy: 'A panoramic cloud pass brings back the volumetric layer, drifting haze, sun scatter, and the wider environmental mood.',
    duration: 8,
    position: new THREE.Vector3(22.0, 14.0, 24.0),
    target: new THREE.Vector3(0, 2.2, 0),
    fov: 58,
    breathe: 0.55,
    dragInspect: {
      radius: 25.5,
      start: 70,
      end: 150,
      height: 10.8,
      heightWave: 1.1,
    },
    apply: (t) => {
      modelTransform.scale = 1;
      modelTransform.posY = VEHICLE_GROUND_Y;
      modelTransform.rotY = -8;
      applyModelAging(0.7);
      grassParams.density = 0.26;
      grass.setDensity(grassParams.density);
      grass.uniforms.uCoverage.value = 0.76;
      grass.uniforms.uHeight.value = 1.5;
      windState.strength = THREE.MathUtils.lerp(0.46, 0.62, t);
      windState.speed = THREE.MathUtils.lerp(0.9, 1.2, t);
      windState.scale = 0.17;
      windState.gust = THREE.MathUtils.lerp(0.24, 0.36, t);
      applyWind();
      cloudsParams.enabled = true;
      fx.fog.setEnabled(true);
      scene.background = demoSkyColor.set(0x22291f);
      scene.fog.color.copy(demoFogColor.set(0x2b3328));
      fx.fog.uniforms.uBase.value = THREE.MathUtils.lerp(8.0, 5.2, t);
      fx.fog.uniforms.uHeight.value = THREE.MathUtils.lerp(7.0, 11.0, t);
      fx.fog.uniforms.uDensity.value = THREE.MathUtils.lerp(0.42, 1.12, t);
      fx.fog.uniforms.uCoverage.value = THREE.MathUtils.lerp(0.26, 0.5, t);
      fx.fog.uniforms.uCoverageEdge.value = 0.16;
      fx.fog.uniforms.uNoiseScale.value = 0.075;
      fx.fog.uniforms.uDetail.value = 0.58;
      fx.fog.uniforms.uDetailScale.value = 5.5;
      fx.fog.uniforms.uWindSpeed.value = 0.11;
      fx.fog.uniforms.uFogColor.value.set(0xb9c6a8);
      fx.fog.uniforms.uSunColor.value.set(0xffdb9f);
      fx.fog.uniforms.uSunStrength.value = THREE.MathUtils.lerp(1.6, 3.8, t);
      fx.fog.uniforms.uAmbient.value = THREE.MathUtils.lerp(0.34, 0.58, t);
      fx.bokeh.enabled = false;
      fogState.enabled = true;
      fogState.density = THREE.MathUtils.lerp(0.004, 0.0065, t);
      applyFog();
    },
  },
  {
    name: '9. Weathering + Decay',
    copy: 'Moisture, cracks, moss accumulation, cloud volume, and atmospheric grading deepen the abandoned-car story without reversing grass growth.',
    duration: 6,
    position: new THREE.Vector3(10.4, 6.2, 12.6),
    target: new THREE.Vector3(0, 1.05, 0),
    fov: 43,
    breathe: 0.26,
    apply: (t) => {
      modelTransform.scale = 1;
      modelTransform.posY = VEHICLE_GROUND_Y;
      modelTransform.rotY = -8;
      grassParams.density = 0.26;
      grass.setDensity(grassParams.density);
      grass.uniforms.uCoverage.value = 0.76;
      grass.uniforms.uHeight.value = 1.5;
      applyModelAging(THREE.MathUtils.lerp(0.62, 0.88, t));
      cloudsParams.enabled = true;
      fx.fog.setEnabled(true);
      scene.background = demoSkyColor.set(0x20261e);
      scene.fog.color.copy(demoFogColor.set(0x293025));
      fx.fog.uniforms.uBase.value = THREE.MathUtils.lerp(8, 4.3, t);
      fx.fog.uniforms.uHeight.value = THREE.MathUtils.lerp(2.5, 4.6, t);
      fx.fog.uniforms.uDensity.value = THREE.MathUtils.lerp(0.05, 0.42, t);
      fx.fog.uniforms.uCoverage.value = THREE.MathUtils.lerp(0.12, 0.22, t);
      fx.fog.uniforms.uFogColor.value.set(0xb8c2a4);
      fx.fog.uniforms.uSunColor.value.set(0xffd7a0);
      dofParams.enabled = true;
      fx.bokeh.enabled = true;
      fx.bokeh.uniforms.aperture.value = THREE.MathUtils.lerp(0.0005, 0.0011, t);
      fx.bokeh.uniforms.maxblur.value = 0.005;
      soilUniforms.uMoisture.value = THREE.MathUtils.lerp(0.16, 0.32, t);
      soilUniforms.uRootPresence.value = THREE.MathUtils.lerp(0.68, 0.82, t);
      soilUniforms.uCrackEnabled.value = t > 0.82 ? 1 : 0;
      soilUniforms.uCrackAmount.value = THREE.MathUtils.lerp(0.01, 0.055, smooth01((t - 0.82) / 0.18));
      mossUniforms.uMossEnabled.value = 1;
      mossUniforms.uMossCoverage.value = THREE.MathUtils.lerp(0.42, 0.48, t);
      mossUniforms.uMossDepth.value = THREE.MathUtils.lerp(0.095, 0.105, t);
      mossUniforms.uMossLocality.value = 0.96;
      mossUniforms.uMossRadius.value = 5.6;
      model.moss.uMossCoverage.value = THREE.MathUtils.lerp(0.64, 0.74, t);
      model.moss.uMossThickness.value = THREE.MathUtils.lerp(0.066, 0.086, t);
      windState.strength = THREE.MathUtils.lerp(0.58, 0.68, t);
      windState.speed = THREE.MathUtils.lerp(0.95, 1.12, t);
      windState.scale = THREE.MathUtils.lerp(0.18, 0.22, t);
      windState.gust = THREE.MathUtils.lerp(0.28, 0.38, t);
      windState.direction = THREE.MathUtils.lerp(42, 50, t);
      applyWind();
      fx.bloom.strength = THREE.MathUtils.lerp(0.05, 0.2, t);
      fx.grade.uniforms.uVignette.value = THREE.MathUtils.lerp(0.18, 0.48, t);
      fx.grade.uniforms.uGrain.value = 0.03;
      fogState.enabled = true;
      fogState.density = THREE.MathUtils.lerp(0.004, 0.007, t);
      applyFog();
    },
  },
  {
    name: '10. Stable Overgrown Scene',
    copy: 'The final shot holds the irreversible result: soil, aged car, moss, tall grass, wind, atmosphere, and cinema post FX all active together.',
    duration: 7,
    position: new THREE.Vector3(12.8, 7.8, 15.2),
    target: new THREE.Vector3(0, 1.0, 0),
    fov: 48,
    breathe: 0.34,
    apply: (t) => {
      modelTransform.scale = 1;
      modelTransform.posY = VEHICLE_GROUND_Y;
      modelTransform.rotY = -8;
      applyModelAging(0.92);
      grassParams.density = 0.26;
      grass.setDensity(grassParams.density);
      grass.uniforms.uCoverage.value = 0.76;
      grass.uniforms.uHeight.value = 1.5;
      mossParams.enabled = true;
      mossUniforms.uMossEnabled.value = 1;
      mossUniforms.uMossCoverage.value = 0.48;
      mossUniforms.uMossDepth.value = 0.105;
      mossUniforms.uMossLocality.value = 0.96;
      mossUniforms.uMossRadius.value = 5.6;
      model.moss.uMossCoverage.value = 0.74;
      model.moss.uMossThickness.value = 0.086;
      windState.strength = 0.72;
      windState.speed = 1.05;
      windState.scale = 0.23;
      windState.gust = 0.4;
      windState.direction = 48;
      applyWind();
      fx.fog.setEnabled(true);
      scene.background = demoSkyColor.set(0x20261f);
      scene.fog.color.copy(demoFogColor.set(0x293025));
      fx.fog.uniforms.uBase.value = 4.8;
      fx.fog.uniforms.uHeight.value = 4.0;
      fx.fog.uniforms.uDensity.value = 0.24;
      fx.fog.uniforms.uCoverage.value = 0.16;
      fx.fog.uniforms.uFogColor.value.set(0xb7c0a3);
      fx.fog.uniforms.uSunColor.value.set(0xffd8a6);
      fx.bokeh.uniforms.aperture.value = 0.0004;
      fx.bokeh.uniforms.maxblur.value = 0.0035;
      fogState.enabled = true;
      fogState.density = 0.0055;
      applyFog();
    },
  },
];

const demoTotalDuration = demoStages.reduce((sum, stage) => sum + stage.duration, 0);
const demoStageStarts = demoStages.reduce((starts, stage, index) => {
  starts[index] = index === 0 ? 0 : starts[index - 1] + demoStages[index - 1].duration;
  return starts;
}, []);

const videoStageCaptions = [
  'Procedural soil displacement establishes the physical ground before vegetation appears.',
  'A weathered product model enters the scene without scale tricks or camera-only spectacle.',
  'Guided orbit shots reveal the model from multiple viewing angles.',
  'Animated key, fill, rim light, exposure, and shadows show material response.',
  'Moss growth and surface weathering turn static assets into a changing environment.',
  'GPU-instanced blades germinate through shader-controlled coverage and density.',
  'Wind, curl, height variation, and vehicle crush create a living grass field.',
  'Clouds, haze, fog, and sun scatter build a publishable atmosphere pass.',
  'Decay, moisture, crack controls, and aging push the scene toward a final look.',
  'The final hero frame presents the complete GrassSystemThreeJS capability stack.',
];

const systemFilmLabels = [
  { title: 'Terrain Surface', caption: '建立可生长的真实地表：材质、湿度、起伏' },
  { title: 'Soil Detail Shader', caption: '地表细节由 shader 控制，而不是静态贴图' },
  { title: 'Model Contact', caption: '模型接地后建立阴影、湿土和交互区域' },
  { title: 'Product Orbit', caption: '围绕主体观察模型、材质和空间关系' },
  { title: 'Moss Shader', caption: '苔藓和老化通过参数逐步覆盖车身' },
  { title: 'GPU Grass Instances', caption: '草叶从小芽到草丛，由 GPU 批量生成' },
  { title: 'Coverage + Crush', caption: '覆盖率、高度变化和车辆压草共同成型' },
  { title: 'Wind Field', caption: '风场带噪声和延迟，不同草丛错峰摆动' },
  { title: 'Cloud / Fog PostFX', caption: '云雾、散射和后期把场景统一成电影感' },
  { title: 'Full System Stack', caption: 'Three.js + WebGL + shader + 参数动画整合展示' },
];

const douyinShots = [
  {
    duration: 2.2,
    title: '01 / 构建地表',
    narration: '从空场开始，先建立真实土地和空间尺度',
    from: {
      camera: [10.8, 5.4, 10.4],
      target: [-3.2, 0.08, -2.0],
      fov: 46,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0,
      aging: 0,
      moss: 0,
      mossDepth: 0,
      modelMoss: 0,
      grassDensity: 0,
      grassCoverage: 0,
      grassHeight: 0.25,
      grassCurl: 0.7,
      windStrength: 0.02,
      windSpeed: 0.2,
      windScale: 0.11,
      windGust: 0.02,
      windDirection: 34,
      clouds: 0,
      fogDensity: 0.0025,
    },
    to: {
      camera: [8.8, 3.8, 8.4],
      target: [-2.2, 0.14, -1.4],
      fov: 42,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0,
      aging: 0.02,
      moss: 0.02,
      mossDepth: 0.01,
      modelMoss: 0,
      grassDensity: 0,
      grassCoverage: 0,
      grassHeight: 0.25,
      grassCurl: 0.7,
      windStrength: 0.03,
      windSpeed: 0.24,
      windScale: 0.11,
      windGust: 0.03,
      windDirection: 34,
      clouds: 0.02,
      fogDensity: 0.003,
    },
  },
  {
    duration: 3.2,
    title: '02 / 地表细节',
    narration: '材质、湿度、裂纹和起伏让平面变成地面',
    from: {
      camera: [7.2, 1.85, 7.0],
      target: [-2.0, 0.14, -0.9],
      fov: 37,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0,
      aging: 0.02,
      moss: 0.02,
      mossDepth: 0.01,
      modelMoss: 0,
      grassDensity: 0,
      grassCoverage: 0,
      grassHeight: 0.25,
      grassCurl: 0.7,
      windStrength: 0.03,
      windSpeed: 0.24,
      windScale: 0.11,
      windGust: 0.03,
      windDirection: 34,
      clouds: 0.02,
      fogDensity: 0.003,
    },
    to: {
      camera: [6.9, 2.15, 6.0],
      target: [-0.7, 0.34, -0.25],
      fov: 36,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0,
      aging: 0.06,
      moss: 0.06,
      mossDepth: 0.02,
      modelMoss: 0,
      grassDensity: 0,
      grassCoverage: 0,
      grassHeight: 0.25,
      grassCurl: 0.7,
      windStrength: 0.04,
      windSpeed: 0.28,
      windScale: 0.12,
      windGust: 0.04,
      windDirection: 35,
      clouds: 0.04,
      fogDensity: 0.0032,
    },
  },
  {
    duration: 4.0,
    title: '03 / 加载产品模型',
    narration: '车辆进入地表，建立接地、阴影和交互区域',
    from: {
      camera: [6.9, 2.6, 6.4],
      target: [-0.8, 0.62, -0.2],
      fov: 39,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0,
      aging: 0.04,
      moss: 0.04,
      mossDepth: 0.01,
      modelMoss: 0,
      grassDensity: 0,
      grassCoverage: 0,
      grassHeight: 0.25,
      grassCurl: 0.7,
      windStrength: 0.04,
      windSpeed: 0.28,
      windScale: 0.12,
      windGust: 0.04,
      windDirection: 35,
      clouds: 0.05,
      fogDensity: 0.0033,
    },
    to: {
      camera: [7.8, 3.15, 7.2],
      target: [0, 0.94, 0],
      fov: 39,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0.35,
      aging: 0.08,
      moss: 0.06,
      mossDepth: 0.02,
      modelMoss: 0.02,
      grassDensity: 0,
      grassCoverage: 0,
      grassHeight: 0.25,
      grassCurl: 0.7,
      windStrength: 0.05,
      windSpeed: 0.32,
      windScale: 0.12,
      windGust: 0.04,
      windDirection: 36,
      clouds: 0.06,
      fogDensity: 0.0035,
    },
  },
  {
    duration: 5.0,
    title: '04 / 产品观察',
    narration: '相机环绕主体，展示模型、材质和空间关系',
    from: {
      camera: [7.8, 3.15, 7.2],
      target: [0, 0.95, 0],
      fov: 39,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0.35,
      aging: 0.08,
      moss: 0.06,
      mossDepth: 0.02,
      modelMoss: 0.02,
      grassDensity: 0,
      grassCoverage: 0,
      grassHeight: 0.25,
      grassCurl: 0.7,
      windStrength: 0.05,
      windSpeed: 0.32,
      windScale: 0.12,
      windGust: 0.04,
      windDirection: 36,
      clouds: 0.06,
      fogDensity: 0.0035,
    },
    to: {
      camera: [-7.4, 3.7, 7.2],
      target: [0, 1.0, 0],
      fov: 40,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0.42,
      aging: 0.12,
      moss: 0.08,
      mossDepth: 0.02,
      modelMoss: 0.04,
      grassDensity: 0,
      grassCoverage: 0,
      grassHeight: 0.25,
      grassCurl: 0.7,
      windStrength: 0.06,
      windSpeed: 0.34,
      windScale: 0.12,
      windGust: 0.05,
      windDirection: 38,
      clouds: 0.08,
      fogDensity: 0.0038,
    },
  },
  {
    duration: 5.5,
    title: '05 / 表面变化',
    narration: 'shader 参数驱动老化、苔藓和材质细节',
    from: {
      camera: [-7.4, 3.7, 7.2],
      target: [0, 1.0, 0],
      fov: 40,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0.45,
      aging: 0.14,
      moss: 0.08,
      mossDepth: 0.02,
      modelMoss: 0.05,
      grassDensity: 0,
      grassCoverage: 0.04,
      grassHeight: 0.25,
      grassCurl: 0.72,
      windStrength: 0.06,
      windSpeed: 0.34,
      windScale: 0.12,
      windGust: 0.05,
      windDirection: 38,
      clouds: 0.08,
      fogDensity: 0.0038,
    },
    to: {
      camera: [-5.4, 3.0, 5.6],
      target: [0.25, 1.04, 0.1],
      fov: 37,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0.5,
      aging: 0.46,
      moss: 0.56,
      mossDepth: 0.13,
      modelMoss: 0.7,
      grassDensity: 0.02,
      grassCoverage: 0.14,
      grassHeight: 0.32,
      grassCurl: 0.78,
      windStrength: 0.08,
      windSpeed: 0.42,
      windScale: 0.13,
      windGust: 0.06,
      windDirection: 39,
      clouds: 0.11,
      fogDensity: 0.004,
    },
  },
  {
    duration: 7.0,
    title: '06 / GPU 草开始生长',
    narration: '大量草叶由实例化和 shader 批量生成',
    from: {
      camera: [-5.4, 3.0, 5.6],
      target: [0.25, 1.04, 0.1],
      fov: 37,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0.55,
      aging: 0.48,
      moss: 0.58,
      mossDepth: 0.13,
      modelMoss: 0.72,
      grassDensity: 0.01,
      grassCoverage: 0.1,
      grassHeight: 0.26,
      grassCurl: 0.74,
      windStrength: 0.08,
      windSpeed: 0.42,
      windScale: 0.13,
      windGust: 0.06,
      windDirection: 39,
      clouds: 0.12,
      fogDensity: 0.004,
    },
    to: {
      camera: [7.2, 4.8, 7.0],
      target: [0, 0.72, 0],
      fov: 44,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0.75,
      aging: 0.58,
      moss: 0.72,
      mossDepth: 0.16,
      modelMoss: 0.84,
      grassDensity: 0.16,
      grassCoverage: 0.52,
      grassHeight: 0.72,
      grassCurl: 0.9,
      windStrength: 0.14,
      windSpeed: 0.52,
      windScale: 0.14,
      windGust: 0.1,
      windDirection: 42,
      clouds: 0.16,
      fogDensity: 0.0045,
    },
  },
  {
    duration: 5.5,
    title: '07 / 草地成型',
    narration: '覆盖率、高度差异和车辆压草一起参与画面',
    from: {
      camera: [7.2, 4.8, 7.0],
      target: [0, 0.72, 0],
      fov: 44,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 0.75,
      aging: 0.6,
      moss: 0.74,
      mossDepth: 0.16,
      modelMoss: 0.86,
      grassDensity: 0.16,
      grassCoverage: 0.52,
      grassHeight: 0.72,
      grassCurl: 0.9,
      windStrength: 0.16,
      windSpeed: 0.54,
      windScale: 0.14,
      windGust: 0.11,
      windDirection: 42,
      clouds: 0.16,
      fogDensity: 0.0045,
    },
    to: {
      camera: [8.2, 3.8, 8.2],
      target: [0, 1.05, 0],
      fov: 41,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 1,
      aging: 0.68,
      moss: 0.82,
      mossDepth: 0.18,
      modelMoss: 0.9,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.48,
      grassCurl: 1.18,
      windStrength: 0.32,
      windSpeed: 0.72,
      windScale: 0.17,
      windGust: 0.18,
      windDirection: 44,
      clouds: 0.18,
      fogDensity: 0.0048,
    },
  },
  {
    duration: 5.5,
    title: '08 / 风场进入',
    narration: '风不是统一摆动，而是带延迟和噪声的区域运动',
    from: {
      camera: [8.2, 3.8, 8.2],
      target: [0, 1.05, 0],
      fov: 41,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 1,
      aging: 0.7,
      moss: 0.84,
      mossDepth: 0.18,
      modelMoss: 0.91,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.48,
      grassCurl: 1.18,
      windStrength: 0.28,
      windSpeed: 0.7,
      windScale: 0.17,
      windGust: 0.18,
      windDirection: 42,
      clouds: 0.24,
      fogDensity: 0.005,
    },
    to: {
      camera: [-5.8, 1.7, 7.3],
      target: [-0.55, 0.92, 0.25],
      fov: 35,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 1,
      aging: 0.74,
      moss: 0.88,
      mossDepth: 0.18,
      modelMoss: 0.93,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.55,
      grassCurl: 1.25,
      windStrength: 0.72,
      windSpeed: 1.0,
      windScale: 0.23,
      windGust: 0.4,
      windDirection: 52,
      clouds: 0.38,
      fogDensity: 0.0054,
    },
  },
  {
    duration: 5.0,
    title: '09 / 云雾与光影',
    narration: '环境层补齐后，技术演示变成完整场景',
    from: {
      camera: [-5.8, 1.7, 7.3],
      target: [-0.55, 0.92, 0.25],
      fov: 35,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 1,
      aging: 0.78,
      moss: 0.9,
      mossDepth: 0.18,
      modelMoss: 0.94,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.55,
      grassCurl: 1.25,
      windStrength: 0.68,
      windSpeed: 0.96,
      windScale: 0.23,
      windGust: 0.38,
      windDirection: 50,
      clouds: 0.38,
      fogDensity: 0.0054,
    },
    to: {
      camera: [10.2, 5.6, 11.8],
      target: [0, 1.02, 0],
      fov: 47,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 1,
      aging: 0.86,
      moss: 0.94,
      mossDepth: 0.18,
      modelMoss: 0.96,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.55,
      grassCurl: 1.24,
      windStrength: 0.7,
      windSpeed: 0.98,
      windScale: 0.23,
      windGust: 0.38,
      windDirection: 50,
      clouds: 0.58,
      fogDensity: 0.0062,
    },
  },
  {
    duration: 4.5,
    title: '10 / 完整系统展示',
    narration: 'Three.js、WebGL、shader 和参数动画组合成最终画面',
    from: {
      camera: [10.2, 5.6, 11.8],
      target: [0, 1.02, 0],
      fov: 47,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 1,
      aging: 0.88,
      moss: 0.94,
      mossDepth: 0.18,
      modelMoss: 0.96,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.55,
      grassCurl: 1.24,
      windStrength: 0.7,
      windSpeed: 0.98,
      windScale: 0.23,
      windGust: 0.38,
      windDirection: 50,
      clouds: 0.58,
      fogDensity: 0.0062,
    },
    to: {
      camera: [9.2, 5.0, 10.4],
      target: [0, 1.05, 0],
      fov: 44,
      modelVisible: 1,
      modelX: 0,
      modelZ: 0,
      modelRotY: -8,
      vehicleCrush: 1,
      aging: 0.92,
      moss: 0.96,
      mossDepth: 0.18,
      modelMoss: 0.97,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.55,
      grassCurl: 1.24,
      windStrength: 0.72,
      windSpeed: 1.0,
      windScale: 0.23,
      windGust: 0.38,
      windDirection: 50,
      clouds: 0.52,
      fogDensity: 0.0058,
    },
  },
];

const legacyDouyinShots = [
  {
    duration: 2.2,
    title: '一辆废弃车',
    narration: '正在被草地慢慢吞没',
    from: {
      camera: [8.9, 5.2, 10.8],
      target: [0.2, 1.05, 0.0],
      fov: 43,
      aging: 0.92,
      moss: 0.95,
      mossDepth: 0.18,
      modelMoss: 0.95,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.55,
      grassCurl: 1.24,
      windStrength: 0.72,
      windSpeed: 1.05,
      windScale: 0.23,
      windGust: 0.4,
      windDirection: 48,
      clouds: 0.22,
      fogDensity: 0.006,
    },
    to: {
      camera: [8.1, 4.7, 9.8],
      target: [0.0, 1.04, 0.0],
      fov: 41,
      aging: 0.92,
      moss: 0.95,
      mossDepth: 0.18,
      modelMoss: 0.95,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.55,
      grassCurl: 1.24,
      windStrength: 0.72,
      windSpeed: 1.05,
      windScale: 0.23,
      windGust: 0.4,
      windDirection: 48,
      clouds: 0.22,
      fogDensity: 0.006,
    },
  },
  {
    duration: 3.4,
    title: '从裸土开始',
    narration: '先建立主体：土地、车辆、空间关系',
    from: {
      camera: [10.8, 6.4, 12.8],
      target: [0, 0.62, 0],
      fov: 48,
      aging: 0.04,
      moss: 0,
      mossDepth: 0,
      modelMoss: 0,
      grassDensity: 0,
      grassCoverage: 0,
      grassHeight: 0.3,
      grassCurl: 0.7,
      windStrength: 0.05,
      windSpeed: 0.35,
      windScale: 0.12,
      windGust: 0.05,
      windDirection: 36,
      clouds: 0.05,
      fogDensity: 0.0035,
    },
    to: {
      camera: [9.2, 5.4, 11.2],
      target: [0, 0.85, 0],
      fov: 46,
      aging: 0.12,
      moss: 0.04,
      mossDepth: 0.01,
      modelMoss: 0.04,
      grassDensity: 0,
      grassCoverage: 0,
      grassHeight: 0.3,
      grassCurl: 0.7,
      windStrength: 0.05,
      windSpeed: 0.35,
      windScale: 0.12,
      windGust: 0.05,
      windDirection: 36,
      clouds: 0.08,
      fogDensity: 0.0038,
    },
  },
  {
    duration: 4.4,
    title: '苔藓爬上车身',
    narration: '老化和苔藓先铺垫故事',
    from: {
      camera: [4.8, 2.7, 5.5],
      target: [-0.35, 1.18, -0.15],
      fov: 35,
      aging: 0.18,
      moss: 0.08,
      mossDepth: 0.02,
      modelMoss: 0.08,
      grassDensity: 0.01,
      grassCoverage: 0.12,
      grassHeight: 0.22,
      grassCurl: 0.75,
      windStrength: 0.06,
      windSpeed: 0.4,
      windScale: 0.12,
      windGust: 0.05,
      windDirection: 38,
      clouds: 0.08,
      fogDensity: 0.004,
    },
    to: {
      camera: [4.5, 2.55, 5.0],
      target: [0.25, 1.13, 0.12],
      fov: 34,
      aging: 0.44,
      moss: 0.68,
      mossDepth: 0.16,
      modelMoss: 0.78,
      grassDensity: 0.03,
      grassCoverage: 0.24,
      grassHeight: 0.32,
      grassCurl: 0.82,
      windStrength: 0.08,
      windSpeed: 0.45,
      windScale: 0.13,
      windGust: 0.07,
      windDirection: 38,
      clouds: 0.12,
      fogDensity: 0.0042,
    },
  },
  {
    duration: 6.2,
    title: '草开始包围它',
    narration: '主戏在这里：密度、高度、覆盖率一起生长',
    from: {
      camera: [7.8, 3.6, 8.8],
      target: [0, 0.85, 0],
      fov: 42,
      aging: 0.46,
      moss: 0.7,
      mossDepth: 0.16,
      modelMoss: 0.8,
      grassDensity: 0.04,
      grassCoverage: 0.28,
      grassHeight: 0.35,
      grassCurl: 0.82,
      windStrength: 0.12,
      windSpeed: 0.5,
      windScale: 0.13,
      windGust: 0.08,
      windDirection: 40,
      clouds: 0.14,
      fogDensity: 0.0044,
    },
    to: {
      camera: [6.4, 3.1, 7.2],
      target: [0, 1.0, 0],
      fov: 39,
      aging: 0.62,
      moss: 0.78,
      mossDepth: 0.18,
      modelMoss: 0.86,
      grassDensity: 0.25,
      grassCoverage: 0.76,
      grassHeight: 1.42,
      grassCurl: 1.18,
      windStrength: 0.28,
      windSpeed: 0.72,
      windScale: 0.16,
      windGust: 0.16,
      windDirection: 42,
      clouds: 0.18,
      fogDensity: 0.0048,
    },
  },
  {
    duration: 4.8,
    title: '风不是统一摆动',
    narration: '风场有噪声和延迟，不同草丛错峰弯曲',
    from: {
      camera: [5.7, 2.75, 6.1],
      target: [0.3, 0.95, -0.2],
      fov: 36,
      aging: 0.68,
      moss: 0.82,
      mossDepth: 0.18,
      modelMoss: 0.9,
      grassDensity: 0.27,
      grassCoverage: 0.78,
      grassHeight: 1.5,
      grassCurl: 1.2,
      windStrength: 0.42,
      windSpeed: 0.82,
      windScale: 0.18,
      windGust: 0.22,
      windDirection: 42,
      clouds: 0.2,
      fogDensity: 0.005,
    },
    to: {
      camera: [4.8, 2.95, 7.2],
      target: [-0.15, 1.0, 0.25],
      fov: 35,
      aging: 0.74,
      moss: 0.86,
      mossDepth: 0.18,
      modelMoss: 0.92,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.55,
      grassCurl: 1.25,
      windStrength: 0.78,
      windSpeed: 1.05,
      windScale: 0.23,
      windGust: 0.42,
      windDirection: 50,
      clouds: 0.25,
      fogDensity: 0.0056,
    },
  },
  {
    duration: 4.0,
    title: '浏览器里的电影感',
    narration: 'Three.js + shader，也能做产品级动态展示',
    from: {
      camera: [9.5, 5.8, 11.8],
      target: [0, 1.02, 0],
      fov: 47,
      aging: 0.88,
      moss: 0.92,
      mossDepth: 0.18,
      modelMoss: 0.95,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.55,
      grassCurl: 1.24,
      windStrength: 0.72,
      windSpeed: 1.0,
      windScale: 0.23,
      windGust: 0.38,
      windDirection: 48,
      clouds: 0.26,
      fogDensity: 0.0058,
    },
    to: {
      camera: [8.4, 5.1, 10.4],
      target: [0, 1.05, 0],
      fov: 44,
      aging: 0.92,
      moss: 0.95,
      mossDepth: 0.18,
      modelMoss: 0.96,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.55,
      grassCurl: 1.24,
      windStrength: 0.72,
      windSpeed: 1.0,
      windScale: 0.23,
      windGust: 0.38,
      windDirection: 48,
      clouds: 0.26,
      fogDensity: 0.0058,
    },
  },
];
const directedSystemFilmLabels = [
  { title: 'Soil First', caption: 'PBR loam / furrow displacement' },
  { title: 'Abandoned Model', caption: 'The product lands in the ecosystem' },
  { title: 'Contact Evidence', caption: 'Wheel crush / damp soil / aging' },
  { title: 'Moss Ecology', caption: 'Localized shader growth' },
  { title: 'GPU Grass Birth', caption: 'Instanced blades emerge unevenly' },
  { title: 'Growth Wave', caption: 'Coverage / height / variation' },
  { title: 'Wind Field', caption: 'Noise wind / clouds / light sweep' },
  { title: 'System Hero', caption: 'Three.js + WebGL + GPU shaders' },
];

const baseFilmState = (overrides = {}) => ({
  camera: [9, 4, 10],
  target: [0, 0.8, 0],
  fov: 42,
  modelVisible: 1,
  modelX: 0,
  modelZ: 0,
  modelRotY: -8,
  vehicleCrush: 0,
  aging: 0,
  moss: 0,
  mossDepth: 0,
  mossLocality: 0,
  mossRadius: 6.2,
  modelMoss: 0,
  grassDensity: 0,
  grassCoverage: 0,
  grassHeight: 0.28,
  grassCurl: 0.72,
  windStrength: 0.03,
  windSpeed: 0.28,
  windScale: 0.12,
  windGust: 0.03,
  windDirection: 36,
  clouds: 0.03,
  fogDensity: 0.003,
  soilMoisture: 0.16,
  soilCracks: 0.01,
  tillage: 0.36,
  rootPresence: 0,
  ...overrides,
});

const directedSystemFilmShots = [
  {
    duration: 3.0,
    title: '01 / Soil First',
    narration: 'A short macro opener establishes real displaced loam before the product appears.',
    cameraHold: [0.08, 0.7],
    cameraArc: 0.12,
    liftArc: 0.1,
    breath: 0.34,
    from: baseFilmState({
      camera: [-5.2, 0.95, 4.7],
      target: [-2.5, 0.12, -1.35],
      fov: 34,
      modelVisible: 0,
      tillage: 0.12,
      soilMoisture: 0.12,
      clouds: 0.0,
      fogDensity: 0.0024,
    }),
    to: baseFilmState({
      camera: [-4.4, 1.08, 4.0],
      target: [-1.58, 0.18, -0.82],
      fov: 32,
      modelVisible: 0,
      tillage: 0.44,
      soilMoisture: 0.18,
      clouds: 0.02,
      fogDensity: 0.0028,
    }),
  },
  {
    duration: 5.6,
    title: '02 / Abandoned Model',
    narration: 'The camera rises from the ground and discovers the car as part of the same physical field.',
    cameraHold: [0.04, 0.82],
    cameraArc: -0.24,
    liftArc: 0.26,
    breath: 0.52,
    from: baseFilmState({
      camera: [-4.4, 1.08, 4.0],
      target: [-1.58, 0.18, -0.82],
      fov: 32,
      modelVisible: 1,
      tillage: 0.48,
      soilMoisture: 0.18,
      clouds: 0.02,
      fogDensity: 0.0028,
    }),
    to: baseFilmState({
      camera: [10.8, 4.4, 10.6],
      target: [0.05, 0.86, -0.05],
      fov: 46,
      modelVisible: 1,
      vehicleCrush: 0.18,
      aging: 0.05,
      moss: 0.02,
      mossDepth: 0.006,
      mossLocality: 0.35,
      mossRadius: 4.4,
      modelMoss: 0.01,
      tillage: 0.44,
      soilMoisture: 0.18,
      clouds: 0.06,
      fogDensity: 0.0036,
    }),
  },
  {
    duration: 4.8,
    title: '03 / Contact Evidence',
    narration: 'A lower orbit checks that the wheels compress the field and the soil responds around the car.',
    cameraHold: [0.12, 0.76],
    cameraArc: 0.32,
    liftArc: -0.08,
    breath: 0.38,
    from: baseFilmState({
      camera: [10.8, 4.4, 10.6],
      target: [0.05, 0.86, -0.05],
      fov: 46,
      modelVisible: 1,
      vehicleCrush: 0.18,
      aging: 0.05,
      moss: 0.02,
      mossDepth: 0.006,
      mossLocality: 0.35,
      mossRadius: 4.4,
      modelMoss: 0.01,
      tillage: 0.44,
      soilMoisture: 0.18,
      clouds: 0.06,
      fogDensity: 0.0036,
    }),
    to: baseFilmState({
      camera: [7.2, 2.5, 5.9],
      target: [0.18, 0.72, -0.12],
      fov: 40,
      modelVisible: 1,
      vehicleCrush: 0.82,
      aging: 0.28,
      moss: 0.12,
      mossDepth: 0.035,
      mossLocality: 0.82,
      mossRadius: 4.8,
      modelMoss: 0.24,
      tillage: 0.42,
      soilMoisture: 0.24,
      rootPresence: 0.08,
      windStrength: 0.05,
      windGust: 0.04,
      clouds: 0.1,
      fogDensity: 0.0039,
    }),
  },
  {
    duration: 5.8,
    title: '04 / Moss Ecology',
    narration: 'Moss stays localized: roof, seams, wheel shadows, and damp soil pockets instead of a green blanket.',
    cameraHold: [0.08, 0.78],
    cameraArc: -0.28,
    liftArc: 0.14,
    breath: 0.44,
    from: baseFilmState({
      camera: [7.2, 2.5, 5.9],
      target: [0.18, 0.72, -0.12],
      fov: 40,
      modelVisible: 1,
      vehicleCrush: 0.82,
      aging: 0.28,
      moss: 0.12,
      mossDepth: 0.035,
      mossLocality: 0.82,
      mossRadius: 4.8,
      modelMoss: 0.24,
      tillage: 0.42,
      soilMoisture: 0.24,
      rootPresence: 0.08,
      clouds: 0.1,
      fogDensity: 0.0039,
    }),
    to: baseFilmState({
      camera: [-6.4, 3.0, 5.9],
      target: [0.02, 0.95, -0.03],
      fov: 40,
      modelVisible: 1,
      vehicleCrush: 0.9,
      aging: 0.5,
      moss: 0.42,
      mossDepth: 0.095,
      mossLocality: 0.96,
      mossRadius: 5.4,
      modelMoss: 0.64,
      grassDensity: 0.01,
      grassCoverage: 0.08,
      grassHeight: 0.26,
      grassCurl: 0.78,
      tillage: 0.4,
      soilMoisture: 0.26,
      rootPresence: 0.22,
      windStrength: 0.08,
      windSpeed: 0.42,
      windGust: 0.06,
      clouds: 0.13,
      fogDensity: 0.0042,
    }),
  },
  {
    duration: 10.0,
    title: '05 / GPU Grass Birth',
    narration: 'The main act holds longer: instanced blades emerge unevenly while the car remains grounded.',
    cameraHold: [0.04, 0.86],
    cameraArc: 0.38,
    liftArc: 0.28,
    breath: 0.62,
    from: baseFilmState({
      camera: [-6.4, 3.0, 5.9],
      target: [0.02, 0.95, -0.03],
      fov: 40,
      modelVisible: 1,
      vehicleCrush: 0.9,
      aging: 0.5,
      moss: 0.42,
      mossDepth: 0.095,
      mossLocality: 0.96,
      mossRadius: 5.4,
      modelMoss: 0.64,
      grassDensity: 0.01,
      grassCoverage: 0.08,
      grassHeight: 0.26,
      grassCurl: 0.78,
      tillage: 0.4,
      soilMoisture: 0.26,
      rootPresence: 0.22,
      windStrength: 0.08,
      windSpeed: 0.42,
      windGust: 0.06,
      clouds: 0.13,
      fogDensity: 0.0042,
    }),
    to: baseFilmState({
      camera: [7.0, 3.35, 7.0],
      target: [-0.05, 0.92, 0.04],
      fov: 41,
      modelVisible: 1,
      vehicleCrush: 1,
      aging: 0.62,
      moss: 0.46,
      mossDepth: 0.1,
      mossLocality: 0.96,
      mossRadius: 5.6,
      modelMoss: 0.7,
      grassDensity: 0.2,
      grassCoverage: 0.62,
      grassHeight: 0.92,
      grassCurl: 0.95,
      grassPatchScale: 0.12,
      grassPatchEdge: 0.12,
      tillage: 0.36,
      soilMoisture: 0.3,
      rootPresence: 0.52,
      windStrength: 0.18,
      windSpeed: 0.58,
      windScale: 0.15,
      windGust: 0.13,
      windDirection: 42,
      clouds: 0.18,
      fogDensity: 0.0047,
    }),
  },
  {
    duration: 7.0,
    title: '06 / Growth Wave',
    narration: 'Coverage, height, and color variation build into a believable overgrown field.',
    cameraHold: [0.06, 0.82],
    cameraArc: -0.36,
    liftArc: 0.18,
    breath: 0.76,
    from: baseFilmState({
      camera: [7.0, 3.35, 7.0],
      target: [-0.05, 0.92, 0.04],
      fov: 41,
      modelVisible: 1,
      vehicleCrush: 1,
      aging: 0.62,
      moss: 0.46,
      mossDepth: 0.1,
      mossLocality: 0.96,
      mossRadius: 5.6,
      modelMoss: 0.7,
      grassDensity: 0.2,
      grassCoverage: 0.62,
      grassHeight: 0.92,
      grassCurl: 0.95,
      grassPatchScale: 0.12,
      grassPatchEdge: 0.12,
      tillage: 0.36,
      soilMoisture: 0.3,
      rootPresence: 0.52,
      windStrength: 0.18,
      windSpeed: 0.58,
      windScale: 0.15,
      windGust: 0.13,
      windDirection: 42,
      clouds: 0.18,
      fogDensity: 0.0047,
    }),
    to: baseFilmState({
      camera: [9.2, 4.55, 9.2],
      target: [0, 1.04, 0],
      fov: 44,
      modelVisible: 1,
      vehicleCrush: 1,
      aging: 0.76,
      moss: 0.48,
      mossDepth: 0.105,
      mossLocality: 0.96,
      mossRadius: 5.6,
      modelMoss: 0.74,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.52,
      grassCurl: 1.22,
      grassPatchScale: 0.18,
      grassPatchEdge: 0.18,
      tillage: 0.32,
      soilMoisture: 0.34,
      rootPresence: 0.78,
      windStrength: 0.42,
      windSpeed: 0.78,
      windScale: 0.18,
      windGust: 0.22,
      windDirection: 46,
      clouds: 0.28,
      fogDensity: 0.0051,
    }),
  },
  {
    duration: 6.2,
    title: '07 / Wind Field',
    narration: 'A visible wind wave passes through the grass while clouds and light give the scene scale.',
    cameraHold: [0.1, 0.78],
    cameraArc: 0.42,
    liftArc: -0.18,
    breath: 0.9,
    from: baseFilmState({
      camera: [9.2, 4.55, 9.2],
      target: [0, 1.04, 0],
      fov: 44,
      modelVisible: 1,
      vehicleCrush: 1,
      aging: 0.76,
      moss: 0.48,
      mossDepth: 0.105,
      mossLocality: 0.96,
      mossRadius: 5.6,
      modelMoss: 0.74,
      grassDensity: 0.28,
      grassCoverage: 0.78,
      grassHeight: 1.52,
      grassCurl: 1.22,
      tillage: 0.32,
      soilMoisture: 0.34,
      rootPresence: 0.78,
      windStrength: 0.42,
      windSpeed: 0.78,
      windScale: 0.18,
      windGust: 0.22,
      windDirection: 46,
      clouds: 0.28,
      fogDensity: 0.0051,
    }),
    to: baseFilmState({
      camera: [-7.2, 2.55, 8.6],
      target: [-0.48, 0.95, 0.16],
      fov: 38,
      modelVisible: 1,
      vehicleCrush: 1,
      aging: 0.84,
      moss: 0.48,
      mossDepth: 0.105,
      mossLocality: 0.96,
      mossRadius: 5.6,
      modelMoss: 0.74,
      grassDensity: 0.28,
      grassCoverage: 0.8,
      grassHeight: 1.58,
      grassCurl: 1.28,
      tillage: 0.3,
      soilMoisture: 0.36,
      rootPresence: 0.84,
      windStrength: 0.78,
      windSpeed: 1.02,
      windScale: 0.24,
      windGust: 0.44,
      windDirection: 52,
      clouds: 0.58,
      fogDensity: 0.0062,
    }),
  },
  {
    duration: 7.0,
    title: '08 / System Hero',
    narration: 'The final frame holds the whole system together: soil, car, moss, GPU grass, wind, clouds, and grading.',
    cameraHold: [0.06, 0.62],
    cameraArc: -0.18,
    liftArc: 0.24,
    breath: 0.7,
    from: baseFilmState({
      camera: [-7.2, 2.55, 8.6],
      target: [-0.48, 0.95, 0.16],
      fov: 38,
      modelVisible: 1,
      vehicleCrush: 1,
      aging: 0.84,
      moss: 0.48,
      mossDepth: 0.105,
      mossLocality: 0.96,
      mossRadius: 5.6,
      modelMoss: 0.74,
      grassDensity: 0.28,
      grassCoverage: 0.8,
      grassHeight: 1.58,
      grassCurl: 1.28,
      tillage: 0.3,
      soilMoisture: 0.36,
      rootPresence: 0.84,
      windStrength: 0.78,
      windSpeed: 1.02,
      windScale: 0.24,
      windGust: 0.44,
      windDirection: 52,
      clouds: 0.58,
      fogDensity: 0.0062,
    }),
    to: baseFilmState({
      camera: [12.2, 6.2, 14.4],
      target: [0, 1.18, 0],
      fov: 48,
      modelVisible: 1,
      vehicleCrush: 1,
      aging: 0.92,
      moss: 0.48,
      mossDepth: 0.105,
      mossLocality: 0.96,
      mossRadius: 5.6,
      modelMoss: 0.74,
      grassDensity: 0.28,
      grassCoverage: 0.8,
      grassHeight: 1.58,
      grassCurl: 1.26,
      tillage: 0.28,
      soilMoisture: 0.34,
      rootPresence: 0.86,
      windStrength: 0.68,
      windSpeed: 0.94,
      windScale: 0.23,
      windGust: 0.36,
      windDirection: 50,
      clouds: 0.5,
      fogDensity: 0.0058,
    }),
  },
];

const douyinTotalDuration = directedSystemFilmShots.reduce((sum, shot) => sum + shot.duration, 0);

const filmShareCues = [
  { at: 0.2, title: 'WebGL 草地系统', subtitle: '土壤、苔藓、风场和 GPU 草叶共同生成一个实时场景。' },
  { at: 8.6, title: '模型进入生态', subtitle: '汽车落在地面上，周围的土壤和植被开始响应。' },
  { at: 16.8, title: 'Shader 驱动生长', subtitle: '苔藓只出现在潮湿阴影处，草从不均匀的区域长出。' },
  { at: 26.0, title: '数千根 GPU 草叶', subtitle: '密度、高度、覆盖和变化一起推进，而不是简单开关。' },
  { at: 36.0, title: '风变得可见', subtitle: '噪声风场推动草、云和光影，形成统一的环境。' },
  { at: 44.0, title: 'Three.js + WebGL', subtitle: '一个由参数和 shader 控制的实时 3D 展示短片。' },
];

function getFilmShareCue(elapsed) {
  let cue = filmShareCues[0];
  for (const item of filmShareCues) {
    if (elapsed >= item.at) cue = item;
    else break;
  }
  return cue;
}

const filmAudio = {
  ctx: null,
  destination: null,
  master: null,
  nodes: [],
  voiceBuffer: null,
  musicBuffer: null,
};

const videoRecorder = {
  active: false,
  pendingStop: false,
  script: 'landscape',
  scriptElapsed: 0,
  recordingDuration: 0,
  filenamePrefix: 'grasssystem-capability-demo',
  renderPresetActive: false,
  previousRendererSize: new THREE.Vector2(),
  previousPixelRatio: 1,
  previousAspect: camera.aspect,
  width: 1280,
  height: 720,
  fps: 60,
  chunks: [],
  canvas: document.createElement('canvas'),
  ctx: null,
  mediaRecorder: null,
  includeCaptions: true,
  includeAudio: true,
  includeVoiceover: true,
  start: () => startVideoRecording('landscape'),
  startDouyin: () => startVideoRecording('douyin'),
  stop: () => stopVideoRecording(),
};
videoRecorder.canvas.width = videoRecorder.width;
videoRecorder.canvas.height = videoRecorder.height;
videoRecorder.ctx = videoRecorder.canvas.getContext('2d', { alpha: false });

function makeNoiseBuffer(audioCtx, seconds = 2) {
  const length = Math.max(1, Math.floor(audioCtx.sampleRate * seconds));
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    last = last * 0.985 + (Math.random() * 2 - 1) * 0.015;
    data[i] = last;
  }
  return buffer;
}

async function loadAudioBuffer(audioCtx, urls, cacheKey) {
  if (filmAudio[cacheKey] !== null) return filmAudio[cacheKey];
  try {
    for (const url of urls) {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) continue;
      filmAudio[cacheKey] = await audioCtx.decodeAudioData(await response.arrayBuffer());
      return filmAudio[cacheKey];
    }
    filmAudio[cacheKey] = false;
    return null;
  } catch {
    filmAudio[cacheKey] = false;
    return null;
  }
}

async function loadFilmVoiceover(audioCtx) {
  return loadAudioBuffer(audioCtx, ['/system-film-voiceover.mp3', '/system-film-voiceover.wav'], 'voiceBuffer');
}

async function loadFilmMusic(audioCtx) {
  return loadAudioBuffer(audioCtx, ['/system-film-music.mp3', '/system-film-music.wav'], 'musicBuffer');
}

async function startFilmAudioStream() {
  if (!videoRecorder.includeAudio) return null;
  stopFilmAudio();

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  const audioCtx = new AudioContextClass();
  filmAudio.ctx = audioCtx;
  filmAudio.destination = audioCtx.createMediaStreamDestination();
  filmAudio.master = audioCtx.createGain();
  filmAudio.master.gain.value = 0.72;
  filmAudio.master.connect(filmAudio.destination);

  const musicBuffer = await loadFilmMusic(audioCtx);
  const voiceBuffer = videoRecorder.includeVoiceover ? await loadFilmVoiceover(audioCtx) : null;
  const now = audioCtx.currentTime;
  const voiceStartOffset = 0.35;
  const total = Math.max(
    douyinTotalDuration + 0.8,
    voiceBuffer ? voiceStartOffset + voiceBuffer.duration + 0.9 : 0
  );
  videoRecorder.recordingDuration = total;

  const wind = audioCtx.createBufferSource();
  wind.buffer = makeNoiseBuffer(audioCtx, 3);
  wind.loop = true;
  const windHighpass = audioCtx.createBiquadFilter();
  windHighpass.type = 'highpass';
  windHighpass.frequency.value = 260;
  windHighpass.Q.value = 0.55;
  const windFilter = audioCtx.createBiquadFilter();
  windFilter.type = 'lowpass';
  windFilter.frequency.value = 1850;
  windFilter.Q.value = 0.35;
  const windGain = audioCtx.createGain();
  windGain.gain.setValueAtTime(musicBuffer ? 0.008 : 0.018, now);
  windGain.gain.linearRampToValueAtTime(musicBuffer ? 0.018 : 0.04, now + 28);
  windGain.gain.linearRampToValueAtTime(musicBuffer ? 0.012 : 0.026, now + total);
  wind.connect(windHighpass);
  windHighpass.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(filmAudio.master);
  wind.start(now);
  filmAudio.nodes.push(wind);

  if (musicBuffer) {
    const music = audioCtx.createBufferSource();
    music.buffer = musicBuffer;
    const musicGain = audioCtx.createGain();
    musicGain.gain.setValueAtTime(0.0, now);
    musicGain.gain.linearRampToValueAtTime(0.24, now + 3.2);
    musicGain.gain.setValueAtTime(0.24, now + Math.max(4, total - 5));
    musicGain.gain.linearRampToValueAtTime(0.0, now + total);
    music.connect(musicGain);
    musicGain.connect(filmAudio.master);
    music.start(now);
    filmAudio.nodes.push(music);
  } else {
    const motifBus = audioCtx.createGain();
    motifBus.gain.value = 0.16;
    motifBus.connect(filmAudio.master);
    const motifNotes = [523.25, 659.25, 783.99, 880.0, 783.99, 659.25];
    for (let i = 0; i < 14; i++) {
      const t = 4.8 + i * 2.35;
      if (t > total - 1) break;
      const note = audioCtx.createOscillator();
      note.type = 'triangle';
      note.frequency.value = motifNotes[i % motifNotes.length];
      const noteGain = audioCtx.createGain();
      noteGain.gain.setValueAtTime(0.0, now + t);
      noteGain.gain.linearRampToValueAtTime(0.028, now + t + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + t + 1.35);
      note.connect(noteGain);
      noteGain.connect(motifBus);
      note.start(now + t);
      note.stop(now + t + 1.4);
      filmAudio.nodes.push(note);
    }
  }

  if (videoRecorder.includeVoiceover) {
    if (voiceBuffer) {
      const voice = audioCtx.createBufferSource();
      voice.buffer = voiceBuffer;
      const voiceGain = audioCtx.createGain();
      voiceGain.gain.value = 0.9;
      voice.connect(voiceGain);
      voiceGain.connect(filmAudio.master);
      voice.start(now + voiceStartOffset);
      filmAudio.nodes.push(voice);
    }
  }

  if (audioCtx.state === 'suspended') await audioCtx.resume();
  return filmAudio.destination.stream;
}

function stopFilmAudio() {
  for (const node of filmAudio.nodes) {
    try {
      node.stop?.();
    } catch {
      // Already stopped.
    }
    try {
      node.disconnect?.();
    } catch {
      // Already disconnected.
    }
  }
  filmAudio.nodes = [];
  try {
    filmAudio.master?.disconnect();
  } catch {
    // Already disconnected.
  }
  if (filmAudio.ctx && filmAudio.ctx.state !== 'closed') {
    filmAudio.ctx.close();
  }
  filmAudio.ctx = null;
  filmAudio.destination = null;
  filmAudio.master = null;
}

function enterRecordingRenderPreset() {
  if (videoRecorder.renderPresetActive) return;
  renderer.getSize(videoRecorder.previousRendererSize);
  videoRecorder.previousPixelRatio = renderer.getPixelRatio();
  videoRecorder.previousAspect = camera.aspect;
  renderer.setPixelRatio(1);
  renderer.setSize(videoRecorder.width, videoRecorder.height, true);
  camera.aspect = videoRecorder.width / videoRecorder.height;
  camera.updateProjectionMatrix();
  fx.setSize(videoRecorder.width, videoRecorder.height);
  videoRecorder.renderPresetActive = true;
}

function exitRecordingRenderPreset() {
  if (!videoRecorder.renderPresetActive) return;
  renderer.setPixelRatio(videoRecorder.previousPixelRatio);
  renderer.setSize(videoRecorder.previousRendererSize.x, videoRecorder.previousRendererSize.y, true);
  camera.aspect = videoRecorder.previousAspect;
  camera.updateProjectionMatrix();
  fx.setSize(videoRecorder.previousRendererSize.x, videoRecorder.previousRendererSize.y);
  videoRecorder.renderPresetActive = false;
}

function setVideoMode(enabled) {
  document.body.classList.toggle('video-mode', enabled);
  videoRecordButton.disabled = enabled;
  videoDouyinButton.disabled = enabled;
  videoStopButton.disabled = !enabled;
  videoStatus.textContent = enabled ? (videoRecorder.script === 'douyin' ? 'Film' : 'Recording') : 'Ready';
  if (enabled) setPresentationMode(true);
}

function getRecorderMimeType() {
  const options = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  return options.find((type) => window.MediaRecorder?.isTypeSupported(type)) || '';
}

function drawWrappedRecordingText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}

function getDouyinCue(elapsed) {
  let cursor = 0;
  for (let i = 0; i < directedSystemFilmShots.length; i++) {
    const shot = directedSystemFilmShots[i];
    const next = cursor + shot.duration;
    if (elapsed <= next || i === directedSystemFilmShots.length - 1) {
      const local = THREE.MathUtils.clamp((elapsed - cursor) / shot.duration, 0, 1);
      const eased = smooth01(local);
      const hold = shot.cameraHold || (i === directedSystemFilmShots.length - 1 ? [0.05, 0.72] : null);
      const cameraEased = hold ? heldShotEase(local, hold[0], hold[1]) : smooth01(local);
      return {
        index: i,
        shot,
        local,
        elapsedInShot: elapsed - cursor,
        overall: THREE.MathUtils.clamp(elapsed / douyinTotalDuration, 0, 1),
        eased,
        cameraEased,
      };
    }
    cursor = next;
  }
  return { index: 0, shot: directedSystemFilmShots[0], local: 0, elapsedInShot: 0, overall: 0, eased: 0, cameraEased: 0 };
}

function getRecordingCue() {
  if (videoRecorder.script === 'douyin') {
    const cue = getDouyinCue(videoRecorder.scriptElapsed);
    const label = getFilmShareCue(videoRecorder.scriptElapsed);
    return {
      mode: 'douyin',
      kicker: 'REAL-TIME WEBGL FILM',
      title: label.title,
      caption: label.subtitle,
      index: cue.index,
      total: directedSystemFilmShots.length,
      overall: cue.overall,
      local: cue.local,
    };
  }
  const { index, stage, local } = getDemoStage(capabilityDemo.elapsed);
  return {
    mode: 'landscape',
    kicker: 'GRASSSYSTEMTHREEJS / GPU VEGETATION DEMO',
    title: stage.name,
    caption: videoStageCaptions[index] || stage.copy,
    index,
    total: demoStages.length,
    overall: THREE.MathUtils.clamp(capabilityDemo.elapsed / demoTotalDuration, 0, 1),
    local,
  };
}

function drawRecordingFrame() {
  const ctx = videoRecorder.ctx;
  const outW = videoRecorder.width;
  const outH = videoRecorder.height;
  const source = renderer.domElement;
  const cue = getRecordingCue();

  ctx.fillStyle = '#050504';
  ctx.fillRect(0, 0, outW, outH);

  if (cue.mode === 'douyin') {
    const scale = Math.max(outW / source.width, outH / source.height);
    const drawW = source.width * scale;
    const drawH = source.height * scale;
    const drawX = (outW - drawW) * 0.5;
    const drawY = (outH - drawH) * 0.5;
    ctx.drawImage(source, drawX, drawY, drawW, drawH);
  } else {
    const scale = Math.max(outW / source.width, outH / source.height);
    const drawW = source.width * scale;
    const drawH = source.height * scale;
    const drawX = (outW - drawW) * 0.5;
    const drawY = (outH - drawH) * 0.5;
    ctx.drawImage(source, drawX, drawY, drawW, drawH);
  }

  const gradient = ctx.createLinearGradient(0, cue.mode === 'douyin' ? outH * 0.2 : outH * 0.45, 0, outH);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.62, cue.mode === 'douyin' ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.28)');
  gradient.addColorStop(1, cue.mode === 'douyin' ? 'rgba(0,0,0,0.82)' : 'rgba(0,0,0,0.68)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, outW, outH);

  if (cue.mode === 'douyin') {
    const margin = 54;
    const titleY = outH - 104;
    const captionY = outH - 66;

    if (videoRecorder.includeCaptions) {
      ctx.fillStyle = 'rgba(255,244,229,0.52)';
      ctx.font = '650 13px Inter, system-ui, sans-serif';
      ctx.fillText(cue.kicker, margin, 48);

      ctx.fillStyle = '#fff2df';
      ctx.font = '800 34px Inter, system-ui, sans-serif';
      drawWrappedRecordingText(ctx, cue.title, margin, titleY, 640, 40);

      ctx.fillStyle = 'rgba(255,244,229,0.78)';
      ctx.font = '600 18px Inter, system-ui, sans-serif';
      drawWrappedRecordingText(ctx, cue.caption, margin, captionY, 760, 24);

      const barY = outH - 28;
      const barW = 520;
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fillRect(margin, barY, barW, 4);
      ctx.fillStyle = '#d9a066';
      ctx.fillRect(margin, barY, barW * cue.overall, 4);
    }
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = '600 17px Inter, system-ui, sans-serif';
    ctx.fillText(cue.kicker, 54, 56);

    ctx.fillStyle = '#f5eadc';
    ctx.font = '700 34px Inter, system-ui, sans-serif';
    ctx.fillText(cue.title, 54, outH - 132);

    ctx.fillStyle = 'rgba(245,234,220,0.78)';
    ctx.font = '500 21px Inter, system-ui, sans-serif';
    drawWrappedRecordingText(ctx, cue.caption, 54, outH - 94, 760, 29);

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(54, outH - 34, 520, 4);
    ctx.fillStyle = '#d9a066';
    ctx.fillRect(54, outH - 34, 520 * cue.overall, 4);

    ctx.fillStyle = 'rgba(245,234,220,0.58)';
    ctx.font = '600 15px Inter, system-ui, sans-serif';
    ctx.fillText(`${String(cue.index + 1).padStart(2, '0')} / ${cue.total}`, outW - 122, outH - 34);
  }

  if (cue.mode === 'douyin') {
    const fadeIn = Math.max(0, 1 - cue.local / 0.12);
    const fadeOut = Math.max(0, (cue.local - 0.9) / 0.1);
    const fade = Math.max(fadeIn, fadeOut) * 0.32;
    if (fade > 0.001) {
      ctx.fillStyle = `rgba(5,5,4,${fade})`;
      ctx.fillRect(0, 0, outW, outH);
    }
  } else if (cue.local < 0.1) {
    ctx.fillStyle = `rgba(217,160,102,${1 - cue.local * 10})`;
    ctx.fillRect(0, 0, outW, 3);
  }
}

function downloadRecordedVideo(blob) {
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const link = document.createElement('a');
  link.href = url;
  link.download = `${videoRecorder.filenamePrefix}-${stamp}.webm`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function configureRecordingPreset(preset) {
  const isDouyin = preset === 'douyin';
  videoRecorder.script = isDouyin ? 'douyin' : 'landscape';
  videoRecorder.scriptElapsed = 0;
  videoRecorder.recordingDuration = isDouyin ? douyinTotalDuration : 0;
  videoRecorder.width = 1280;
  videoRecorder.height = 720;
  videoRecorder.filenamePrefix = isDouyin ? 'grasssystem-system-build-film' : 'grasssystem-capability-demo';
  videoRecorder.canvas.width = videoRecorder.width;
  videoRecorder.canvas.height = videoRecorder.height;
}

async function startVideoRecording(preset = 'landscape') {
  if (videoRecorder.active) return;
  if (!window.MediaRecorder || !videoRecorder.canvas.captureStream) {
    window.alert('This browser does not support canvas recording.');
    return;
  }

  configureRecordingPreset(preset);
  capabilityDemo.loop = false;
  capabilityDemo.speed = 1;
  videoRecorder.pendingStop = false;
  videoRecorder.chunks = [];
  setVideoMode(true);
  enterRecordingRenderPreset();
  startCapabilityDemo();

  const stream = videoRecorder.canvas.captureStream(videoRecorder.fps);
  const audioStream = preset === 'douyin' ? await startFilmAudioStream() : null;
  if (audioStream) {
    for (const track of audioStream.getAudioTracks()) stream.addTrack(track);
  }
  const mimeType = getRecorderMimeType();
  const options = mimeType
    ? { mimeType, videoBitsPerSecond: 12000000, audioBitsPerSecond: 160000 }
    : { videoBitsPerSecond: 12000000, audioBitsPerSecond: 160000 };
  videoRecorder.mediaRecorder = new MediaRecorder(stream, options);
  videoRecorder.mediaRecorder.ondataavailable = (event) => {
    if (event.data?.size) videoRecorder.chunks.push(event.data);
  };
  videoRecorder.mediaRecorder.onstop = () => {
    const blob = new Blob(videoRecorder.chunks, { type: mimeType || 'video/webm' });
    downloadRecordedVideo(blob);
    videoRecorder.chunks = [];
    stopFilmAudio();
    exitRecordingRenderPreset();
    setVideoMode(false);
    if (!capabilityDemo.active) setPresentationMode(false);
  };
  videoRecorder.mediaRecorder.start(250);
  videoRecorder.active = true;
  videoStatus.textContent = videoRecorder.script === 'douyin' ? 'Film' : 'Recording';
}

function stopVideoRecording() {
  if (!videoRecorder.active) return;
  const wasDouyin = videoRecorder.script === 'douyin';
  videoRecorder.active = false;
  videoRecorder.pendingStop = false;
  videoStatus.textContent = 'Saving';
  if (wasDouyin) {
    capabilityDemo.active = false;
    controls.enabled = true;
  }
  if (videoRecorder.mediaRecorder?.state === 'recording') {
    videoRecorder.mediaRecorder.stop();
  } else {
    stopFilmAudio();
    exitRecordingRenderPreset();
    setVideoMode(false);
  }
  videoRecorder.script = 'landscape';
}

function setPresentationMode(enabled) {
  if (!gui.domElement) return;
  gui.domElement.style.opacity = enabled ? '0' : '1';
  gui.domElement.style.pointerEvents = enabled ? 'none' : 'auto';
  gui.domElement.style.transform = enabled ? 'translateX(18px)' : 'translateX(0)';
  gui.domElement.style.transition = 'opacity .25s ease, transform .25s ease';
}

function seekCapabilityDemo(seconds) {
  capabilityDemo.active = true;
  controls.enabled = false;
  controls.autoRotate = false;
  cine.autoOrbit = false;
  capabilityDemo.elapsed = THREE.MathUtils.clamp(seconds, 0, demoTotalDuration - 0.001);
  demoOverlay.style.opacity = '1';
  demoControls.classList.add('is-active');
  if (capabilityDemo.presentationMode) setPresentationMode(true);
}

function updateDemoAdvanceButton(currentIndex = 0) {
  demoAdvance.classList.toggle('is-running', capabilityDemo.active);
  if (!capabilityDemo.active) {
    demoAdvance.textContent = '开始演示';
    demoAdvance.title = '从第一阶段开始完整演示';
    return;
  }
  if (currentIndex >= demoStages.length - 1) {
    demoAdvance.textContent = '最终场景';
    demoAdvance.title = '已经进入最后阶段';
    return;
  }
  demoAdvance.textContent = '推进演示';
  demoAdvance.title = `跳到 ${demoStages[currentIndex + 1].name}`;
}

function advanceCapabilityDemo() {
  if (!capabilityDemo.active) {
    startCapabilityDemo();
    return;
  }
  const { index } = getDemoStage(capabilityDemo.elapsed);
  const nextIndex = Math.min(index + 1, demoStages.length - 1);
  seekCapabilityDemo(demoStageStarts[nextIndex] + 0.01);
  updateCapabilityDemo(0);
}

demoStages.forEach((stage, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = String(index + 1);
  button.title = stage.name;
  button.addEventListener('click', () => seekCapabilityDemo(demoStageStarts[index] + 0.01));
  demoJumpers.appendChild(button);
});

demoScrub.addEventListener('input', () => {
  const pct = Number(demoScrub.value) / 1000;
  seekCapabilityDemo(pct * demoTotalDuration);
});
demoExit.addEventListener('click', () => stopCapabilityDemo());
demoAdvance.addEventListener('click', () => advanceCapabilityDemo());
videoRecordButton.addEventListener('click', () => startVideoRecording('landscape'));
videoDouyinButton.addEventListener('click', () => startVideoRecording('douyin'));
videoStopButton.addEventListener('click', () => stopVideoRecording());

function smooth01(t) {
  t = THREE.MathUtils.clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
}

function heldShotEase(local, holdIn = 0.18, holdOut = 0.84) {
  if (local <= holdIn) return 0;
  if (local >= holdOut) return 1;
  return smooth01((local - holdIn) / (holdOut - holdIn));
}

function getDemoStage(elapsed) {
  let cursor = 0;
  for (let i = 0; i < demoStages.length; i++) {
    const stage = demoStages[i];
    const next = cursor + stage.duration;
    if (elapsed <= next || i === demoStages.length - 1) {
      return {
        index: i,
        stage,
        local: THREE.MathUtils.clamp((elapsed - cursor) / stage.duration, 0, 1),
      };
    }
    cursor = next;
  }
  return { index: 0, stage: demoStages[0], local: 0 };
}

function updateDemoOverlay(stage, local, overall) {
  demoOverlay.querySelector('.cap-title').textContent = stage.name;
  demoOverlay.querySelector('.cap-copy').textContent = stage.copy;
  demoOverlay.querySelector('.cap-meter span').style.width = `${Math.round(overall * 100)}%`;
  demoOverlay.style.opacity = capabilityDemo.active ? '1' : '0';
  demoOverlay.style.transform = capabilityDemo.active ? 'translateY(0)' : 'translateY(8px)';
  demoControls.classList.toggle('is-active', capabilityDemo.active);
  demoScrub.value = String(Math.round(overall * 1000));
  const currentIndex = demoStages.indexOf(stage);
  Array.from(demoJumpers.children).forEach((button, index) => {
    button.classList.toggle('is-current', index === currentIndex);
  });
  updateDemoAdvanceButton(currentIndex);
  capabilityDemo.stage = stage.name;
  capabilityDemo.progress = Math.round(overall * 100);
}

function startCapabilityDemo() {
  capabilityDemo.active = true;
  capabilityDemo.elapsed = 0;
  capabilityDemo.stage = demoStages[0].name;
  capabilityDemo.progress = 0;
  updateDemoAdvanceButton(0);

  controls.enabled = false;
  controls.autoRotate = false;
  cine.autoOrbit = false;
  if (capabilityDemo.presentationMode) setPresentationMode(true);

  renderer.toneMappingExposure = 0.92;
  scene.background = demoSkyColor.set(0x171311);
  scene.fog.color.copy(demoFogColor.set(0x171311));
  fx.fog.uniforms.uFogColor.value.set(0xcdd6dd);
  fx.fog.uniforms.uSunColor.value.set(0xffe9c8);
  keyLight.intensity = 4.1;
  fillLight.intensity = 0.9;
  rimLight.intensity = 170;
  scene.environmentIntensity = 0.55;

  modelTransform.posX = 0;
  modelTransform.posY = VEHICLE_GROUND_Y;
  modelTransform.posZ = 0;
  modelTransform.rotY = -8;
  modelTransform.scale = 1;
  applyModelTransform();
  applyModelAging(0);

  modelState.showModel = false;
  model.setVisible(false);
  syncVehicleGrassInteraction();
  mossParams.enabled = false;
  mossUniforms.uMossEnabled.value = 0;
  mossUniforms.uMossCoverage.value = 0;
  mossUniforms.uMossDepth.value = 0;
  mossUniforms.uMossLocality.value = 0;
  mossUniforms.uMossRadius.value = 6.2;
  model.moss.uMossCoverage.value = 0;
  model.moss.uMossThickness.value = 0;

  grassParams.enabled = false;
  grass.mesh.visible = false;
  grassParams.density = 0;
  grass.setDensity(0);
  grass.uniforms.uCoverage.value = 0;
  grass.uniforms.uHeight.value = 0.35;
  grass.uniforms.uWidth.value = 0.03;
  grass.uniforms.uCurl.value = 0.7;

  cloudsParams.enabled = false;
  fx.fog.setEnabled(false);
  dofParams.enabled = false;
  fx.bokeh.enabled = false;
  soilUniforms.uMoisture.value = 0.16;
  soilUniforms.uTillageStrength.value = 0.42;
  soilUniforms.uRootPresence.value = 0;
  soilUniforms.uOrganicScatter.value = 0.34;
  soilUniforms.uCrackEnabled.value = 0;
  soilUniforms.uCrackAmount.value = 0.03;

  fx.grade.uniforms.uChroma.value = 0.0015;
  fx.grade.uniforms.uContrast.value = 1.08;
  fx.grade.uniforms.uSaturation.value = 1.08;
}

function stopCapabilityDemo() {
  capabilityDemo.active = false;
  controls.enabled = true;
  updateDemoAdvanceButton();
  camera.fov = cine.fov;
  camera.updateProjectionMatrix();
  controls.target.set(0, 0, 0);
  demoOverlay.style.opacity = '0';
  demoControls.classList.remove('is-active');
  setPresentationMode(false);
}

function renderCapabilityDemoFrame(elapsed, overallOverride = null) {
  capabilityDemo.elapsed = THREE.MathUtils.clamp(elapsed, 0, demoTotalDuration);
  const { index, stage, local } = getDemoStage(capabilityDemo.elapsed);
  const eased = smooth01(local);
  const previousStage = demoStages[Math.max(0, index - 1)];
  const transition = smooth01(Math.min(local / 0.32, 1));

  demoCam.previousPosition.copy(previousStage.position);
  demoCam.previousTarget.copy(previousStage.target);
  demoCam.position.copy(previousStage.position).lerp(stage.position, transition);
  demoCam.target.copy(previousStage.target).lerp(stage.target, transition);

  camera.position.copy(demoCam.position);
  controls.target.copy(demoCam.target);
  if (stage.dragInspect) {
    const inspect = stage.dragInspect;
    const angle = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(inspect.start, inspect.end, eased));
    const heightWave = Math.sin(local * Math.PI * 2.0) * inspect.heightWave;
    camera.position.set(
      controls.target.x + Math.cos(angle) * inspect.radius,
      controls.target.y + inspect.height + heightWave,
      controls.target.z + Math.sin(angle) * inspect.radius
    );
  }
  const breath = stage.breathe ?? 0.14;
  const breathPhase = capabilityDemo.elapsed * 1.15;
  camera.position.x += Math.sin(breathPhase * 0.7) * breath * 0.38;
  camera.position.y += Math.sin(breathPhase) * breath;
  camera.position.z += Math.cos(breathPhase * 0.55) * breath * 0.24;
  controls.target.y += Math.sin(breathPhase * 0.82) * breath * 0.16;
  if (stage.inspect) {
    const inspectX = Math.sin(local * Math.PI * 2.0) * 0.62;
    const inspectY = Math.sin(local * Math.PI * 4.0) * 0.18;
    controls.target.x += inspectX;
    controls.target.y += inspectY;
    camera.position.x += inspectX * 0.42;
    camera.position.y += inspectY * 0.75;
  }
  camera.lookAt(controls.target);
  camera.fov = THREE.MathUtils.lerp(previousStage.fov, stage.fov, transition);
  camera.updateProjectionMatrix();

  for (let i = 0; i < index; i++) {
    demoStages[i].apply(1);
  }
  stage.apply(eased);
  applyModelTransform();

  fx.bokeh.uniforms.focus.value = camera.position.distanceTo(demoCam.target);
  updateDemoOverlay(stage, local, overallOverride ?? capabilityDemo.elapsed / demoTotalDuration);
}

function updateCapabilityDemo(dt) {
  if (!capabilityDemo.active) return;

  capabilityDemo.elapsed += dt * capabilityDemo.speed;
  if (capabilityDemo.elapsed >= demoTotalDuration) {
    if (capabilityDemo.loop) {
      capabilityDemo.elapsed %= demoTotalDuration;
    } else {
      capabilityDemo.elapsed = demoTotalDuration;
      capabilityDemo.active = false;
      controls.enabled = true;
      setPresentationMode(false);
      if (videoRecorder.active) videoRecorder.pendingStop = true;
    }
  }

  renderCapabilityDemoFrame(capabilityDemo.elapsed);
}

function shotValue(shot, key, t) {
  return THREE.MathUtils.lerp(shot.from[key], shot.to[key], t);
}

function shotValueOr(shot, key, t, fallback) {
  const from = shot.from[key] ?? fallback;
  const to = shot.to[key] ?? from;
  return THREE.MathUtils.lerp(from, to, t);
}

function shotVec3(shot, key, t, out) {
  const a = shot.from[key];
  const b = shot.to[key];
  out.set(
    THREE.MathUtils.lerp(a[0], b[0], t),
    THREE.MathUtils.lerp(a[1], b[1], t),
    THREE.MathUtils.lerp(a[2], b[2], t)
  );
}

function applyShotCameraArc(shot, local, position, target) {
  const arc = shot.cameraArc ?? 0;
  const lift = shot.liftArc ?? 0;
  if (Math.abs(arc) < 0.001 && Math.abs(lift) < 0.001) return;

  const phase = Math.sin(local * Math.PI);
  const toCamera = position.clone().sub(target);
  const sideways = new THREE.Vector3(-toCamera.z, 0, toCamera.x);
  if (sideways.lengthSq() > 0.0001) {
    sideways.normalize().multiplyScalar(arc * phase);
    position.add(sideways);
  }
  position.y += lift * phase;
}

function applyDouyinDirectorFrame(cue) {
  const { shot, eased, local, cameraEased } = cue;
  const breathGate = Math.sin(local * Math.PI);
  const breathScale = shot.breath ?? (cue.index <= 1 ? 0.45 : cue.index >= 6 ? 1.25 : 0.85);
  const cameraBreath = Math.sin(videoRecorder.scriptElapsed * 0.52) * 0.022 * breathGate * breathScale;
  const targetBreath = Math.sin(videoRecorder.scriptElapsed * 0.42) * 0.014 * breathGate * breathScale;

  const modelVisibility = shotValueOr(shot, 'modelVisible', eased, 1);
  modelState.showModel = modelVisibility > 0.05;
  model.setVisible(modelState.showModel);
  modelTransform.scale = 1;
  modelTransform.posX = shotValueOr(shot, 'modelX', eased, 0);
  modelTransform.posY = VEHICLE_GROUND_Y;
  modelTransform.posZ = shotValueOr(shot, 'modelZ', eased, 0);
  modelTransform.rotY = shotValueOr(shot, 'modelRotY', eased, -8);
  vehicleSceneParams.grassCrush = shotValueOr(shot, 'vehicleCrush', eased, modelState.showModel ? 1 : 0);
  applyModelTransform();
  applyModelAging(shotValue(shot, 'aging', eased));

  const rawMossCoverage = shotValue(shot, 'moss', eased);
  const mossCoverage = Math.min(rawMossCoverage, 0.48);
  mossParams.enabled = mossCoverage > 0.01;
  mossUniforms.uMossEnabled.value = mossParams.enabled ? 1 : 0;
  mossUniforms.uMossCoverage.value = mossCoverage;
  mossUniforms.uMossDepth.value = Math.min(shotValue(shot, 'mossDepth', eased), 0.105);
  mossUniforms.uMossLocality.value = shotValueOr(
    shot,
    'mossLocality',
    eased,
    smooth01(THREE.MathUtils.clamp((mossCoverage - 0.03) / 0.24, 0, 1)) * 0.96
  );
  mossUniforms.uMossRadius.value = shotValueOr(shot, 'mossRadius', eased, 5.6);
  mossUniforms.uMossScale.value = THREE.MathUtils.lerp(0.18, 0.26, mossUniforms.uMossLocality.value);
  mossUniforms.uMossEdge.value = THREE.MathUtils.lerp(0.12, 0.18, mossUniforms.uMossLocality.value);
  mossUniforms.uMossTextureScale.value = 0.42;
  mossUniforms.uMossNormalScale.value = 1.35;
  model.moss.uMossCoverage.value = Math.min(shotValue(shot, 'modelMoss', eased), 0.74);
  model.moss.uMossThickness.value = THREE.MathUtils.lerp(0.006, 0.086, model.moss.uMossCoverage.value);

  const grassDensity = shotValue(shot, 'grassDensity', eased);
  grassParams.enabled = grassDensity > 0.005;
  grass.mesh.visible = grassParams.enabled;
  grassParams.density = grassDensity;
  grass.setDensity(grassDensity);
  grass.uniforms.uCoverage.value = shotValue(shot, 'grassCoverage', eased);
  grass.uniforms.uHeight.value = shotValue(shot, 'grassHeight', eased);
  grass.uniforms.uWidth.value = THREE.MathUtils.lerp(0.028, 0.055, THREE.MathUtils.clamp(grassDensity / 0.28, 0, 1));
  grass.uniforms.uCurl.value = shotValue(shot, 'grassCurl', eased);
  const grassMaturity = THREE.MathUtils.clamp(grassDensity / 0.28, 0, 1);
  grass.uniforms.uMaskScale.value = shotValueOr(shot, 'grassPatchScale', eased, THREE.MathUtils.lerp(0.075, 0.18, grassMaturity));
  grass.uniforms.uMaskEdge.value = shotValueOr(shot, 'grassPatchEdge', eased, THREE.MathUtils.lerp(0.07, 0.18, grassMaturity));

  windState.strength = shotValue(shot, 'windStrength', eased);
  windState.speed = shotValue(shot, 'windSpeed', eased);
  windState.scale = shotValue(shot, 'windScale', eased);
  windState.gust = shotValue(shot, 'windGust', eased);
  windState.direction = shotValue(shot, 'windDirection', eased);
  applyWind();

  const cloudLevel = shotValue(shot, 'clouds', eased);
  const cloudPresence = smooth01(THREE.MathUtils.clamp((cloudLevel - 0.12) / 0.42, 0, 1));
  cloudsParams.enabled = cloudLevel > 0.04;
  fx.fog.setEnabled(cloudLevel > 0.04);
  scene.background = demoSkyColor.set(0x20231f);
  scene.fog.color.copy(demoFogColor.set(0x262c24));
  fx.fog.uniforms.uBase.value = THREE.MathUtils.lerp(8.0, 3.2, cloudPresence);
  fx.fog.uniforms.uHeight.value = THREE.MathUtils.lerp(4.0, 9.4, cloudPresence);
  fx.fog.uniforms.uDensity.value = THREE.MathUtils.lerp(0.04, 1.08, cloudPresence);
  fx.fog.uniforms.uCoverage.value = THREE.MathUtils.lerp(0.08, 0.42, cloudPresence);
  fx.fog.uniforms.uCoverageEdge.value = THREE.MathUtils.lerp(0.18, 0.11, cloudPresence);
  fx.fog.uniforms.uNoiseScale.value = THREE.MathUtils.lerp(0.075, 0.052, cloudPresence);
  fx.fog.uniforms.uDetail.value = THREE.MathUtils.lerp(0.5, 0.72, cloudPresence);
  fx.fog.uniforms.uDetailScale.value = THREE.MathUtils.lerp(4.8, 7.2, cloudPresence);
  fx.fog.uniforms.uWindSpeed.value = THREE.MathUtils.lerp(0.055, 0.13, cloudPresence);
  fx.fog.uniforms.uFogColor.value.set(0xb5c3a5);
  fx.fog.uniforms.uSunColor.value.set(0xffd9a4);
  fx.fog.uniforms.uSunStrength.value = THREE.MathUtils.lerp(1.4, 4.1, cloudPresence);
  fx.fog.uniforms.uAmbient.value = THREE.MathUtils.lerp(0.36, 0.62, cloudPresence);
  fogState.enabled = true;
  fogState.density = shotValue(shot, 'fogDensity', eased);
  applyFog();

  const agingAmount = shotValue(shot, 'aging', eased);
  soilUniforms.uSoilColor.value.set(0xc0936b);
  soilUniforms.uVarAmount.value = 0.2;
  soilUniforms.uTillageStrength.value = shotValueOr(
    shot,
    'tillage',
    eased,
    THREE.MathUtils.lerp(0.28, 0.44, Math.min(cue.overall * 2.5, 1))
  );
  soilUniforms.uOrganicScatter.value = 0.34;
  soilUniforms.uRootPresence.value = shotValueOr(
    shot,
    'rootPresence',
    eased,
    THREE.MathUtils.clamp(grassDensity / 0.26, 0, 1) * 0.78
  );
  soilUniforms.uMoisture.value = shotValueOr(
    shot,
    'soilMoisture',
    eased,
    THREE.MathUtils.lerp(0.16, 0.32, mossCoverage)
  );
  soilUniforms.uWetDarken.value = 0.72;
  soilUniforms.uWetRoughness.value = 0.55;
  soilUniforms.uCrackEnabled.value = agingAmount > 0.88 ? 1 : 0;
  soilUniforms.uCrackAmount.value = shotValueOr(
    shot,
    'soilCracks',
    eased,
    THREE.MathUtils.lerp(0.01, 0.055, smooth01((agingAmount - 0.82) / 0.18))
  );
  soilUniforms.uCrackWidth.value = 0.018;
  applyModelTransform();

  fx.bokeh.enabled = cue.index >= 2;
  fx.bokeh.uniforms.aperture.value = cue.index >= 4 ? 0.00055 : 0.00035;
  fx.bokeh.uniforms.maxblur.value = 0.0035;
  fx.bloom.strength = THREE.MathUtils.lerp(0.05, 0.18, cloudLevel);
  fx.grade.uniforms.uVignette.value = 0.42;
  fx.grade.uniforms.uGrain.value = 0.026;
  fx.grade.uniforms.uChroma.value = 0.0015;
  fx.grade.uniforms.uContrast.value = 1.12;
  fx.grade.uniforms.uSaturation.value = 1.05;
  renderer.toneMappingExposure = THREE.MathUtils.lerp(0.86, 0.96, cloudLevel);
  scene.environmentIntensity = 0.56;

  const filmLight = smooth01(cue.overall);
  keyLight.position.set(
    THREE.MathUtils.lerp(7.5, -4.2, filmLight),
    THREE.MathUtils.lerp(9.5, 12.5, filmLight),
    THREE.MathUtils.lerp(6.5, 4.8, filmLight)
  );
  keyLight.intensity = THREE.MathUtils.lerp(2.4, 4.8, Math.sin(filmLight * Math.PI));
  fillLight.intensity = THREE.MathUtils.lerp(0.22, 0.9, filmLight);
  rimLight.intensity = THREE.MathUtils.lerp(80, 210, filmLight);
  scene.environmentIntensity = THREE.MathUtils.lerp(0.42, 0.62, filmLight);

  shotVec3(shot, 'camera', cameraEased, camera.position);
  shotVec3(shot, 'target', cameraEased, controls.target);
  applyShotCameraArc(shot, local, camera.position, controls.target);
  camera.position.x += cameraBreath;
  camera.position.y += cameraBreath * 0.5;
  controls.target.y += targetBreath;
  camera.fov = shotValue(shot, 'fov', cameraEased);
  camera.updateProjectionMatrix();
  camera.lookAt(controls.target);

  capabilityDemo.stage = shot.title;
  capabilityDemo.progress = Math.round(cue.overall * 100);
  demoOverlay.querySelector('.cap-title').textContent = shot.title;
  demoOverlay.querySelector('.cap-copy').textContent = shot.narration;
  demoOverlay.querySelector('.cap-meter span').style.width = `${Math.round(cue.overall * 100)}%`;
  updateDemoAdvanceButton(Math.min(demoStages.length - 1, 6 + Math.floor(local * 3)));
}

function updateDouyinDemo(dt) {
  if (!videoRecorder.active || videoRecorder.script !== 'douyin') return;
  capabilityDemo.active = true;
  controls.enabled = false;
  controls.autoRotate = false;
  cine.autoOrbit = false;
  videoRecorder.scriptElapsed += dt;
  const stopAt = Math.max(douyinTotalDuration, videoRecorder.recordingDuration || 0);
  if (videoRecorder.scriptElapsed >= stopAt) {
    videoRecorder.scriptElapsed = stopAt;
    videoRecorder.pendingStop = true;
  }
  const cue = getDouyinCue(Math.min(videoRecorder.scriptElapsed, douyinTotalDuration));
  applyDouyinDirectorFrame(cue);
  videoStatus.textContent = `${Math.round(THREE.MathUtils.clamp(videoRecorder.scriptElapsed / stopAt, 0, 1) * 100)}%`;
}

const fCapability = gui.addFolder('Capability Demo');
fCapability.add(capabilityDemo, 'play').name('Play Full Scene Demo');
fCapability.add(capabilityDemo, 'stop').name('Stop');
fCapability.add(capabilityDemo, 'speed', 0.25, 2, 0.05).name('Playback Speed');
fCapability.add(capabilityDemo, 'loop').name('Loop');
fCapability.add(videoRecorder, 'start').name('Record Video WebM');
fCapability.add(videoRecorder, 'startDouyin').name('Record System Film');
fCapability.add(videoRecorder, 'stop').name('Stop Recording');
fCapability.add(videoRecorder, 'includeCaptions').name('Film Captions');
fCapability.add(videoRecorder, 'includeAudio').name('Film Music');
fCapability.add(videoRecorder, 'includeVoiceover').name('Film Voiceover');
fCapability
  .add(capabilityDemo, 'presentationMode')
  .name('Presentation Mode')
  .onChange((v) => setPresentationMode(Boolean(v) && capabilityDemo.active));
fCapability.add(capabilityDemo, 'stage').name('Stage').listen();
fCapability.add(capabilityDemo, 'progress', 0, 100, 1).name('Progress').listen();

/* -------------------------------------------------------------------------- */
/*  Resize & render loop                                                       */
/* -------------------------------------------------------------------------- */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  fx.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1); // clamp after tab-switches
  shared.uTime.value += dt;

  controls.update();
  if (videoRecorder.active && videoRecorder.script === 'douyin') {
    updateDouyinDemo(dt);
  } else {
    updateCapabilityDemo(dt);
  }
  grass.update(camera.position);
  updateFocusPlane(dt);

  fx.render(dt);
  if (videoRecorder.active) {
    drawRecordingFrame();
    if (videoRecorder.pendingStop) stopVideoRecording();
  }
});
