"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_hsl(var(--primary)/0.8),inset_0_1px_0_rgb(255_255_255/0.22)] hover:bg-primary-light hover:shadow-glow",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90",
        outline:
          "border border-input bg-card/40 text-foreground hover:border-gold/50 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent-light",
        ghost: "text-foreground/85 hover:bg-accent hover:text-accent-foreground",
        link: "text-gold underline-offset-4 hover:underline",
        accent:
          "bg-gold text-gold-foreground shadow-[0_8px_24px_-10px_hsl(var(--gold)/0.7)] hover:brightness-110",
        hero: "gradient-primary text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.85),inset_0_1px_0_rgb(255_255_255/0.25)] hover:shadow-glow hover:brightness-110",
        glass:
          "glass border border-border/70 text-foreground hover:border-gold/40 hover:bg-card/80",
        success:
          "bg-success text-success-foreground shadow-md hover:bg-success/90",
        // Selected state for filter tabs / segmented controls
        tab: "bg-secondary text-gold shadow-[inset_0_0_0_1px_hsl(var(--gold)/0.35)] hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 px-7 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
