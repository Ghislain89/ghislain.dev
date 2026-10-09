// Apache/LiteSpeed config for hosting dist/ at ghislain.dev/playwright/slides/.
// Slidev uses history routing, so deep links such as /ui/5 must fall back to index.html.
import { writeFileSync } from 'node:fs'

const spaFallback = `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
`

for (const deck of ['ui', 'api'])
  writeFileSync(`dist/${deck}/.htaccess`, spaFallback)

writeFileSync('dist/.htaccess', `RewriteEngine On
RewriteRule ^$ /playwright/slides.html [R=302,L]
`)
