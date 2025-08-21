"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { OGVerifier } from "@/components/og-verifier"
import { EVAOGBadge } from "@/components/eva-og-badge"
import { TwitterConnect } from "@/components/twitter-connect"
import Navbar from "@/components/navbar"
import { AlertCircle, Info, Wallet, CheckCircle, Twitter, Shield, Download } from "lucide-react"
import Image from "next/image"

export default function ProfilePage() {
  const [twitterHandle, setTwitterHandle] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [walletInput, setWalletInput] = useState("")
  const [isOGVerified, setIsOGVerified] = useState(false)
  const [verificationData, setVerificationData] = useState<{ handle: string; tweetUrl: string } | null>(null)
  const [authError, setAuthError] = useState("")
  const [ogBadgeClaimed, setOgBadgeClaimed] = useState(false)

  useEffect(() => {
    // Check for authentication errors in URL
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get("error")
    const message = urlParams.get("message")
    const details = urlParams.get("details")

    if (error === "twitter_auth_failed") {
      setAuthError(message || "Twitter authentication failed. Please try again.")
    } else if (error === "no_code") {
      setAuthError("Twitter authentication was cancelled or failed. Please try connecting again.")
    } else if (error === "auth_failed") {
      setAuthError(
        message || `Failed to authenticate with Twitter. ${details ? `Details: ${details}` : "Please try again."}`,
      )
    } else if (error === "twitter_oauth_error") {
      setAuthError(message || `Twitter OAuth Error: ${details || "Unknown error occurred"}`)
    } else if (error) {
      setAuthError(message || `Authentication error: ${error}${details ? ` - ${details}` : ""}`)
    }

    // Clean up URL parameters after showing error
    if (error) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Auto-claim OG badge when both conditions are met
  useEffect(() => {
    if (isOGVerified && walletAddress && !ogBadgeClaimed) {
      // Simulate registration process
      setTimeout(() => {
        setOgBadgeClaimed(true)
      }, 1500)
    }
  }, [isOGVerified, walletAddress, ogBadgeClaimed])

  const handleTwitterConnect = (handle: string) => {
    setTwitterHandle(handle)
    setAuthError("") // Clear any previous errors
  }

  const handleWalletSubmit = () => {
    if (walletInput.trim()) {
      // Basic validation for wallet address format
      if (walletInput.startsWith("0x") && walletInput.length === 42) {
        setWalletAddress(walletInput.trim())
        setWalletInput("")
      } else {
        alert("Please enter a valid Ethereum wallet address (starts with 0x and is 42 characters long)")
      }
    }
  }

  const handleWalletRemove = () => {
    setWalletAddress("")
  }

  const handleOGVerification = (isVerified: boolean, data?: { handle: string; tweetUrl: string }) => {
    setIsOGVerified(isVerified)
    setVerificationData(data || null)
  }

  return (
    <div className="relative bg-top p-4 min-h-screen md:min-h-auto md:pb-[200px]">
      <Navbar inverse />
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-center text-[#48333D] gap-8 lg:gap-16 max-w-6xl mx-auto pt-16 px-4">
        <div className="flex flex-col w-full">
          <h1 className="text-3xl lg:text-4xl font-bold uppercase">
            🧬 Claim Your EVA OG Status
          </h1>
          <p className="text-base lg:text-lg">
            Connect your verified Twitter account and add your wallet address to claim your OG status
          </p>
        </div>
        
        {/* Instructions */}
        <div className="relative items-start w-full justify-start gap-4 p-4 lg:p-6">
          <h2 className="text-sm font-bold uppercase mb-2">How it works</h2>
          <div className="text-sm lg:text-base space-y-1">
            <p>1. Authenticate with Twitter OAuth (proves ownership)</p>
            <p>2. Enter your wallet address</p>
            <p>3. We verify your account against our OG list</p>
            <p>4. Your OG status is automatically registered</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {authError && (
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="relative p-4 bg-red-100/20 border border-red-200/30 rounded-lg">
            <div className="flex items-start space-x-3 text-[#48333D]">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
              <div>
                <div className="font-medium mb-1">Authentication Error</div>
                <div className="text-sm">{authError}</div>
                <Button
                  onClick={() => setAuthError("")}
                  size="sm"
                  variant="outline"
                  className="mt-2 border-red-300 text-red-700 hover:bg-red-100/20"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Message for Non-OGs */}
      {twitterHandle && !isOGVerified && (
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="relative p-4 bg-blue-100/20 border border-blue-200/30 rounded-lg">
            <div className="flex items-start space-x-3 text-[#48333D]">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
              <div>
                <div className="font-medium mb-1">Twitter Account Connected Successfully!</div>
                <div className="text-sm">
                  Your Twitter account has been verified and connected. We&apos;re now checking if you&apos;re eligible for OG
                  status based on early support for Songjam.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Message */}
      {isOGVerified && walletAddress && !ogBadgeClaimed && (
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="relative p-4 bg-yellow-100/20 border border-yellow-200/30 rounded-lg">
            <div className="flex items-start space-x-3 text-[#48333D]">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mt-0.5"></div>
              <div>
                <div className="font-medium mb-1">Registering Your OG Status...</div>
                <div className="text-sm">
                  We&apos;re processing your OG claim and linking it to your wallet address. This will only take a moment.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto pt-16 px-4">
        {/* Left Column - Connection Steps */}
        <div className="flex flex-col gap-8 w-full lg:w-1/2">
          {/* Twitter Connection */}
          <div className="relative">
            <div className="relative p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Twitter className="w-5 h-5 text-[#FF007A]" />
                <h3 className="text-lg font-bold text-[#48333D]">
                  Verified Twitter Connection <span className="text-sm text-[#FF007A]">(required)</span>
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Authenticate with Twitter OAuth to prove account ownership
              </p>
              <TwitterConnect onConnect={handleTwitterConnect} />
              {/* Hidden OG Verifier - runs in background */}
              {twitterHandle && (
                <div className="hidden">
                  <OGVerifier twitterHandle={twitterHandle} onVerification={handleOGVerification} />
                </div>
              )}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="relative">
            <div className="relative p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-5 h-5 text-[#FF007A]" />
                <h3 className="text-lg font-bold text-[#48333D]">
                  Wallet Address <span className="text-sm text-[#FF007A]">(required)</span>
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Enter your wallet address to link with your OG status
              </p>
              {!walletAddress ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wallet-input" className="text-sm text-[#48333D]">
                      Ethereum Wallet Address
                    </Label>
                    <Input
                      id="wallet-input"
                      type="text"
                      placeholder="0x..."
                      value={walletInput}
                      onChange={(e) => setWalletInput(e.target.value)}
                      className="bg-white/10 border-white/20 text-[#48333D] placeholder:text-gray-500"
                    />
                  </div>
                  <Button
                    onClick={handleWalletSubmit}
                    disabled={!walletInput.trim()}
                    className="w-full bg-[#FF007A] hover:bg-[#FF007A]/90 text-white border-0"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Add Wallet Address
                  </Button>
                  <p className="text-xs text-gray-500">
                    Enter your Ethereum wallet address (starts with 0x). This will be linked to your verified Twitter
                    account and OG status.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-green-100/20 rounded-lg border border-green-200/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-medium">Wallet Address Added</p>
                        <p className="text-green-700 text-sm font-mono">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </p>
                      </div>
                      <Button
                        onClick={handleWalletRemove}
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-100/20"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Status */}
        <div className="flex flex-col gap-8 w-full lg:w-1/2">
          {/* Current Status */}
          <div className="relative">
            <div className="relative p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-[#FF007A]" />
                <h3 className="text-lg font-bold text-[#48333D]">Your Status</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Twitter Account (Verified)</Label>
                  <div className="p-2 bg-white/10 rounded text-[#48333D] border border-white/20">
                    {twitterHandle || "Not connected"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Wallet Address</Label>
                  <div className="p-2 bg-white/10 rounded text-[#48333D] border border-white/20">
                    {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Not connected"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">OG Status</Label>
                  <div className="flex items-center space-x-2">
                    {ogBadgeClaimed ? (
                      <div className="flex items-center space-x-2">
                        <EVAOGBadge />
                        <span className="text-green-600 text-sm font-bold">✅ Claimed!</span>
                      </div>
                    ) : isOGVerified && walletAddress ? (
                      <div className="p-2 bg-yellow-100/20 rounded text-yellow-800 border border-yellow-200/30">
                        Processing Registration...
                      </div>
                    ) : isOGVerified ? (
                      <div className="p-2 bg-blue-100/20 rounded text-blue-800 border border-blue-200/30">
                        Verified - Add Wallet to Complete
                      </div>
                    ) : (
                      <div className="p-2 bg-red-100/20 rounded text-red-800 border border-red-200/30">
                        {twitterHandle ? "Not verified as OG" : "Awaiting verification"}
                      </div>
                    )}
                  </div>
                </div>

                {verificationData && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Proof Tweet</Label>
                    <a
                      href={verificationData.tweetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 bg-blue-100/20 rounded text-blue-800 hover:bg-blue-200/30 transition-colors border border-blue-200/30"
                    >
                      View Original Tweet →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Success Message */}
          {ogBadgeClaimed && (
            <div className="relative">
              <div className="relative p-6 bg-green-50/20 backdrop-blur-sm rounded-lg border border-green-300/30">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-green-800">🎉 OG Status Registered Successfully!</h3>
                </div>
                
                <div className="text-center space-y-4">
                  <EVAOGBadge size="large" />
                  <p className="text-green-800">
                    Congratulations! Your Songjam OG status has been officially registered and linked to your
                    wallet. Thank you for being an early supporter!
                  </p>
                  <div className="p-3 bg-white/60 rounded-lg border border-green-200 text-sm">
                    <div className="font-medium text-green-800 mb-1">Your Registered OG Profile:</div>
                    <div className="text-green-700 space-y-1">
                      <div>Twitter: {twitterHandle}</div>
                      <div className="font-mono text-xs break-all">Wallet: {walletAddress}</div>
                      <div>Status: ✅ Songjam OG (Registered)</div>
                      <div className="text-xs text-green-600 mt-2">
                        Your OG status is now permanently linked to your wallet address
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Section - NEW */}
      {ogBadgeClaimed && (
        <div className="max-w-4xl mx-auto px-4 mt-16">
          <div className="relative">
            <div className="relative p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h3 className="text-2xl font-bold text-[#48333D] text-center mb-4">
                Confirm Your OG Status in Eva&apos;s Memory Bank
              </h3>
              <p className="text-center text-gray-600 mb-6">
                Share your OG status with the community by posting this image and tagging @EvaOnlineXyz
              </p>
              
              {/* OG Image */}
              <div className="relative w-full max-w-2xl mx-auto mb-6">
                <Image
                  src="/images/eva-og-share.jpg"
                  alt="EVA OG Status"
                  width={800}
                  height={450}
                  className="w-full h-auto rounded-lg border border-white/20"
                />
              </div>

              {/* Share Instructions */}
              <div className="bg-[#FF007A]/10 p-4 rounded-lg border border-[#FF007A]/20 mb-6">
                <p className="text-sm text-[#48333D] font-medium mb-2">Share with this text:</p>
                <code className="block bg-white/10 p-3 rounded text-sm text-[#48333D] font-mono">
                  I have claimed OG Status for @EvaOnlineXyz
                </code>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* Download Button */}
                <Button
                  onClick={() => {
                    // Create a download link for the image
                    const link = document.createElement('a')
                    link.href = '/images/eva-og-share.jpg'
                    link.download = 'eva-og-status.jpg'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  className="bg-white/10 hover:bg-white/20 text-[#48333D] border border-[#48333D]/20 px-6 py-3"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>

                {/* Share Button */}
                <Button
                  onClick={() => {
                    const shareText = `I have claimed OG Status for @EvaOnlineXyz\n\n#EVAOnline #EVAAgent`
                    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
                    window.open(shareUrl, "_blank")
                  }}
                  className="bg-[#FF007A] hover:bg-[#FF007A]/90 text-white border-0 px-8 py-3"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Share on X
                </Button>
              </div>

              {/* Instructions */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Instructions:</span>
                </p>
                <ol className="text-xs text-gray-500 mt-2 space-y-1">
                  <li>1. Click &quot;Download Image&quot; to save the OG status image</li>
                  <li>2. Click &quot;Share on X&quot; to open the tweet composer</li>
                  <li>3. Attach the downloaded image to your tweet</li>
                  <li>4. Post to confirm your OG status in Eva&apos;s memory bank!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-center mt-16 text-[#48333D]">
        COPYRIGHT © 2025 SONGJAM
      </div>
    </div>
  )
} 