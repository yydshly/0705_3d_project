import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = 5191;
const server = spawn(process.execPath, ['server.mjs'], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
server.stdout.on('data', (chunk) => {
  output += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  output += chunk.toString();
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`);
  const text = await response.text();
  return { status: response.status, text };
}

try {
  await wait(500);

  const home = await request('/');
  const script = await request('/src/main.js');
  const favicon = await fetch(`http://127.0.0.1:${port}/favicon.ico`);

  if (home.status !== 200 || !home.text.includes('3DGS 真实场景查看器')) {
    throw new Error(`Expected / to return index.html, got ${home.status}`);
  }

  if (script.status !== 200 || !script.text.includes('garden.splat')) {
    throw new Error(`Expected /src/main.js to return scene script, got ${script.status}`);
  }

  if (favicon.status !== 204) {
    throw new Error(`Expected /favicon.ico to return 204, got ${favicon.status}`);
  }

  console.log('Server route check passed.');
} catch (error) {
  console.error(output.trim());
  console.error(error.message);
  process.exitCode = 1;
} finally {
  server.kill();
}
