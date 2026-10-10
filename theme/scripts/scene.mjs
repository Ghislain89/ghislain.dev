// Generates the night-street artwork used by the theme (assets/street.svg and assets/backdrop.svg).
// Original vector art inspired by a Tokyo night street: starry sky, a lit cumulus cloud, power lines,
// street lamps, a glowing konbini, parked cars, a railway crossing and a wet road with a crosswalk.
// The street is modelled in 3D (u across the road, z away from the viewer, h up) with distance fog.
// Run: node theme/scripts/scene.mjs
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets')
const W = 1600
const H = 900
const VP = { x: 800, y: 540 }
const F = 590 // focal length: one unit at distance 1 is 590px; the road is 2 units wide
const EYE = 360 / F // eye height, so the road edges meet the bottom corners at z = 1
const WALK = 2.03 // building line
const HAZE = '#7088d8'

let seed = 7
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
const pick = arr => arr[Math.floor(rand() * arr.length)]
const r1 = n => Math.round(n * 10) / 10
const lerp = (a, b, t) => a + (b - a) * t
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))
const mix = (a, b, t) => `#${hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], t)).toString(16).padStart(2, '0')).join('')}`
const pts = list => list.map(p => `${r1(p[0])},${r1(p[1])}`).join(' ')
const poly = (list, attrs) => `<polygon points="${pts(list)}" ${attrs}/>`
const line = (list, attrs) => `<polyline points="${pts(list)}" fill="none" ${attrs}/>`
const fog = z => Math.min(0.88, Math.max(0, 1 - Math.exp(-(z - 1.4) * 0.05)))

// Projection and the three kinds of planes in the street
const P = (u, z, h = 0) => [VP.x + (u * F) / z, VP.y + ((EYE - h) * F) / z]
const side = (u, za, zb, ha, hb) => [P(u, za, ha), P(u, zb, ha), P(u, zb, hb), P(u, za, hb)] // facing the road
const face = (ua, ub, z, ha, hb) => [P(ua, z, ha), P(ub, z, ha), P(ub, z, hb), P(ua, z, hb)] // facing the viewer
const flat = (ua, ub, za, zb, h = 0) => [P(ua, za, h), P(ub, za, h), P(ub, zb, h), P(ua, zb, h)] // horizontal
const px = (n, z) => (n * F) / z

let gid = 0
let extraDefs = ''
function hGradient(x1, x2, stops) {
  const id = `g${gid++}`
  extraDefs += `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${r1(x1)}" y1="0" x2="${r1(x2)}" y2="0">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`
  return `url(#${id})`
}

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

function sparkles(count, maxY) {
  let s = ''
  for (let i = 0; i < count; i++) {
    const x = rand() * W
    const y = rand() * maxY
    const l = 4 + rand() * 6
    s += `<g opacity="${r1(lerp(0.5, 0.95, rand()))}"><circle cx="${r1(x)}" cy="${r1(y)}" r="5" fill="url(#star)"/><path d="M${r1(x - l)},${r1(y)}H${r1(x + l)}M${r1(x)},${r1(y - l)}V${r1(y + l)}" stroke="#eaf0ff" stroke-width=".8"/></g>`
  }
  return s
}

function defs() {
  return `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#090d2e"/><stop offset=".28" stop-color="#16236e"/>
    <stop offset=".46" stop-color="#2a45a8"/><stop offset=".58" stop-color="#5d7fd8"/><stop offset=".62" stop-color="#8fa8ea"/>
  </linearGradient>
  <linearGradient id="road" gradientUnits="userSpaceOnUse" x1="0" y1="900" x2="0" y2="540">
    <stop offset="0" stop-color="#1f2c62"/><stop offset=".55" stop-color="#3550a4"/><stop offset=".9" stop-color="#7d97e2"/><stop offset="1" stop-color="#b9cbf6"/>
  </linearGradient>
  <linearGradient id="walk" gradientUnits="userSpaceOnUse" x1="0" y1="900" x2="0" y2="540">
    <stop offset="0" stop-color="#2a3a7c"/><stop offset=".7" stop-color="#4d68bc"/><stop offset="1" stop-color="#93abe8"/>
  </linearGradient>
  <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#a9bdf5" stop-opacity="0"/><stop offset=".6" stop-color="#a9bdf5" stop-opacity=".35"/><stop offset="1" stop-color="#a9bdf5" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff0c2" stop-opacity=".5"/><stop offset="1" stop-color="#ffd38a" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff6dc"/><stop offset=".5" stop-color="#ffdca0"/><stop offset="1" stop-color="#f3b46a"/>
  </linearGradient>
  <linearGradient id="cloud" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f4f7ff"/><stop offset=".45" stop-color="#c9d6ff"/><stop offset=".8" stop-color="#9aa8ec"/><stop offset="1" stop-color="#e7b3dc"/>
  </linearGradient>
  <radialGradient id="horizon" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#e3ebff" stop-opacity=".9"/><stop offset=".4" stop-color="#9db4ff" stop-opacity=".35"/><stop offset="1" stop-color="#9db4ff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="lamp" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fff1c4" stop-opacity=".95"/><stop offset=".2" stop-color="#e8a94e" stop-opacity=".5"/><stop offset=".55" stop-color="#9a6a3a" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="warm" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#ffd59a" stop-opacity=".75"/><stop offset=".5" stop-color="#ff9e64" stop-opacity=".2"/><stop offset="1" stop-color="#ff9e64" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="cool" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#dfe9ff" stop-opacity=".7"/><stop offset="1" stop-color="#7aa2f7" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="red" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#ff7a85" stop-opacity=".95"/><stop offset="1" stop-color="#f7768e" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="star" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#c7d4ff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vignette" cx=".5" cy=".46" r=".75">
    <stop offset=".55" stop-color="#05071a" stop-opacity="0"/><stop offset="1" stop-color="#05071a" stop-opacity=".6"/>
  </radialGradient>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2"/></filter>
  <filter id="cloudy" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="streak" x="-200%" y="-50%" width="500%" height="200%"><feGaussianBlur stdDeviation="5 9"/></filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  ${extraDefs}
</defs>`
}

