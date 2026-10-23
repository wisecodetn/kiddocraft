// Builds the site's brand images from the original logo and banner (kept in _brand/).
// Run once: node scripts/brand-assets.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const LOGO = "_brand/img1.jpeg"; // square logo on white
const BANNER = "_brand/img2.jpeg"; // 1600×608 sky banner

mkdirSync("public/brand", { recursive: true });
mkdirSync("src/app", { recursive: true });

/** Turns a white background into transparency ("color to alpha"), keeping anti-aliased edges clean. */
async function whiteToAlpha(input) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let p = 0; p < info.width * info.height; p++) {
    const [r, g, b] = [data[p * 3], data[p * 3 + 1], data[p * 3 + 2]];
    let a = Math.max(255 - r, 255 - g, 255 - b) / 255;
    if (a < 0.08) a = 0;
    const un = (c) => (a === 0 ? 0 : Math.max(0, Math.min(255, Math.round((c - 255 * (1 - a)) / a))));
    out[p * 4] = un(r);
    out[p * 4 + 1] = un(g);
    out[p * 4 + 2] = un(b);
    out[p * 4 + 3] = Math.round(a * 255);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

// Full logo (feet + wordmark): bbox measured at x 159–920, y 275–802.
const logoCrop = await sharp(LOGO).extract({ left: 150, top: 266, width: 780, height: 545 }).toBuffer();
await (await whiteToAlpha(logoCrop)).png().toBuffer().then((b) => sharp(b).resize({ width: 520 }).png().toFile("public/brand/logo.png"));

// Footprints only, centred on a square canvas, for icons.
// The bottom strip is whited out except under the blue heel, so letter ascenders don't show.
const markCrop = await sharp(LOGO)
  .extract({ left: 290, top: 266, width: 520, height: 420 })
  .composite([
    { input: { create: { width: 230, height: 20, channels: 3, background: "#ffffff" } }, left: 0, top: 400 },
    { input: { create: { width: 140, height: 20, channels: 3, background: "#ffffff" } }, left: 380, top: 400 },
    { input: { create: { width: 520, height: 12, channels: 3, background: "#ffffff" } }, left: 0, top: 408 },
  ])
  .toBuffer();
const mark = await (await whiteToAlpha(markCrop)).png().toBuffer();
const square = (size, pad, bg) =>
  sharp(mark)
    .resize({ width: size - pad * 2, height: size - pad * 2, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 } });
await square(512, 24).png().toFile("public/brand/mark.png");
await square(512, 40).png().toFile("src/app/icon.png");
await square(180, 18, { r: 255, g: 255, b: 255, alpha: 1 }).flatten({ background: "#ffffff" }).png().toFile("src/app/apple-icon.png");
await square(192, 16, { r: 255, g: 255, b: 255, alpha: 1 }).flatten({ background: "#ffffff" }).png().toFile("public/brand/icon-192.png");
await square(512, 48, { r: 255, g: 255, b: 255, alpha: 1 }).flatten({ background: "#ffffff" }).png().toFile("public/brand/icon-512.png");

// Social share image: the banner, centre-cropped to 1200×630.
await sharp(BANNER).resize({ width: 1200, height: 630, fit: "cover", position: "centre" }).jpeg({ quality: 86 }).toFile("public/brand/og-default.jpg");
// The banner itself, for the "about" section.
await sharp(BANNER).webp({ quality: 86 }).toFile("public/brand/banner.webp");

console.log("Brand assets written to public/brand and src/app");
