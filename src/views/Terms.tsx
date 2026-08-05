"use client";
import React from "react";
import Header from "@/components/homePage/Header";
import Footer from "@/components/homePage/Footer";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { SITE_URL } from "@/lib/seo";

const Terms = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col bg-background">
        <Seo
          title="Terms of Use"
          description="Read the Complisk terms of use for platform access, business responsibilities, payments, and service limitations."
          pathname="/terms"
          structuredData={{
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Complisk Terms of Use",
            url: `${SITE_URL}/terms`,
          }}
        />

        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
                Terms of Use
              </h1>
              <p className="text-center text-muted-foreground mb-12">
                Last Updated: January 7, 2026
              </p>

              <div className="space-y-8 text-muted-foreground">
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    1. Acceptance of Terms
                  </h2>
                  <p>
                    By accessing or using the Complisk platform, you agree to be
                    bound by these Terms of Use and all applicable laws and
                    regulations. If you do not agree, you must not access or use
                    the platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    2. Description of Services
                  </h2>
                  <p>
                    Complisk is a technology platform that provides tools for
                    businesses to publish promotional content, including offers
                    and QR codes, viewable by users based on location and
                    category. Complisk provides infrastructure only and does not
                    guarantee exposure, traffic, customer engagement,
                    redemptions, or business results.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    3. No Guarantees or Endorsements
                  </h2>
                  <p>
                    Complisk does not endorse, verify, validate, or guarantee
                    any promotion, business, or offer listed on the platform.
                    Any interaction between businesses and customers occurs
                    solely at their discretion and risk.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    4. Business Responsibilities
                  </h2>
                  <p className="mb-2">Businesses are solely responsible for:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>The accuracy and legality of their promotions</li>
                    <li>
                      Compliance with all applicable local, state, federal, and
                      international laws
                    </li>
                    <li>Fulfillment of offers and customer interactions</li>
                    <li>Honoring promotional terms they publish</li>
                  </ul>
                  <p className="mt-2">
                    Complisk does not monitor, enforce, or mediate disputes
                    between businesses and customers.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    5. User Conduct and Prohibited Content
                  </h2>
                  <p className="mb-2">Users may not:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      Engage in fraud, abuse, or manipulation of the platform
                    </li>
                    <li>
                      Upload illegal, misleading, explicit, hateful, political,
                      or religiously hostile content
                    </li>
                    <li>Interfere with platform security or functionality</li>
                    <li>Attempt unauthorized access to systems or data</li>
                  </ul>
                  <p className="mt-2">
                    Violations may result in immediate suspension or termination
                    and potential legal action.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    6. Accounts and Access
                  </h2>
                  <p>
                    Complisk may suspend or terminate accounts at its sole
                    discretion for violations of these terms, misuse of the
                    platform, or actions that pose legal, security, or
                    reputational risk.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    7. Payments, Subscriptions, and Billing
                  </h2>
                  <p>
                    If subscription fees apply, they are billed in advance
                    according to the selected plan. Refunds, if any, are
                    governed by the cancellation policy in effect at the time of
                    purchase. Complisk reserves the right to change pricing,
                    billing methods, or subscription terms with notice.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    8. Third-Party Services
                  </h2>
                  <p>
                    Complisk relies on third-party infrastructure, hosting,
                    payment processors, and service providers. Complisk is not
                    responsible for service interruptions, data loss, or
                    failures caused by third parties.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    9. Intellectual Property
                  </h2>
                  <p>
                    All platform software, design, branding, and infrastructure
                    are the exclusive property of Complisk. Users retain
                    ownership of their promotional content but grant Complisk a
                    non-exclusive license to display and distribute it within
                    the platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    10. Privacy and Data Use
                  </h2>
                  <p>
                    Complisk collects and processes data in accordance with its
                    Privacy Policy. Complisk does not sell personal data. Use of
                    the platform constitutes consent to data handling practices
                    as described in that policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    11. Cookies and Similar Technologies
                  </h2>
                  <p>
                    Complisk may use cookies and similar technologies to enable
                    basic platform functionality, security, and user
                    preferences, such as remembering location selections or
                    maintaining session integrity. Complisk does not use cookies
                    for behavioral advertising or cross-site tracking unless
                    expressly disclosed.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    12. Disclaimers
                  </h2>
                  <p>
                    The platform is provided “as is” and “as available,” without
                    warranties of any kind, express or implied, including
                    fitness for a particular purpose or uninterrupted
                    availability.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    13. Limitation of Liability
                  </h2>
                  <p>
                    To the maximum extent permitted by law, Complisk shall not
                    be liable for indirect, incidental, consequential, special,
                    or punitive damages, including lost profits, lost data,
                    business interruption, or reputational harm.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    14. Indemnification
                  </h2>
                  <p>
                    Users agree to indemnify and hold harmless Complisk from any
                    claims, damages, losses, or liabilities arising from their
                    use of the platform, their promotions, or violations of
                    these terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    15. No Partnership or Agency
                  </h2>
                  <p>
                    Nothing in these terms creates a partnership, agency, joint
                    venture, or employment relationship between Complisk and any
                    user or business.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    16. Governing Law and Jurisdiction
                  </h2>
                  <p>
                    These Terms of Use are governed by and construed in
                    accordance with the laws of the jurisdiction in which
                    Complisk is operated, without regard to conflict-of-law
                    principles.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    17. Changes to Terms
                  </h2>
                  <p>
                    Complisk may update these Terms of Use at any time.
                    Continued use of the platform after changes constitutes
                    acceptance of the revised terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    18. Severability
                  </h2>
                  <p>
                    If any provision of these terms is found unenforceable, the
                    remaining provisions shall remain in full force and effect.
                  </p>
                </section>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Terms;
