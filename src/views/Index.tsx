import Link from "next/link";
import Hero from "@/components/homePage/Hero";
import Header from "@/components/homePage/Header";
import Footer from "@/components/homePage/Footer";
import CategoryCarousel from "@/components/public/CategoryCarousel";
import { SceneBackdrop } from "@/components/art/Scene";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header overlay />
      <main className="flex-grow">
        <Hero />

        <div className="relative -mt-px">
          <CategoryCarousel
            title="Featured deals"
            excludeCategories={[
              "general-merchandise-store",
              "online-shopping",
              "shopping",
            ]}
          />

          <CategoryCarousel
            title="Food & drinks"
            href="/category/restaurants"
            categories={["restaurants", "coffee-&-tea", "food"]}
          />
          <CategoryCarousel
            title="Beauty & spas"
            href="/category/beauty-&-spas"
            categories={["beauty-&-spas"]}
          />
          <CategoryCarousel
            title="Products"
            href="/category/shopping"
            categories={[
              "general-merchandise-store",
              "online-shopping",
              "shopping",
            ]}
          />

          {/* Owner call-to-action */}
          <section className="mx-auto w-full max-w-7xl px-3 pb-4 pt-8 sm:px-6 lg:px-8">
            <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 px-6 py-10 sm:px-10 sm:py-14">
              <SceneBackdrop name="storefront" fade="left" compact />
              <div className="max-w-xl">
                <h2 className="text-2xl text-white sm:text-3xl">
                  Own a local business? Put your deal in front of your neighbors.
                </h2>
                <p className="mt-3 text-base text-white/80">
                  Build a coupon in minutes, choose the cities that see it, and
                  track who saves it.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/business/visitor"
                    className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-light"
                  >
                    Start with the business portal
                  </Link>
                  <Link
                    href="/hopping-deals-business-directory"
                    className="inline-flex h-11 items-center rounded-xl border border-white/25 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:border-gold/60 hover:text-gold"
                  >
                    Browse the directory
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
