"use client";

import MindshareLeaderboard from "@/components/mindshare-leaderboard";
import AboutShort from "@/components/about-short";
import Abilities from "@/components/abilities";
import StakeCoin from "@/components/StakeCoin";

export default function Home() {
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setIsLoading(false);
  //   }, 1000);
  // }, []);

  return (
    <>
      {/* Fixed Social Buttons - Near Title */}
      <div className="fixed top-4 right-8 md:top-4 md:right-16 z-50 flex gap-3">
        {/* X (Twitter) Button */}
        <button
          onClick={() => {
            window.open("https://x.com/jellufun", "_blank");
          }}
          className="
            flex items-center justify-center
            w-12 h-12
            rounded-full
            bg-black/20 backdrop-blur-sm
            border border-white/20
            text-white
            hover:bg-black/30 hover:border-white/30
            active:scale-95
            transition-all duration-300 ease-in-out
            shadow-lg hover:shadow-xl
            cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-white/50
            group
          "
          title="Follow @jellufun on X"
        >
          <svg
            className="w-6 h-6 group-hover:scale-110 transition-transform duration-200"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* SomniaMeme Button */}
        <button
          onClick={() => {
            window.open("https://somnia.meme", "_blank");
          }}
          className="
            flex items-center justify-center
            w-12 h-12
            rounded-full
            bg-black/20 backdrop-blur-sm
            border border-white/20
            text-white
            hover:bg-black/30 hover:border-white/30
            active:scale-95
            transition-all duration-300 ease-in-out
            shadow-lg hover:shadow-xl
            cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-white/50
            group
          "
          title="Visit SomniaMeme"
        >
          <img
            src="/images/somnia-icon.webp"
            alt="Somnia"
            className="w-6 h-6 rounded-full group-hover:scale-110 transition-transform duration-200"
          />
        </button>
      </div>

      {/* Hero Section with Jellu Landing */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Jellu Background Image */}
        <div className="absolute inset-0 bg-[url('/images/jellu-landing.png')] bg-cover bg-center bg-no-repeat">
          {/* Top gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10"></div>
          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>
        </div>
        {/* Background Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>

        {/* Top Left Text Content */}
        <div className="absolute top-40 left-8 md:top-64 md:left-48 z-10">
          <div className="text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              #1 meme on somnia
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-white mb-6 drop-shadow-lg">
              stay wobbly stay jelly
            </p>

            {/* Stake Button */}
            <div className="mb-4">
              <StakeCoin
                onClick={() => {
                  // Add your staking logic here
                  console.log("Staking $JELLY...");
                  window.open(
                    "https://somnia.meme/coin/0xd5447af13a1df69add89e185155b20fb72d5e9a7",
                    "_blank"
                  );
                }}
              />
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator - Bottom Center */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 text-center">
          <p className="text-white text-lg font-medium mb-2">scroll down</p>
          <div className="flex justify-center">
            <svg
              className="w-6 h-6 text-white animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="relative py-20 px-8 md:px-8 overflow-hidden">
        {/* Animated Background */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.2),transparent_50%)]"></div> */}

        {/* Floating Jelly Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-6">
              Origin Story
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full"></div>
          </div>

          {/* Story Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Story Text */}
            <div className="space-y-8">
              <div className="group">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-pink-300 transition-colors duration-300">
                  From Quest to Jellyverse
                </h3>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  <span className="text-pink-400 font-semibold">$JELLU</span>{" "}
                  started as a simple meme mascot, created purely to complete
                  Somnia quests.
                </p>
              </div>

              <div className="group">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm">!</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                    But something happened.
                  </h4>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-lg text-gray-300 leading-relaxed">
                  The{" "}
                  <span className="text-pink-400 font-semibold">wobble</span>{" "}
                  caught on. The{" "}
                  <span className="text-purple-400 font-semibold">memes</span>{" "}
                  got louder. The{" "}
                  <span className="text-blue-400 font-semibold">current</span>{" "}
                  grew stronger.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed italic">
                  Jelly always best when shared...
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  What began as a playful side quest odyssey turned into a{" "}
                  <span className="text-pink-400 font-bold">
                    full-on community
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden md:flex justify-center items-center mb-8 md:mb-0">
              <img
                src="/images/jelly-coffee.png"
                alt="Jelly Coffee"
                className="w-80 h-80 rounded-full shadow-2xl"
              />
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h4 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Now, the JellyDevs are giving away their full allocation:
              </h4>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                169,999,995 $JELLU
              </div>
              <p className="text-xl text-gray-300 mb-6">
                back to the community, starting with{" "}
                <span className="text-pink-400 font-bold">6.9% to yappers</span>
                ...
              </p>
              {/* <div className="flex justify-center">
                <div className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-bold text-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                  Join the Wobble
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      <MindshareLeaderboard
        title="Who's $JELLU?"
        moto="Top voices of the Jellu Memes in Somiaverse"
        projectId="jellu69"
        timeframes={["24H", "7D", "69D"]}
        backgroundImageUrl=""
      />
      <Abilities />
      <AboutShort />
      {/* <AnimatePresence>{isLoading && <Loading />}</AnimatePresence> */}
    </>
  );
}
