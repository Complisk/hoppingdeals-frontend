"use client";

import { useState } from "react";
import { getInitial } from "./types";

const SIZE_CLASSES = {
  sm: "h-10 w-10 text-base",
  md: "h-12 w-12 text-xl",
} as const;

interface BusinessLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: keyof typeof SIZE_CLASSES;
}

// Logo tile with an initial-letter fallback (also used when the image fails).
const BusinessLogo = ({ name, logoUrl, size = "md" }: BusinessLogoProps) => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 font-black text-primary-light ${SIZE_CLASSES[size]}`}
    >
      {logoUrl && !failed ? (
        <img
          src={logoUrl}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        getInitial(name)
      )}
    </div>
  );
};

export default BusinessLogo;
