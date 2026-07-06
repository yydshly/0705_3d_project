import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 5181);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml']
]);

function resolveRequest(url) {
  const pathname = new URL(url, `http://127.0.0.1:${port}`).pathname;
  const safePath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const localPath = safePath === '/' ? 'index.html' : safePath.replace(/^[/\\]/, '');
  return join(root, localPath);
}

const server = createServer(async (request, response) => {
  try {
    const filePath = resolveRequest(request.url || '/');
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes.get(extname(filePath)) || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`3DGS real-scene viewer running at http://127.0.0.1:${port}/`);
});
