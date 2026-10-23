// Draws on-brand placeholder illustrations (magnetic tiles, craft kits…) used by the seed data
// until real product photos are uploaded from the admin. Run: node scripts/placeholder-images.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT = "public/images/seed";
mkdirSync(OUT, { recursive: true });

// Tile colours taken from the brand banner: [frame, fill].
const C = {
  blue: ["#2f86cf", "#7cbcec"],
  coral: ["#e06464", "#f6a7a7"],
  green: ["#3fae72", "#97d9ae"],
  yellow: ["#e3a90a", "#ffd859"],
};
const order = ["blue", "coral", "green", "yellow"];
const pick = (i) => C[order[((i % 4) + 4) % 4]];

function sq(x, y, s, c, rot = 0) {
  const [frame, fill] = C[c] ?? c;
  const w = Math.max(4, s * 0.07);
  return `<g transform="translate(${x} ${y}) rotate(${rot} ${s / 2} ${s / 2})">
    <rect x="${w / 2}" y="${w / 2}" width="${s - w}" height="${s - w}" rx="${s * 0.06}" fill="${fill}" stroke="${frame}" stroke-width="${w}"/>
    <rect x="${s * 0.3}" y="${s * 0.3}" width="${s * 0.4}" height="${s * 0.4}" rx="${s * 0.03}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="${w * 0.55}"/>
  </g>`;
}

function tri(x, y, s, c, rot = 0) {
  const [frame, fill] = C[c] ?? c;
  const w = Math.max(4, s * 0.07);
  const h = s * 0.866;
  return `<g transform="translate(${x} ${y + (s - h)}) rotate(${rot} ${s / 2} ${h / 2})">
    <path d="M${s / 2} ${w} L${s - w} ${h - w / 2} L${w} ${h - w / 2} Z" fill="${fill}" stroke="${frame}" stroke-width="${w}" stroke-linejoin="round"/>
    <path d="M${s / 2} ${h * 0.38} L${s * 0.68} ${h * 0.74} L${s * 0.32} ${h * 0.74} Z" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="${w * 0.55}" stroke-linejoin="round"/>
  </g>`;
}

const cloud = (x, y, s) =>
  `<g fill="#fff" opacity=".95" transform="translate(${x} ${y}) scale(${s})"><circle cx="40" cy="40" r="28"/><circle cx="78" cy="30" r="34"/><circle cx="112" cy="44" r="24"/><rect x="20" y="40" width="110" height="28" rx="14"/></g>`;

const foot = (x, y, s, color, flip = false) =>
  `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" fill="${color}"><ellipse cx="0" cy="22" rx="11" ry="17"/><circle cx="-8" cy="-2" r="4"/><circle cx="0" cy="-5" r="4.5"/><circle cx="8" cy="-3" r="3.6"/><circle cx="13" cy="3" r="3"/></g>`;

function sky(w, h, top = "#dff0fb", bottom = "#fdf7e3") {
  return `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  ${cloud(w * 0.06, h * 0.08, w / 1000)}${cloud(w * 0.7, h * 0.13, (w / 1000) * 0.8)}
  <ellipse cx="${w / 2}" cy="${h * 1.32}" rx="${w * 0.95}" ry="${h * 0.5}" fill="#cfe9bf"/>`;
}

const ground = (h) => h * 0.84; // y where things stand

