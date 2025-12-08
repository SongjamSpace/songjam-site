"use client";

import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { formatNumber } from "@/lib/utils";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

export default function Stats() {
  const { data: leaderboard, isLoading, error } = useLeaderboard();

  // Calculate stats from leaderboard data
  const stats = {
    totalYappers: leaderboard?.length || 0,
    topScore:
      leaderboard && leaderboard.length > 0
        ? Math.max(...leaderboard.map((entry) => entry.totalPoints))
        : 0,
    avgScore:
      leaderboard && leaderboard.length > 0
        ? Math.round(
          leaderboard.reduce((sum, entry) => sum + entry.totalPoints, 0) /
          leaderboard.length
        )
        : 0,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 lg:gap-16 text-[#48333D] w-full lg:w-1/3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8 lg:gap-16 text-[#48333D] w-full lg:w-1/3">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">--</h1>
          <p>Total Singers</p>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">--</h1>
          <p>Top Score</p>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">--</h1>
          <p>Avg. Score</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-12 text-[#48333D] w-full lg:w-1/3">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{stats.totalYappers}</h1>
        <p>Total Singers</p>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{formatNumber(stats.topScore)}</h1>
        <p>Top Score</p>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{formatNumber(stats.avgScore)}</h1>
        <p>Avg. Score</p>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold">Base Eva Points Formula</h2>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 border border-white/20 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto overflow-x-auto">
          <div className="scale-65 transform origin-top-left m-1 min-w-[200px]">
            <BlockMath math="E_{\text{base}} = \underbrace{((L \cdot 0.2) + (R \cdot 0.4) + (B \cdot 0.4) + (RT \cdot 0.6) + (QT \cdot 1.0))}_{\text{Engagement Points}}" />
          </div>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed">
          Your base score is a sum of Engagement Points from interactions
          (Likes, Replies, Bookmarks, Retweets, Quote Tweets).
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold">Engagement Boosters</h2>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 border border-white/20 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto overflow-x-auto">
          <div className="scale-65 transform origin-top-left m-1 min-w-[200px]">
            <BlockMath math="\text{Booster} = \begin{cases} 2.0 & \text{if } \text{engagement} \geq \text{high threshold} \\ 1.5 & \text{if } \text{engagement} \geq \text{low threshold} \\ 1.0 & \text{otherwise} \end{cases}" />
          </div>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed">
          Your engagement score gets boosted based on the performance of your
          tweets. Here are the thresholds:
        </p>
        <div className="text-xs text-gray-700 leading-relaxed space-y-1">
          <p>• Likes: 2.0x (100+), 1.5x (50+)</p>
          <p>• Replies: 2.0x (20+), 1.5x (10+)</p>
          <p>• Retweets: 2.0x (30+), 1.5x (15+)</p>
          <p>• Quote Tweets: 2.0x (15+), 1.5x (8+)</p>
          <p>• Bookmarks: 2.0x (25+), 1.5x (12+)</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold">Early Multiplier</h2>
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full border border-red-200">
            Expired
          </span>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 border border-white/20 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto overflow-x-auto">
          <div className="scale-65 transform origin-top-left m-1 min-w-[200px]">
            <BlockMath math="\\{earlyMultiplier} = 1 + 99 \times \frac{\\max(0, T_{genesis} - T_{post})}{780447}" />
          </div>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed">
          Applies to posts made since first tweet at @evaonlinexyz. Maximum
          multiplier is 100x.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold">Bonus Songjam Multiplier</h2>
        <p className="text-xs text-gray-700 leading-relaxed">
          Receive an extra boost of 20% on your Eva points for each Tweet that
          tags{" "}
          <a
            href="https://x.com/intent/follow?screen_name=SongjamSpace"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF007A] font-bold hover:underline transition-colors"
          >
            @SongjamSpace
          </a>
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold">
          Songjam Agentic Review System Prompt
        </h2>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <p className="text-xs text-gray-700 leading-relaxed mb-3">
            Given the following tweets and replies from a yapper, evaluate their
            behavior and intent. Focus on detecting low-effort engagement
            farming versus genuine contribution to the project.
          </p>

          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold text-gray-800 mb-1">
                1. Summary
              </h3>
              <ul className="text-xs text-gray-700 space-y-1 ml-3">
                <li>a) What are the recurring themes/topics?</li>
                <li>
                  b) Is the tone informative, promotional, conversational, or
                  repetitive?
                </li>
                <li>
                  c) Are they clearly explaining the project or just hyping it
                  without substance?
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-800 mb-1">
                2. Replies Analysis
              </h3>
              <ul className="text-xs text-gray-700 space-y-1 ml-3">
                <li>
                  a) Are replies thoughtful and unique, or spammy and
                  repetitive?
                </li>
                <li>b) Is there two-way engagement from the yapper?</li>
                <li>c) Are any replies likely part of bot networks?</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-800 mb-1">
                3. Authenticity &amp; Quality
              </h3>
              <p className="text-xs text-gray-700 mb-1 ml-3">Score based on:</p>
              <ul className="text-xs text-gray-700 space-y-1 ml-6">
                <li>a) Originality of tweet content</li>
                <li>b) Relevance to the project</li>
                <li>c) Language variety</li>
                <li>
                  d) Signs of low-effort (copypasta, overused CTAs, mass
                  tagging)
                </li>
                <li>e) Interaction depth in replies</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-800 mb-1">
                4. Engagement Farming Indicators
              </h3>
              <ul className="text-xs text-gray-700 space-y-1 ml-3">
                <li>i) averageHashtags: Avg. number of hashtags per tweet</li>
                <li>ii) averageMentions: Avg. number of @mentions per tweet</li>
                <li>
                  iii) gmTweetCount: Number of tweets that say &ldquo;GM&rdquo;
                  or similar
                </li>
                <li>
                  iv) callToActionRatio: Proportion of tweets asking users to
                  &ldquo;Retweet&rdquo;, &ldquo;Tag&rdquo;,
                  &ldquo;Follow&rdquo;, etc.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-800 mb-1">
                5. Bot-Like Behavior
              </h3>
              <ul className="text-xs text-gray-700 space-y-1 ml-3">
                <li>a) Analyze tweet frequency, repetition, and uniformity.</li>
                <li>
                  b) Score from 0&ndash;100 based on patterns that resemble
                  automated behavior.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
