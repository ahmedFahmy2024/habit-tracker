/**
 * Happit brand-asset generator (Phase 8). Produces the app icon, Android adaptive layers,
 * splash icon, and favicon from the M3 accent palette — a green rounded-square with a bold
 * cream checkmark (the app's "mark done" motif). Pure Node + pngjs (no sharp/SVG rasterizer),
 * anti-aliased via signed-distance fields so edges are clean at any size.
 *
 * Run: `node scripts/gen-icons.mjs`. Overwrites the placeholder starter assets in assets/images.
 * Colors mirror docs/ui-tokens.md §1.2 (light scheme): primary #386a20, surface #fdfcf5.
 */
import { PNG } from "pngjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../assets/images");
mkdirSync(OUT, { recursive: true });

// ---- palette (M3 light scheme, docs/ui-tokens.md §1.2) ----
const GREEN = [0x38, 0x6a, 0x20]; // --primary
const CREAM = [0xfd, 0xfc, 0xf5]; // --surface
const WHITE = [0xff, 0xff, 0xff];

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const mix = (a, b, t) => a.map((c, i) => Math.round(c + (b[i] - c) * t));

/** Signed distance to a rounded rectangle centered at (cx,cy), half-extents (hx,hy), radius r. */
function sdRoundRect(px, py, cx, cy, hx, hy, r) {
  const qx = Math.abs(px - cx) - (hx - r);
  const qy = Math.abs(py - cy) - (hy - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

/** Signed distance to a thick polyline (the check), stroke half-width = hw. */
function sdPolyline(px, py, pts, hw) {
  let d = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const vx = bx - ax;
    const vy = by - ay;
    const wx = px - ax;
    const wy = py - ay;
    const t = clamp01((wx * vx + wy * vy) / (vx * vx + vy * vy));
    const dx = wx - t * vx;
    const dy = wy - t * vy;
    d = Math.min(d, Math.hypot(dx, dy));
  }
  return d - hw;
}

/**
 * Render one PNG. `opts`: { size, bg (rgb|null), plate (bool → green rounded-square),
 * plateInset (0..1 of size), check (rgb|null), checkColorOnPlate (rgb) }.
 */
function render({ size, bg, plate, plateInset = 0.14, checkColor }) {
  const png = new PNG({ width: size, height: size });
  const S = 2; // supersample factor for AA
  const cx = size / 2;
  const cy = size / 2;
  const hx = size / 2 - size * plateInset;
  const hy = hx;
  const r = size * 0.24; // rounded-square corner (M3 xl-ish, squircle feel)

  // Check geometry in a normalized box, then mapped to plate bounds.
  const plateLeft = cx - hx;
  const plateTop = cy - hy;
  const plateW = hx * 2;
  const plateH = hy * 2;
  const P = (nx, ny) => [plateLeft + nx * plateW, plateTop + ny * plateH];
  const check = [P(0.28, 0.53), P(0.44, 0.68), P(0.74, 0.34)];
  const strokeHW = size * 0.052;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r4 = 0;
      let g4 = 0;
      let b4 = 0;
      let a4 = 0;
      // supersample S×S
      for (let sy = 0; sy < S; sy++) {
        for (let sx = 0; sx < S; sx++) {
          const px = x + (sx + 0.5) / S;
          const py = y + (sy + 0.5) / S;
          let col = bg ? [...bg] : [0, 0, 0];
          let alpha = bg ? 1 : 0;

          if (plate) {
            const dp = sdRoundRect(px, py, cx, cy, hx, hy, r);
            const covPlate = clamp01(0.5 - dp); // AA edge (~1px)
            if (covPlate > 0) {
              col = mix(col, GREEN, covPlate);
              alpha = Math.max(alpha, covPlate);
            }
          }

          // check mark
          const dc = sdPolyline(px, py, check, strokeHW);
          const covCheck = clamp01(0.5 - dc);
          if (covCheck > 0) {
            col = mix(col, checkColor, covCheck);
            alpha = Math.max(alpha, covCheck);
          }

          r4 += col[0];
          g4 += col[1];
          b4 += col[2];
          a4 += alpha;
        }
      }
      const n = S * S;
      const idx = (y * size + x) << 2;
      png.data[idx] = Math.round(r4 / n);
      png.data[idx + 1] = Math.round(g4 / n);
      png.data[idx + 2] = Math.round(b4 / n);
      png.data[idx + 3] = Math.round((a4 / n) * 255);
    }
  }
  return png;
}

function save(name, png) {
  const buf = PNG.sync.write(png);
  writeFileSync(resolve(OUT, name), buf);
  console.log(`  ${name} (${png.width}×${png.height}, ${buf.length} bytes)`);
}

console.log("Generating Happit brand assets →", OUT);

// App icon (iOS/Android legacy + Expo `icon`): cream field, green plate, cream check.
save("icon.png", render({ size: 1024, bg: CREAM, plate: true, checkColor: CREAM }));

// Android adaptive foreground: transparent, the green plate + cream check (safe-zone inset larger).
save(
  "android-icon-foreground.png",
  render({ size: 1024, bg: null, plate: true, plateInset: 0.24, checkColor: CREAM }),
);

// Android adaptive background: solid cream field (matches app.json backgroundColor).
save("android-icon-background.png", render({ size: 1024, bg: CREAM, plate: false, checkColor: CREAM }));

// Android monochrome (themed icons): transparent, white check silhouette only, no plate.
save(
  "android-icon-monochrome.png",
  render({ size: 1024, bg: null, plate: false, plateInset: 0.24, checkColor: WHITE }),
);

// Splash icon: transparent, green plate + cream check (shown centered over the splash bg).
save("splash-icon.png", render({ size: 512, bg: null, plate: true, plateInset: 0.16, checkColor: CREAM }));

// Favicon (web): small cream field, green plate + cream check.
save("favicon.png", render({ size: 48, bg: CREAM, plate: true, plateInset: 0.1, checkColor: CREAM }));

console.log("Done.");
