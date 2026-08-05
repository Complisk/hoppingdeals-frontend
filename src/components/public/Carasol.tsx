"use client";

import { useRef, useEffect, useLayoutEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const sunOrMoon = ["/sun.webp", "/moon.webp"];
const Background = ["/day-background.webp", "/night-bg.webp"];

function getTimeBasedBackgroundIndex(): number {
  const hours = new Date().getHours();
  return hours >= 6 && hours < 20 ? 0 : 1;
}

const buildings = [
  {
    id: "Restaurants",
    link: "restaurants,food",
    src: "/new-assets/10.webp",
    alt: "Market",
  },
  {
    id: "Beauty & Spas",
    link: "beauty-&-spas",
    src: "/barber.png",
    alt: "Pizzeria",
  },
  {
    id: "Home Services",
    link: "home-services",
    src: "/new-assets/5.webp",
    alt: "Bakery",
  },
  {
    id: "Coffee & Tea",
    link: "coffee-&-tea",
    src: "/new-assets/7.webp",
    alt: "Barbershop",
  },
  {
    id: "Food",
    link: "food,coffee-&-tea,restaurants",
    src: "/bakery.png",
    alt: "Bookstore",
  },

  {
    id: "Local Services",
    link: "local-services",
    src: "/new-assets/21.webp",
    alt: "Boutique",
  },
  { id: "Pets", link: "pets", src: "/new-assets/6.webp", alt: "Flower Shop" },
  {
    id: "Professional Services",
    link: "professional-services",
    src: "/new-assets/4.webp",
    alt: "Fruits & Vegetables",
  },
  {
    id: "Health & Medical",
    link: "health-&-medical",
    src: "/pharmacy.png",
    alt: "Pharmacy",
  },
  {
    id: "Event Planning & Services",
    link: "event-planning-&-services",
    src: "/new-assets/Capture123-removebg-preview.png",
    alt: "Building 1",
  },
  {
    id: "Hotels & Casinos",
    link: "hotels-&-casinos",
    src: "/Casino__Hotel-removebg-preview.png",
    alt: "Building 2",
  },
  {
    id: "Nightlife",
    link: "nightlife",
    src: "/new-assets/1.webp",
    alt: "Building 3",
  },
  {
    id: "Arts & Entertainment",
    link: "arts-&-entertainment",
    src: "/new-assets/art-entertairment.png",
    alt: "Building 4",
  },
  {
    id: "Active Life",
    link: "active-life",
    src: "/new-assets/8.webp",
    alt: "Building 5",
  },
  {
    id: "General Merchandise Store",
    link: "general-merchandise-store",
    src: "/Capture_store-removebg-preview.png",
    alt: "Building 9",
  },
  {
    id: "Online Shopping",
    link: "online-shopping",
    src: "/new-assets/online-shopping.png",
    alt: "Building 6",
  },
  {
    id: "Real Estate",
    link: "real-estate",
    src: "/Home_Services-removebg-preview.png",
    alt: "Building 7",
  },
  {
    id: "Mass Media",
    link: "mass-media",
    src: "/new-assets/21.webp",
    alt: "Building 8",
  },
];

// Measured from image alpha bounds so assets with extra transparent bottom
// space can be visually aligned on the same baseline.
const IMAGE_BOTTOM_OFFSET_PERCENT: Record<string, number> = {
  "/new-assets/10.webp": 15.51,
  "/barber.png": 9.8,
  "/new-assets/5.webp": 8.6,
  "/new-assets/7.webp": 8.43,
  "/bakery.png": 15.68,
  "/new-assets/21.webp": 10.3,
  "/new-assets/6.webp": 16.69,
  "/new-assets/4.webp": 14.17,
  "/pharmacy.png": 7.94,
  "/new-assets/1.webp": 6.91,
  "/new-assets/2.webp": 8.77,
  "/new-assets/art-entertairment.png": 0,
  "/new-assets/8.webp": 15.35,
  "/new-assets/9.webp": 8.94,
  "/new-assets/Shopping_Catergory_Building_for_Carousel__1_-removebg-preview.png": 20.94,
};

const IMAGE_SCALE_BY_SRC: Record<string, number> = {
  "/Products___Shopping-removebg-preview.png": 1.24,
  "/Home_Services-removebg-preview.png": 0.82,
  "/new-assets/online-shopping.png": 0.82,
};

function getImageBottomOffsetPercent(src: string): number {
  return IMAGE_BOTTOM_OFFSET_PERCENT[src] ?? 0;
}

function getImageScaleBySrc(src: string): number {
  return IMAGE_SCALE_BY_SRC[src] ?? 1;
}

const BUILDING_WIDTH = 180; // Width of each building in pixels
const BUILDING_GAP = 40; // Gap between buildings

export default function Carousel() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const airplaneRef = useRef<HTMLDivElement>(null);
  const airplaneX = useRef(100);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentTranslateX = useRef(0);
  const lastTranslateX = useRef(0);
  const velocity = useRef(0);
  const lastMoveTime = useRef(0);
  const lastMoveX = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const isButtonScrolling = useRef(false);

  const [translateX, setTranslateX] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [currentBgIndex, setCurrentBgIndex] = useState(
    getTimeBasedBackgroundIndex(),
  );

  const memoizedBuildings = useMemo(() => buildings, []);

  // Calculate max scroll based on total content width
  const maxTranslateX = useMemo(() => {
    const totalWidth = buildings.length * (BUILDING_WIDTH + BUILDING_GAP + 45); // +10 for extra padding
    return Math.max(
      0,
      totalWidth - (typeof window !== "undefined" ? window.innerWidth : 1920),
    );
  }, []);

  // Calculate dynamic carousel width based on buildings
  const carouselWidth = useMemo(() => {
    if (buildings.length === 0) return 0;
    return buildings.length * (BUILDING_WIDTH + BUILDING_GAP);
  }, []);

  useLayoutEffect(() => {
    const interval = setInterval(
      () => setCurrentBgIndex(getTimeBasedBackgroundIndex()),
      60000,
    );
    return () => clearInterval(interval);
  }, []);

  // Momentum animation
  const animateMomentum = () => {
    if (Math.abs(velocity.current) > 0.5) {
      velocity.current *= 0.95; // Friction
      currentTranslateX.current = Math.max(
        -maxTranslateX,
        Math.min(0, currentTranslateX.current + velocity.current),
      );
      setTranslateX(currentTranslateX.current);
      animationFrameId.current = requestAnimationFrame(animateMomentum);
    } else {
      velocity.current = 0;
    }
  };

  // Smooth scroll animation for button clicks
  const animateButtonScroll = (targetX: number) => {
    const startX = currentTranslateX.current;
    const distance = targetX - startX;
    const duration = 500; // 500ms animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      currentTranslateX.current = startX + distance * easeProgress;
      setTranslateX(currentTranslateX.current);

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        isButtonScrolling.current = false;
      }
    };

    isButtonScrolling.current = true;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animate();
  };

  // Mouse/Touch handlers for drag
  const handleDragStart = (clientX: number) => {
    if (isButtonScrolling.current) return;
    isDragging.current = true;
    startX.current = clientX;
    lastTranslateX.current = currentTranslateX.current;
    lastMoveTime.current = Date.now();
    lastMoveX.current = clientX;
    velocity.current = 0;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging.current) return;

    const deltaX = clientX - startX.current;
    const now = Date.now();
    const timeDelta = now - lastMoveTime.current;

    if (timeDelta > 0) {
      velocity.current = ((clientX - lastMoveX.current) / timeDelta) * 16;
    }

    lastMoveTime.current = now;
    lastMoveX.current = clientX;

    const newTranslateX = Math.max(
      -maxTranslateX,
      Math.min(0, lastTranslateX.current + deltaX),
    );

    currentTranslateX.current = newTranslateX;
    setTranslateX(newTranslateX);

    // Update direction based on movement
    if (deltaX > 0) {
      setDirection("left");
    } else if (deltaX < 0) {
      setDirection("right");
    }
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Start momentum animation if there's velocity
    if (Math.abs(velocity.current) > 0.5) {
      animateMomentum();
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Button controls for navigation with smooth animation
  const handleButtonMove = (dir: "left" | "right") => {
    if (isButtonScrolling.current) return;

    const step = dir === "right" ? -300 : 300;
    const targetX = Math.max(
      -maxTranslateX,
      Math.min(0, currentTranslateX.current + step),
    );

    setDirection(dir);
    animateButtonScroll(targetX);
  };

  // Airplane animation
  useEffect(() => {
    let animationFrame: number;
    const loop = () => {
      const speed = 0.2;
      if (direction === "right") {
        airplaneX.current -= speed;
        if (airplaneX.current < -30) airplaneX.current = 100;
      } else {
        airplaneX.current += speed;
        if (airplaneX.current > 120) airplaneX.current = -20;
      }
      if (airplaneRef.current) {
        airplaneRef.current.style.transform = `translateX(${airplaneX.current}vw) scaleX(${direction === "left" ? -1 : 1})`;
      }
      animationFrame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrame);
  }, [direction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-[55vh] relative overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${Background[currentBgIndex]}')` }}
      />

      <div className="absolute right-3 top-3 z-20 pointer-events-none w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px]">
        <img
          src={sunOrMoon[currentBgIndex]}
          alt="Sun/Moon"
          className="object-contain"
        />
      </div>

      {currentBgIndex === 0 && (
        <div className="absolute left-3 top-3 z-20 pointer-events-none w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px]">
          <img src="/cloud.webp" alt="Clouds" className="object-contain" />
        </div>
      )}

      <div
        ref={containerRef}
        className="absolute inset-0 h-[55vh] w-full overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Buildings carousel - at the top */}
        <motion.div
          ref={carouselRef}
          className="absolute top-0 left-0 z-20 bottom-0 flex items-end gap-[35px] sm:gap-[45px] px-4 h-[65%]"
          style={{
            x: translateX,
            width: buildings.length > 0 ? `${carouselWidth}px` : "auto",
          }}
        >
          {memoizedBuildings.map((b) => (
            <div key={b.id} className="flex-shrink-0">
              <Link href={`/category/${b?.link}`}>
                <div className="relative overflow-visible group w-[180px] h-[180px] md:w-[170px] md:h-[170px] lg:w-[200px] lg:h-[200px] overflow-hidden transition-all duration-300">
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[84%] flex items-end justify-center overflow-hidden">
                    <div className="h-full w-full flex items-end justify-center origin-bottom transition-transform duration-300 group-hover:scale-105">
                      <div
                        className="h-full flex items-end justify-center origin-bottom"
                        style={{
                          transform: `scale(${getImageScaleBySrc(b.src)})`,
                        }}
                      >
                        <img
                          src={b.src}
                          alt={b.alt}
                          style={{
                            transform: `translateY(${getImageBottomOffsetPercent(b.src)}%)`,
                          }}
                          className="h-full w-auto max-w-full object-contain object-bottom"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>

                  <p
                    style={{ color: currentBgIndex ? "white" : "black" }}
                    className="absolute top-7 text-nowrap left-1/2 -translate-x-1/2  text-sm md:text-base font-semibold tracking-wide text-center px-3"
                  >
                    {b.id}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </motion.div>

        {/* Road - at the bottom */}
        <div className="absolute bottom-0 left-0 w-full h-[45%] z-10">
          <motion.div className="flex h-full" style={{ x: translateX }}>
            {Array.from({
              length: 120,
            }).map((_, i) => (
              <img
                key={`road-${i}`}
                src="/image.png"
                alt="Road"
                className="w-full h-full transform scale-y-[-1] "
                draggable={false}
              />
            ))}
          </motion.div>
        </div>

        {/* Car - moving on the road */}

        <motion.div
          onClick={() => router.push("/category/auto-services")}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/category/auto-services");
            }
          }}
          role="link"
          tabIndex={0}
          className="absolute left-[8%] bottom-[12%] flex flex-col items-center md:bottom-[10%] lg:bottom-[4%] w-[190px] md:w-[130px] z-40 lg:w-[160px] cursor-pointer"
          style={{
            transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
          }}
        >
          <p
            className=" font-bold text-white"
            style={{
              transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
            }}
          >
            Automotive
          </p>
          <img
            src="/car.png"
            alt="Car - go to Auto Services"
            width={100}
            height={75}
            className="h-auto w-full drop-shadow-lg z-10"
            draggable={false}
          />
        </motion.div>

        {/* Airplane */}
        <div
          ref={airplaneRef}
          onClick={() => router.push("/category/airline")}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/category/airline");
            }
          }}
          role="link"
          tabIndex={0}
          className="absolute top-[12%] md:top-[5%] left-0 z-[999999999] w-[90px] sm:w-[110px] md:w-[130px] lg:w-[160px] cursor-pointer flex flex-col items-center"
        >
          <p
            className=" font-bold text-white"
            style={{
              transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
            }}
          >
            Airline
          </p>
          <img
            src="/airplane.png"
            alt="Airplane"
            width={150}
            height={75}
            className="h-auto w-full"
            draggable={false}
          />
        </div>

        {/* Navigation buttons - for both mobile and desktop */}
        <div className="absolute bottom-3 left-0 w-full flex justify-between px-4 z-30">
          <button
            className="z-20 p-3 bg-background border rounded-full shadow hover:bg-muted transition-colors opacity-50 "
            onClick={() => handleButtonMove("left")}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
          >
            <ChevronLeft size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </button>
          <button
            className="z-20 p-3 bg-background border rounded-full shadow hover:bg-muted transition-colors opacity-50 "
            onClick={() => handleButtonMove("right")}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
          >
            <ChevronRight size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
