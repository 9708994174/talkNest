"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RevenueDashboard } from "@/components/revenue-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Heart, DollarSign, Users, Calendar, TrendingUp } from "lucide-react"

export default function RevenueDashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [revenueData, setRevenueData] = useState({
    totalEarnings: 0,
    sessionsCompleted: 0,
    averageRating: 0,
    upcomingBookings: 0,
  })

  useEffect(() => {
    const user = localStorage.getItem("talknest_user")
    if (user) {
      const userData = JSON.parse(user)
      setCurrentUser(userData)

      // Check if user is professional
      if (userData.subscription !== "professional") {
        router.push("/pricing")
        return
      }

      fetchRevenueData(userData.id)
    } else {
      router.push("/auth")
    }
  }, [router])

  const fetchRevenueData = async (userId: string) => {
    try {
      const response = await fetch(`/api/revenue/professional/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setRevenueData(data)
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 md:p-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")} className="hover:bg-purple-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Revenue Dashboard
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Professional Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenueData.totalEarnings}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueData.sessionsCompleted}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueData.averageRating}/5</div>
              <p className="text-xs text-muted-foreground">From clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueData.upcomingBookings}</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Dashboard Component */}
        <RevenueDashboard />
      </div>
    </div>
  )
}
