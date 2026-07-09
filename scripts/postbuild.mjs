import { copyFileSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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

// Generate simple SVG icons
const sizes = [16, 48, 128];
sizes.forEach((size) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#6366f1"/>
  <text x="64" y="88" font-size="72" text-anchor="middle">🤖</text>
</svg>`;
  writeFileSync(resolve(dist, `assets/icons/icon${size}.png`), svg);
});

console.log("✅ Post-build complete: manifest, popup HTML, icons copied to dist/");
