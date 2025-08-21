"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import ogTweetList from "@/data/ogTweetList.json"
import { Twitter, ExternalLink, Users } from "lucide-react"
import Link from "next/link"

export default function OGWallPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOGs, setFilteredOGs] = useState(ogTweetList)

  useEffect(() => {
    if (searchTerm) {
      const filtered = ogTweetList.filter((og) => {
        // Remove @ symbol from search term if present
        const cleanSearchTerm = searchTerm.replace('@', '').toLowerCase()
        // Remove @ symbol from handle for comparison
        const cleanHandle = og.handle.replace('@', '').toLowerCase()
        
        // Search in handle (with and without @)
        return og.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
               cleanHandle.includes(cleanSearchTerm)
      })
      setFilteredOGs(filtered)
    } else {
      setFilteredOGs(ogTweetList)
    }
  }, [searchTerm])

  return (
    <div className="relative bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]">
      <Navbar inverse />
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-center text-[#48333D] gap-8 lg:gap-16 max-w-6xl mx-auto pt-16 px-4">
        <div className="flex flex-col w-full">
          <h1 className="text-3xl lg:text-4xl font-bold uppercase">
            🧬 EVA OG Wall
          </h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto mb-8">
            Hall of fame for early Songjam supporters
          </p>
          <p className="text-white/70 max-w-2xl mx-auto mb-12">
            These community members showed early support for Songjam by tweeting about the project.
          </p>
          <div className="text-sm flex items-center gap-2 uppercase mt-2">
            <div className="size-[8px] bg-[#C0C0C0]" />
            <span>{ogTweetList.length} Verified OGs</span>
          </div>
        </div>
        
        {/* Stats Card */}
        <div className="relative items-start w-full justify-start gap-4 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF007A]" />
              <span className="text-sm font-bold uppercase">OG COMMUNITY</span>
            </div>
            <Link href="/og-checker">
              <button className="text-sm text-[#FF007A] hover:underline font-bold">
                CLAIM YOUR STATUS →
              </button>
            </Link>
          </div>
          <p className="text-sm lg:text-base">
            These community members showed early support for Songjam by tweeting about the project. 
            Their contributions are forever recorded in Songjam&apos;s memory bank.
          </p>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Twitter handle (e.g., @username or username)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-[#48333D] placeholder:text-gray-500 focus:outline-none focus:border-[#FF007A]/50"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            {filteredOGs.length} / {ogTweetList.length}
          </div>
        </div>
        {searchTerm && (
          <p className="text-xs text-gray-600 mt-2">
            💡 Tip: You can search with or without the @ symbol (e.g., &quot;username&quot; or &quot;@username&quot;)
          </p>
        )}
      </div>

      {/* OG Grid */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOGs.map((og, index) => (
            <div
              key={index}
              className="relative p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-[#FF007A]" />
                  <span className="font-medium text-[#48333D]">{og.handle}</span>
                </div>
              </div>
              
              <a
                href={og.tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#FF007A] hover:underline"
              >
                See OG Profile
                <ExternalLink className="w-3 h-3" />
              </a>
              
              {/* Badge */}
              <div className="absolute -top-2 -right-2 bg-[#FF007A] text-white text-xs px-2 py-1 rounded-full font-bold">
                OG
              </div>
            </div>
          ))}
        </div>

        {filteredOGs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No OGs found matching &quot;{searchTerm}&quot;</p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="max-w-6xl mx-auto px-4 mt-16">
        <div className="relative p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          <h3 className="text-lg font-bold text-[#48333D] mb-2">What makes someone an OG?</h3>
          <p className="text-sm text-gray-600 mb-4">
            OG status is granted to community members who tweeted about Songjam during the early days of the project. 
            These supporters helped spread awareness and build the foundation of our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/og-checker" className="flex-1">
              <button className="w-full px-6 py-3 bg-[#FF007A] hover:bg-[#FF007A]/90 text-white rounded-lg font-medium transition-colors">
                Check Your OG Status
              </button>
            </Link>
            <Link href="/leaderboard" className="flex-1">
              <button className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-[#48333D] border border-[#48333D]/20 rounded-lg font-medium transition-colors">
                View Leaderboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-white/60 mt-12">
        COPYRIGHT © 2025 SONGJAM
      </div>
    </div>
  )
} 