const screen = 'style="mix-blend-mode:screen"'
const glowAt = ([x, y], r, grad, opacity = 1, sy = 1) =>
  `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(r)}" ry="${r1(r * sy)}" fill="url(#${grad})" opacity="${opacity}" ${screen}/>`

// A reflection on the wet road: a soft vertical streak below a light, as far below the ground as the light is above it
function reflection(u, z, h, color, width = 0.12, opacity = 0.5) {
  const [x, gy] = P(u, z, 0)
  const ly = P(u, z, h)[1]
  const len = Math.max(8, gy - ly)
  return `<ellipse cx="${r1(x)}" cy="${r1(gy + len * 0.45)}" rx="${r1(Math.max(2, px(width, z)))}" ry="${r1(len * 0.55)}" fill="${color}" opacity="${opacity}" filter="url(#streak)" ${screen}/>`
}

// A building whose facade runs along the street on one side (s = -1 left, 1 right)
function building({ s, z0, z1, h, fill, floors, type = 'flat', warm = 0.22, cool = 0.1, signs = [], roof = true, shutters = 0.4 }) {
  const u = s * WALK
  const shade = z => mix(fill, HAZE, fog(z))
  const fh = h / floors
  let svg = ''
  // The end wall facing the viewer shows above lower, nearer buildings
  svg += poly(face(u, u + s * 2.2, z0, 0, h), `fill="${mix(shade(z0), '#070b26', 0.35)}"`)
  svg += line([P(u, z0, h), P(u + s * 2.2, z0, h)], `stroke="${mix(shade(z0), '#b9c8ff', 0.25)}" stroke-width="${r1(Math.max(0.6, px(0.02, z0)))}"`)
  svg += poly(side(u, z0, z1, 0, h), `fill="${hGradient(P(u, z0)[0], P(u, z1)[0], [[0, mix(shade(z0), '#c3d2ff', 0.06)], [1, shade(z1)]])}"`)
  // Corner and parapet highlights
  svg += line([P(u, z0, 0), P(u, z0, h)], `stroke="${mix(shade(z0), '#c3d2ff', 0.3)}" stroke-width="${r1(Math.max(0.6, px(0.025, z0)))}" opacity=".7"`)
  svg += line([P(u, z0, h), P(u, z1, h)], `stroke="${mix(shade(z0), '#b9c8ff', 0.4)}" stroke-width="${r1(Math.max(0.8, px(0.03, z0)))}" opacity=".8"`)
  // Roof clutter: water tanks, AC units and antennas against the sky
  if (roof) {
    const zr = lerp(z0, z1, 0.25 + rand() * 0.4)
    const dark = mix(shade(zr), '#070b26', 0.45)
    svg += poly(face(u + s * 0.3, u + s * 0.75, zr, h, h + 0.32), `fill="${dark}"`)
    svg += poly(face(u + s * 0.25, u + s * 0.8, zr, h + 0.32, h + 0.36), `fill="${dark}"`)
    svg += line([P(u + s * 0.15, zr + 0.4, h), P(u + s * 0.15, zr + 0.4, h + 0.7)], `stroke="${dark}" stroke-width="${r1(Math.max(0.6, px(0.015, zr)))}"`)
    svg += line([P(u + s * 0.05, zr + 0.4, h + 0.55), P(u + s * 0.25, zr + 0.4, h + 0.55)], `stroke="${dark}" stroke-width="${r1(Math.max(0.6, px(0.012, zr)))}"`)
  }
  const bays = Math.max(1, Math.round((z1 - z0) / 0.5))
  const bw = (z1 - z0) / bays
  let lit = ''
  for (let f = 0; f < floors; f++) {
    const base = f * fh
    if (f > 0) svg += line([P(u, z0, base), P(u, z1, base)], `stroke="${mix(shade(z0), '#a9bcff', 0.2)}" stroke-width="${r1(Math.max(0.5, px(0.012, z0)))}" opacity=".6"`)
    for (let i = 0; i < bays; i++) {
      const za = z0 + (i + 0.18) * bw
      const zb = za + 0.62 * bw
      const zm = (za + zb) / 2
      if (f === 0) {
        if (type === 'shop') continue
        if (rand() < shutters) {
          svg += poly(side(u, za, zb, 0, fh * 0.7), `fill="${mix(shade(zm), '#8ea3e0', 0.25)}"`)
          for (let k = 1; k < 6; k++) svg += line([P(u, za, (fh * 0.7 * k) / 6), P(u, zb, (fh * 0.7 * k) / 6)], `stroke="${mix(shade(zm), '#0a1033', 0.4)}" stroke-width=".6" opacity=".6"`)
        } else if (rand() < 0.5) {
          svg += poly(side(u, za, zb, 0, fh * 0.72), `fill="${mix(pick(['#ffd59a', '#e3ecff']), HAZE, fog(zm) * 0.6)}" opacity=".85"`)
          lit += glowAt(P(u * 0.92, zm, 0.05), px(0.5, zm), rand() < 0.6 ? 'warm' : 'cool', 0.6, 0.35)
        } else {
          svg += poly(side(u, za, zb, 0, fh * 0.72), `fill="${mix(shade(zm), '#070b26', 0.5)}"`)
        }
        continue
      }
      const ha = base + fh * 0.26
      const hb = base + fh * 0.76
      const r = rand()
      if (r < warm + cool) {
        const c = r < warm ? pick(['#ffc777', '#ffb86c', '#ffd89a', '#ffe2b0']) : pick(['#e3ecff', '#c6d5ff'])
        lit += poly(side(u, za, zb, ha, hb), `fill="${mix(c, HAZE, fog(zm) * 0.55)}"`)
        if (zm < 9 && rand() < 0.5) lit += poly(side(u, za, lerp(za, zb, 0.35), ha, hb), `fill="${mix(c, '#7a4a3a', 0.35)}" opacity=".8"`)
      } else {
        svg += poly(side(u, za, zb, ha, hb), `fill="${mix(shade(zm), '#060a24', 0.45)}"`)
        svg += poly(side(u, za, zb, hb - fh * 0.12, hb), `fill="${mix(shade(zm), '#9db4ff', 0.25)}" opacity=".6"`)
      }
      if (zm < 12) svg += line([P(u, zm, ha), P(u, zm, hb)], `stroke="${mix(shade(zm), '#060a24', 0.5)}" stroke-width="${r1(Math.max(0.5, px(0.015, zm)))}"`)
      if (type === 'apt') {
        const ub = u - s * 0.16
        svg += poly(side(ub, z0 + i * bw + 0.04, z0 + (i + 1) * bw - 0.04, base, base + 0.05), `fill="${mix(shade(zm), '#b9c8ff', 0.35)}"`)
        svg += poly(side(ub, z0 + i * bw + 0.04, z0 + (i + 1) * bw - 0.04, base + 0.05, base + 0.3), `fill="${mix(shade(zm), '#0a1033', 0.25)}" opacity=".75"`)
        svg += line([P(ub, z0 + i * bw + 0.04, base + 0.3), P(ub, z0 + (i + 1) * bw - 0.04, base + 0.3)], `stroke="${mix(shade(zm), '#c3d2ff', 0.35)}" stroke-width="${r1(Math.max(0.5, px(0.012, zm)))}"`)
      } else if (zm < 14 && rand() < 0.3) {
        const ua = u - s * 0.07
        svg += poly(side(ua, za, za + 0.2, base + 0.04, base + 0.2), `fill="${mix(shade(zm), '#a9b8e8', 0.35)}"`)
        svg += line([P(ua, za + 0.1, base + 0.08), P(ua, za + 0.1, base + 0.16)], `stroke="${mix(shade(zm), '#0a1033', 0.5)}" stroke-width="${r1(Math.max(0.5, px(0.02, zm)))}"`)
      }
    }
  }
  svg += `<g filter="url(#soft)">${lit}</g>${lit}`
  // Drain pipe
  const zp = lerp(z0, z1, 0.9)
  if (zp < 16) svg += line([P(u - s * 0.02, zp, 0), P(u - s * 0.02, zp, h)], `stroke="${mix(shade(zp), '#060a24', 0.5)}" stroke-width="${r1(Math.max(0.6, px(0.025, zp)))}"`)
  // Signs sticking out over the pavement, facing the viewer
  for (const sg of signs) {
    const ua = u - s * 0.05
    const ub = u - s * (0.05 + (sg.w ?? 0.2))
    svg += `<g filter="url(#glow)">${poly(face(ua, ub, sg.z, sg.ha, sg.hb), `fill="${sg.bg ?? '#2a1a3a'}" stroke="${sg.color}" stroke-width="${r1(Math.max(1, px(0.012, sg.z)))}"`)}`
    const n = sg.blocks ?? 4
    for (let k = 0; k < n; k++) {
      const hh = lerp(sg.hb, sg.ha, (k + 0.25) / n)
      svg += poly(face(lerp(ua, ub, 0.28), lerp(ua, ub, 0.72), sg.z, hh - (sg.hb - sg.ha) / n * 0.55, hh), `fill="${k === sg.accent ? '#f7768e' : sg.ink ?? '#ffd89a'}"`)
    }
    svg += `</g>`
    svg += reflection(lerp(ua, ub, 0.5), sg.z, (sg.ha + sg.hb) / 2, sg.color, 0.08, 0.35)
  }
  return svg
}

