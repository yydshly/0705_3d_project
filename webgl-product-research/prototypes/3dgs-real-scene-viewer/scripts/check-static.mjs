import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const required = [
  'index.html',
  'src/main.js',
  'src/styles.css',
  'README.md',
  'server.mjs'
];

for (const file of required) {
  await access(join(root, file));
}

const html = await readFile(join(root, 'index.html'), 'utf8');
const js = await readFile(join(root, 'src/main.js'), 'utf8');

const checks = [
  ['iframe target', html.includes('id="splatFrame"')],
  ['scene data', js.includes('garden.splat')],
  ['mesh comparison', html.includes('meshVsSplat')],
  ['external fallback', html.includes('target="_blank"')]
];

const failed = checks.filter(([, ok]) => !ok);

if (failed.length) {
  console.error('Static check failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log('Static prototype check passed.');
