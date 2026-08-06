"use client";

// Home hero — ported 1:1 from the HoppingDeals home hero UI.
//   Poster background (mobile/desktop variants) → floating ticket cards for the
//   most popular categories → collapsible "More Categories" link strip.

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const ARTBOARD = {
  width: 513,
  height: 641,
};

interface HeroCard {
  key: string;
  label: string;
  kind: string;
  icon: string;
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  color: string;
  labelColor: string;
  badgeColor: string;
  copy: [string, string];
}

const cards: HeroCard[] = [
  {
    key: "restaurants",
    label: "RESTAURANTS",
    kind: "restaurants",
    icon: "restaurant",
    href: "/category/restaurants",
    x: 31,
    y: 315,
    width: 111,
    height: 80,
    rotate: -7,
    color: "#f2760e",
    labelColor: "#124aa0",
    badgeColor: "#c52d30",
    copy: ["$10", "OFF"],
  },
  {
    key: "beauty",
    label: "BEAUTY & SPAS",
    kind: "beauty",
    icon: "lotus",
    href: "/category/beauty-&-spas",
    x: 154,
    y: 313,
    width: 106,
    height: 79,
    rotate: 0,
    color: "#f45d8f",
    labelColor: "#172d6f",
    badgeColor: "#f13da4",
    copy: ["30%", "OFF"],
  },
  {
    key: "home",
    label: "HOME SERVICES",
    kind: "home",
    icon: "home",
    href: "/category/home-services",
    x: 278,
    y: 312,
    width: 106,
    height: 78,
    rotate: -3,
    color: "#74b528",
    labelColor: "#245f20",
    badgeColor: "#4f9a2b",
    copy: ["HOME", "DEALS"],
  },
  {
    key: "coffee",
    label: "COFFEE & TEAS",
    kind: "coffee",
    icon: "coffee",
    href: "/category/coffee-&-tea",
    x: 389,
    y: 314,
    width: 101,
    height: 78,
    rotate: 5,
    color: "#7517cf",
    labelColor: "#a81d32",
    badgeColor: "#5022c3",
    copy: ["SUPER", "SAVINGS"],
  },
  {
    key: "auto",
    label: "AUTO SERVICES",
    kind: "auto",
    icon: "car",
    href: "/category/auto-services",
    x: 92,
    y: 407,
    width: 106,
    height: 78,
    rotate: 4,
    color: "#2563eb",
    labelColor: "#194aa8",
    badgeColor: "#2563eb",
    copy: ["OIL", "DEALS"],
  },
  {
    key: "pets",
    label: "PETS",
    kind: "pets",
    icon: "paw",
    href: "/category/pets",
    x: 210,
    y: 407,
    width: 106,
    height: 78,
    rotate: -2,
    color: "#f59e0b",
    labelColor: "#9a5b03",
    badgeColor: "#f59e0b",
    copy: ["PET", "SAVINGS"],
  },
  {
    key: "shopping",
    label: "SHOPPING",
    kind: "shopping",
    icon: "bag",
    href: "/category/shopping",
    x: 326,
    y: 407,
    width: 106,
    height: 78,
    rotate: 3,
    color: "#8b5cf6",
    labelColor: "#5b35c9",
    badgeColor: "#7c3aed",
    copy: ["20%", "OFF"],
  },
];

const CARD_THEMES: Record<string, { light: string; dark: string }> = {
  restaurants: { light: "#ffa93a", dark: "#cb4400" },
  beauty: { light: "#ff97c2", dark: "#d82465" },
  home: { light: "#a3f03b", dark: "#53950d" },
  coffee: { light: "#af52ff", dark: "#5209ac" },
  auto: { light: "#60a5fa", dark: "#1d4ed8" },
  pets: { light: "#fbbf24", dark: "#d97706" },
  shopping: { light: "#a78bfa", dark: "#6d28d9" },
};

const moreCategoryLinks = [
  { label: "Food", href: "/category/food" },
  { label: "Soap & Skincare", href: "/category/shopping" },
  { label: "Professional Services", href: "/category/professional-services" },
  { label: "Health & Medical", href: "/category/health-&-medical" },
  { label: "Event Planning", href: "/category/event-planning-&-services" },
  { label: "Hotels & Casinos", href: "/category/hotels-&-casinos" },
  { label: "Nightlife", href: "/category/nightlife" },
  { label: "Active Life", href: "/category/active-life" },
  { label: "Education", href: "/category/education" },
  { label: "Arts & Entertainment", href: "/category/arts-&-entertainment" },
  { label: "Travel & Activities", href: "/category/travel-&-activities" },
];

const STAR_PATH =
  "M 0,-3.5 L 0.97,-1.02 L 3.56,-1.02 L 1.48,0.5 L 2.27,3.08 L 0,1.55 L -2.27,3.08 L -1.48,0.5 L -3.56,-1.02 L -0.97,-1.02 Z";

function pct(value: number, base: number) {
  return `${(value / base) * 100}%`;
}

