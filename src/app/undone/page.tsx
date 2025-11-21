"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import localFont from "next/font/local";
import MindshareLeaderboard from "./mindshare-leaderboard";

const williamsFont = localFont({
  src: "../../../public/fonts/Williams-SemiBold.ttf",
  variable: "--font-williams",
  display: "swap",
});

const imageBaseUrl =
  "https://firebasestorage.googleapis.com/v0/b/lustrous-stack-453106-f6.firebasestorage.app/o/lb-gallery%2Fundone%2Fundone";
const imageToken = "?alt=media";

const galleryImages = [
  `${imageBaseUrl}_1.png${imageToken}`,
  `${imageBaseUrl}_2.png${imageToken}`,
  `${imageBaseUrl}_3.png${imageToken}`,
];

const appPointsInfo = {
  actions: [
    { action: "daily_spins", points: 5, icon: "🎰" },
    {
      action: "stickers",
      points: 20,
      img: "/images/undone/stickers.png",
    },
    {
      action: "helmet_stickers",
      points: 50,
      img: "/images/undone/helmet.png",
    },
    { action: "tasks", points: 100, icon: "✅" },
    { action: "rounds completed", points: 200, icon: "🏆" },
  ],
  multiplier: {
    description: "Ordering a watch doubles your points",
    value: "x2",
  },
};

const getPointsColor = (points: number) => {
  if (points <= 20) return "from-blue-500/20 to-cyan-500/20 border-blue-400/30";
  if (points <= 50)
    return "from-green-500/20 to-emerald-500/20 border-green-400/30";
  if (points <= 100)
    return "from-yellow-500/20 to-orange-500/20 border-yellow-400/30";
  return "from-purple-500/20 to-pink-500/20 border-purple-400/30";
};

export default function Page() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hoveredAction, setHoveredAction] = useState<number | null>(null);

  // Auto-rotate carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % galleryImages.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={williamsFont.variable}>
      <MindshareLeaderboard
        title="Undone x Williams Racing"
        moto="Your wrist. Your rules. ⌚
