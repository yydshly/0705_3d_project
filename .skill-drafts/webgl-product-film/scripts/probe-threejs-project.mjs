#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || process.cwd());
const maxFiles = Number(process.env.PROBE_MAX_FILES || 500);
const exts = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".glsl", ".vert", ".frag"]);
const ignoreDirs = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage"]);

function walk(dir, out = []) {
  if (out.length >= maxFiles) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) walk(full, out);
    } else if (exts.has(path.extname(entry.name))) {
      out.push(full);
      if (out.length >= maxFiles) break;
    }
  }
  return out;
}

const patterns = [
  ["three-import", /from\s+["']three["']|require\(["']three["']\)/],
  ["renderer", /WebGLRenderer|WebGPURenderer/],
  ["render-loop", /requestAnimationFrame|setAnimationLoop/],
  ["shader", /ShaderMaterial|RawShaderMaterial|onBeforeCompile|vertexShader|fragmentShader/],
  ["instancing", /InstancedMesh|InstancedBufferGeometry|gl_InstanceID/],
  ["post-processing", /EffectComposer|UnrealBloomPass|BokehPass|ShaderPass/],
  ["gltf", /GLTFLoader|\.glb|\.gltf/],
  ["controls", /OrbitControls|PointerLockControls|TransformControls/],
  ["recording", /MediaRecorder|captureStream/],
  ["gui", /lil-gui|dat\.gui|leva|tweakpane/],
];

const pkgPath = path.join(root, "package.json");
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  console.log(`# ${pkg.name || path.basename(root)}`);
  console.log(`scripts: ${Object.keys(pkg.scripts || {}).join(", ") || "none"}`);
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const interestingDeps = Object.keys(deps).filter((name) =>
    /three|vite|react|vue|svelte|gsap|theatre|leva|gui|ffmpeg|remotion/i.test(name),
  );
  console.log(`notable deps: ${interestingDeps.join(", ") || "none"}`);
}

const files = walk(root);
const hits = new Map(patterns.map(([name]) => [name, []]));

for (const file of files) {
  let text = "";
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const [name, re] of patterns) {
    if (re.test(text)) hits.get(name).push(path.relative(root, file));
  }
}

console.log("\nFindings:");
for (const [name, filesWithHit] of hits) {
  const sample = filesWithHit.slice(0, 8);
  console.log(`- ${name}: ${filesWithHit.length ? sample.join(", ") : "not found"}`);
}

console.log(`\nScanned ${files.length} source-like files under ${root}`);
