"use client";
import React from "react";
import Header from "@/components/homePage/Header";
import Footer from "@/components/homePage/Footer";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { SITE_URL } from "@/lib/seo";

const AboutUs = () => {
  return (
    <>
      <Header light />

      <div className="min-h-screen flex flex-col bg-background">
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
          <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-center">
                About Us
              </h1>

              <section className="mb-12">
                <h2 className="text-2xl font-bold  mb-4">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Hopping Deals is a specialized promotion platform designed to
                  bridge the gap between businesses and consumers. Our goal is
                  to empower business owners to create customizable promotional
                  banners targeted to specific locations, allowing users to
                  discover active, relevant deals based on their current
                  category interests and geography.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold  mb-4">
                  The "Direct-to-Consumer" Advantage
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We believe in a transparent marketplace. Every deal banner you
                  see on our platform is created directly by the business owner
                  for you. By eliminating the "middleman," Hopping Deals takes no
                  commissions or cuts from these transactions. This allows
                  businesses to save money on marketing and pass those direct
                  savings on to their customers.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold  mb-4">Our Story</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Hopping Deals was born from real-world experience. Our founder, a
                  former business owner, understood the immense effort and high
                  costs required to attract new customers. For years, small
                  local businesses have sought a technology platform that offers
                  a simple, automated way to launch micro-promotions without the
                  complexity of social media advertising, SEO, or traditional
                  coupon sites. Hopping Deals is the solution to those challenges.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">User Benefit:</h2>
                <h3 className="text-xl font-semibold mb-3">
                  Your Local Deals, All in One Place
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  Hopping Deals is your all-in-one platform for discovering the best
                  deals and promotions right in your neighborhood. We partner
                  with local merchants to bring you exclusive offers, making it
                  easier than ever to spend consciously and save money.
                </p>
                <h3 className="text-xl font-semibold mb-3">
                  You Build the Platform
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Don't see your favorite local business on Hopping Deals? You have
                  the power to change that! Simply sign up and use the Tagging
                  feature on your Profile Page to nominate your go-to spots.
                  Once a business receives enough tags from our community, our
                  team will personally reach out to bring their deals directly
                  to you.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Merchant Benefit:</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  We help business owners design, launch, and track 30-day
                  geo-targeted campaigns in specific cities and regions with
                  full control over timing and reach. No bidding wars. No
                  subscriptions. No commissions. Just flat-fee promotions that
                  run exactly where and when you choose.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  Businesses create visual promotions using customizable
                  templates or their own uploaded artwork. Text elements can be
                  added, positioned, resized, styled, and scheduled. Promotions
                  can be set with exact start and end dates and times, giving
                  complete control over when offers run. Campaigns can also be
                  created in advance and scheduled to launch automatically,
                  allowing structured marketing without daily manual effort.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  Campaigns are built around geographic reach. Every promotion
                  begins with city-level targeting based on your campaign level,
                  with the ability to expand to additional cities or upgrade to
                  statewide coverage. Increased reach expands exposure, not
                  platform access. This structure keeps pricing predictable
                  while giving businesses scalable visibility.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
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

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">
                  How Hopping Deals Is Different
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  Traditional advertising platforms are often expensive,
                  complicated, and unpredictable. Hopping Deals is structured around
                  clarity and control. Each campaign runs for up to a fixed
                  30-day period from your selected start date. Businesses know
                  exactly what they are paying and exactly how long their
                  promotion will run. There are no percentage cuts from your
                  revenue and no algorithm-driven bidding systems.
                </p>
                <h3 className="text-xl font-semibold mb-3">
                  All Campaigns Include:
                </h3>
                <ul className="list-disc list-inside text-lg text-muted-foreground leading-relaxed mb-4">
                  <li>30-day campaign run from selected start date</li>
                  <li>
                    Real-time analytics to track views, scans, and engagement
                  </li>
                  <li>
                    Unique QR code for every promotion (future version release)
                  </li>
                  <li>
                    Time-based scheduling with defined start date and time (runs
                    up to 30 days)
                  </li>
                  <li>
                    Future promotion banner launch planning – create and
                    schedule campaigns in advance
                  </li>
                  <li>City-level targeting with optional statewide upgrade</li>
                  <li>
                    Custom promotion builder with full text and design controls
                  </li>
                </ul>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Hopping Deals was built from real-world business experience. We
                  understand how difficult and costly it can be to attract new
                  customers through traditional social media advertising, search
                  engine ads, or coupon marketplaces. Hopping Deals provides a
                  direct, structured alternative — predictable cost, geographic
                  precision, measurable performance, and full control in the
                  hands of the business owner.
                </p>
              </section>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AboutUs;
