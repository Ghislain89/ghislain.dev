// Assembles the static site in dist/site, exactly as it is uploaded to public_html:
//   home/*                      -> /
//   playwright/*                -> /playwright/
//   theme/styles/tokens.css     -> /theme/tokens.css (the shared Tokyo Night palette)
// The decks are built and uploaded separately (see .github/workflows/decks-deploy.yml).
//
//   node scripts/build-site.mjs           -> build
//   node scripts/build-site.mjs --serve   -> build and preview on http://localhost:4321
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'dist/site')

const copies = [
  ['home', '.'],
  ['playwright', 'playwright'],
  ['theme/styles/tokens.css', 'theme/tokens.css'],
]

rmSync(out, { recursive: true, force: true })
for (const [from, to] of copies) {
  const target = join(out, to)
  mkdirSync(dirname(target), { recursive: true })
  cpSync(join(root, from), target, { recursive: true, filter: (src) => !src.endsWith('.DS_Store') })
}
console.log(`Built ${out}`)

if (process.argv.includes('--serve')) {
  const port = Number(process.env.PORT ?? 4321)
  const types = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json',
  }
  // Mirrors the server's DirectoryIndex: index.html, or the one named in the folder's .htaccess.
  const directoryIndex = (dir) => {
    const htaccess = join(dir, '.htaccess')
    const custom = existsSync(htaccess) && readFileSync(htaccess, 'utf8').match(/^DirectoryIndex\s+(\S+)/m)?.[1]
    return join(dir, custom || 'index.html')
  }
  createServer((req, res) => {
    let file = join(out, normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)))
    if (!file.startsWith(out)) return res.writeHead(403).end()
    if (existsSync(file) && statSync(file).isDirectory()) file = directoryIndex(file)
    if (!existsSync(file)) return res.writeHead(404).end('Not found')
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
    res.end(readFileSync(file))
  }).listen(port, () => console.log(`Serving dist/site on http://localhost:${port}`))
}