// ---------------------------------------------------------------- scenes
const scenes = {
  // Big set: house + towers + scattered tiles
  "set-grand": (w, h) => {
    const g = ground(h), s = 110;
    let out = "";
    for (let i = 0; i < 5; i++) out += sq(110, g - s * (i + 1), s, order[i % 4]);
    out += tri(110, g - s * 6, s, "yellow");
    out += sq(340, g - s, s, "coral") + sq(450, g - s, s, "green") + sq(340, g - 2 * s, s, "blue") + sq(450, g - 2 * s, s, "yellow");
    out += tri(340, g - 3 * s, s, "yellow") + tri(450, g - 3 * s, s, "blue") + tri(395, g - 3 * s, s, "coral", 180);
    for (let i = 0; i < 3; i++) out += sq(700, g - s * (i + 1), s, order[(i + 2) % 4]);
    out += tri(700, g - s * 4, s, "green");
    out += sq(610, 210, 70, "yellow", 18) + tri(860, 260, 70, "blue", -20) + sq(560, 120, 50, "coral", -12);
    return out;
  },
  tower: (w, h) => {
    const g = ground(h), s = 120;
    let out = "";
    for (let i = 0; i < 5; i++) out += sq(440, g - s * (i + 1), s, order[(i + 1) % 4]);
    out += tri(440, g - s * 6, s, "coral");
    out += sq(250, g - s, s, "yellow") + tri(250, g - 2 * s, s, "green");
    out += sq(630, g - s, s, "blue") + sq(630, g - 2 * s, s, "green") + tri(630, g - 3 * s, s, "yellow");
    out += tri(200, 200, 80, "blue", 25) + sq(780, 180, 70, "coral", 14);
    return out;
  },
  house: (w, h) => {
    const g = ground(h), s = 140;
    let out = "";
    out += sq(290, g - s, s, "coral") + sq(430, g - s, s, "blue") + sq(570, g - s, s, "green");
    out += sq(290, g - 2 * s, s, "yellow") + sq(430, g - 2 * s, s, "coral") + sq(570, g - 2 * s, s, "blue");
    out += tri(290, g - 3 * s, s, "blue") + tri(430, g - 3 * s, s, "yellow") + tri(570, g - 3 * s, s, "coral");
    out += tri(360, g - 3 * s, s, "green", 180) + tri(500, g - 3 * s, s, "green", 180);
    out += sq(110, 240, 80, "green", -15) + tri(810, 230, 90, "yellow", 12);
    return out;
  },
  car: (w, h) => {
    const g = ground(h), s = 130;
    let out = "";
    out += sq(220, g - s - 50, s, "blue") + sq(350, g - s - 50, s, "blue") + sq(480, g - s - 50, s, "blue") + sq(610, g - s - 50, s, "coral");
    out += sq(350, g - 2 * s - 50, s, "yellow") + sq(480, g - 2 * s - 50, s, "yellow");
    out += tri(220, g - 2 * s - 50, s, "green", 0) + tri(610, g - 2 * s - 50, s, "green");
    for (const cx of [300, 650]) out += `<circle cx="${cx}" cy="${g - 40}" r="58" fill="#3b3f4a"/><circle cx="${cx}" cy="${g - 40}" r="26" fill="#cfd6e2"/>`;
    out += sq(820, 260, 70, "coral", 20) + tri(130, 240, 70, "yellow", -10);
    return out;
  },
  rocket: (w, h) => {
    const g = ground(h), s = 120;
    let out = `<path d="M${500 - 50} ${g - 20} Q500 ${g + 60} ${500 + 50} ${g - 20} Z" fill="#ffb347"/>`;
    for (let i = 0; i < 4; i++) out += sq(440, g - 60 - s * (i + 1), s, i % 2 ? "blue" : "coral");
    out += tri(440, g - 60 - s * 5, s, "yellow");
    out += tri(320, g - 60 - s, s, "green") + tri(560, g - 60 - s, s, "green");
    out += `<circle cx="500" cy="${g - 60 - s * 2.5}" r="26" fill="#fff" stroke="#2f86cf" stroke-width="8"/>`;
    out += `<g fill="#ffd859">${[[150, 180], [820, 220], [760, 420], [200, 450]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0 -22 L6 -6 L22 0 L6 6 L0 22 L-6 6 L-22 0 L-6 -6 Z"/>`).join("")}</g>`;
    return out;
  },
  castle: (w, h) => {
    const g = ground(h), s = 105;
    let out = "";
    for (const [x, n] of [[180, 4], [705, 4]]) {
      for (let i = 0; i < n; i++) out += sq(x, g - s * (i + 1), s, order[(i + x) % 4]);
      out += tri(x, g - s * (n + 1), s, "coral");
    }
    for (const x of [285, 390, 495, 600]) out += sq(x, g - s, s, "yellow") + sq(x, g - 2 * s, s, "blue");
    out += tri(390, g - 3 * s, s, "green") + tri(495, g - 3 * s, s, "green") + tri(442, g - 3 * s, s, "yellow", 180);
    out += `<path d="M447 ${g} v-${s * 0.9} a50 50 0 0 1 106 0 v${s * 0.9} z" fill="#8a5a3c"/>`;
    return out;
  },
  starter: (w, h) => {
    let out = "";
    const items = [
      [170, 230, "blue", 0, 0], [380, 180, "coral", 1, 12], [600, 250, "yellow", 0, -10], [780, 330, "green", 1, 18],
      [220, 470, "green", 0, 8], [440, 430, "yellow", 1, -16], [640, 520, "blue", 0, 20], [300, 640, "coral", 0, -6],
    ];
    for (const [x, y, c, t, r] of items) out += t ? tri(x, y, 150, c, r) : sq(x, y, 150, c, r);
    return out;
  },
  bridge: (w, h) => {
    const g = ground(h), s = 110;
    let out = "";
    for (const x of [160, 730]) for (let i = 0; i < 3; i++) out += sq(x, g - s * (i + 1), s, order[(i + 2) % 4]);
    for (let i = 0; i < 6; i++) out += sq(160 + s + i * 76, g - 3 * s - 4, 76, order[i % 4]);
    out += tri(160, g - 4 * s, s, "yellow") + tri(730, g - 4 * s, s, "yellow");
    out += `<path d="M270 ${g} Q500 ${g - 200} 730 ${g}" fill="none" stroke="#2f86cf" stroke-width="14" stroke-linecap="round"/>`;
    return out;
  },
  // Craft kit: pompoms, crayons, paper and googly eyes
  craft: (w, h) => {
    let out = `<rect x="170" y="300" width="660" height="460" rx="40" fill="#fff" stroke="#e3a90a" stroke-width="14"/>
      <rect x="170" y="300" width="660" height="110" rx="40" fill="#ffd859"/>`;
    const poms = [[300, 520, 60, "#f6a7a7"], [420, 600, 48, "#7cbcec"], [540, 520, 55, "#97d9ae"], [660, 610, 50, "#ffd859"], [720, 480, 40, "#e06464"], [330, 660, 38, "#2f86cf"]];
    for (const [x, y, r, c] of poms) out += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.25}" fill="#fff" opacity=".45"/>`;
    const cr = [["#e06464", 0], ["#2f86cf", 1], ["#3fae72", 2], ["#e3a90a", 3]];
    for (const [c, i] of cr) out += `<g transform="translate(${250 + i * 150} 140) rotate(${-10 + i * 7})"><rect width="44" height="190" rx="10" fill="${c}"/><path d="M0 0 L22 -46 L44 0 Z" fill="${c}"/><rect y="40" width="44" height="18" fill="#fff" opacity=".6"/></g>`;
    for (const [x, y] of [[480, 690], [600, 700]]) out += `<circle cx="${x}" cy="${y}" r="22" fill="#fff" stroke="#3b3f4a" stroke-width="4"/><circle cx="${x + 5}" cy="${y + 4}" r="10" fill="#3b3f4a"/>`;
    return out;
  },
  beads: (w, h) => {
    let out = `<path d="M180 520 C 300 260, 700 260, 820 520 C 700 760, 300 760, 180 520 Z" fill="none" stroke="#b9c3d1" stroke-width="6"/>`;
    const cols = ["#e06464", "#ffd859", "#2f86cf", "#3fae72", "#f6a7a7", "#7cbcec"];
    for (let i = 0; i < 18; i++) {
      const t = (i / 18) * Math.PI * 2;
      const x = 500 + Math.cos(t) * 320, y = 520 + Math.sin(t) * 190;
      out += i % 3 === 0 ? `<rect x="${x - 28}" y="${y - 28}" width="56" height="56" rx="12" fill="${cols[i % 6]}"/>` : `<circle cx="${x}" cy="${y}" r="30" fill="${cols[i % 6]}"/>`;
      out += `<circle cx="${x}" cy="${y}" r="7" fill="#fff" opacity=".8"/>`;
    }
    out += `<g font-family="Arial Rounded MT Bold, Arial" font-weight="700" font-size="54" text-anchor="middle" fill="#fff">${["A", "B", "C"].map((l, i) => `<rect x="${395 + i * 75}" y="470" width="64" height="64" rx="12" fill="${cols[i + 2]}"/><text x="${427 + i * 75}" y="520">${l}</text>`).join("")}</g>`;
    return out;
  },
  shapes: (w, h) => {
    // Montessori shape sorter board
    let out = `<rect x="160" y="330" width="680" height="420" rx="36" fill="#e9c79a" stroke="#c9a06d" stroke-width="12"/>`;
    out += `<circle cx="300" cy="460" r="70" fill="#7cbcec" stroke="#2f86cf" stroke-width="10"/>`;
    out += `<rect x="430" y="390" width="140" height="140" rx="16" fill="#f6a7a7" stroke="#e06464" stroke-width="10"/>`;
    out += `<path d="M700 385 L780 530 L620 530 Z" fill="#ffd859" stroke="#e3a90a" stroke-width="10" stroke-linejoin="round"/>`;
    out += `<path d="M300 570 l24 48 52 8 -38 36 9 52 -47 -25 -47 25 9 -52 -38 -36 52 -8z" fill="#97d9ae" stroke="#3fae72" stroke-width="10" stroke-linejoin="round"/>`;
    out += `<rect x="440" y="580" width="140" height="110" rx="55" fill="#7cbcec" stroke="#2f86cf" stroke-width="10"/>`;
    out += `<path d="M700 570 l60 35 0 70 -60 35 -60 -35 0 -70z" fill="#f6a7a7" stroke="#e06464" stroke-width="10" stroke-linejoin="round"/>`;
    out += sq(200, 140, 110, "yellow", -12) + tri(690, 140, 110, "blue", 14);
    return out;
  },
  puzzle: (w, h) => {
    const piece = (x, y, c) =>
      `<path transform="translate(${x} ${y})" d="M0 0 h70 a30 30 0 1 1 60 0 h70 v70 a30 30 0 1 0 0 60 v70 h-70 a30 30 0 1 1 -60 0 h-70 v-70 a30 30 0 1 0 0 -60 z" fill="${C[c][1]}" stroke="${C[c][0]}" stroke-width="10" stroke-linejoin="round"/>`;
    return piece(230, 260, "blue") + piece(500, 230, "coral") + piece(300, 520, "yellow") + piece(560, 500, "green") +
      `<g font-family="Arial Rounded MT Bold, Arial" font-weight="700" font-size="90" fill="#fff" text-anchor="middle"><text x="330" y="395">1</text><text x="600" y="365">2</text><text x="400" y="655">3</text><text x="660" y="635">4</text></g>`;
  },
};

