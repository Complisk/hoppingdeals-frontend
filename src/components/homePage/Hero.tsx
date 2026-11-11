"use client";

// Home hero — space background, headline, and seven glowing category cards
// laid out in two tilted rows on the planet's horizon, each with an
// illustration popping out of the top. Desktop positions are percentages of
// the 1835×857 design artboard (.hx-stage); phones get a two-column grid.

import Link from "next/link";
import { useState } from "react";

interface HeroCard {
  key: string;
  title: string;
  offer: [string, string]; // [highlighted, rest]
  href: string;
  art: string;
  icon: string;
  colors: { light: string; base: string; dark: string; glow: string; badge: string };
  // card box in the 1835×857 artboard + tilt
  box: { x: number; y: number; w: number; h: number; r: number };
  // illustration box in the same artboard
  artBox: { x: number; y: number; w: number; h: number };
}

const W = 1835;
const H = 857;

const cards: HeroCard[] = [
  {
    key: "food",
    title: "Restaurants",
    offer: ["$10", "OFF"],
    href: "/category/restaurants",
    art: "/hero/art/food.webp",
    icon: "restaurant",
    colors: { light: "#ffc25a", base: "#f28a12", dark: "#b4500a", glow: "#ff9a1f", badge: "#f47a10" },
    box: { x: 190, y: 290, w: 385, h: 225, r: -6 },
    artBox: { x: 243.3, y: 233.3, w: 225.3, h: 136 },
  },
  {
    key: "beauty",
    title: "Beauty & Spas",
    offer: ["50%", "OFF"],
    href: "/category/beauty-&-spas",
    art: "/hero/art/beauty.webp",
    icon: "lotus",
    colors: { light: "#ff8cc4", base: "#e8408e", dark: "#a3135a", glow: "#ff4fa0", badge: "#ec4f98" },
    box: { x: 585, y: 297, w: 325, h: 203, r: -4 },
    artBox: { x: 631, y: 263.3, w: 172, h: 109 },
  },
  {
    key: "home",
    title: "Home Services",
    offer: ["HOME DEALS", ""],
    href: "/category/home-services",
    art: "/hero/art/home.webp",
    icon: "home",
    colors: { light: "#6ff08c", base: "#21b84c", dark: "#0b7a2e", glow: "#3dff7a", badge: "#22b14c" },
    box: { x: 925, y: 302, w: 328, h: 198, r: 0 },
    artBox: { x: 956.7, y: 264.7, w: 205.7, h: 109.7 },
  },
  {
    key: "coffee",
    title: "Coffee & Teas",
    offer: ["SUPER SAVINGS", ""],
    href: "/category/coffee-&-tea",
    art: "/hero/art/coffee.webp",
    icon: "coffee",
    colors: { light: "#c08cff", base: "#8a3cf0", dark: "#5414b0", glow: "#b06bff", badge: "#9146f2" },
    box: { x: 1270, y: 294, w: 355, h: 228, r: 6 },
    artBox: { x: 1358, y: 268, w: 141.5, h: 104.5 },
  },
  {
    key: "auto",
    title: "Auto Services",
    offer: ["OIL DEALS", ""],
    href: "/category/auto-services",
    art: "/hero/art/auto.webp",
    icon: "wrench",
    colors: { light: "#69b4ff", base: "#1f70ea", dark: "#0c3fa8", glow: "#3b8cff", badge: "#2378f0" },
    box: { x: 360, y: 537, w: 365, h: 200, r: -6 },
    artBox: { x: 413, y: 512.7, w: 204.3, h: 87.7 },
  },
  {
    key: "pets",
    title: "Pets",
    offer: ["PET SAVINGS", ""],
    href: "/category/pets",
    art: "/hero/art/pets.webp",
    icon: "paw",
    colors: { light: "#ffc860", base: "#f39a1a", dark: "#bd620a", glow: "#ffb020", badge: "#f5951a" },
    box: { x: 742, y: 540, w: 345, h: 175, r: 0 },
    artBox: { x: 810.5, y: 503.5, w: 160.5, h: 94 },
  },
  {
    key: "shopping",
    title: "Shopping",
    offer: ["20%", "OFF"],
    href: "/category/shopping",
    art: "/hero/art/shopping.webp",
    icon: "bag",
    colors: { light: "#c39bff", base: "#8b4dff", dark: "#5520c8", glow: "#b06bff", badge: "#9152ff" },
    box: { x: 1100, y: 545, w: 370, h: 200, r: 6 },
    artBox: { x: 1173, y: 520, w: 185, h: 90.5 },
  },
];

