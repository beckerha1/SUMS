/**
 * Regenerates public/favicon.ico from public/SUMS_favicon.png (pads to a square canvas first).
 * Run: npm run favicon
 */
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { PNG } from "pngjs";
import pngToIco from "png-to-ico";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcPath = path.join(root, "public", "SUMS_favicon.png");
const outIco = path.join(root, "public", "favicon.ico");

function padToSquarePng(buffer) {
  const src = PNG.sync.read(buffer);
  const w = src.width;
  const h = src.height;
  if (w === h) {
    return buffer;
  }
  const size = Math.max(w, h);
  const out = new PNG({
    width: size,
    height: size,
    colorType: 6,
    inputHasAlpha: true,
  });
  for (let i = 0; i < out.data.length; i += 1) {
    out.data[i] = 0;
  }
  const ox = Math.floor((size - w) / 2);
  const oy = Math.floor((size - h) / 2);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const si = (w * y + x) << 2;
      const di = (size * (y + oy) + (x + ox)) << 2;
      out.data[di] = src.data[si];
      out.data[di + 1] = src.data[si + 1];
      out.data[di + 2] = src.data[si + 2];
      out.data[di + 3] = src.data[si + 3];
    }
  }
  return PNG.sync.write(out);
}

const raw = fs.readFileSync(srcPath);
const square = padToSquarePng(raw);
const tmp = path.join(os.tmpdir(), `sums-favicon-square-${process.pid}.png`);
fs.writeFileSync(tmp, square);
try {
  const buf = await pngToIco(tmp);
  fs.writeFileSync(outIco, buf);
} finally {
  fs.rmSync(tmp, { force: true });
}

console.log("Wrote", path.relative(root, outIco));
