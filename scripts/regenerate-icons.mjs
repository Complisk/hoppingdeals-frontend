// Regenerate every favicon / PWA icon from the Hopping Deals brand logo (public/logo.png).
// Run: node scripts/regenerate-icons.mjs   (from anywhere)
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = path.join(rootDir, "public/logo.png");
const outDir = path.join(rootDir, "public");

const sizes = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["favicon-48x48.png", 48],
  ["apple-touch-icon.png", 180],
  ["web-app-manifest-192x192.png", 192],
  ["web-app-manifest-512x512.png", 512],
];

for (const [file, size] of sizes) {
  const out = path.join(outDir, file);
  await sharp(logoPath).resize(size, size).png().toFile(out);
  const meta = await sharp(out).metadata();
  console.log(`${file} -> ${meta.width}x${meta.height} (${fs.statSync(out).size} bytes)`);
}
console.log("Done. All icons regenerated from logo.png");