function pole(u, z, { lamp = false, transformer = false, sign = false } = {}) {
  const w = 0.07
  const c = mix('#0a0f2e', HAZE, fog(z) * 0.8)
  const top = 2.75
  let s = poly(face(u - w / 2, u + w / 2, z, 0, top), `fill="${c}"`)
  s += poly(face(u - w / 2, u - w / 2 + 0.018, z, 0, top), `fill="${mix(c, '#7f97e0', 0.35)}"`)
  for (const [hh, half] of [[2.5, 0.38], [2.22, 0.3]]) {
    s += poly(face(u - half, u + half, z, hh, hh + 0.05), `fill="${c}"`)
    for (const k of [-0.8, -0.3, 0.3, 0.8]) s += poly(face(u + half * k - 0.015, u + half * k + 0.015, z, hh + 0.05, hh + 0.11), `fill="${mix(c, '#c6d0f0', 0.4)}"`)
  }
  if (transformer) {
    s += poly(face(u + 0.04, u + 0.26, z, 1.72, 2.08), `fill="${mix(c, '#5f6f9e', 0.35)}" rx="3"`)
    s += poly(face(u + 0.06, u + 0.1, z, 1.72, 2.08), `fill="${mix(c, '#b9c8ff', 0.3)}" opacity=".6"`)
  }
  s += poly(face(u - 0.1, u - 0.035, z, 1.1, 1.32), `fill="${mix(c, '#55679e', 0.3)}"`)
  if (sign) {
    const [x, y] = P(u, z, 1.55)
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(px(0.13, z))}" fill="#3d63d8" stroke="#e3ecff" stroke-width="${r1(px(0.02, z))}"/>`
    s += `<path d="M${r1(x - px(0.08, z))},${r1(y + px(0.08, z))}L${r1(x + px(0.08, z))},${r1(y - px(0.08, z))}" stroke="#f7768e" stroke-width="${r1(px(0.025, z))}"/>`
  }
  if (lamp) {
    const dir = u < 0 ? 1 : -1
    const head = [u + dir * 0.55, z, 1.95]
    const arm = P(u, z, 1.9)
    const tip = P(...head)
    s += `<path d="M${r1(arm[0])},${r1(arm[1])} Q${r1((arm[0] + tip[0]) / 2)},${r1(tip[1] - px(0.12, z))} ${r1(tip[0])},${r1(tip[1])}" stroke="${c}" stroke-width="${r1(px(0.03, z))}" fill="none"/>`
    const g = P(head[0], z, 0)
    const spread = px(0.75, z)
    s += `<polygon points="${pts([[tip[0] - px(0.06, z), tip[1]], [tip[0] + px(0.06, z), tip[1]], [g[0] + spread, g[1]], [g[0] - spread, g[1]]])}" fill="url(#cone)" opacity=".55" ${screen}/>`
    s += glowAt(g, px(1.1, z), 'lamp', 0.6, 0.28)
    s += glowAt(tip, px(0.9, z), 'lamp', 1)
    s += `<ellipse cx="${r1(tip[0])}" cy="${r1(tip[1] + px(0.01, z))}" rx="${r1(px(0.13, z))}" ry="${r1(px(0.035, z))}" fill="#fff6d8"/>`
    s += reflection(head[0], z, 1.95, '#ffd89a', 0.12, 0.45)
  }
  return { svg: s, a: P(u - 0.34, z, 2.53), b: P(u + 0.34, z, 2.53), c: P(u - 0.26, z, 2.25), d: P(u + 0.26, z, 2.25), z }
}

