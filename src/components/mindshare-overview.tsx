"use client";

import { motion } from "framer-motion";
import { MessageSquare, Mic } from "lucide-react";
import { useState, useEffect } from "react";

interface MindshareOverviewProps {
    countdownTargetDate: string; // ISO
    nextLaunchLabel: string;
    nextLaunchDate: string;
    leftSection: {
        title: string;
        subtitle: string;
        statLabel: string;
        statValue: string | number;
    };
    rightSection: {
        title: string;
        subtitle: string;
        statLabel: string;
        statValue: string | number;
    };
}

function CountdownTimer({ targetDate }: { targetDate: number }) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor(
                        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                    ),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="flex gap-4 justify-center items-center text-white">
            <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                    {String(timeLeft.days).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Days
                </div>
            </div>
            <div className="text-2xl text-gray-600 font-light">:</div>
            <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                    {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Hours
                </div>
            </div>
            <div className="text-2xl text-gray-600 font-light">:</div>
            <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                    {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Mins
                </div>
            </div>
            <div className="text-2xl text-gray-600 font-light">:</div>
            <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                    {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Secs
                </div>
            </div>
        </div>
    );
}

export default function MindshareOverview({
    countdownTargetDate,
    nextLaunchLabel,
    nextLaunchDate,
    leftSection,
    rightSection,
}: MindshareOverviewProps) {
    const [isCampaignEnded, setIsCampaignEnded] = useState(false);
    const [targetDate, setTargetDate] = useState<number>(new Date(countdownTargetDate).getTime());

    useEffect(() => {
        const checkTime = () => {
            const now = new Date().getTime();
            const initialTarget = new Date(countdownTargetDate).getTime();
            
            if (now > initialTarget) {
                setIsCampaignEnded(true);
                setTargetDate(new Date(nextLaunchDate).getTime());
            } else {
                setIsCampaignEnded(false);
                setTargetDate(initialTarget);
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 1000);
        return () => clearInterval(interval);
    }, [countdownTargetDate]);

    return (
        <div className="max-w-4xl mx-auto my-8">
            {isCampaignEnded && <div className="px-4 mb-4">
                <div className="max-w-7xl mx-auto bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center backdrop-blur-md">
                <h3 className="text-xl md:text-2xl font-bold text-yellow-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-williams), sans-serif" }}>
                    This Campaign has ended
                </h3>
                </div>
            </div>}
            {/* Main Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                {/* Glowing background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-orange-500/20 blur-3xl -z-10" />

                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 overflow-hidden">
                    {/* Animated grid background */}
                    <div className="absolute inset-0 opacity-10">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `
                linear-gradient(to right, rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
              `,
                                backgroundSize: "40px 40px",
                            }}
                        />
                    </div>

                    <div className="relative z-10 space-y-8">
                        {/* Countdown Section */}
                        <div className="text-center space-y-4">
                            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                                {isCampaignEnded ? nextLaunchLabel : "LAUNCHING IN"}
                            </h2>
                            <CountdownTimer targetDate={targetDate} />
                        </div>

                        {/* Side by Side Sections */}
                        {!isCampaignEnded && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Section */}
                            <div className="bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/20 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                                        <MessageSquare className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-purple-300">
                                            {leftSection.title}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {leftSection.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-400 mb-1">
                                        {leftSection.statLabel}
                                    </p>
                                    <p className="text-3xl font-bold text-purple-300">
                                        {leftSection.statValue}
                                    </p>
                                </div>
                            </div>

                            {/* Right Section */}
                            <div className="bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-500/20 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                                        <Mic className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-cyan-300">
                                            {rightSection.title}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {rightSection.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-400 mb-1">
                                        {rightSection.statLabel}
                                    </p>
                                    <p className="text-3xl font-bold text-cyan-300">
                                        {rightSection.statValue}
                                    </p>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
