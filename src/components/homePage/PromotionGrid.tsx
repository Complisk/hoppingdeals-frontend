"use client";
import React from "react";

const PromotionGrid = () => {
  const promotions = [
    { id: 5, image: "/15213b79016a4b706a12fac9013f121d9207b8c8.jpg" },
    { id: 2, image: "/7c5346abcf3fa4042c08b82ca1ebf4190338a876.png" },
    { id: 4, image: "/0178cc1b3847296ca6bd479d40bb82cde490e03e.png" },
    { id: 3, image: "/9c3ab31f7102f43cfec2463d17aa18e9da9f2d40.png" },
    { id: 6, image: "/f78bf8d1b556a3c74fa425ad5ae01eb568b48e0b.jpg" },
    { id: 1, image: "/3a14b7232eb4807fdece634f7194eb61e0414504.png" },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6">Promotions for you</h2>

      <div className="border-4 border-black p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((item) => (
            <div key={item.id} className="">
              <img
                src={item.image}
                alt=""
                className=" md:w-[30vw] object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionGrid;
