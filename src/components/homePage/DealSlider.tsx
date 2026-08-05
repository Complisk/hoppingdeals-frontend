"use client";
import React from "react";

interface DealSliderProps {
  title: string;
}

const DealSlider: React.FC<DealSliderProps> = ({ title }) => {
  const deals = Array(4)
    .fill(null)
    .map((_, i) => ({
      id: i,
      image: `https://picsum.photos/300/300?random=${
        title === "Food & Beverage Deals" ? i + 20 : i + 30
      }`,
      caption:
        title === "Food & Beverage Deals"
          ? "Free Fry Friday!"
          : "35% OFF Nail X",
    }));

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="border-2 h-[30vh] bg-gray-200 p-4 relative flex items-center group"></div>
    </section>
  );
};

export default DealSlider;
