"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Heart, Crown } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (sessionId) {
      verifyPayment(sessionId)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/payments/verify?session_id=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)

        // Update local storage with new user data
        const currentUser = JSON.parse(localStorage.getItem("talknest_user") || "{}")
        const updatedUser = { ...currentUser, subscription: data.planType }
        localStorage.setItem("talknest_user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              TalkNest
            </span>
          </div>

          {sessionData && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Crown className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">
                  Welcome to {sessionData.planType === "premium" ? "Premium" : "Professional"}!
                </span>
              </div>
              <p className="text-sm text-purple-700">
                Your subscription is now active and you have access to all {sessionData.planType} features.
              </p>
            </div>
          )}

          <p className="text-gray-600">
            Thank you for upgrading your TalkNest experience. You now have access to enhanced features and unlimited
            emotional support connections.
          </p>

          <div className="space-y-2">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.push("/profile")} className="w-full">
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
