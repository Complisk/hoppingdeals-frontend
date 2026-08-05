#!/usr/bin/env node
/**
 * Codemod: migrate the copied Vite/React Router codebase to Next.js App Router.
 * - react-router-dom imports -> next/link + next/navigation
 * - <Link to=...> -> <Link href=...>
 * - useNavigate() -> useRouter() and navigate() -> router.push()/router.replace()
 * - import.meta.env.VITE_API_BASE_URL -> process.env.NEXT_PUBLIC_API_BASE_URL
 * - add "use client" to client-only folders
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const CLIENT_DIRS = new Set([
  "components", "pages", "hooks", "services", "store", "utils",
]);
const NAV_HOOKS = new Set([
  "useNavigate", "useParams", "useLocation", "useSearchParams",
  "useRouter", "usePathname", "useSearchParams",
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

function rewrite(content, relPath) {
  let c = content;
  const isClientDir = CLIENT_DIRS.has(relPath.split("/")[0]);

  // ---- 1. react-router-dom imports ----
  const rrImportRe = /import\s*\{([^}]*)\}\s*from\s*["']react-router-dom["'];?/g;
  const replacements = [];
  let m;
  while ((m = rrImportRe.exec(c))) {
    const names = m[1].split(",").map((s) => s.trim()).filter(Boolean);
    const linkNames = names.filter((n) => n === "Link" || n === "NavLink");
    const navNames = names.filter((n) => !linkNames.includes(n) && n !== "Outlet" && n !== "Navigate");
    const lines = [];
    if (linkNames.includes("Link")) lines.push('import Link from "next/link";');
    if (linkNames.includes("NavLink")) lines.push('import { NavLink } from "@/components/NavLink";');
    if (navNames.length) lines.push(`import { ${navNames.join(", ")} } from "next/navigation";`);
    replacements.push({ from: m[0], to: lines.join("\n") });
  }
  for (const r of replacements) c = c.replace(r.from, r.to);

  // ---- 2. <Link to= -> <Link href= ----
  c = c.replace(/<Link(\s+)to=/g, "<Link$1href=");

  // ---- 3. navigate() -> router.push() / router.replace() ----
  c = c.replace(/useNavigate\(\)/g, "useRouter()");
  c = c.replace(/\bnavigate\s*=\s*useRouter\(\)/g, "router = useRouter()");
  // replace:true two-arg form first
  c = c.replace(
    /router\.push\(\s*([^()]*?)\s*,\s*\{\s*replace:\s*true\s*\}\s*\)/g,
    "router.replace($1)",
  );
  c = c.replace(/\bnavigate\(/g, "router.push(");
  c = c.replace(/\brouter\.push\(([^()]*?),\s*\{\s*state:/g, (match, arg) => {
    // keep for manual review
    return `router.push(${arg}, { state:`;
  });

  // ---- 4. import.meta.env ----
  c = c.replace(/import\.meta\.env\.VITE_API_BASE_URL/g, "process.env.NEXT_PUBLIC_API_BASE_URL");

  // ---- 5. "use client" directive ----
  if (isClientDir && !/^["']use (client|server|cache)["'];?/.test(c.trimStart())) {
    c = '"use client";\n' + c;
  }
  return c;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const rel = file.replace(ROOT, "").replace(/^[\\/]/, "");
  const original = readFileSync(file, "utf8");
  const next = rewrite(original, rel);
  if (next !== original) {
    writeFileSync(file, next);
    changed++;
    console.log("rewrote", rel);
  }
}
console.log(`\nDone. Rewrote ${changed} files.`);
