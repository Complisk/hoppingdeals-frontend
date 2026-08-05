"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type NavLinkClassName = string | ((props: { isActive: boolean; isPending: boolean }) => string);

interface NavLinkCompatProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> {
  to: string;
  className?: NavLinkClassName;
  activeClassName?: string;
  pendingClassName?: string;
  end?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, end, ...props }, ref) => {
    const pathname = usePathname();

    const isActive = end
      ? pathname === to
      : pathname === to ||
        (to !== "/" && pathname.startsWith(to.endsWith("/") ? to : `${to}/`));

    const resolvedClassName =
      typeof className === "function"
        ? className({ isActive, isPending: false })
        : cn(className, isActive && activeClassName, false && pendingClassName);

    return (
      <Link
        ref={ref}
        href={to}
        className={resolvedClassName}
        aria-current={isActive ? "page" : undefined}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
