// Generates an elegant SUMMER game background for Colattao Rush.
// Light warm summer palette at the edges, scattered DRINK INGREDIENTS
// (citrus slices, mint, strawberry, ice, matcha), and a DARK radial vignette
// down the center vertical play column so falling stickers + text stay readable.
//
// Output: public/assets/colattao/backgrounds/colattao-bg-summer.png  (941x1672)
// Run: node scripts/gen-summer-bg.mjs

import sharp from "sharp";
import { writeFileSync } from "node:fs";

const W = 941;
const H = 1672;

// Brand palette
const ESPRESSO = "#1D1108";
const ESPRESSO_DEEP = "#120a04";
const GOLD = "#DAAE4F";
const CREAM = "#F8EDD7";

// ---------- ingredient builders (return an SVG <g> string) ----------

function citrusSlice(rind, flesh, r = 70) {
  // a clean half/full citrus slice with segments
  const segs = 10;
  let wedges = "";
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2;
    const a1 = ((i + 1) / segs) * Math.PI * 2;
    const ri = r * 0.78;
    const x0 = Math.cos(a0) * ri, y0 = Math.sin(a0) * ri;
    const x1 = Math.cos(a1) * ri, y1 = Math.sin(a1) * ri;
    wedges += `<path d="M0 0 L${x0.toFixed(1)} ${y0.toFixed(1)} A${ri.toFixed(1)} ${ri.toFixed(1)} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${flesh}" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1.6"/>`;
  }
  return `
  <g>
    <circle r="${r}" fill="${rind}"/>
    <circle r="${r * 0.88}" fill="#ffffff" fill-opacity="0.9"/>
    <circle r="${r * 0.8}" fill="${flesh}"/>
    ${wedges}
    <circle r="${r * 0.1}" fill="#ffffff" fill-opacity="0.8"/>
    <circle r="${r}" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2"/>
  </g>`;
}

function leaf(green, deep, len = 90) {
  // mint / matcha leaf with central vein
  const w = len * 0.55;
  return `
  <g>
    <path d="M0 ${(-len / 2).toFixed(1)} C ${w} ${(-len * 0.2).toFixed(1)}, ${w} ${(len * 0.2).toFixed(1)}, 0 ${(len / 2).toFixed(1)} C ${-w} ${(len * 0.2).toFixed(1)}, ${-w} ${(-len * 0.2).toFixed(1)}, 0 ${(-len / 2).toFixed(1)} Z" fill="${green}"/>
    <path d="M0 ${(-len / 2).toFixed(1)} L0 ${(len / 2).toFixed(1)}" stroke="${deep}" stroke-width="2.2" stroke-opacity="0.7"/>
    <path d="M0 ${(-len * 0.2).toFixed(1)} L ${(w * 0.6).toFixed(1)} ${(-len * 0.02).toFixed(1)}" stroke="${deep}" stroke-width="1.5" stroke-opacity="0.5"/>
    <path d="M0 ${(len * 0.05).toFixed(1)} L ${(-w * 0.6).toFixed(1)} ${(len * 0.2).toFixed(1)}" stroke="${deep}" stroke-width="1.5" stroke-opacity="0.5"/>
    <path d="M0 ${(-len / 2).toFixed(1)} C ${w * 0.6} ${(-len * 0.2).toFixed(1)}, ${w * 0.6} ${(len * 0.2).toFixed(1)}, 0 ${(len / 2).toFixed(1)}" fill="#ffffff" fill-opacity="0.12"/>
  </g>`;
}

