"use client";
import React, { useEffect } from "react";
import MindshareLeaderboard from "@/components/mindshare-leaderboard";
import Navbar from "@/components/navbar";
import HybridTarget from "@/components/hybrid-target";
import { useState } from "react";
import axios from "axios";

const projectId = "adam_songjam";
export default function Page() {
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const fetchTotalUsersCount = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SONGJAM_SERVER}/leaderboard/latest-lb-users-count/${projectId}`
    );
    if (res.data.usersCount) {
      setTotalUsersCount(res.data.usersCount);
    }
  };
  useEffect(() => {
    fetchTotalUsersCount();
  }, []);

  return (
    <div className="relative bg-cover bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]">
      <Navbar />
      <HybridTarget currentYappers={totalUsersCount} />
      <MindshareLeaderboard
        title="Who is $ADAM"
        moto="The First Creator Coin in the Songjam Ecosystem - Seeded in SOL for a Cross-Chain Future"
        projectId={projectId}
        timeframes={["ALL"]}
        backgroundImageUrl="/images/banners/adam.jpeg"
      />
    </div>
  );
}
