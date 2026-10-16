"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categories } from "@/data/mockData";
import { Button } from "@/components/ui/button";

interface CategoryStreetProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

/* Real, High-Quality Images (Unsplash CDN) */
const categoryImages: Record<string, string> = {
  nails:
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop",
  restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop",
  retail:
    "https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=600&auto=format&fit=crop",
  automotive:
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop",
  drinks:
    "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?q=80&w=600&auto=format&fit=crop",
  beauty:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
  hotels:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop",
  casino:
    "https://images.unsplash.com/photo-1518544882561-8c1e36f8e5c6?q=80&w=600&auto=format&fit=crop",
  airlines:
    "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=600&auto=format&fit=crop",
};

const CategoryStreet = ({
  selectedCategory,
  onSelectCategory,
}: CategoryStreetProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  return (
    <section className="py-12 bg-gradient-to-b from-background to-secondary/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">
            Explore Local Categories
          </h2>
          <p className="text-muted-foreground mt-2">
            Discover promotions from businesses around you
          </p>
        </div>

        <div className="relative">
          {canScrollLeft && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur"
              onClick={() => scroll("left")}
            >
              <ChevronLeft />
            </Button>
          )}

          {canScrollRight && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur"
              onClick={() => scroll("right")}
            >
              <ChevronRight />
            </Button>
          )}

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto px-10 pb-6 scrollbar-hide"
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;

              return (
                <motion.button
                  key={category.id}
                  whileHover={{ y: -10, scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    onSelectCategory(isSelected ? null : category.id)
                  }
                  className="flex-shrink-0 group"
                >
                  <div
                    className={`relative w-40 md:w-48 h-52 md:h-64 rounded-3xl overflow-hidden shadow-xl transition-all ${
                      isSelected
                        ? "ring-4 ring-primary ring-offset-2 scale-105"
                        : "hover:shadow-2xl"
                    }`}
                  >
                    {/* Image */}
                    <img
                      src={categoryImages[category.id]}
                      alt={category.name}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

                    {/* Category Name */}
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <span className="text-white text-lg font-semibold drop-shadow">
                        {category.name}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-6"
          >
            <div className="px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              Showing {categories.find((c) => c.id === selectedCategory)?.name}{" "}
              promotions
              <button
                className="ml-3 underline text-xs"
                onClick={() => onSelectCategory(null)}
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CategoryStreet;
