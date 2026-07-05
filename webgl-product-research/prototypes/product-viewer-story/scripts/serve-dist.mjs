import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'

const root = resolve('dist')
const port = Number(process.env.PORT || 5179)

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary'
}

createServer((request, response) => {
  const url = new URL(request.url || '/', `http://127.0.0.1:${port}`)
  const safePath = url.pathname === '/' ? '/index.html' : url.pathname
  const file = join(root, safePath)
  const target = existsSync(file) && statSync(file).isFile() ? file : join(root, 'index.html')

  response.setHeader('Content-Type', types[extname(target)] || 'application/octet-stream')
  createReadStream(target).pipe(response)
}).listen(port, '127.0.0.1', () => {
  console.log(`product-viewer-story dist: http://127.0.0.1:${port}/`)
})
