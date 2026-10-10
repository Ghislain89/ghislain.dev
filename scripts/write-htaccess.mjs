// Apache/LiteSpeed config for a Slidev build hosted on ghislain.dev.
// Slidev uses history routing, so deep links such as /slides/testcontainers/5 must fall back to index.html.
//   node ../../scripts/write-htaccess.mjs dist
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2] ?? 'dist'
writeFileSync(join(dir, '.htaccess'), `DirectoryIndex index.html
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
`)
rmSync(join(dir, '_redirects'), { force: true }) // Netlify-only, written by Slidev