const wire = (a, b, sag, width = 1.6, color = '#060a22') =>
  `<path d="M${r1(a[0])},${r1(a[1])} Q${r1((a[0] + b[0]) / 2)},${r1((a[1] + b[1]) / 2 + sag)} ${r1(b[0])},${r1(b[1])}" stroke="${color}" stroke-width="${r1(width)}" fill="none" opacity=".92"/>`

function car(u0, u1, z0, body = '#2b3c80') {
  const len = 1.1
  const z1 = z0 + len
  const ub = u0 < 0 ? u1 : u0 // the side facing the road centre
  const c = mix(body, HAZE, fog(z0) * 0.7)
  const hi = mix(c, '#c9d6ff', 0.45)
  let s = poly(flat(u0 - 0.03, u1 + 0.03, z0 - 0.05, z1 + 0.05), 'fill="#05081c" opacity=".45" filter="url(#soft)"')
  for (const zw of [z0 + 0.2, z1 - 0.2]) {
    const [x, y] = P(ub, zw, 0.075)
    s += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(px(0.035, zw))}" ry="${r1(px(0.075, zw))}" fill="#05081c"/>`
  }
  s += poly(side(ub, z0, z1, 0.07, 0.24), `fill="${mix(c, '#060a24', 0.15)}"`)
  s += line([P(ub, z0, 0.2), P(ub, z1, 0.2)], `stroke="${hi}" stroke-width="${r1(px(0.01, z0))}" opacity=".7"`)
  const uc = ub + (u0 < 0 ? -0.04 : 0.04)
  s += poly([P(uc, z0 + 0.3, 0.25), P(uc, z1 - 0.25, 0.25), P(uc, z1 - 0.38, 0.36), P(uc, z0 + 0.42, 0.36)], `fill="#141c48"`)
  s += poly([P(uc, z0 + 0.34, 0.26), P(uc, z0 + 0.58, 0.26), P(uc, z0 + 0.6, 0.34), P(uc, z0 + 0.45, 0.34)], `fill="${hi}" opacity=".35"`)
  s += poly(flat(u0 + 0.05, u1 - 0.05, z0 + 0.42, z1 - 0.38, 0.36), `fill="${mix(c, '#9db4ff', 0.35)}"`)
  s += poly([P(u0 + 0.04, z0 + 0.14, 0.25), P(u1 - 0.04, z0 + 0.14, 0.25), P(u1 - 0.07, z0 + 0.42, 0.36), P(u0 + 0.07, z0 + 0.42, 0.36)], `fill="${hGradient(P(u0, z0)[0], P(u1, z0)[0], [[0, '#2a3a7c'], [0.5, '#6d86d4'], [1, '#22306a']])}"`)
  s += poly(flat(u0, u1, z0, z0 + 0.14, 0.25), `fill="${mix(c, '#9db4ff', 0.2)}"`)
  for (const ut of [u0, u1 - 0.07]) s += poly(face(ut, ut + 0.07, z0 + 0.03, 0, 0.08), 'fill="#05081c"')
  s += poly(face(u0, u1, z0, 0.05, 0.25), `fill="${c}"`)
  s += poly(face(u0, u1, z0, 0.05, 0.08), `fill="${mix(c, '#060a24', 0.4)}"`)
  s += poly(face((u0 + u1) / 2 - 0.06, (u0 + u1) / 2 + 0.06, z0, 0.1, 0.15), `fill="#dfe8ff" opacity=".85"`)
  for (const [ua, ubb] of [[u0 + 0.02, u0 + 0.1], [u1 - 0.1, u1 - 0.02]]) {
    s += glowAt(P((ua + ubb) / 2, z0, 0.19), px(0.2, z0), 'red', 0.9)
    s += poly(face(ua, ubb, z0, 0.17, 0.21), `fill="#ff5f6d"`)
    s += reflection((ua + ubb) / 2, z0, 0.19, '#ff5f6d', 0.05, 0.6)
  }
  return s
}

