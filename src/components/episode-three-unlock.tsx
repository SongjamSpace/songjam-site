"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useState } from "react";

export default function EpisodeThreeUnlock() {
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const fetchTotalUsersCount = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SONGJAM_SERVER}/leaderboard/latest-lb-users-count/adam_songjam`
    );
    if (res.data.usersCount) {
      setTotalUsersCount(res.data.usersCount);
    }
  };
  useEffect(() => {
    fetchTotalUsersCount();
  }, []);
  // Unlock targets
  const targets = [
    {
      label: "Total Songjammers",
      value: "2.5K",
      current: totalUsersCount, // This should be dynamic from your backend
      target: 2500,
      unlocked: false,
    },
    {
      label: "#2 MSI Metric",
      value: "?",
      current: 0,
      target: 1,
      unlocked: false,
      mystery: true,
    },
    {
      label: "#3 MSI Metric",
      value: "?",
      current: 0,
      target: 1,
      unlocked: false,
      mystery: true,
    },
    {
      label: "#4 MSI Metric",
      value: "?",
      current: 0,
      target: 1,
      unlocked: false,
      mystery: true,
    },
  ];

  return (
    <div className="relative w-full h-0 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="absolute -top-16 z-20 bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl"
      >
        <div className="text-center mb-4">
          <h3
            className="text-xl md:text-2xl font-black text-white mb-2 drop-shadow-lg"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            Songjam: Episode III
          </h3>
          <p
            className="text-sm text-white/80"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Unlock Mindshare targets to launch the next activation in the
            Songjam revolution
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-w-[320px]">
          {targets.map((item, index) => (
            <motion.div
              key={`${item.label}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden backdrop-blur-sm rounded-xl p-4 text-center transition-all duration-300 ${
                item.unlocked
                  ? "bg-gradient-to-br from-green-500/20 to-green-600/10 border-2 border-green-500/60 shadow-lg shadow-green-500/20"
                  : item.mystery
                  ? "bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-2 border-purple-400/40 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/10"
                  : "bg-white/10 border-2 border-white/30 hover:bg-white/15 hover:border-white/40"
              }`}
            >
              {/* Glow effect for mystery items */}
              {item.mystery && !item.unlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}

              {/* Value area */}
              <div className="flex justify-center items-center mb-3 relative z-10">
                {item.mystery ? (
                  <div className="relative">
                    {/* Mystery indicator */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 flex items-center justify-center relative">
                      {item.unlocked ? (
                        <svg
                          className="w-8 h-8 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span
                          className="text-3xl font-black text-purple-400"
                          style={{ fontFamily: "Orbitron, sans-serif" }}
                        >
                          ?
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-3xl md:text-4xl font-black ${
                      item.unlocked ? "text-green-400" : "text-white"
                    }`}
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    {item.value}
                  </div>
                )}
              </div>

              {/* Label area */}
              <div
                className={`text-xs uppercase tracking-wider relative z-10 ${
                  item.mystery ? "text-purple-300/90" : "text-white/80"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {item.label}
              </div>

              {/* Progress bar for non-mystery items */}
              {!item.mystery && (
                <div className="mt-3 w-full bg-white/20 rounded-full h-2 overflow-hidden relative z-10">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${(item.current / item.target) * 100}%`,
                    }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* View Leaderboard Button */}
        <div className="mt-6 text-center">
          <a
            href="/adam"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            View Leaderboard
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
