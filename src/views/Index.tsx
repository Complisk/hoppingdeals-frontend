import Hero from "@/components/homePage/Hero";
import Categories from "@/components/homePage/Categories";
import Header from "@/components/homePage/Header";
import Footer from "@/components/homePage/Footer";
import CategoryCarousel from "@/components/public/CategoryCarousel";
const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header overlay />
      <main className="flex-grow">
        <Hero />

        {/* <Categories /> */}
        <CategoryCarousel
          title="Featured Promotion"
          excludeCategories={[
            "general-merchandise-store",
            "online-shopping",
            "shopping",
          ]}
        />

        <CategoryCarousel
          title="Food & Drinks"
          categories={["restaurants", "coffee-&-tea", "food"]}
        />
        <CategoryCarousel
          title="Beauty & Spas"
          categories={["beauty-&-spas"]}
        />
        <CategoryCarousel
          title="Products"
          categories={[
            "general-merchandise-store",
            "online-shopping",
            "shopping",
          ]}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
