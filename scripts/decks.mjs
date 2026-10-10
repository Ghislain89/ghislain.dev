// Runs an npm command in one deck or in every deck under decks/.
//   node scripts/decks.mjs ci                  -> npm ci in every deck
//   node scripts/decks.mjs run build           -> npm run build in every deck
//   node scripts/decks.mjs run dev testcontainers
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const all = readdirSync('decks', { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join('decks', entry.name, 'package.json')))
  .map((entry) => entry.name)

const args = process.argv.slice(2)
const last = args.at(-1)
const decks = all.includes(last) ? [args.pop()] : all

if (args.length === 0) {
  console.log(`Usage: node scripts/decks.mjs <npm args> [deck]\nDecks: ${all.join(', ')}`)
  process.exit(1)
}

for (const deck of decks) {
  console.log(`\n▶ decks/${deck}: npm ${args.join(' ')}`)
  const { status } = spawnSync('npm', args, { cwd: join('decks', deck), stdio: 'inherit', shell: process.platform === 'win32' })
  if (status !== 0) process.exit(status ?? 1)
}
