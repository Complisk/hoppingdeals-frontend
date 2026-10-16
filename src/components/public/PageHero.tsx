import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SceneBackdrop, type SceneName } from "@/components/art/Scene";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  children?: React.ReactNode;
  className?: string;
  /** Narrow content column for reading pages (about, blog, terms) */
  narrow?: boolean;
  /** The page's own night-scene artwork */
  scene: SceneName;
  /** Optional tint for the scene (e.g. the category color) */
  accent?: string;
}

// Title band for inner public pages. Each page brings its own scene so the
// site feels like one night sky with a different view on every page.
export default function PageHero({
  title,
  description,
  crumbs,
  children,
  className,
  narrow = false,
  scene,
  accent,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate flex min-h-[400px] flex-col justify-start overflow-hidden border-b border-white/10 px-4 pb-14 pt-8 sm:min-h-[420px] sm:justify-center sm:px-6 sm:pb-20 sm:pt-12 lg:px-8",
        className,
      )}
    >
      <SceneBackdrop name={scene} accent={accent} />
      <div className={cn("mx-auto w-full", narrow ? "max-w-4xl" : "max-w-7xl")}>
        {crumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
              {crumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition-colors hover:text-gold">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-white">
                      {crumb.label}
                    </span>
                  )}
                  {index < crumbs.length - 1 ? (
                    <ChevronRight className="h-3.5 w-3.5 text-white/40" aria-hidden="true" />
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <h1 className="max-w-3xl text-3xl leading-[1.1] text-white drop-shadow-[0_3px_12px_rgb(0_0_0/0.5)] sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
