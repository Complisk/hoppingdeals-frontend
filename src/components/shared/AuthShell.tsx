"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Scene, { type SceneName } from "@/components/art/Scene";

interface AuthShellProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  /** Links under the form (switch account type, back to site…) */
  footer?: React.ReactNode;
  /** Right-hand moon panel copy (hidden below lg) */
  aside?: {
    /** The night scene behind the panel */
    scene: SceneName;
    eyebrow?: string;
    title: string;
    points?: string[];
  };
  /** Wider form column for long registration forms */
  wide?: boolean;
}

// Shared frame for every sign-in / sign-up / password screen: the form sits
// on the night sky, the moon horizon from the home hero fills the side panel.
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  aside,
  wide = false,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative flex flex-1 items-start justify-center px-5 py-10 sm:px-8 lg:items-center">
        <div className={cn("w-full", wide ? "max-w-2xl" : "max-w-md")}>
          <Link href="/" className="mb-10 inline-flex items-center gap-3">
            <img src="/logo.png" alt="Hopping Deals" className="h-16 w-auto" />
          </Link>

          <h1 className="text-3xl leading-tight text-foreground">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
          ) : null}

          <div className="mt-8">{children}</div>

          {footer ? (
            <div className="mt-8 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </div>
      </div>

      {aside ? (
        <aside className="relative isolate hidden w-[44%] max-w-[44rem] shrink-0 overflow-hidden border-l border-white/10 bg-[linear-gradient(180deg,#0d0826_0%,#1c1250_100%)] lg:flex lg:flex-col lg:justify-start">
          {/* Scene sits in the lower part so the copy above stays clear. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[60%]">
            <Scene name={aside.scene} className="h-full w-full" />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,#160e3c_0%,transparent_30%)]"
            />
          </div>
          <div className="sticky top-0 px-12 pt-24">
            {aside.eyebrow ? (
              <p className="mb-4 text-sm font-semibold text-gold">
                {aside.eyebrow}
              </p>
            ) : null}
            <h2 className="max-w-md text-4xl leading-[1.1] text-white drop-shadow-[0_3px_12px_rgb(0_0_0/0.6)]">
              {aside.title}
            </h2>
            {aside.points?.length ? (
              <ul className="mt-8 max-w-md space-y-4">
                {aside.points.map((point) => (
                  <li key={point} className="flex gap-3 text-white/85">
                    <span className="hd-sparkle mt-1.5" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </aside>
      ) : null}
    </div>
  );
}

/** Small "or switch" link row used under auth forms. */
export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-semibold text-gold underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}
