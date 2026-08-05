#!/usr/bin/env node
/**
 * With `cacheComponents` enabled, `export const dynamic = "force-dynamic"`
 * is not allowed. The supported way to opt a route into dynamic rendering is
 * calling `await connection()` from "next/cache" inside the page.
 * This script (1) strips any force-dynamic markers and (2) adds `await
 * connection()` to dynamic-param protected pages.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const APP = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry === "page.tsx") out.push(full);
  }
  return out;
}

for (const file of walk(APP)) {
  const rel = file.replace(APP, "").replace(/[\\/]/g, "/");
  const content = readFileSync(file, "utf8");
  let next = content;

  // 1) strip force-dynamic markers (line + surrounding blank line)
  next = next.replace(/\n\s*export const dynamic = "force-dynamic";\n/g, "\n");

  // 2) for dynamic-param protected pages, add a connection() dynamic marker
  const isDynamicParam = /\[[^\]]+\]/.test(rel);
  const isProtected = rel.includes("(protected)");
  if (isDynamicParam && isProtected && !next.includes("connection")) {
    next = next.replace(
      'import type { Metadata } from "next";',
      'import type { Metadata } from "next";\nimport { connection } from "next/cache";',
    );
    next = next.replace(
      /export default function (\w+)\(\) \{/,
      "export default async function $1() {\n  await connection();",
    );
  }

  if (next !== content) {
    writeFileSync(file, next);
    console.log("updated ->", rel);
  }
}
console.log("done");
