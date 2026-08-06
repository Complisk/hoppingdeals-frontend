"use client";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "default" | "light";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({}: LogoProps) => {
  return (
    <Link href="/">
      <Image
        width={24}
        height={24}
        src="/logo.png"
        className=" w-16 md:w-24 "
        alt="Hopping Deals logo"
      />
    </Link>
  );
};

export default Logo;
