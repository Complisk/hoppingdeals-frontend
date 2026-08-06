"use client";
import Link from "next/link";

interface LogoProps {
  variant?: "default" | "light";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({
  variant = "default",
  size = "md",
  showText = true,
}: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/">
      <img src="/logo.png" className=" w-24 " alt="Hopping Deals logo" />
    </Link>
  );
};

export default Logo;
