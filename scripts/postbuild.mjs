import { copyFileSync, mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dist = resolve(root, "dist");

// Ensure dirs
mkdirSync(resolve(dist, "popup"), { recursive: true });
mkdirSync(resolve(dist, "assets/icons"), { recursive: true });

// Copy manifest
copyFileSync(resolve(root, "manifest.json"), resolve(dist, "manifest.json"));

// Write popup HTML pointing to built JS
writeFileSync(
  resolve(dist, "popup/index.html"),
  `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>NeatCode</title>
    <link rel="stylesheet" href="/popup/index.css" />
    <style>body{margin:0;background:#0f0f1a;}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/popup/index.js"></script>
  </body>
</html>`
);

// Generate real PNG icons (Chrome rejects SVG content in .png files)
const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function makeIcon(size) {
  const INDIGO = [0x63, 0x66, 0xf1];
  const WHITE = [0xff, 0xff, 0xff];
  const radius = size * 0.22;
  // one filter byte (0) prefixes each row of RGBA pixels
  const raw = Buffer.alloc(size * (size * 4 + 1));

  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    for (let x = 0; x < size; x++) {
      const i = row + 1 + x * 4;
      // rounded-rect mask
      const dx = Math.max(radius - x, x - (size - 1 - radius), 0);
      const dy = Math.max(radius - y, y - (size - 1 - radius), 0);
      if (dx * dx + dy * dy > radius * radius) continue; // transparent corner

      // robot face drawn in a 128-unit coordinate space
      const u = ((x + 0.5) * 128) / size;
      const v = ((y + 0.5) * 128) / size;
      const eye = Math.hypot(u - 42, v - 52) < 13 || Math.hypot(u - 86, v - 52) < 13;
      const mouth = u > 40 && u < 88 && v > 84 && v < 96;
      const c = eye || mouth ? WHITE : INDIGO;
      raw[i] = c[0];
      raw[i + 1] = c[1];
      raw[i + 2] = c[2];
      raw[i + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

[16, 48, 128].forEach((size) => {
  writeFileSync(resolve(dist, `assets/icons/icon${size}.png`), makeIcon(size));
});

console.log("✅ Post-build complete: manifest, popup HTML, icons copied to dist/");
