"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PricingPlans } from "@/components/pricing-plans"
import { PremiumFeatures } from "@/components/premium-features"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart } from "lucide-react"

export default function PricingPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = localStorage.getItem("talknest_user")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 md:p-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()} className="hover:bg-purple-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TalkNest
              </span>
            </div>
          </div>
          {currentUser && (
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Dashboard
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Unlock Premium Support
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get unlimited access to emotional support, professional consultations, and advanced features to enhance your
            wellbeing journey.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <PricingPlans />

      {/* Premium Features */}
      <PremiumFeatures />
    </div>
  )
}
