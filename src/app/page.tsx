"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface LeaderboardData {
  username: string;
  name: string;
  totalPoints: number;
  userId: string;
}

type FilterType = "ALL" | "24H" | "7D";

export default function Home() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("24H");

  const getApiUrl = (filterType: FilterType) => {
    const baseUrl =
      "https://songjamspace-leaderboard.logesh-063.workers.dev/jellu69";
    switch (filterType) {
      case "24H":
        return `${baseUrl}_daily`;
      case "7D":
        return `${baseUrl}_weekly`;
      case "ALL":
      default:
        return baseUrl;
    }
  };

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        const url = getApiUrl(filter);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        const data = await response.json();
        setLeaderboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [filter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          {/* <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center"> */}
          <img
            src="/android-chrome-192x192.png"
            alt="Jellu Logo"
            className="w-18 h-18 rounded-lg"
          />
          {/* </div> */}
          <div>
            <h1 className="text-4xl font-bold text-white">JELLU</h1>
            <p className="text-white text-sm">on Somnia Network</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center space-x-4">
          <a
            href="https://x.com/jellu69"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex justify-center px-6 mb-8"
      >
        <img
          src="/images/banners/jelly_banner.jpeg"
          alt="Jelly Banner"
          className="max-w-4xl w-full h-auto rounded-2xl shadow-2xl border border-white/10"
        />
      </motion.div>

      {/* Leaderboard Section */}
      <section className="px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {/* <h3 className="text-4xl font-bold text-white mb-2">
            $JELLU Yapperboard
          </h3> */}
          {/* <p className="text-white text-lg mb-8">
            Who's the jelliest of them all?
          </p> */}

          {/* Filter Options */}
          <div className="flex justify-center mb-6">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-1 flex">
              {(["24H", "7D", "ALL"] as FilterType[]).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filter === filterOption
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/10">
              <div className="text-white font-semibold text-lg">RANK</div>
              <div className="text-white font-semibold text-lg">Yapper</div>
              <div className="text-white font-semibold text-lg text-right">
                Total Points
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
                <p className="text-white/50 mt-4">Loading yapperboard...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-8 text-center">
                <p className="text-red-400 mb-2">Failed to load data</p>
                <p className="text-white/50 text-sm">{error}</p>
              </div>
            )}

            {/* Leaderboard */}
            {!loading && !error && leaderboardData.length > 0 && (
              <div className="divide-y divide-white/10">
                {leaderboardData.map((item, index) => (
                  <motion.div
                    key={item.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                    className="grid grid-cols-3 gap-4 p-6 hover:bg-white/5 transition-colors duration-200"
                  >
                    {/* Rank */}
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    </div>

                    {/* Yapper */}
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-lg">
                        {item.name}
                      </span>
                      <span className="text-white/60 font-sm">
                        @{item.username}
                      </span>
                    </div>

                    {/* Yaps */}
                    <div className="flex items-center justify-end">
                      <span className="text-pink-400 text-lg">
                        {item.totalPoints.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && leaderboardData.length === 0 && (
              <div className="p-8 text-center text-white/50">
                <p>No yappers found yet. Be the first to join!</p>
              </div>
            )}

            {/* Powered by Songjam */}
            <div className="p-4 border-t border-white/10 text-center">
              <p className="text-white/40 text-sm">
                Powered by{" "}
                <a
                  href="https://x.com/SongjamSpace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 font-medium hover:text-white transition-colors duration-200"
                >
                  Songjam
                </a>
              </p>
            </div>
          </div>

          {/* Analytics Section */}
          {!loading && !error && leaderboardData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Total Yaps */}
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white/60 text-sm font-medium uppercase tracking-wide">
                      Total Points
                    </h4>
                    <p className="text-3xl font-bold text-pink-400 mt-2">
                      {leaderboardData
                        .reduce((sum, item) => sum + item.totalPoints, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">📊</span>
                  </div>
                </div>
              </div>

              {/* Total Yappers */}
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white/60 text-sm font-medium uppercase tracking-wide">
                      Total Yappers
                    </h4>
                    <p className="text-3xl font-bold text-purple-400 mt-2">
                      {leaderboardData.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">👥</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