function strawberry(r = 60) {
  let seeds = "";
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.3;
    const rr = r * (0.45 + (i % 3) * 0.15);
    const x = Math.cos(a) * rr * 0.8;
    const y = Math.sin(a) * rr + r * 0.1;
    seeds += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="2.4" ry="4" fill="#FBE7A0" transform="rotate(${(a * 57).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return `
  <g>
    <path d="M ${-r * 0.85} ${-r * 0.35} C ${-r * 0.9} ${r * 0.5}, ${-r * 0.3} ${r * 1.05}, 0 ${r * 1.05} C ${r * 0.3} ${r * 1.05}, ${r * 0.9} ${r * 0.5}, ${r * 0.85} ${-r * 0.35} C ${r * 0.6} ${-r * 0.85}, ${-r * 0.6} ${-r * 0.85}, ${-r * 0.85} ${-r * 0.35} Z" fill="#E2415A"/>
    <path d="M ${-r * 0.85} ${-r * 0.35} C ${-r * 0.55} ${-r * 0.55}, ${r * 0.55} ${-r * 0.55}, ${r * 0.85} ${-r * 0.35} C ${r * 0.4} ${-r * 0.15}, ${-r * 0.4} ${-r * 0.15}, ${-r * 0.85} ${-r * 0.35} Z" fill="#ffffff" fill-opacity="0.18"/>
    ${seeds}
    <g transform="translate(0 ${(-r * 0.5).toFixed(1)})">
      <path d="M0 -6 L 12 -22 L 4 -6 L 20 -10 L 6 0 L 0 -18 L -6 0 L -20 -10 L -4 -6 L -12 -22 Z" fill="#5FA45A"/>
    </g>
  </g>`;
}

function iceCube(s = 56) {
  return `
  <g>
    <rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" rx="10" fill="#ffffff" fill-opacity="0.45"/>
    <rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" rx="10" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2"/>
    <path d="M ${-s * 0.3} ${-s * 0.32} L ${-s * 0.05} ${-s * 0.32} L ${-s * 0.28} ${s * 0.25} L ${-s * 0.42} ${s * 0.05} Z" fill="#ffffff" fill-opacity="0.55"/>
    <path d="M ${s * 0.12} ${-s * 0.3} L ${s * 0.3} ${-s * 0.3} L ${s * 0.18} ${s * 0.1} Z" fill="#ffffff" fill-opacity="0.35"/>
  </g>`;
}

function zest(color = GOLD, len = 70) {
  return `
  <g>
    <path d="M ${-len / 2} 0 C ${-len * 0.2} ${-len * 0.4}, ${len * 0.2} ${len * 0.4}, ${len / 2} 0" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"/>
    <path d="M ${-len / 2} 0 C ${-len * 0.2} ${-len * 0.4}, ${len * 0.2} ${len * 0.4}, ${len / 2} 0" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="3" stroke-linecap="round"/>
  </g>`;
}

// ---------- scatter layout (kept to the side/corner margins) ----------
// Center vertical play column ~ x in [300,640] is intentionally left empty;
// the dark vignette overlay further protects it.

const lemon = () => citrusSlice("#E8B73A", "#FFF3BE", 84);
const lime = () => citrusSlice("#8FB94A", "#E6F2C8", 76);
const orange = () => citrusSlice("#EE9B3C", "#FFD9A0", 90);
const mint = () => leaf("#6FAE6A", "#2f5e2c", 120);
const matcha = () => leaf("#8FBF3F", "#4f6f1f", 108);

const items = [
  // left margin, top -> bottom
  { x: 110, y: 150,  rot: -18, s: 1.05, g: orange() },
  { x: 78,  y: 400,  rot: 12,  s: 0.95, g: mint() },
  { x: 200, y: 320,  rot: 0,   s: 1.0,  g: lemon() },
  { x: 70,  y: 660,  rot: 24,  s: 1.05, g: strawberry() },
  { x: 190, y: 600,  rot: -10, s: 0.85, g: iceCube() },
  { x: 100, y: 900,  rot: -22, s: 1.1,  g: lime() },
  { x: 210, y: 1120, rot: 14,  s: 0.95, g: mint() },
  { x: 80,  y: 1160, rot: 0,   s: 1.0,  g: zest(GOLD, 92) },
  { x: 120, y: 1380, rot: -16, s: 1.1,  g: lemon() },
  { x: 215, y: 1580, rot: 20,  s: 0.9,  g: matcha() },
  { x: 85,  y: 1540, rot: -8,  s: 1.0,  g: orange() },
  // right margin, top -> bottom
  { x: 835, y: 170,  rot: 16,  s: 1.1,  g: lemon() },
  { x: 760, y: 360,  rot: -12, s: 0.95, g: matcha() },
  { x: 860, y: 600,  rot: 8,   s: 1.0,  g: lime() },
  { x: 745, y: 640,  rot: -18, s: 0.85, g: iceCube() },
  { x: 845, y: 880,  rot: 22,  s: 1.1,  g: strawberry() },
  { x: 760, y: 1100, rot: -14, s: 0.95, g: orange() },
  { x: 865, y: 1140, rot: 6,   s: 0.9,  g: zest(GOLD, 84) },
  { x: 830, y: 1360, rot: 18,  s: 1.1,  g: mint() },
  { x: 770, y: 1570, rot: -20, s: 1.0,  g: lemon() },
  { x: 865, y: 1520, rot: 10,  s: 0.85, g: iceCube() },
  // top & bottom bands, reaching toward (but not into) the play column
  { x: 300, y: 90,   rot: 30,  s: 0.85, g: zest(CREAM, 80) },
  { x: 640, y: 100,  rot: -28, s: 0.95, g: lime() },
  { x: 430, y: 70,   rot: 8,   s: 0.8,  g: mint() },
  { x: 300, y: 1600, rot: -24, s: 0.85, g: matcha() },
  { x: 660, y: 1610, rot: 26,  s: 1.0,  g: strawberry() },
  { x: 470, y: 1620, rot: -6,  s: 0.85, g: lemon() },
];

const scattered = items
  .map(
    (it) =>
      `<g transform="translate(${it.x} ${it.y}) rotate(${it.rot}) scale(${it.s})" opacity="0.95">${it.g}</g>`
  )
  .join("\n");

// ---------- compose full SVG ----------

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- light warm summer wash -->
    <linearGradient id="summer" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="#FFF9EC"/>
      <stop offset="35%" stop-color="#FFEFCF"/>
      <stop offset="70%" stop-color="#FBE2B0"/>
      <stop offset="100%" stop-color="#F6D396"/>
    </linearGradient>

    <!-- gentle radial darkening focused tightly on the center for text contrast -->
    <radialGradient id="centerDark" cx="50%" cy="50%" r="40%" fx="50%" fy="50%">
      <stop offset="0%"   stop-color="${ESPRESSO_DEEP}" stop-opacity="0.80"/>
      <stop offset="55%"  stop-color="${ESPRESSO}"      stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${ESPRESSO}"      stop-opacity="0.0"/>
    </radialGradient>

    <!-- horizontal column mask: tall, narrow dark play column -->
    <linearGradient id="colMask" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${ESPRESSO}" stop-opacity="0.0"/>
      <stop offset="30%"  stop-color="${ESPRESSO}" stop-opacity="0.55"/>
      <stop offset="50%"  stop-color="${ESPRESSO_DEEP}" stop-opacity="0.82"/>
      <stop offset="70%"  stop-color="${ESPRESSO}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${ESPRESSO}" stop-opacity="0.0"/>
    </linearGradient>

    <radialGradient id="glow" cx="50%" cy="22%" r="60%">
      <stop offset="0%" stop-color="#FFFDF4" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#FFFDF4" stop-opacity="0"/>
    </radialGradient>

    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
  </defs>

  <!-- base summer wash -->
  <rect width="${W}" height="${H}" fill="url(#summer)"/>

  <!-- soft summer color blobs for depth -->
  <g filter="url(#soft)" opacity="0.55">
    <circle cx="120" cy="220" r="150" fill="#FFD27A"/>
    <circle cx="850" cy="420" r="170" fill="#FFE0A0"/>
    <circle cx="110" cy="1180" r="160" fill="#F7C97E"/>
    <circle cx="860" cy="1340" r="180" fill="#FFD58C"/>
    <circle cx="470" cy="60"  r="160" fill="#FFF0C8"/>
    <circle cx="470" cy="1640" r="170" fill="#F3C27E"/>
  </g>

  <!-- top soft glow -->
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- scattered ingredients (edges/corners) -->
  ${scattered}

  <!-- DARK central play column: applied OVER ingredients so center stays clean -->
  <rect width="${W}" height="${H}" fill="url(#colMask)"/>
  <rect width="${W}" height="${H}" fill="url(#centerDark)"/>

  <!-- subtle gold edge framing for elegance -->
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="26" fill="none" stroke="${GOLD}" stroke-opacity="0.18" stroke-width="3"/>
</svg>`;

writeFileSync("scripts/_summer-bg-debug.svg", svg);

await sharp(Buffer.from(svg))
  .png()
  .toFile("public/assets/colattao/backgrounds/colattao-bg-summer.png");

const meta = await sharp(
  "public/assets/colattao/backgrounds/colattao-bg-summer.png"
).metadata();
console.log(`wrote colattao-bg-summer.png ${meta.width}x${meta.height}`);
