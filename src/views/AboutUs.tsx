"use client";
import React from "react";
import Header from "@/components/homePage/Header";
import Footer from "@/components/homePage/Footer";
import PageHero from "@/components/public/PageHero";
import Seo from "@/components/seo/Seo";
import { SITE_URL } from "@/lib/seo";

const SECTIONS = [
  { id: "mission", label: "Our mission" },
  { id: "direct", label: "Direct to consumer" },
  { id: "story", label: "Our story" },
  { id: "shoppers", label: "For shoppers" },
  { id: "businesses", label: "For businesses" },
  { id: "different", label: "How we’re different" },
];

const AboutUs = () => {
  return (
    <>
      <Header />

      <div className="min-h-screen flex flex-col">
        <Seo
          title="About Hopping Deals"
          description="Learn how Hopping Deals helps local businesses launch location-based promotions and helps customers discover timely local deals."
          pathname="/about-us"
          structuredData={{
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About Hopping Deals",
            url: `${SITE_URL}/about-us`,
            description:
              "Hopping Deals connects local businesses with nearby customers through targeted promotions and transparent campaign tools.",
          }}
        />

        <main className="flex-1">
          <PageHero
            scene="observatory"
            title="About Hopping Deals"
            description="Local deals created by the business owners themselves, with no middleman taking a cut."
            crumbs={[{ label: "Home", href: "/" }, { label: "About us" }]}
          />
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[14rem_1fr] lg:px-8">
            <nav
              aria-label="On this page"
              className="hidden lg:block"
            >
              <ul className="sticky top-28 space-y-1 border-l border-border text-sm">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ml-px block border-l border-transparent py-1.5 pl-4 text-muted-foreground transition-colors hover:border-gold hover:text-foreground"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <article className="max-w-[68ch] [&_h2]:scroll-mt-28 [&_h2]:text-2xl [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:text-[1.05rem] [&_p]:leading-8 [&_p]:text-foreground/80 [&_section]:mb-14">

              <section>
                <h2 id="mission" className="mb-4">Our mission</h2>
                <p>
                  Hopping Deals is a specialized promotion platform designed to
                  bridge the gap between businesses and consumers. Our goal is
                  to empower business owners to create customizable promotional
                  banners targeted to specific locations, allowing users to
                  discover active, relevant deals based on their current
                  category interests and geography.
                </p>
              </section>

              <section>
                <h2 id="direct" className="mb-4">
                  The direct-to-consumer advantage
                </h2>
                <p>
                  We believe in a transparent marketplace. Every deal banner you
                  see on our platform is created directly by the business owner
                  for you. By eliminating the "middleman," Hopping Deals takes no
                  commissions or cuts from these transactions. This allows
                  businesses to save money on marketing and pass those direct
                  savings on to their customers.
                </p>
              </section>

              <section>
                <h2 id="story" className="mb-4">Our story</h2>
                <p>
                  Hopping Deals was born from real-world experience. Our founder, a
                  former business owner, understood the immense effort and high
                  costs required to attract new customers. For years, small
                  local businesses have sought a technology platform that offers
                  a simple, automated way to launch micro-promotions without the
                  complexity of social media advertising, SEO, or traditional
                  coupon sites. Hopping Deals is the solution to those challenges.
                </p>
              </section>

              <section>
                <h2 id="shoppers" className="mb-4">For shoppers</h2>
                <h3 className="mb-3 mt-8">
                  Your Local Deals, All in One Place
                </h3>
                <p className="mb-4">
                  Hopping Deals is your all-in-one platform for discovering the best
                  deals and promotions right in your neighborhood. We partner
                  with local merchants to bring you exclusive offers, making it
                  easier than ever to spend consciously and save money.
                </p>
                <h3 className="mb-3 mt-8">
                  You Build the Platform
                </h3>
                <p>
                  Don't see your favorite local business on Hopping Deals? You have
                  the power to change that! Simply sign up and use the Tagging
                  feature on your Profile Page to nominate your go-to spots.
                  Once a business receives enough tags from our community, our
                  team will personally reach out to bring their deals directly
                  to you.
                </p>
              </section>

              <section>
                <h2 id="businesses" className="mb-4">For businesses</h2>
                <p className="mb-4">
                  We help business owners design, launch, and track 30-day
                  geo-targeted campaigns in specific cities and regions with
                  full control over timing and reach. No bidding wars. No
                  subscriptions. No commissions. Just flat-fee promotions that
                  run exactly where and when you choose.
                </p>
                <p className="mb-4">
                  Businesses create visual promotions using customizable
                  templates or their own uploaded artwork. Text elements can be
                  added, positioned, resized, styled, and scheduled. Promotions
                  can be set with exact start and end dates and times, giving
                  complete control over when offers run. Campaigns can also be
                  created in advance and scheduled to launch automatically,
                  allowing structured marketing without daily manual effort.
                </p>
                <p className="mb-4">
                  Campaigns are built around geographic reach. Every promotion
                  begins with city-level targeting based on your campaign level,
                  with the ability to expand to additional cities or upgrade to
                  statewide coverage. Increased reach expands exposure, not
                  platform access. This structure keeps pricing predictable
                  while giving businesses scalable visibility.
                </p>
                <p>
                  Every promotion includes a unique QR code (future version
                  release), allowing customers to scan directly from the
                  promotion. This creates measurable engagement and trackable
                  response. Hopping Deals provides real-time analytics so businesses
                  can monitor views, QR scans, and overall engagement. Promotion
                  dashboards display activity over the last 7 days, 30 days, and
                  total campaign performance, giving clear visibility into
                  results.
                </p>
              </section>

              <section>
                <h2 id="different" className="mb-4">
                  How Hopping Deals is different
                </h2>
                <p className="mb-4">
                  Traditional advertising platforms are often expensive,
                  complicated, and unpredictable. Hopping Deals is structured around
                  clarity and control. Each campaign runs for up to a fixed
                  30-day period from your selected start date. Businesses know
                  exactly what they are paying and exactly how long their
                  promotion will run. There are no percentage cuts from your
                  revenue and no algorithm-driven bidding systems.
                </p>
                <h3 className="mb-3 mt-8">
                  Every campaign includes
                </h3>
                <ul className="hd-panel mb-6 grid gap-3 p-5 text-[1.02rem] text-foreground/85 sm:grid-cols-2">
                  <li className="flex gap-2.5">
                    <span className="hd-sparkle mt-1.5" aria-hidden="true" />
                    <span>30-day campaign run from selected start date</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="hd-sparkle mt-1.5" aria-hidden="true" />
                    <span>
                    Real-time analytics to track views, scans, and engagement
                  </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="hd-sparkle mt-1.5" aria-hidden="true" />
                    <span>
                    Unique QR code for every promotion (future version release)
                  </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="hd-sparkle mt-1.5" aria-hidden="true" />
                    <span>
                    Time-based scheduling with defined start date and time (runs
                    up to 30 days)
                  </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="hd-sparkle mt-1.5" aria-hidden="true" />
                    <span>
                    Future promotion banner launch planning – create and
                    schedule campaigns in advance
                  </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="hd-sparkle mt-1.5" aria-hidden="true" />
                    <span>City-level targeting with optional statewide upgrade</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="hd-sparkle mt-1.5" aria-hidden="true" />
                    <span>
                    Custom promotion builder with full text and design controls
                  </span>
                  </li>
                </ul>
                <p>
                  Hopping Deals was built from real-world business experience. We
                  understand how difficult and costly it can be to attract new
                  customers through traditional social media advertising, search
                  engine ads, or coupon marketplaces. Hopping Deals provides a
                  direct, structured alternative — predictable cost, geographic
                  precision, measurable performance, and full control in the
                  hands of the business owner.
                </p>
              </section>
            </article>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AboutUs;