UNDONE watches are where individuality meets precision.
Designed by you, shipped worldwide. 🌍"
        projectId="songjamspace"
        timeframes={["24H", "7D", "ALL"]}
        backgroundImageUrl="/images/banners/undone.png"
      />

      {/* Combined App Points & Gallery Section */}
      <div className="relative bg-black py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
              <h3
                className="text-2xl md:text-3xl font-bold mb-3 text-white"
                style={{ fontFamily: "var(--font-williams), sans-serif" }}
              >
                Earn Points & Explore
              </h3>
              <p
                className="text-sm md:text-base text-white/80 max-w-3xl"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                On top of your yapping points, earn additional points for using
                the Undone app. Check out the gallery below to see what's
                possible!
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 lg:items-stretch">
              {/* Points System */}
              <div className="flex flex-col">
                <h4
                  className="text-lg md:text-xl font-semibold mb-4 text-white/90"
                  style={{ fontFamily: "var(--font-williams), sans-serif" }}
                >
                  Points Breakdown
                </h4>
                <div className="flex-1 space-y-3 relative">
                  {/* Racing Background Container */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    {/* Racing Stripes Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
                      {/* Diagonal Racing Stripes */}
                      <div className="absolute inset-0 opacity-30">
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 20px,
                            rgba(255, 255, 255, 0.05) 20px,
                            rgba(255, 255, 255, 0.05) 40px
                          )`,
                          }}
                        ></div>
                      </div>
                      {/* Speed Lines Effect */}
                      <div className="absolute inset-0 opacity-20">
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `repeating-linear-gradient(
                            90deg,
                            transparent,
                            transparent 30px,
                            rgba(255, 255, 255, 0.03) 30px,
                            rgba(255, 255, 255, 0.03) 60px
                          )`,
                          }}
                        ></div>
                      </div>
                      {/* Animated Gradient Overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"
                        animate={{
                          backgroundPosition: ["0% 0%", "100% 100%"],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                        style={{
                          backgroundSize: "200% 200%",
                        }}
                      />
                      {/* Corner Accents */}
                      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/30 to-transparent blur-2xl"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-pink-500/30 to-transparent blur-2xl"></div>
                    </div>
                  </div>

                  {/* Points Items */}
                  <div className="relative z-10 space-y-3">
                    {appPointsInfo.actions.map((item, idx) => (
                      <motion.div
                        key={idx}
                        className={`relative overflow-hidden rounded-xl border-2 ${getPointsColor(
                          item.points
                        )} p-4 cursor-pointer backdrop-blur-sm bg-black/40 shadow-lg`}
                        onMouseEnter={() => setHoveredAction(idx)}
                        onMouseLeave={() => setHoveredAction(null)}
                        whileHover={{ scale: 1.02, y: -2, x: 4 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.1 }}
                      >
                        {/* Racing stripe accent */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white/60 via-white/30 to-transparent"></div>

                        {/* Speed line effect on hover */}
                        {hoveredAction === idx && (
                          <motion.div
                            className="absolute inset-0"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                          >
                            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                          </motion.div>
                        )}

                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl relative">
                              {item.img ? (
                                <img
                                  src={item.img}
                                  className="w-6 h-6 rounded"
                                />
                              ) : (
                                <div className="text-2xl">{item.icon}</div>
                              )}
                            </div>
                            <div>
                              <div
                                className="font-semibold capitalize text-white text-sm md:text-base drop-shadow-lg"
                                style={{ fontFamily: "Inter, sans-serif" }}
                              >
                                {item.action.replace(/_/g, " ")}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className="text-xl md:text-2xl font-bold text-white drop-shadow-lg"
                              style={{
                                fontFamily: "var(--font-williams), sans-serif",
                              }}
                            >
                              +{item.points}
                            </div>
                            <div
                              className="text-xs text-white/70"
                              style={{ fontFamily: "Inter, sans-serif" }}
                            >
                              points
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Multiplier Card */}
                {appPointsInfo.multiplier && (
                  <motion.div
                    className="mt-6 p-5 rounded-xl border-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/50 shadow-lg shadow-purple-500/20 backdrop-blur-sm bg-black/40 relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Racing accent stripe */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400/80 via-pink-400/60 to-transparent"></div>

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <img
                          src={"/images/undone/watch.png"}
                          className="h-10 rounded"
                        />
                        <div>
                          <div
                            className="font-semibold text-white text-base md:text-lg drop-shadow-lg"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {appPointsInfo.multiplier.description}
                          </div>
                          <div
                            className="text-xs text-white/80 mt-1"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            Special bonus multiplier
                          </div>
                        </div>
                      </div>
                      <div
                        className="text-3xl md:text-4xl font-bold text-white bg-white/20 px-4 py-2 rounded-lg drop-shadow-lg"
                        style={{
                          fontFamily: "var(--font-williams), sans-serif",
                        }}
                      >
                        {appPointsInfo.multiplier.value}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Gallery Carousel */}
              <div className="flex flex-col">
                <h4
                  className="text-lg md:text-xl font-semibold mb-4 text-white/90"
                  style={{ fontFamily: "var(--font-williams), sans-serif" }}
                >
                  Gallery
                </h4>
                <div className="relative overflow-hidden rounded-xl bg-white/5 flex-1">
                  {/* Hidden first image to establish container height */}
                  <img
                    src={galleryImages[0]}
                    alt=""
                    className="w-full h-auto opacity-0 pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* All images absolutely positioned and animated */}
                  {galleryImages.map((imageUrl, index) => (
                    <motion.div
                      key={index}
                      className="absolute inset-0 top-0 left-0 right-0"
                      initial={false}
                      animate={{
                        opacity: currentImageIndex === index ? 1 : 0,
                        x:
                          currentImageIndex === index
                            ? 0
                            : currentImageIndex > index
                            ? -100
                            : 100,
                        pointerEvents:
                          currentImageIndex === index ? "auto" : "none",
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <img
                        src={imageUrl}
                        alt={`Undone gallery image ${index + 1}`}
                        className="w-full h-auto object-cover"
                      />
                    </motion.div>
                  ))}

                  {/* Navigation Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {galleryImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentImageIndex === index
                            ? "w-8 bg-white"
                            : "w-2 bg-white/50 hover:bg-white/75"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