function cloud() {
  // A cumulus tower lit from the front, sitting behind the far end of the street
  let shadow = ''
  let body = ''
  let light = ''
  const puffs = []
  for (let i = 0; i < 46; i++) {
    const t = rand()
    const x = lerp(600, 1000, t)
    const bell = Math.exp(-Math.pow((t - 0.42) / 0.22, 2))
    const r = 22 + bell * 46 + rand() * 18
    const y = 470 - bell * 150 - rand() * 40 - r * 0.3
    puffs.push([x, y, r])
  }
  puffs.sort((a, b) => b[1] - a[1])
  for (const [x, y, r] of puffs) {
    shadow += `<circle cx="${r1(x + 4)}" cy="${r1(y + 8)}" r="${r1(r)}" fill="#6d80d4"/>`
    body += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r * 0.94)}"/>`
    light += `<circle cx="${r1(x - r * 0.25)}" cy="${r1(y - r * 0.3)}" r="${r1(r * 0.55)}" fill="#f7f9ff" opacity=".55"/>`
  }
  return `<g filter="url(#cloudy)">${shadow}<g fill="url(#cloud)">${body}</g>${light}</g>`
    + `<ellipse cx="800" cy="470" rx="240" ry="34" fill="#f4a6c8" opacity=".35" filter="url(#blur)" ${screen}/>`
}

