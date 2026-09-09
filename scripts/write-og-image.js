'use strict';

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'public', 'SUMS_logo.png');
const DEST = path.join(ROOT, 'public', 'og-image.png');

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_LOGO_WIDTH = 1040;
const MAX_LOGO_HEIGHT = 420;

function fill(png, r, g, b, a) {
  const { data } = png;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  }
}

function blitScaled(src, dst, dx, dy, dw, dh) {
  for (let y = 0; y < dh; y += 1) {
    const sy = Math.min(src.height - 1, Math.floor((y * src.height) / dh));
    for (let x = 0; x < dw; x += 1) {
      const sx = Math.min(src.width - 1, Math.floor((x * src.width) / dw));
      const si = (sy * src.width + sx) << 2;
      const di = ((dy + y) * dst.width + (dx + x)) << 2;
      dst.data[di] = src.data[si];
      dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2];
      dst.data[di + 3] = src.data[si + 3];
    }
  }
}

const logo = PNG.sync.read(fs.readFileSync(SRC));
const scale = Math.min(MAX_LOGO_WIDTH / logo.width, MAX_LOGO_HEIGHT / logo.height);
const dw = Math.round(logo.width * scale);
const dh = Math.round(logo.height * scale);
const dx = Math.round((WIDTH - dw) / 2);
const dy = Math.round((HEIGHT - dh) / 2);

const out = new PNG({ width: WIDTH, height: HEIGHT });
fill(out, 0, 0, 0, 255);
blitScaled(logo, out, dx, dy, dw, dh);

fs.writeFileSync(DEST, PNG.sync.write(out));
console.log(`Wrote ${path.relative(ROOT, DEST)} (${WIDTH}x${HEIGHT})`);
