// Generates the night-street artwork used by the theme (assets/street.svg and assets/backdrop.svg).
// Original vector art inspired by a Tokyo night street: starry sky, power lines, street lamps,
// a glowing konbini, distant railway crossing and a crosswalk. Run: node theme/scripts/scene.mjs
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets')
const W = 1600
const H = 900
const VP = { x: 800, y: 540 }

let seed = 7
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
const pick = arr => arr[Math.floor(rand() * arr.length)]
const r1 = n => Math.round(n * 10) / 10
const lerp = (a, b, t) => a + (b - a) * t
const poly = (pts, attrs) => `<polygon points="${pts.map(p => `${r1(p[0])},${r1(p[1])}`).join(' ')}" ${attrs}/>`

function stars(count, maxY, minR = 0.5, maxR = 1.7) {
  let s = ''
  for (let i = 0; i < count; i++) {
    const x = rand() * W
    const y = Math.pow(rand(), 1.4) * maxY
    const r = lerp(minR, maxR, Math.pow(rand(), 3))
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="#fff" opacity="${r1(lerp(0.25, 0.95, rand()))}"/>`
  }
  return s
}

// Facades recede towards the vanishing point. side = -1 (left) or 1 (right).
function facade({ side, xa, xb, roofAt0, fill, rows, cols, warm = 0.16, cool = 0.08 }) {
  const d = x => (side < 0 ? x : W - x) / 800
  const ground = x => lerp(780, VP.y, d(x))
  const roof = x => lerp(roofAt0, VP.y, d(x))
  const y = (x, v) => lerp(ground(x), roof(x), v)
  let s = poly([[xa, ground(xa)], [xb, ground(xb)], [xb, roof(xb)], [xa, roof(xa)]], `fill="${fill}"`)
  s += `<polyline points="${r1(xa)},${r1(roof(xa))} ${r1(xb)},${r1(roof(xb))}" stroke="#3a4f99" stroke-width="2" fill="none" opacity=".7"/>`
  const cw = (xb - xa) / cols
  for (let i = 0; i < cols; i++) {
    for (let j = 1; j < rows; j++) {
      const x1 = xa + i * cw + cw * 0.22
      const x2 = x1 + cw * 0.56
      const v1 = j / rows + 0.18 / rows
      const v2 = v1 + 0.55 / rows
      if (v2 > 0.97) continue
      const r = rand()
      const color = r < warm ? pick(['#ffc777', '#f6b26b', '#ffd89a']) : r < warm + cool ? '#9ab8ff' : '#121a3d'
      const op = r < warm + cool ? lerp(0.55, 0.95, rand()) : 0.75
      s += poly([[x1, y(x1, v1)], [x2, y(x2, v1)], [x2, y(x2, v2)], [x1, y(x1, v2)]], `fill="${color}" opacity="${r1(op)}"${r < warm ? ' filter="url(#soft)"' : ''}`)
    }
  }
  return { svg: s, y, ground, roof }
}

function defs() {
  return `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0a0e2e"/><stop offset=".35" stop-color="#16246a"/>
    <stop offset=".55" stop-color="#2c4196"/><stop offset=".62" stop-color="#5b6fc0"/>
  </linearGradient>
  <linearGradient id="road" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#1e2b5c"/><stop offset=".7" stop-color="#3a52a0"/><stop offset="1" stop-color="#8ea6e6"/>
  </linearGradient>
  <linearGradient id="walk" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#1a2550"/><stop offset="1" stop-color="#5068b4"/>
  </linearGradient>
  <radialGradient id="horizon" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#d9e4ff" stop-opacity=".85"/><stop offset=".4" stop-color="#9db4ff" stop-opacity=".35"/><stop offset="1" stop-color="#9db4ff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="lamp" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fff1c4" stop-opacity=".9"/><stop offset=".2" stop-color="#e8a94e" stop-opacity=".45"/><stop offset=".55" stop-color="#9a6a3a" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="shop" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#ffcf87" stop-opacity=".6"/><stop offset="1" stop-color="#ff9e64" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="red" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#ff7a85" stop-opacity=".9"/><stop offset="1" stop-color="#f7768e" stop-opacity="0"/>
  </radialGradient>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2"/></filter>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`
}

function pole(base, t, h0 = 1050) {
  const k = 1 - t
  const w = 3 + k * 13
  const top = base[1] - k * h0
  let s = `<rect x="${r1(base[0] - w / 2)}" y="${r1(top)}" width="${r1(w)}" height="${r1(base[1] - top)}" fill="#0b1130"/>`
  s += `<rect x="${r1(base[0] - w * 3)}" y="${r1(top + k * 60)}" width="${r1(w * 6)}" height="${r1(Math.max(2, w * 0.45))}" fill="#0b1130"/>`
  s += `<rect x="${r1(base[0] - w * 2.2)}" y="${r1(top + k * 110)}" width="${r1(w * 4.4)}" height="${r1(Math.max(2, w * 0.4))}" fill="#0b1130"/>`
  return { svg: s, top: [base[0], top + k * 60], mid: [base[0], top + k * 110], k }
}

const wire = (a, b, sag, width = 1.6) =>
  `<path d="M${r1(a[0])},${r1(a[1])} Q${r1((a[0] + b[0]) / 2)},${r1((a[1] + b[1]) / 2 + sag)} ${r1(b[0])},${r1(b[1])}" stroke="#070b24" stroke-width="${width}" fill="none" opacity=".9"/>`

function street() {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${defs()}`
  s += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`
  s += stars(260, 520)
  // Clouds glowing pink and lavender on the horizon
  s += `<g filter="url(#blur)" opacity=".75"><ellipse cx="760" cy="455" rx="120" ry="50" fill="#c3a6f0"/><ellipse cx="860" cy="430" rx="90" ry="60" fill="#f4a6c8"/><ellipse cx="930" cy="470" rx="110" ry="40" fill="#a6b8ff"/></g>`
  s += `<ellipse cx="${VP.x}" cy="${VP.y - 20}" rx="380" ry="200" fill="url(#horizon)" style="mix-blend-mode:screen"/>`
  // Distant town at the end of the street
  let x = 660
  while (x < 940) {
    const w = 18 + rand() * 30
    const top = 430 + rand() * 80
    s += `<rect x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(VP.y + 8 - top)}" fill="#4a62b0" opacity=".85"/>`
    for (let wy = top + 6; wy < VP.y - 4; wy += 9) {
      for (let wx = x + 3; wx < x + w - 4; wx += 7) {
        if (rand() < 0.35) s += `<rect x="${r1(wx)}" y="${r1(wy)}" width="3" height="3" fill="${rand() < 0.5 ? '#ffe3a8' : '#dfe8ff'}" opacity=".8"/>`
      }
    }
    x += w + 2
  }
  s += `<rect x="600" y="${VP.y - 40}" width="400" height="60" fill="#b9c9ff" opacity=".18" filter="url(#blur)"/>`
  // Ground: sidewalks and road
  s += poly([[0, 780], [VP.x, VP.y], [210, H], [0, H]], 'fill="url(#walk)"')
  s += poly([[W, 780], [VP.x, VP.y], [W - 210, H], [W, H]], 'fill="url(#walk)"')
  s += poly([[210, H], [VP.x, VP.y], [W - 210, H]], 'fill="url(#road)"')
  s += `<polyline points="210,${H} ${VP.x},${VP.y} ${W - 210},${H}" stroke="#0e1640" stroke-width="5" fill="none" opacity=".7"/>`
  s += `<polyline points="330,${H} ${VP.x},${VP.y} ${W - 330},${H}" stroke="#cfdcff" stroke-width="3" fill="none" opacity=".45"/>`
  s += `<line x1="${VP.x}" y1="${VP.y}" x2="${VP.x + 40}" y2="${H}" stroke="#e0e8ff" stroke-width="5" stroke-dasharray="40 46" opacity=".35"/>`
  // Crosswalk
  for (let cx = 250; cx < W - 260; cx += 112) {
    const t = (H - 832) / (H - VP.y)
    const a = [cx, H]
    const b = [cx + 64, H]
    s += poly([a, b, [lerp(b[0], VP.x, t), 832], [lerp(a[0], VP.x, t), 832]], 'fill="#b9cbff" opacity=".5"')
  }
  // Railway crossing near the horizon
  s += `<g transform="translate(905 505)"><line x1="0" y1="0" x2="0" y2="40" stroke="#0b1130" stroke-width="2.5"/><line x1="-9" y1="-6" x2="9" y2="6" stroke="#ffe9a8" stroke-width="2.5"/><line x1="-9" y1="6" x2="9" y2="-6" stroke="#ffe9a8" stroke-width="2.5"/><circle cx="-6" cy="14" r="16" fill="url(#red)" style="mix-blend-mode:screen"/><circle cx="6" cy="14" r="16" fill="url(#red)" style="mix-blend-mode:screen"/><circle cx="-6" cy="14" r="2.6" fill="#ff5f6d"/><circle cx="6" cy="14" r="2.6" fill="#ff5f6d"/></g>`
  // Buildings, left (nearest first is drawn last)
  const left = [
    { xa: 700, xb: 772, roofAt0: -40, fill: '#22306a', rows: 7, cols: 2 },
    { xa: 600, xb: 700, roofAt0: 140, fill: '#1c2860', rows: 4, cols: 3 },
    { xa: 470, xb: 600, roofAt0: -300, fill: '#1a2458', rows: 16, cols: 3, warm: 0.12 },
    { xa: 260, xb: 470, roofAt0: -40, fill: '#18214f', rows: 7, cols: 5, warm: 0.18 },
    { xa: 0, xb: 260, roofAt0: -260, fill: '#141c45', rows: 9, cols: 4, warm: 0.18 },
  ]
  const right = [
    { xa: 828, xb: 900, roofAt0: 160, fill: '#22306a', rows: 4, cols: 2 },
    { xa: 900, xb: 1120, roofAt0: 40, fill: '#1c2860', rows: 5, cols: 4 },
    { xa: 1120, xb: 1330, roofAt0: 120, fill: '#18214f', rows: 4, cols: 3, warm: 0.22 },
    { xa: 1330, xb: W, roofAt0: -160, fill: '#141c45', rows: 8, cols: 4, warm: 0.22 },
  ]
  let konbini
  for (const b of left) {
    const f = facade({ side: -1, ...b })
    s += f.svg
    if (b.xa === 0) konbini = f
  }
  for (const b of right) s += facade({ side: 1, ...b }).svg
  // Konbini: warm storefront, sign band and a vertical neon sign
  const k = konbini
  const q = (x1, x2, v1, v2) => [[x1, k.y(x1, v1)], [x2, k.y(x2, v1)], [x2, k.y(x2, v2)], [x1, k.y(x1, v2)]]
  s += `<ellipse cx="170" cy="840" rx="220" ry="70" fill="url(#shop)" style="mix-blend-mode:screen"/>`
  s += poly(q(20, 235, 0.0, 0.16), 'fill="#ffd28a" opacity=".92" filter="url(#glow)"')
  for (const mx of [70, 125, 180]) s += poly(q(mx, mx + 4, 0.0, 0.16), 'fill="#b98b52" opacity=".7"')
  s += poly(q(10, 245, 0.165, 0.215), 'fill="#d7e3ff" opacity=".9"')
  s += poly(q(30, 150, 0.175, 0.205), 'fill="#5a7bd8" opacity=".85"')
  s += poly(q(170, 200, 0.172, 0.208), 'fill="#f7768e"')
  s += `<g filter="url(#glow)"><rect x="262" y="395" width="26" height="150" rx="3" fill="#2a1a3a" stroke="#ff9e64" stroke-width="3"/>`
  for (let i = 0; i < 5; i++) s += `<rect x="268" y="${405 + i * 28}" width="14" height="${12 + (i % 2) * 4}" rx="2" fill="${i === 2 ? '#f7768e' : '#ffd89a'}"/>`
  s += `</g>`
  s += `<rect x="250" y="${r1(k.y(250, 0.12))}" width="18" height="${r1(k.y(250, 0) - k.y(250, 0.12))}" fill="#eaf1ff" opacity=".85" filter="url(#glow)"/>`
  // Utility poles, lamps and power lines
  const lc = t => [lerp(215, VP.x, t), lerp(H, VP.y, t)]
  const rc = t => [lerp(W - 215, VP.x, t), lerp(H, VP.y, t)]
  const lp = [0.82, 0.66, 0.42, 0.12].map(t => pole(lc(t), t))
  const rp = [0.8, 0.6, 0.36, 0.05].map(t => pole(rc(t), t))
  for (const p of [...lp, ...rp]) s += p.svg
  const lamp = (p, len, size) => {
    const ax = p.top[0] + len
    const ay = p.mid[1] + 20 * p.k
    return `<circle cx="${r1(ax)}" cy="${r1(ay)}" r="${r1(size * 5)}" fill="url(#lamp)" style="mix-blend-mode:screen"/>`
      + `<path d="M${r1(p.top[0])},${r1(ay + 8 * p.k)} Q${r1(p.top[0] + len / 2)},${r1(ay - 22 * p.k)} ${r1(ax)},${r1(ay)}" stroke="#0b1130" stroke-width="${r1(2 + p.k * 4)}" fill="none"/>`
      + `<ellipse cx="${r1(ax)}" cy="${r1(ay + 2)}" rx="${r1(size)}" ry="${r1(size * 0.3)}" fill="#fff4cf"/>`
  }
  s += lamp(lp[2], 120, 34) + lamp(lp[1], 60, 18)
  s += `<ellipse cx="520" cy="770" rx="170" ry="40" fill="url(#lamp)" style="mix-blend-mode:screen" opacity=".55"/>`
  s += `<ellipse cx="600" cy="800" rx="30" ry="110" fill="#ffd98a" opacity=".12" filter="url(#blur)"/>`
  const chain = ps => {
    let w = ''
    for (let i = 0; i < ps.length - 1; i++) {
      w += wire(ps[i].top, ps[i + 1].top, 30 * ps[i + 1].k, 1 + 2 * ps[i + 1].k)
      w += wire(ps[i].mid, ps[i + 1].mid, 40 * ps[i + 1].k, 1 + 2 * ps[i + 1].k)
    }
    return w
  }
  s += chain(lp) + chain(rp)
  s += wire(lp[1].top, rp[1].top, 40, 1.4) + wire(lp[2].top, rp[2].top, 70, 2) + wire(lp[2].mid, rp[1].mid, 60, 1.6)
  s += wire(lp[3].top, rp[2].top, 120, 2.5) + wire(lp[3].mid, rp[3].mid, 160, 3) + wire([0, 120], lp[3].top, 40, 3)
  s += wire(rp[3].top, [W, 60], 30, 3) + wire(lp[0].top, rp[0].top, 18, 1)
  s += `</svg>`
  return s
}

// Calm backdrop for content slides: sky, stars, power lines and a dark skyline along the bottom
function backdrop() {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${defs()}`
  s += `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121530"/><stop offset=".6" stop-color="#1a1b2e"/><stop offset="1" stop-color="#1d2547"/></linearGradient>`
  s += `<rect width="${W}" height="${H}" fill="url(#bg)"/>`
  s += `<g opacity=".55">${stars(120, 360, 0.5, 1.4)}</g>`
  s += `<g filter="url(#blur)" opacity=".16"><ellipse cx="560" cy="${H - 40}" rx="260" ry="60" fill="#bb9af7"/><ellipse cx="880" cy="${H - 50}" rx="220" ry="50" fill="#f4a6c8"/><ellipse cx="1180" cy="${H - 30}" rx="240" ry="50" fill="#7aa2f7"/></g>`
  s += `<g opacity=".8">`
  s += `<rect x="1490" y="-10" width="9" height="200" fill="#0b0f26"/><rect x="1462" y="40" width="65" height="5" fill="#0b0f26"/>`
  s += wire([1100, -10], [1494, 42], 40, 1.4) + wire([1180, -10], [1494, 42], 25, 1.2) + wire([1494, 42], [1610, 70], 10, 1.4) + wire([1494, 70], [1610, 110], 12, 1.4) + wire([1260, -10], [1494, 70], 30, 1.1)
  s += `</g>`
  // Skyline
  let x = -10
  let sky = ''
  while (x < W) {
    const w = 40 + rand() * 90
    const h = 18 + rand() * 50
    sky += `<rect x="${r1(x)}" y="${r1(H - h)}" width="${r1(w)}" height="${r1(h)}" fill="#141a3a"/>`
    for (let wy = H - h + 7; wy < H - 6; wy += 11) {
      for (let wx = x + 6; wx < x + w - 8; wx += 12) {
        const r = rand()
        if (r < 0.12) sky += `<rect x="${r1(wx)}" y="${r1(wy)}" width="5" height="4" fill="${r < 0.08 ? '#ffc777' : '#7aa2f7'}" opacity=".55"/>`
      }
    }
    x += w
  }
  s += `<g opacity=".9">${sky}</g>`
  s += `<rect x="0" y="${H - 3}" width="${W}" height="3" fill="#7aa2f7" opacity=".25"/>`
  s += `</svg>`
  return s
}

writeFileSync(join(out, 'street.svg'), street())
writeFileSync(join(out, 'backdrop.svg'), backdrop())
console.log('wrote street.svg and backdrop.svg')