const moreCategoryLinks = [
  { label: "Food", href: "/category/food" },
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

const pct = (v: number, base: number) => `${(v / base) * 100}%`;

const Hero: React.FC = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <section className="hx-hero" aria-labelledby="hx-title">
      <div className="hx-stage">

        <div className="hx-heading">
          <p className="hx-eyebrow">
            <span aria-hidden="true" />
            Discover amazing deals
            <span aria-hidden="true" />
          </p>
          <h1 id="hx-title" className="hx-title">
            Shop Smart <em>Save Big</em>
          </h1>
          <p className="hx-lede">
            Find the best local deals, discounts and offers near you. Your next
            great deal is just a click away!
          </p>
        </div>

        <ul className="hx-cards" aria-label="Popular categories">
          {cards.map((card, i) => (
            <li
              key={card.key}
              className="hx-card-wrap"
              style={
                {
                  "--x": pct(card.box.x, W),
                  "--y": pct(card.box.y, H),
                  "--w": pct(card.box.w, W),
                  "--h": pct(card.box.h, H),
                  "--r": `${card.box.r}deg`,
                  // 3D: outer cards turn toward the centre and show their outer edge
                  "--ry": `${-card.box.r * 1.5}deg`,
                  "--ex": card.box.r / 6,
                  "--i": i,
                  "--light": card.colors.light,
                  "--base": card.colors.base,
                  "--dark": card.colors.dark,
                  "--glow": card.colors.glow,
                  "--badge": card.colors.badge,
                  "--ax": pct(card.artBox.x - card.box.x, card.box.w),
                  "--ay": pct(card.artBox.y - card.box.y, card.box.h),
                  "--aw": pct(card.artBox.w, card.box.w),
                } as React.CSSProperties
              }
            >
              <span className="hx-spark hx-spark--a" aria-hidden="true" />
              <span className="hx-spark hx-spark--b" aria-hidden="true" />
              <Link href={card.href} className="hx-card">
                <img className="hx-card__art" src={card.art} alt="" aria-hidden="true" />
                <span className="hx-card__badge" aria-hidden="true">
                  <BadgeIcon name={card.icon} />
                </span>
                <span className="hx-card__text">
                  <span className="hx-card__title">{card.title}</span>
                  <span
                    className={`hx-card__offer${
                      (card.offer[0] + card.offer[1]).length > 8 ? " hx-card__offer--long" : ""
                    }`}
                  >
                    <b>{card.offer[0]}</b>
                    {card.offer[1] ? <> {card.offer[1]}</> : null}
                  </span>
                  <span className="hx-card__explore">
                    Explore
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="hx-more">
          {showMore ? (
            <nav id="hx-more-list" className="hx-more__list" aria-label="More business categories">
              {moreCategoryLinks.map((c) => (
                <Link key={c.href} href={c.href} className="hx-more__link">
                  {c.label}
                </Link>
              ))}
            </nav>
          ) : null}
          <button
            type="button"
            className="hx-more__btn"
            aria-expanded={showMore}
            aria-controls="hx-more-list"
            onClick={() => setShowMore((v) => !v)}
          >
            <span className="hx-more__label">
              <Star />
              {showMore ? "Fewer Categories" : "More Categories"}
              <Star />
            </span>
            <svg className="hx-more__chevron" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 9 7 7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

function Star() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffc83d" aria-hidden="true">
      <path d="m12 2.8 2.7 5.7 6.2.8-4.6 4.3 1.2 6.2L12 16.8l-5.5 3 1.2-6.2-4.6-4.3 6.2-.8L12 2.8Z" />
    </svg>
  );
}

function BadgeIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 32 32",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (name) {
    case "restaurant":
      return (
        <svg {...common}>
          <path d="M9 4v11M12 4v11M6 4v11M6 9h6M9 15v13" stroke="currentColor" strokeLinecap="round" strokeWidth="2.8" />
          <path d="M22 4c-3 3-4.5 6.6-4.3 10.8.1 2.6 1.5 4.2 3.2 4.2h1.5V28" stroke="currentColor" strokeLinecap="round" strokeWidth="2.8" />
        </svg>
      );
    case "lotus":
      return (
        <svg {...common}>
          <path d="M16 5c4 5 4 10 0 15-4-5-4-10 0-15Z" stroke="currentColor" strokeWidth="2.2" />
          <path d="M8 10c5 2 8 5.8 8 11-6-.8-9.4-4.4-8-11ZM24 10c-5 2-8 5.8-8 11 6-.8 9.4-4.4 8-11Z" stroke="currentColor" strokeWidth="2.2" />
          <path d="M4 18c5.4 0 9.4 1.7 12 5 2.6-3.3 6.6-5 12-5-2 6-6 9-12 9s-10-3-12-9Z" stroke="currentColor" strokeWidth="2.2" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M5 15.2 16 6l11 9.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" />
          <path d="M8.5 14v13h15V14" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.8" />
          <path d="M14 27v-7h4v7" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5" />
        </svg>
      );
    case "wrench":
      return (
        <svg {...common}>
          <path d="M20.5 4.5a6.5 6.5 0 0 0-6.2 8.4L5.6 21.6a2.6 2.6 0 0 0 3.7 3.7l8.7-8.7a6.5 6.5 0 0 0 8.4-6.2l-3.6 3.6-3.9-.8-.8-3.9 3.6-3.6Z" fill="currentColor" />
        </svg>
      );
    case "paw":
      return (
        <svg {...common}>
          <path d="M10.5 14.5c1.7 0 3-1.8 3-4s-1.3-4-3-4-3 1.8-3 4 1.3 4 3 4ZM21.5 14.5c1.7 0 3-1.8 3-4s-1.3-4-3-4-3 1.8-3 4 1.3 4 3 4ZM7.5 20c1.4 0 2.5-1.4 2.5-3.2s-1.1-3.2-2.5-3.2S5 15 5 16.8 6.1 20 7.5 20ZM24.5 20c1.4 0 2.5-1.4 2.5-3.2s-1.1-3.2-2.5-3.2S22 15 22 16.8s1.1 3.2 2.5 3.2Z" fill="currentColor" />
          <path d="M16 16c4.4 0 7 4.1 7 7.1 0 2-1.4 3.4-3.2 3.4-1.4 0-2.2-.8-3.8-.8s-2.4.8-3.8.8c-1.8 0-3.2-1.4-3.2-3.4 0-3 2.6-7.1 7-7.1Z" fill="currentColor" />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <path d="M9 12h14l-1 15H10L9 12Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.6" />
          <path d="M12 12c0-3 1.7-5 4-5s4 2 4 5" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M9 15h12v5.5A5.5 5.5 0 0 1 15.5 26h-1A5.5 5.5 0 0 1 9 20.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.6" />
          <path d="M21 17h2.5c2 0 3 1 3 2.8 0 2-1.5 3.2-4.5 3.2" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
          <path d="M12 4c-2 2.4 2 4.1 0 6.4M17 4c-2 2.4 2 4.1 0 6.4M22 5.5c-1.5 1.8 1.5 3.1 0 4.9" stroke="currentColor" strokeLinecap="round" strokeWidth="2.1" />
        </svg>
      );
  }
}

export default Hero;
