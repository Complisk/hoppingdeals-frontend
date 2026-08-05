#!/usr/bin/env node
/**
 * Adds `"use client";` to every file in client-only folders that lacks a directive.
 * (The main codemod skipped files whose content didn't otherwise change.)
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const CLIENT_DIRS = new Set([
  "components", "pages", "hooks", "services", "store", "utils",
]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const rel = file.replace(ROOT, "").replace(/^[\\/]/, "");
  const topDir = rel.split(/[\\/]/)[0];
  if (!CLIENT_DIRS.has(topDir)) continue;
  if (file.endsWith(".d.ts")) continue;

  const original = readFileSync(file, "utf8");
  if (/^["']use (client|server|cache)["'];?/.test(original.trimStart())) continue;

  writeFileSync(file, `"use client";\n${original}`);
  changed++;
  console.log("use client ->", rel);
}
console.log(`\nDone. Added directive to ${changed} files.`);
