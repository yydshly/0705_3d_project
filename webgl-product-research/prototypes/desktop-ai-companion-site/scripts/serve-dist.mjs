import http from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'

const port = Number(process.argv[2] || 5176)
const root = resolve('dist')

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

http.createServer((request, response) => {
  const url = new URL(request.url || '/', `http://127.0.0.1:${port}`)
  const cleanPath = decodeURIComponent(url.pathname).replace(/^\/+/, '')
  let file = join(root, cleanPath || 'index.html')

  if (!existsSync(file) || statSync(file).isDirectory()) {
    file = join(root, 'index.html')
  }

  response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream')
  createReadStream(file).pipe(response)
}).listen(port, '127.0.0.1', () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}/`)
})
