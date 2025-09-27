"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function GenesisCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Target date: October 15, 2025 12:00 PM ET (UTC-4)
    const targetDate = new Date("2025-10-15T12:00:00-04:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Songjam: Episode II
          </h3>
          <p 
            className="text-sm text-white/80"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            The next activation in the Songjam revolution
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 min-w-[320px]">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center hover:bg-white/15 transition-all duration-300"
            >
              <div 
                className="text-2xl md:text-3xl font-black text-white mb-1"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {String(item.value).padStart(2, '0')}
              </div>
              <div 
                className="text-xs text-white/80 uppercase tracking-wider"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