/** Footprint trail along the bottom, like the banner. */
const trail = (w, h) => foot(w * 0.1, h * 0.9, 1.4, "#ffc603") + foot(w * 0.16, h * 0.87, 1.4, "#048bdc", true) + foot(w * 0.86, h * 0.9, 1.4, "#ffc603") + foot(w * 0.92, h * 0.87, 1.4, "#048bdc", true);

async function render(name, scene, { w = 1000, h = 1000, top, bottom } = {}) {
  // Scenes are drawn on a 1000×1000 board; wide images centre the board and scale it down.
  const scale = Math.min(w, h) / 1000;
  const dx = (w - 1000 * scale) / 2, dy = h - 1000 * scale;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${sky(w, h, top, bottom)}
    <g transform="translate(${dx} ${dy}) scale(${scale})">${scenes[scene](1000, 1000)}</g>
    ${trail(w, h)}
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(`${OUT}/${name}.webp`);
}

const jobs = [
  // Products (square)
  ["grand-set", "set-grand"], ["grand-set-2", "castle", { top: "#fde7e7" }],
  ["tower-set", "tower"], ["tower-set-2", "bridge", { top: "#e3f6ea" }],
  ["house-set", "house", { top: "#fff3cf" }],
  ["car-set", "car"], ["car-set-2", "starter", { top: "#e3f6ea" }],
  ["rocket-set", "rocket", { top: "#d8e8ff", bottom: "#eef5ff" }],
  ["castle-set", "castle"],
  ["starter-set", "starter"],
  ["bridge-set", "bridge"],
  ["craft-kit", "craft", { top: "#fff3cf" }],
  ["pompom-kit", "craft", { top: "#fde7e7" }],
  ["beads-kit", "beads", { top: "#f1e9ff" }],
  ["shapes-board", "shapes", { top: "#e3f6ea" }],
  ["puzzle-numbers", "puzzle", { top: "#fff3cf" }],
  // Categories (square)
  ["cat-magnetic", "set-grand", { top: "#d8ecfb" }],
  ["cat-construction", "castle", { top: "#fde7e7" }],
  ["cat-craft", "craft", { top: "#fff3cf" }],
  ["cat-educational", "shapes", { top: "#e3f6ea" }],
  // Blog covers (1200×630)
  ["blog-benefits", "set-grand", { w: 1200, h: 630 }],
  ["blog-age", "starter", { w: 1200, h: 630, top: "#fff3cf" }],
  ["blog-ideas", "castle", { w: 1200, h: 630, top: "#e3f6ea" }],
  ["blog-crafts", "craft", { w: 1200, h: 630, top: "#fde7e7" }],
];

for (const [name, scene, opts] of jobs) await render(name, scene, opts);
console.log(`${jobs.length} images written to ${OUT}`);
