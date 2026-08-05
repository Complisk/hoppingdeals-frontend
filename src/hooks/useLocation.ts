"use client";
import { usePathname } from "next/navigation";

/**
 * React-router-compatible `useLocation()` built on Next.js navigation hooks.
 * Returns `{ pathname, search, hash, state }` so ported pages keep working.
 *
 * Only `pathname` is derived from the router — `search`/`hash` are left empty
 * to keep this hook safe inside statically-rendered pages (unlike
 * `useSearchParams`, which requires a Suspense boundary).
 */
export function useLocation() {
  const pathname = usePathname();

  return {
    pathname,
    search: "",
    hash: "",
    state: null,
    key: "",
  };
}

export default useLocation;
