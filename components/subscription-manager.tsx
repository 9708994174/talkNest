"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, CreditCard, AlertCircle } from "lucide-react"

interface SubscriptionManagerProps {
  userId: string
  currentPlan: string
  onPlanChange?: (newPlan: string) => void
}

export function SubscriptionManager({ userId, currentPlan, onPlanChange }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)

  useEffect(() => {
    fetchSubscriptionData()
  }, [userId])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch(`/api/subscriptions/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      } else {
        console.error("Failed to fetch subscription data")
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error)
    }
  }

  const handleUpgrade = async (planType: string, priceId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          priceId,
          planType,
        }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      }
    } catch (error) {
      console.error("Error creating subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.",
      )
    )
      return

    setLoading(true)
    try {
      const response = await fetch(`/api/subscriptions/${userId}/cancel`, {
        method: "POST",
      })

      if (response.ok) {
        const result = await response.json()
        alert(
          `Subscription canceled. You'll continue to have access until ${new Date(result.cancelAt).toLocaleDateString()}`,
        )
        fetchSubscriptionData()
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to cancel subscription")
      }
    } catch (error) {
      console.error("Error canceling subscription:", error)
      alert("Failed to cancel subscription. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Subscription Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Current Plan</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge
                className={`${currentPlan === "premium" ? "bg-purple-500" : currentPlan === "professional" ? "bg-yellow-500" : "bg-gray-500"}`}
              >
                {currentPlan === "free" ? "Free" : currentPlan === "premium" ? "Premium" : "Professional"}
              </Badge>
              {currentPlan !== "free" && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
          </div>
          {subscriptionData?.nextBillingDate && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Next billing</p>
              <p className="text-sm font-semibold">{new Date(subscriptionData.nextBillingDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {currentPlan === "free" && (
          <div className="space-y-2">
            <Button
              onClick={() => handleUpgrade("premium", "price_premium_monthly")}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Upgrade to Premium - $9.99/month
            </Button>
            <Button
              onClick={() => handleUpgrade("professional", "price_professional_monthly")}
              disabled={loading}
              variant="outline"
              className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              Go Professional - $29.99/month
            </Button>
          </div>
        )}

        {currentPlan !== "free" && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Your subscription will renew automatically</span>
            </div>
            <Button
              onClick={handleCancelSubscription}
              disabled={loading}
              variant="outline"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              Cancel Subscription
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
