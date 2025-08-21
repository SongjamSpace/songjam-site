"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import ogTweetList from "@/data/ogTweetList.json"

interface OGVerifierProps {
  twitterHandle: string
  onVerification: (isVerified: boolean, data?: { handle: string; tweetUrl: string }) => void
}

export function OGVerifier({ twitterHandle, onVerification }: OGVerifierProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [verificationResult, setVerificationResult] = useState<{
    isVerified: boolean
    data?: { handle: string; tweetUrl: string }
  } | null>(null)

  useEffect(() => {
    const checkOGStatus = async () => {
      setIsChecking(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if handle exists in OG list
      const ogEntry = ogTweetList.find((entry) => entry.handle.toLowerCase() === twitterHandle.toLowerCase())

      const result = {
        isVerified: !!ogEntry,
        data: ogEntry ? { handle: ogEntry.handle, tweetUrl: ogEntry.tweetUrl } : undefined,
      }

      setVerificationResult(result)
      onVerification(result.isVerified, result.data)
      setIsChecking(false)
    }

    if (twitterHandle) {
      checkOGStatus()
    }
  }, [twitterHandle, onVerification])

  if (isChecking) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Checking OG status...</span>
      </div>
    )
  }

  if (!verificationResult) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {verificationResult.isVerified ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">✅ Verified EVA OG!</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">❌ Not found in OG list</span>
          </>
        )}
      </div>

      {verificationResult.isVerified && verificationResult.data && (
        <div className="p-3 bg-green-100/80 rounded-lg border border-green-200">
          <p className="text-green-800 text-sm">
            Your handle <strong>{verificationResult.data.handle}</strong> was found in our verified OG list!
          </p>
          <a
            href={verificationResult.data.tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-900 text-sm underline"
          >
            View your original tweet →
          </a>
        </div>
      )}

      {!verificationResult.isVerified && (
        <div className="p-3 bg-red-100/80 rounded-lg border border-red-200">
          <p className="text-red-800 text-sm">
            Your Twitter handle was not found in our OG list. Only early supporters who tweeted about Songjam are
            eligible for OG status.
          </p>
        </div>
      )}
    </div>
  )
} 