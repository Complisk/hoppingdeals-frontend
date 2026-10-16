import { cn } from "@/lib/utils";

// Shared sidebar item style for the business and admin shells: quiet by
// default, active item gets the moon-gold rail and label.
export const sidebarItemClass = (isActive: boolean) =>
  cn(
    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_hsl(var(--gold)/0.18)] before:absolute before:-left-4 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-full before:bg-gold before:shadow-[0_0_12px_hsl(var(--gold)/0.8)]"
      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
  );
