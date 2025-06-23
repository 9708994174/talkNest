"use client"

import { Check, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with emotional support",
    features: [
      "3 conversations per month",
      "Basic matching algorithm",
      "Community support groups",
      "Safety guidelines",
    ],
    buttonText: "Get Started",
    popular: false,
    priceId: null,
    planType: "free",
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "month",
    description: "Enhanced features for regular users",
    features: [
      "Unlimited conversations",
      "Priority matching",
      "Video call support",
      "Professional moderators",
      "Crisis intervention access",
      "Mood tracking tools",
    ],
    buttonText: "Upgrade to Premium",
    popular: true,
    priceId: "price_1QRxyzABC123premium", // Replace with actual Stripe price ID
    planType: "premium",
  },
  {
    name: "Professional",
    price: "$29.99",
    period: "month",
    description: "For licensed therapists and counselors",
    features: [
      "All Premium features",
      "Professional verification badge",
      "Earn from consultations",
      "Advanced analytics",
      "Custom availability settings",
      "Direct booking system",
    ],
    buttonText: "Go Professional",
    popular: false,
    priceId: "price_1QRxyzABC123professional", // Replace with actual Stripe price ID
    planType: "professional",
  },
]

export function PricingPlans() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = localStorage.getItem("talknest_user")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  const handlePlanSelection = async (planType: string, priceId: string | null) => {
    // Handle free plan
    if (planType === "free") {
      if (!currentUser) {
        router.push("/auth?redirect=pricing")
        return
      }
      router.push("/dashboard")
      return
    }

    // Check if user is logged in
    if (!currentUser) {
      router.push("/auth?redirect=pricing")
      return
    }

    setLoading(planType)
    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          priceId,
          planType,
        }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment processing failed. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted-foreground">
            Unlock more features to enhance your emotional support journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? "border-purple-500 shadow-lg scale-105" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${plan.popular ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePlanSelection(plan.planType, plan.priceId)}
                  disabled={loading === plan.planType}
                >
                  {loading === plan.planType ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
