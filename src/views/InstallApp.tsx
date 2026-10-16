import Header from "@/components/homePage/Header";
import Footer from "@/components/homePage/Footer";
import PageHero from "@/components/public/PageHero";

const PLATFORMS = [
  {
    name: "iPhone and iPad (Safari)",
    steps: [
      "Open hoppingdeals.com in Safari.",
      "Tap the Share button, the box with an arrow pointing up.",
      "Scroll down and tap Add to Home Screen.",
      "Tap Add. The Hopping Deals bunny appears with your apps.",
    ],
  },
  {
    name: "Android (Chrome)",
    steps: [
      "Open hoppingdeals.com in Chrome.",
      "Tap the three-dot menu in the top-right corner.",
      "Tap Add to Home screen, or Install app.",
      "Confirm, then open Hopping Deals from your home screen.",
    ],
  },
];

const InstallApp = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        <PageHero
          scene="phone"
          title="Put Hopping Deals on your home screen"
          description="No app store needed. Add the site to your phone and open local deals with one tap."
          crumbs={[{ label: "Home", href: "/" }, { label: "Install the app" }]}
        />

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[minmax(0,22rem)_1fr] lg:px-8">
          <figure className="hd-panel overflow-hidden">
            <img
              src="/46283196-7c44-4b52-a0c6-be62db26f67f.png"
              alt="Share menu on iPhone with Add to Home Screen highlighted"
              className="w-full object-cover"
            />
            <figcaption className="p-4 text-sm text-muted-foreground">
              On iPhone, Add to Home Screen sits in the Share menu.
            </figcaption>
          </figure>

          <div className="grid gap-6 md:grid-cols-2">
            {PLATFORMS.map((platform) => (
              <section key={platform.name} className="hd-panel p-6">
                <h2 className="mb-5 font-sans text-lg font-semibold tracking-tight text-foreground">
                  {platform.name}
                </h2>
                <ol className="space-y-4">
                  {platform.steps.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-sm font-bold text-gold">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-sm leading-6 text-foreground/85">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InstallApp;
