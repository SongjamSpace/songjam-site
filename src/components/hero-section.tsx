"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "./navbar";

interface HeroSectionProps {
  backgroundImageUrl?: string;
}

export default function HeroSection({ 
  backgroundImageUrl = "/images/voxpop.png" 
}: HeroSectionProps) {
  return (
    <>
      <div
        id="hero"
        className="relative bg-cover bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
        }}
      >
        {/* Bottom gradient fade overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[oklch(0.145_0_0)]"></div>
        
        {/* Navbar */}
        <Navbar />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center py-8 px-4">
          <motion.h1 
            className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg text-white"
            style={{ fontFamily: "Orbitron, sans-serif" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Own Your Voice
          </motion.h1>
          <motion.p 
            className="text-xl max-w-2xl mx-auto drop-shadow-lg text-white/90 mb-12"
            style={{ fontFamily: "Inter, sans-serif" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            When Attention becomes Currency, Voice is the Commodity
          </motion.p>
        </div>

        {/* Two Column Layout */}
        <div className="relative z-10 px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Side - Product Features with Image Space */}
              <motion.div 
                className="bg-white/5 border-white/20 backdrop-blur-sm rounded-2xl border p-8"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  From Attribution to Monetization
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Attribution</h3>
                      <p className="text-white/80 text-sm">Just a few seconds of your voice is enough to create a deepfake clone. Secure your unique voiceprint to prevent these attacks.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Verification</h3>
                      <p className="text-white/80 text-sm">Cryptographically verify your voiceprint with a Vode (voice node) paired with a Proof-of-Stake (Pos) consensus mechanism.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Tokenization</h3>
                      <p className="text-white/80 text-sm">The voice extends to your social presence, mint your own creator coin to use your existing social data to participate in Mindshare Capital Markets.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Monetization</h3>
                      <p className="text-white/80 text-sm">Your voice has value! Share cutting-edge crypto projects with the world to monetize your opinions and be rewarded in their native tokens.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Side - Top Performers */}
              <motion.div 
                className="bg-white/5 border-white/20 backdrop-blur-sm rounded-2xl border p-8"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  Top Performers
                </h2>
                <div className="space-y-4">
                  {/* Project 1 */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                        <Image 
                          src="/images/projects/Q.jpg" 
                          alt="Q Project" 
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Quantrix</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">10.98M</div>
                        <div className="text-white/70 text-xs">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">13.8K</div>
                        <div className="text-white/70 text-xs">Tweets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">$14.12M</div>
                        <div className="text-white/70 text-xs">ATH</div>
                      </div>
                    </div>
                  </div>

                  {/* Project 2 */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                        <Image 
                          src="/images/projects/eva.jpg" 
                          alt="Eva Project" 
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Eva Online</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">3.39M</div>
                        <div className="text-white/70 text-xs">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">12.4K</div>
                        <div className="text-white/70 text-xs">Tweets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">$1.99M</div>
                        <div className="text-white/70 text-xs">ATH</div>
                      </div>
                    </div>
                  </div>

                  {/* Project 3 */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                        <Image 
                          src="/images/projects/jellu.jpg" 
                          alt="Jellu Project" 
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Jellu</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">705.7K</div>
                        <div className="text-white/70 text-xs">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">8.6K</div>
                        <div className="text-white/70 text-xs">Tweets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">$272K</div>
                        <div className="text-white/70 text-xs">ATH</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
