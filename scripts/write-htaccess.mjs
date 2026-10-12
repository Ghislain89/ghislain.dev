// Apache/LiteSpeed config for Slidev builds hosted on ghislain.dev.
// Slidev uses history routing, so deep links such as /slides/testcontainers/5 must fall back to index.html.
//
//   node ../../scripts/write-htaccess.mjs dist                       one deck in dist/
//   node ../../scripts/write-htaccess.mjs dist/ui dist/api \
//     --redirect dist /playwright/slides.html                         several decks, and dist/ itself redirects
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const redirectAt = args.indexOf('--redirect')
const redirect = redirectAt === -1 ? undefined : args.splice(redirectAt, 3).slice(1)
const dirs = args.length ? args : ['dist']

// DirectoryIndex: a parent .htaccess (such as /playwright/.htaccess) may set another index, which subfolders inherit.
for (const dir of dirs) {
  writeFileSync(join(dir, '.htaccess'), `DirectoryIndex index.html
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
`)
  rmSync(join(dir, '_redirects'), { force: true }) // Netlify-only, written by Slidev
}

if (redirect) {
  const [dir, url] = redirect
  if (!dir || !url) throw new Error('Usage: --redirect <dir> <url>')
  writeFileSync(join(dir, '.htaccess'), `RewriteEngine On
RewriteRule ^$ ${url} [R=302,L]
`)
}
