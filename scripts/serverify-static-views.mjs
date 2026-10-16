/**
 * Convert pure-static views into true React Server Components:
 *  - strip the `"use client"` directive
 *  - drop the no-op <Seo /> component + its imports (Next Metadata API covers SEO)
 *  - drop now-unused imports
 *
 * Safe for views that use NO client hooks (no useState/useEffect/useRef...).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const targets = [
  "src/views/Index.tsx",
  "src/views/BlogDIYMarketing2026.tsx",
  "src/views/InstallApp.tsx",
  "src/views/CompliskBusinessDirectory.tsx",
];

for (const rel of targets) {
  const file = resolve(root, rel);
  let s = readFileSync(file, "utf8");

  // 1. Strip the leading "use client" directive
  s = s.replace(/^"use client";\s*\r?\n/, "");

  // 2. Drop Seo / SITE_URL imports
  s = s.replace(
    /import Seo from "@\/components\/seo\/Seo";\s*\r?\n?/g,
    "",
  );
  s = s.replace(
    /import \{ SITE_URL \} from "@\/lib\/seo";\s*\r?\n?/g,
    "",
  );

  // 3. Drop the <Seo ... /> blocks (self-closing, possibly with big props)
  s = s.replace(/<Seo[\s\S]*?\/>\s*\r?\n?/g, "");

  // 4. Per-file unused import cleanup
  if (rel.endsWith("Index.tsx")) {
    s = s.replace(
      /import PromotionGrid from "@\/components\/homePage\/PromotionGrid";\s*\r?\n?/g,
      "",
    );
    s = s.replace(
      /import DealSlider from "@\/components\/homePage\/DealSlider";\s*\r?\n?/g,
      "",
    );
    s = s.replace(
      /import \{ useEffect, useState \} from "react";\s*\r?\n?/g,
      "",
    );
  }

  writeFileSync(file, s);
  console.log(`serverified ${rel}`);
}