function getTicketPath(
  width: number,
  height: number,
  notchesCount = 5,
  notchRadius = 5.5,
  cornerRadius = 7,
  inset = 0,
) {
  const w = width - inset * 2;
  const h = height - inset * 2;
  const r = Math.max(0, cornerRadius - inset * 0.5);
  const nr = Math.max(0, notchRadius - inset * 0.1);
  const yMin = r + nr + 4;
  const yMax = h - r - nr - 4;
  const notchYPositions: number[] = [];

  if (notchesCount === 1) {
    notchYPositions.push(h / 2);
  } else if (notchesCount > 1) {
    const step = (yMax - yMin) / (notchesCount - 1);
    for (let i = 0; i < notchesCount; i += 1) {
      notchYPositions.push(yMin + i * step);
    }
  }

  let d = `M ${inset + r},${inset} L ${width - inset - r},${inset}`;
  d += ` A ${r},${r} 0 0,0 ${width - inset},${inset + r}`;

  for (const notchY of notchYPositions) {
    const yc = inset + notchY;
    d += ` L ${width - inset},${yc - nr}`;
    d += ` A ${nr},${nr} 0 0,0 ${width - inset},${yc + nr}`;
  }

  d += ` L ${width - inset},${height - inset - r}`;
  d += ` A ${r},${r} 0 0,0 ${width - inset - r},${height - inset}`;
  d += ` L ${inset + r},${height - inset}`;
  d += ` A ${r},${r} 0 0,0 ${inset},${height - inset - r}`;

  for (let i = notchYPositions.length - 1; i >= 0; i -= 1) {
    const yc = inset + notchYPositions[i];
    d += ` L ${inset},${yc + nr}`;
    d += ` A ${nr},${nr} 0 0,0 ${inset},${yc - nr}`;
  }

  d += ` L ${inset},${inset + r}`;
  d += ` A ${r},${r} 0 0,0 ${inset + r},${inset}`;
  d += " Z";

  return d;
}

function getStarsForCard(width: number, height: number) {
  return [
    { x: 0.18, y: 0.72, scale: 0.9, opacity: 0.22 },
    { x: 0.25, y: 0.84, scale: 1.3, opacity: 0.28 },
    { x: 0.42, y: 0.78, scale: 0.8, opacity: 0.18 },
    { x: 0.58, y: 0.85, scale: 1.1, opacity: 0.25 },
    { x: 0.72, y: 0.7, scale: 1.2, opacity: 0.3 },
    { x: 0.85, y: 0.8, scale: 0.7, opacity: 0.15 },
    { x: 0.32, y: 0.88, scale: 1.0, opacity: 0.25 },
    { x: 0.65, y: 0.74, scale: 1.4, opacity: 0.27 },
  ].map((star) => ({
    x: star.x * width,
    y: star.y * height,
    scale: star.scale * (width > 100 ? 1 : 0.7),
    opacity: star.opacity,
  }));
}