function street() {
  gid = 0
  extraDefs = ''
  let s = ''
  s += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`
  s += stars(300, 520) + sparkles(10, 320)
  s += `<ellipse cx="${VP.x}" cy="${VP.y - 40}" rx="520" ry="230" fill="url(#horizon)" ${screen}/>`
  s += cloud()
  s += `<g filter="url(#blur)" opacity=".6"><ellipse cx="560" cy="480" rx="140" ry="40" fill="#c3a6f0"/><ellipse cx="1060" cy="470" rx="160" ry="36" fill="#a6b8ff"/></g>`
  // Distant town beyond the crossing
  let town = ''
  for (let i = 0; i < 26; i++) {
    const z = 45 + rand() * 50
    const ua = lerp(-9, 9, rand())
    const ww = 0.8 + rand() * 1.6
    const hh = 1.5 + Math.pow(rand(), 2) * 8
    const c = mix('#4f68bd', '#b3c4f5', fog(z) * 0.8)
    town += poly(face(ua, ua + ww, z, 0, hh), `fill="${c}"`)
    for (let fy = 0.6; fy < hh - 0.3; fy += 0.55) {
      for (let fx = ua + 0.2; fx < ua + ww - 0.2; fx += 0.4) {
        if (rand() < 0.35) town += poly(face(fx, fx + 0.2, z, fy, fy + 0.25), `fill="${rand() < 0.5 ? '#fff0c8' : '#eef3ff'}" opacity=".85"`)
      }
    }
  }
  s += town
  s += `<rect x="0" y="${VP.y - 120}" width="${W}" height="150" fill="url(#mist)"/>`
  // Trees around the crossing
  for (const [u0, z] of [[-2.6, 20], [-1.7, 24], [1.8, 19], [2.8, 23], [-3.6, 17]]) {
    const c = mix('#2a8fa8', '#9fd9e6', fog(z) * 0.6)
    for (let k = 0; k < 9; k++) {
      const [x, y] = P(u0 + (rand() - 0.5) * 0.9, z, 0.6 + rand() * 0.8)
      s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(px(0.25 + rand() * 0.25, z))}" fill="${k % 3 ? c : mix(c, '#d6f5ff', 0.3)}"/>`
    }
  }
  // Ground: road, pavements and kerbs
  s += poly([P(-WALK, 1), P(-WALK, 400), P(-1, 400), P(-1, 1)], 'fill="url(#walk)"')
  s += poly([P(WALK, 1), P(WALK, 400), P(1, 400), P(1, 1)], 'fill="url(#walk)"')
  s += poly([P(-1, 1), P(-1, 400), P(1, 400), P(1, 1)], 'fill="url(#road)"')
  s += poly([P(-WALK, 0.6), P(-WALK, 1.5), P(-1, 1.5), P(-1, 0.6)], 'fill="url(#walk)"')
  let tiles = ''
  for (const sd of [-1, 1]) {
    for (let k = 1; k < 5; k++) tiles += line([P(sd * lerp(1, WALK, k / 5), 0.6), P(sd * lerp(1, WALK, k / 5), 300)], '')
    for (let z = 1; z < 40; z *= 1.09) tiles += line([P(sd * 1.03, z), P(sd * WALK, z)], '')
  }
  s += `<g stroke="#a9bcff" stroke-width=".7" opacity=".16">${tiles}</g>`
  for (const sd of [-1, 1]) {
    s += line([P(sd * 1.0, 0.8), P(sd * 1.0, 400)], 'stroke="#0d1640" stroke-width="5" opacity=".75"')
    s += line([P(sd * 1.03, 0.8), P(sd * 1.03, 400)], 'stroke="#c9d6ff" stroke-width="2" opacity=".5"')
    s += line([P(sd * 0.9, 0.8), P(sd * 0.9, 400)], 'stroke="#dfe8ff" stroke-width="3" opacity=".45"')
  }
  // Wet sheen down the middle of the road
  s += `<polygon points="${pts([P(-0.5, 1), P(-0.02, 60), P(0.02, 60), P(0.5, 1)])}" fill="#b9cbff" opacity=".1" filter="url(#blur)"/>`
  // Road markings: crosswalk, stop line and a diamond warning of the crossing ahead
  for (let ua = -0.86; ua < 0.85; ua += 0.2) {
    s += poly(flat(ua, ua + 0.11, 0.98, 1.24), 'fill="#d5e2ff" opacity=".62"')
  }
  s += poly(flat(-0.86, 0.86, 1.38, 1.42), 'fill="#d5e2ff" opacity=".5"')
  const dm = [P(0, 2.4), P(0.16, 2.9), P(0, 3.4), P(-0.16, 2.9)]
  s += `<polygon points="${pts(dm)}" fill="none" stroke="#d5e2ff" stroke-width="4" opacity=".45"/>`
  // Railway crossing near the end of the street
  const zx = 18
  for (const sd of [-1, 1]) {
    const u0 = sd * 1.15
    const c = mix('#0a0f2e', HAZE, fog(zx) * 0.6)
    s += poly(face(u0 - 0.03, u0 + 0.03, zx, 0, 1.05), `fill="${c}"`)
    const cb = P(u0, zx, 0.98)
    const l = px(0.16, zx)
    s += `<path d="M${r1(cb[0] - l)},${r1(cb[1] - l * 0.6)}L${r1(cb[0] + l)},${r1(cb[1] + l * 0.6)}M${r1(cb[0] - l)},${r1(cb[1] + l * 0.6)}L${r1(cb[0] + l)},${r1(cb[1] - l * 0.6)}" stroke="#ffe9a8" stroke-width="2.4"/>`
    for (const k of [-0.09, 0.09]) {
      const p = P(u0 + k, zx, 0.75)
      s += glowAt(p, px(0.35, zx), 'red', 1)
      s += `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="${r1(px(0.04, zx))}" fill="#ff5f6d"/>`
      s += reflection(u0 + k, zx, 0.75, '#ff5f6d', 0.06, 0.55)
    }
    const arm = sd < 0 ? [u0, -0.05] : [0.05, u0]
    s += `<line x1="${r1(P(arm[0], zx, 0.55)[0])}" y1="${r1(P(arm[0], zx, 0.55)[1])}" x2="${r1(P(arm[1], zx, 0.55)[0])}" y2="${r1(P(arm[1], zx, 0.55)[1])}" stroke="#ffe08a" stroke-width="2.5" stroke-dasharray="5 5"/>`
  }
  // Buildings, far to near
  const left = [
    { z0: 26, z1: 60, h: 4.5, fill: '#2b3f8e', floors: 6, warm: 0.2 },
    { z0: 16, z1: 26, h: 3.2, fill: '#283b88', floors: 4, signs: [{ z: 17, ha: 0.9, hb: 2.2, color: '#f7768e', accent: 1 }] },
    { z0: 11, z1: 16, h: 5.2, fill: '#24367f', floors: 7, type: 'apt', warm: 0.25 },
    { z0: 7.6, z1: 11, h: 2.8, fill: '#22337a', floors: 3, signs: [{ z: 8.2, ha: 0.8, hb: 2.1, color: '#ff9e64', accent: 2 }] },
    { z0: 4.7, z1: 7.6, h: 7.2, fill: '#203074', floors: 11, type: 'apt', warm: 0.2, cool: 0.14 },
    { z0: 3.2, z1: 4.7, h: 3.4, fill: '#1d2c6c', floors: 4, signs: [{ z: 3.6, ha: 1.1, hb: 2.5, color: '#bb9af7', accent: 0, blocks: 5 }] },
    { z0: 1.4, z1: 3.2, h: 2.5, fill: '#1b2966', floors: 3, type: 'shop', warm: 0.35, cool: 0 },
  ]
  const right = [
    { z0: 24, z1: 60, h: 3.6, fill: '#2b3f8e', floors: 5 },
    { z0: 14, z1: 24, h: 2.6, fill: '#283b88', floors: 3, signs: [{ z: 15, ha: 0.7, hb: 1.8, color: '#73daca', accent: 2 }] },
    { z0: 9, z1: 14, h: 5.8, fill: '#24367f', floors: 8, type: 'apt', cool: 0.16 },
    { z0: 5.6, z1: 9, h: 3.4, fill: '#22337a', floors: 4, signs: [{ z: 6, ha: 1.0, hb: 2.6, color: '#f7768e', accent: 3, blocks: 5 }] },
    { z0: 3.7, z1: 5.6, h: 2.6, fill: '#1f2f70', floors: 3, warm: 0.3 },
    { z0: 1.3, z1: 3.7, h: 1.95, fill: '#1d2c6c', floors: 2, warm: 0.45, cool: 0.1, roof: false, shutters: 0 },
  ]
  for (const b of left) s += building({ s: -1, ...b })
  // Konbini storefront on the nearest left building
  const u = -WALK
  const zs = [1.45, 3.15]
  s += glowAt(P(u, 2.3, 0.4), px(1.6, 2.3), 'warm', 0.8, 0.6)
  s += `<g filter="url(#glow)">${poly(side(u, zs[0], zs[1], 0.04, 0.68), 'fill="url(#glass)"')}</g>`
  for (const hh of [0.2, 0.34, 0.48]) {
    s += line([P(u, zs[0], hh), P(u, zs[1], hh)], 'stroke="#c48d52" stroke-width="2" opacity=".55"')
    for (let z = zs[0] + 0.05; z < zs[1] - 0.05; z += 0.07) {
      if (rand() < 0.75) s += poly(side(u, z, z + 0.045, hh + 0.01, hh + 0.06 + rand() * 0.04), `fill="${pick(['#f7768e', '#7aa2f7', '#73daca', '#ff9e64', '#bb9af7', '#e0af68'])}" opacity=".7"`)
    }
  }
  for (let z = zs[0]; z <= zs[1] + 0.01; z += (zs[1] - zs[0]) / 4) s += poly(side(u, z, z + 0.035, 0.04, 0.68), 'fill="#3b2a3c"')
  s += poly(side(u, 2.32, 2.48, 0.38, 0.6), 'fill="#f7768e" opacity=".85"')
  s += poly(side(u, 2.55, 2.68, 0.42, 0.6), 'fill="#73daca" opacity=".8"')
  s += `<g filter="url(#glow)">${poly(side(u - 0.04, zs[0] - 0.05, zs[1] + 0.05, 0.7, 0.92), 'fill="#eef3ff"')}</g>`
  s += poly(side(u - 0.04, zs[0] - 0.05, zs[1] + 0.05, 0.74, 0.78), 'fill="#3d6fe0"')
  s += poly(side(u - 0.04, zs[0] - 0.05, zs[1] + 0.05, 0.78, 0.81), 'fill="#73daca"')
  s += poly(side(u - 0.04, 2.6, 2.85, 0.73, 0.89), 'fill="#f7768e"')
  s += poly(side(u - 0.04, zs[0] - 0.05, zs[1] + 0.05, 0.68, 0.7), 'fill="#0a0f2e" opacity=".6"')
  // Warm light spilling over the pavement, and its reflection on the road
  s += `<polygon points="${pts(flat(u, -0.95, zs[0] - 0.4, zs[1] + 0.3))}" fill="${hGradient(P(u, 2.2)[0], P(-0.95, 2.2)[0], [[0, '#ffd59a', 0.55], [1, '#ffd59a', 0]])}" ${screen}/>`
  s += reflection(-1.2, 2.3, 0.5, '#ffd59a', 0.4, 0.35)
  // Vending machine
  const uv = u + 0.2
  s += poly(face(u, uv, 3.22, 0, 0.5), 'fill="#2a3566"')
  s += `<g filter="url(#glow)">${poly(side(uv, 3.22, 3.45, 0, 0.5), 'fill="#e6eeff"')}</g>`
  for (const hh of [0.3, 0.38]) {
    for (let z = 3.24; z < 3.43; z += 0.035) s += poly(side(uv, z, z + 0.022, hh, hh + 0.05), `fill="${pick(['#f7768e', '#7aa2f7', '#ff9e64', '#73daca'])}"`)
  }
  s += glowAt(P(uv, 3.33, 0.25), px(0.7, 3.33), 'cool', 0.7)
  s += reflection(uv + 0.1, 3.33, 0.3, '#dfe9ff', 0.08, 0.4)
  // A-frame poster board on the pavement
  const bz = 1.32
  s += line([P(-1.62, bz + 0.05, 0), P(-1.6, bz, 0.34)], 'stroke="#0a0f2e" stroke-width="4"')
  s += line([P(-1.36, bz + 0.05, 0), P(-1.38, bz, 0.34)], 'stroke="#0a0f2e" stroke-width="4"')
  s += poly(face(-1.6, -1.38, bz, 0.08, 0.36), 'fill="#f3e6d0"')
  s += poly(face(-1.58, -1.4, bz, 0.1, 0.3), 'fill="#f7a35c"')
  s += `<circle cx="${r1(P(-1.49, bz, 0.23)[0])}" cy="${r1(P(-1.49, bz, 0.23)[1])}" r="${r1(px(0.045, bz))}" fill="#fff4dc"/>`
  s += poly(face(-1.56, -1.42, bz, 0.12, 0.15), 'fill="#f7768e"')
  s += poly(face(-1.58, -1.4, bz, 0.31, 0.35), 'fill="#3d6fe0"')
  // Vertical neon sign on the konbini corner
  s += `<g filter="url(#glow)">${poly(face(u + 0.06, u + 0.2, 3.25, 1.05, 2.15), 'fill="#2a1a3a" stroke="#ff9e64" stroke-width="3"')}`
  for (let i = 0; i < 5; i++) s += poly(face(u + 0.09, u + 0.17, 3.25, 2.02 - i * 0.2, 2.13 - i * 0.2), `fill="${i === 2 ? '#f7768e' : '#ffd89a'}"`)
  s += `</g>`
  s += reflection(u + 0.13, 3.25, 1.6, '#ff9e64', 0.08, 0.4)
  for (const b of right) s += building({ s: 1, ...b })
  // Near right: a two-storey apartment with a balcony and an overhanging roof
  const ur = WALK
  const ub = ur - 0.22
  s += poly(side(ub, 1.3, 3.7, 1.0, 1.06), 'fill="#5a72c0"')
  s += poly(side(ub, 1.3, 3.7, 1.06, 1.34), 'fill="#0f1844" opacity=".55"')
  let rails = ''
  for (let z = 1.32; z < 3.7; z += 0.09) rails += line([P(ub, z, 1.06), P(ub, z, 1.34)], '')
  s += `<g stroke="#9db4ff" stroke-width="1.2" opacity=".55">${rails}</g>`
  s += line([P(ub, 1.3, 1.34), P(ub, 3.7, 1.34)], 'stroke="#c9d6ff" stroke-width="3" opacity=".75"')
  s += poly([P(ur - 0.3, 1.25, 1.95), P(ur - 0.3, 3.75, 1.95), P(ur + 0.1, 3.75, 2.12), P(ur + 0.1, 1.25, 2.12)], 'fill="#0d1540"')
  s += line([P(ur - 0.3, 1.25, 1.95), P(ur - 0.3, 3.75, 1.95)], 'stroke="#7f97e0" stroke-width="2" opacity=".7"')
  for (const z of [2.1, 2.5]) s += poly(side(ur - 0.03, z, z + 0.14, 0.75, 0.95), 'fill="#9aa8d0"')
  s += glowAt(P(ur, 2.9, 0.5), px(0.8, 2.9), 'warm', 0.5, 0.6)
  // Traffic cones
  for (const z of [2.05, 2.4]) {
    const [x, y] = P(1.32, z, 0)
    const w = px(0.07, z)
    const hh = px(0.24, z)
    s += `<path d="M${r1(x - w)},${r1(y)}L${r1(x)},${r1(y - hh)}L${r1(x + w)},${r1(y)}Z" fill="#ff9e64"/><path d="M${r1(x - w * 0.55)},${r1(y - hh * 0.45)}L${r1(x + w * 0.55)},${r1(y - hh * 0.45)}" stroke="#f3f6ff" stroke-width="${r1(hh * 0.12)}"/><rect x="${r1(x - w * 1.3)}" y="${r1(y - 2)}" width="${r1(w * 2.6)}" height="3" fill="#c46a3a"/>`
  }
  s += car(0.5, 0.95, 2.45)
  s += car(0.55, 0.98, 7.2, '#3a3f7a')
  // Utility poles, lamps and power lines
  const lp = [[1.18, {}], [1.95, { transformer: true }], [3.3, { lamp: true }], [5.8, {}], [9.5, { lamp: true }], [15, {}], [24, {}]].map(([z, o]) => pole(-1.14, z, o))
  const rp = [[1.42, { transformer: true }], [2.2, { sign: true }], [4.3, {}], [7, { lamp: true }], [11.5, {}], [19, {}]].map(([z, o]) => pole(1.14, z, o))
  for (const p of [...lp, ...rp].sort((a, b) => b.z - a.z)) s += p.svg
  let wires = ''
  const run = ps => {
    for (let i = 0; i < ps.length - 1; i++) {
      const sag = px(0.22, ps[i].z)
      const w = Math.max(0.8, px(0.012, ps[i].z))
      for (const k of ['a', 'b', 'c', 'd']) wires += wire(ps[i][k], ps[i + 1][k], sag, w)
    }
  }
  run(lp)
  run(rp)
  for (const [i, j, k] of [[1, 2, 'b'], [2, 3, 'd'], [3, 4, 'b'], [4, 5, 'b'], [5, 5, 'a'], [0, 1, 'c']]) {
    const a = lp[i]
    const b = rp[j]
    wires += wire(a[k], b[k === 'b' ? 'a' : 'c'], px(0.6, Math.max(a.z, b.z)), Math.max(0.8, px(0.012, Math.max(a.z, b.z))))
  }
  // Drops from the poles to the buildings
  for (const p of [lp[1], lp[3], rp[2], rp[1]]) {
    const sd = p === lp[1] || p === lp[3] ? -1 : 1
    wires += wire(sd < 0 ? p.a : p.b, P(sd * WALK, p.z + 0.6, 1.9), px(0.15, p.z), Math.max(0.7, px(0.01, p.z)))
  }
  wires += wire([0, 40], lp[0].a, 30, 3) + wire([W, 90], rp[0].b, 30, 3) + wire([W, 20], rp[0].a, 40, 2.5)
  s += wires
  s += `<rect width="${W}" height="${H}" fill="url(#vignette)"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${defs()}${s}</svg>`
}

