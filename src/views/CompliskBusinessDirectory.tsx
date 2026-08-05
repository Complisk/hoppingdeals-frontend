import Header from "@/components/homePage/Header";
import Footer from "@/components/homePage/Footer";
const CompliskBusinessDirectory = () => {
  return (
    <>
      <Header />

      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-grow px-4 py-4 md:py-28 sm:px-8">
          <section className="mx-auto max-w-5xl">
            <h1 className="text-3xl font-extrabold text-center tracking-tight text-slate-900 sm:text-4xl">
              Complisk Business Directory
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-700 sm:text-lg">
              Support Local with Complisk! Discover the incredible businesses
              that power our platform. Whether they have already shared
              exclusive offers with our users or are gearing up for future
              launches, these merchants are committed to excellence. Join us in
              championing local entrepreneurship.
            </p>

            <div className="mt-20">
              <img
                src="/new-assets/complisk-business-directory-snip.PNG"
                alt="Complisk Business Directory"
                className="h-auto max-h-[560px] w-full object-contain"
                loading="lazy"
              />
            </div>

            <div className="mt-8 border-t-2 border-red-600 pt-3 text-center text-sm font-semibold tracking-wide text-red-700 sm:text-3xl">
              COMING SOON
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CompliskBusinessDirectory;