const Hero: React.FC = () => {
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  return (
    <section className="hd-hero" aria-label="Hopping Deals local coupon hero">
      <div className="hd-hero__poster">
        <picture className="hd-hero__background" aria-hidden="true">
          <source media="(max-width: 640px)" srcSet="/mobile-bg-hero.png" />
          <img
            src="/disktop-view-bg-hero.png"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </picture>

        <div className="hd-hero__tickets" aria-label="Popular deal categories">
          {cards.map((card) => (
            <TicketCard card={card} key={card.key} />
          ))}
        </div>

        {showMoreCategories ? (
          <nav
            id="hero-more-categories"
            className="hd-hero__category-links"
            aria-label="More business categories"
          >
            {moreCategoryLinks.map((category) => (
              <Link
                className="hd-hero__category-link"
                href={category.href}
                key={category.href}
              >
                {category.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <button
          className={`hd-hero__more${
            showMoreCategories ? " hd-hero__more--expanded" : ""
          }`}
          type="button"
          onClick={() => setShowMoreCategories((value) => !value)}
          aria-expanded={showMoreCategories}
          aria-controls="hero-more-categories"
        >
          <Image
            src="/more-categories.png"
            alt="More Categories"
            width={254}
            height={45}
            priority
          />
        </button>
      </div>
    </section>
  );
};

function TicketCard({ card }: { card: HeroCard }) {
  const style = {
    left: pct(card.x, ARTBOARD.width),
    top: pct(card.y, ARTBOARD.height),
    width: pct(card.width, ARTBOARD.width),
    height: pct(card.height, ARTBOARD.height),
    transform: `rotate(${card.rotate}deg)`,
    "--ticket-color": card.color,
    "--ticket-label": card.labelColor,
    "--badge-color": card.badgeColor,
  } as React.CSSProperties;

  const theme = CARD_THEMES[card.key] || {
    light: card.color,
    dark: card.color,
  };
  const outerPath = getTicketPath(card.width, card.height, 5, 5.5, 8, 0);
  const innerPath = getTicketPath(card.width, card.height, 5, 5.5, 8, 3.5);
  const stars = getStarsForCard(card.width, card.height);

  return (
    <Link
      className={`hd-ticket hd-ticket--${card.kind}`}
      href={card.href}
      style={style}
    >
      <svg
        className="hd-ticket__svg"
        viewBox={`0 0 ${card.width} ${card.height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={`hd-grad-${card.key}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={theme.light} />
            <stop offset="100%" stopColor={theme.dark} />
          </linearGradient>
          <clipPath id={`hd-clip-${card.key}`}>
            <path d={outerPath} />
          </clipPath>
        </defs>
        <g clipPath={`url(#hd-clip-${card.key})`}>
          <path d={outerPath} fill={`url(#hd-grad-${card.key})`} />
          <path
            d={`M 0,0 L ${card.width},0 L 0,${card.height} Z`}
            fill="white"
            opacity="0.08"
          />
          {stars.map((star, index) => (
            <path
              key={index}
              d={STAR_PATH}
              transform={`translate(${star.x}, ${star.y}) scale(${star.scale})`}
              fill="white"
              opacity={star.opacity}
            />
          ))}
          <path d={outerPath} fill="black" opacity="0.14" />
        </g>
        <path
          d={innerPath}
          stroke="rgba(255, 255, 255, 0.42)"
          strokeWidth="1.2"
          strokeDasharray="2,2"
          fill="none"
        />
        <path d={outerPath} stroke="#061442" strokeWidth="2.8" fill="none" />
      </svg>
      <div className="hd-ticket__body">
        <div className="hd-ticket__label">{card.label}</div>
        <div className="hd-ticket__copy">
          <span>{card.copy[0]}</span>
          <span>{card.copy[1]}</span>
        </div>
      </div>
      <div className="hd-ticket__badge" aria-hidden="true">
        <BadgeIcon name={card.icon} />
      </div>
    </Link>
  );
}

function BadgeIcon({ name }: { name: string }) {
  const common = {
    className: "hd-ticket__badge-svg",
    viewBox: "0 0 32 32",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (name) {
    case "restaurant":
      return (
        <svg {...common}>
          <path
            d="M9 4v11M12 4v11M6 4v11M6 9h6M9 15v13"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.6"
          />
          <path
            d="M22 4c-3 3-4.5 6.6-4.3 10.8.1 2.6 1.5 4.2 3.2 4.2h1.5V28"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.6"
          />
        </svg>
      );
    case "lotus":
      return (
        <svg {...common}>
          <path
            d="M16 5c4 5 4 10 0 15-4-5-4-10 0-15Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 10c5 2 8 5.8 8 11-6-.8-9.4-4.4-8-11ZM24 10c-5 2-8 5.8-8 11 6-.8 9.4-4.4 8-11Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M4 18c5.4 0 9.4 1.7 12 5 2.6-3.3 6.6-5 12-5-2 6-6 9-12 9s-10-3-12-9Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path
            d="M5 15.2 16 6l11 9.2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.6"
          />
          <path
            d="M8.5 14v13h15V14"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2.6"
          />
          <path
            d="M14 27v-7h4v7"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2.3"
          />
        </svg>
      );
    case "car":
      return (
        <svg {...common}>
          <path
            d="M7 18h18l-2.2-6.2A3 3 0 0 0 20 10h-8a3 3 0 0 0-2.8 1.8L7 18Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
          <path
            d="M6 18v5h3M23 23h3v-5M10 23a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM22 23a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
        </svg>
      );
    case "paw":
      return (
        <svg {...common}>
          <path
            d="M10.5 14.5c1.7 0 3-1.8 3-4s-1.3-4-3-4-3 1.8-3 4 1.3 4 3 4ZM21.5 14.5c1.7 0 3-1.8 3-4s-1.3-4-3-4-3 1.8-3 4 1.3 4 3 4ZM7.5 20c1.4 0 2.5-1.4 2.5-3.2s-1.1-3.2-2.5-3.2S5 15 5 16.8 6.1 20 7.5 20ZM24.5 20c1.4 0 2.5-1.4 2.5-3.2s-1.1-3.2-2.5-3.2S22 15 22 16.8s1.1 3.2 2.5 3.2Z"
            fill="currentColor"
          />
          <path
            d="M16 16c4.4 0 7 4.1 7 7.1 0 2-1.4 3.4-3.2 3.4-1.4 0-2.2-.8-3.8-.8s-2.4.8-3.8.8c-1.8 0-3.2-1.4-3.2-3.4 0-3 2.6-7.1 7-7.1Z"
            fill="currentColor"
          />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <path
            d="M9 12h14l-1 15H10L9 12Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
          <path
            d="M12 12c0-3 1.7-5 4-5s4 2 4 5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.4"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path
            d="M9 15h12v5.5A5.5 5.5 0 0 1 15.5 26h-1A5.5 5.5 0 0 1 9 20.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          <path
            d="M21 17h2.5c2 0 3 1 3 2.8 0 2-1.5 3.2-4.5 3.2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.4"
          />
          <path
            d="M12 4c-2 2.4 2 4.1 0 6.4M17 4c-2 2.4 2 4.1 0 6.4M22 5.5c-1.5 1.8 1.5 3.1 0 4.9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      );
  }
}

export default Hero;