// Calm backdrop for content slides: sky, stars, power lines and a layered skyline along the bottom
function backdrop() {
  gid = 0
  extraDefs = ''
  let s = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11142e"/><stop offset=".6" stop-color="#191b2f"/><stop offset="1" stop-color="#1f2a52"/></linearGradient>`
  s += `<rect width="${W}" height="${H}" fill="url(#bg)"/>`
  s += `<g opacity=".55">${stars(140, 380, 0.5, 1.4)}</g>`
  s += `<g opacity=".35">${sparkles(4, 260)}</g>`
  // Horizon glow and a faint cloud bank
  s += `<g filter="url(#blur)" opacity=".2"><ellipse cx="520" cy="${H - 60}" rx="300" ry="80" fill="#bb9af7"/><ellipse cx="880" cy="${H - 80}" rx="240" ry="70" fill="#f4a6c8"/><ellipse cx="1220" cy="${H - 50}" rx="280" ry="70" fill="#7aa2f7"/></g>`
  s += `<g filter="url(#blur)" opacity=".12">`
  for (let i = 0; i < 10; i++) s += `<circle cx="${r1(lerp(980, 1280, rand()))}" cy="${r1(H - 120 - rand() * 50)}" r="${r1(25 + rand() * 30)}" fill="#c9d6ff"/>`
  s += `</g>`
  s += `<g opacity=".8">`
  s += `<rect x="1490" y="-10" width="9" height="200" fill="#0b0f26"/><rect x="1462" y="40" width="65" height="5" fill="#0b0f26"/>`
  s += wire([1100, -10], [1494, 42], 40, 1.4) + wire([1180, -10], [1494, 42], 25, 1.2) + wire([1494, 42], [1610, 70], 10, 1.4) + wire([1494, 70], [1610, 110], 12, 1.4) + wire([1260, -10], [1494, 70], 30, 1.1)
  s += `</g>`
  // Skyline in three layers, hazier further away
  const layer = (fill, minH, maxH, minW, maxW, lit, opacity) => {
    let x = -10
    let g = ''
    while (x < W) {
      const w = lerp(minW, maxW, rand())
      const h = lerp(minH, maxH, Math.pow(rand(), 1.5))
      g += `<rect x="${r1(x)}" y="${r1(H - h)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}"/>`
      for (let wy = H - h + 7; wy < H - 6; wy += 11) {
        for (let wx = x + 6; wx < x + w - 8; wx += 12) {
          const r = rand()
          if (r < lit) g += `<rect x="${r1(wx)}" y="${r1(wy)}" width="5" height="4" fill="${r < lit * 0.65 ? '#ffc777' : '#9ab8ff'}" opacity=".6"/>`
        }
      }
      x += w + (rand() < 0.3 ? 10 : 0)
    }
    return `<g opacity="${opacity}">${g}</g>`
  }
  s += layer('#27336a', 70, 190, 50, 110, 0.05, 0.45)
  s += `<rect x="0" y="${H - 150}" width="${W}" height="150" fill="url(#mist)" opacity=".35"/>`
  s += layer('#1b2350', 40, 110, 40, 100, 0.08, 0.8)
  s += `<rect x="1360" y="${H - 175}" width="30" height="175" fill="#161d44"/><rect x="1373" y="${H - 200}" width="3" height="25" fill="#161d44"/><circle cx="1374.5" cy="${H - 201}" r="7" fill="url(#red)"/><circle cx="1374.5" cy="${H - 201}" r="2" fill="#ff7a85"/>`
  for (let wy = H - 165; wy < H - 20; wy += 12) s += `<rect x="1366" y="${wy}" width="18" height="2" fill="#7aa2f7" opacity="${r1(0.15 + rand() * 0.25)}"/>`
  s += layer('#121836', 16, 60, 40, 120, 0.12, 0.95)
  s += `<rect x="0" y="${H - 3}" width="${W}" height="3" fill="#7aa2f7" opacity=".25"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${defs()}${s}</svg>`
}

writeFileSync(join(out, 'street.svg'), street())
writeFileSync(join(out, 'backdrop.svg'), backdrop())
console.log('wrote street.svg and backdrop.svg')
