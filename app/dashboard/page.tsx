"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Heart,
  MapPin,
  MessageCircle,
  Settings,
  Search,
  Bell,
  Shield,
  Calendar,
  LogOut,
  Edit,
  Coffee,
  RefreshCw,
  Users,
  Zap,
  Star,
  Clock,
  Filter,
  Sparkles,
  Menu,
  X,
  Crown,
  Lock,
  CreditCard,
  TrendingUp,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { LiveLocationTracker } from "@/components/live-location-tracker"

export default function Dashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedMood, setSelectedMood] = useState("All Moods")
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentLocation, setCurrentLocation] = useState<any>(null)
  const [availableForSupport, setAvailableForSupport] = useState(true)
  const [totalNearby, setTotalNearby] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [activeConversations, setActiveConversations] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState("free") // free, premium, professional
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<Date | null>(null)
  const [dailyMessageCount, setDailyMessageCount] = useState(0)
  const [monthlyMessageLimit, setMonthlyMessageLimit] = useState(3)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("talknest_token")
    const user = localStorage.getItem("talknest_user")

    if (!token || !user) {
      router.push("/auth")
      return
    }

    try {
      const userData = JSON.parse(user)
      setCurrentUser(userData)
      setAvailableForSupport(userData.isAvailableForSupport || true)

      // Get current location
      initializeLocation()

      // Fetch conversations
      fetchConversations(userData.id)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/auth")
    }
  }, [router])

  useEffect(() => {
    if (currentLocation && currentUser) {
      fetchNearbyUsers()
    }
  }, [currentLocation, selectedMood, currentUser])

  const fetchConversations = async (userId: string) => {
    try {
      const response = await fetch(`/api/conversations?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setActiveConversations(data.conversations || [])
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setActiveConversations([])
    }
  }

  const initializeLocation = async () => {
    try {
      const position = await getCurrentPosition()
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
      setCurrentLocation(location)

      // Update user location in database
      updateUserLocation(location)
    } catch (error) {
      console.error("Location error:", error)
      // Use default location for demo
      const defaultLocation = { lat: 37.7749, lng: -122.4194 }
      setCurrentLocation(defaultLocation)
    }
  }

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      })
    })
  }

  const updateUserLocation = async (location: any) => {
    if (!currentUser) return

    try {
      await fetch("/api/users/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          location,
        }),
      })
    } catch (error) {
      console.error("Error updating location:", error)
    }
  }

  const fetchNearbyUsers = async () => {
    if (!currentLocation || !currentUser) return

    try {
      setLoading(true)
      const response = await fetch("/api/users/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          location: currentLocation,
          moodFilter: selectedMood,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success && data.users) {
        setNearbyUsers(data.users)
        setTotalNearby(data.totalFound)
      } else {
        setNearbyUsers([])
        setTotalNearby(0)
      }
    } catch (error) {
      console.error("Error fetching nearby users:", error)
      setNearbyUsers([])
      setTotalNearby(0)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    // Update user offline status
    if (currentUser) {
      try {
        await fetch("/api/users/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            isOnline: false,
          }),
        })
      } catch (error) {
        console.error("Error updating status:", error)
      }
    }

    localStorage.removeItem("talknest_token")
    localStorage.removeItem("talknest_user")
    router.push("/")
  }

  const handleStartChat = async (userId: string) => {
    // Check message limits for free users
    if (subscriptionStatus === "free" && dailyMessageCount >= monthlyMessageLimit) {
      router.push("/pricing")
      return
    }

    try {
      // Create or get conversation
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          otherUserId: userId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Increment message count for free users
          if (subscriptionStatus === "free") {
            setDailyMessageCount((prev) => prev + 1)
          }
          router.push(`/chat/${userId}`)
        }
      }
    } catch (error) {
      console.error("Error starting chat:", error)
      router.push(`/chat/${userId}`)
    }
  }

  const handleScheduleMeetup = (userId: string) => {
    router.push(`/meetup/${userId}`)
  }

  const handleMoodFilter = (mood: string) => {
    setSelectedMood(mood)
  }

  const handleRefresh = () => {
    fetchNearbyUsers()
    if (currentUser) {
      fetchConversations(currentUser.id)
    }
  }

  const toggleAvailability = async () => {
    const newAvailability = !availableForSupport
    setAvailableForSupport(newAvailability)

    try {
      await fetch("/api/users/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          isAvailable: newAvailability,
        }),
      })
    } catch (error) {
      console.error("Error updating availability:", error)
      // Revert on error
      setAvailableForSupport(!newAvailability)
    }
  }

  const filteredUsers = nearbyUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.interests?.some((interest: string) => interest.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const getMoodGradient = (mood: string) => {
    const gradients: Record<string, string> = {
      Happy: "from-green-400 to-green-600",
      Calm: "from-blue-400 to-blue-600",
      Anxious: "from-orange-400 to-orange-600",
      Stressed: "from-red-400 to-red-600",
      Lonely: "from-purple-400 to-purple-600",
      Excited: "from-pink-400 to-pink-600",
      Peaceful: "from-teal-400 to-teal-600",
      Supportive: "from-cyan-400 to-cyan-600",
    }
    return gradients[mood] || "from-gray-400 to-gray-600"
  }

  const formatTime = (timestamp: string | Date) => {
    if (!timestamp) return "now"

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="flex">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm shadow-lg"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}

        {/* Left Sidebar */}
        <div
          className={`${isMobile ? "fixed inset-y-0 left-0 z-40 transform transition-transform" : "relative"} ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"} w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 min-h-screen shadow-lg`}
        >
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-2 mb-4 md:mb-6">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <Heart className="h-3 w-3 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TalkNest
              </span>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 mb-4 md:mb-6">
              <div className="relative">
                <Avatar className="w-10 h-10 md:w-12 md:h-12 ring-2 ring-purple-200">
                  <AvatarImage
                    src={
                      currentUser.profilePicture ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.firstName || "/placeholder.svg"}`
                    }
                  />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                    {currentUser.firstName?.[0]}
                    {currentUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm md:text-base truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 flex items-center">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{currentLocation ? "Current Location" : "Location Unknown"}</span>
                </p>
              </div>
            </div>

            {/* Current Mood & Subscription Status */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200/50 mb-4 md:mb-6 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">CURRENT MOOD</span>
                  <div className="flex items-center space-x-2">
                    {subscriptionStatus !== "free" && (
                      <Badge
                        className={`${subscriptionStatus === "premium" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-yellow-500 to-orange-500"} text-white text-xs`}
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        {subscriptionStatus === "premium" ? "Premium" : "Pro"}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" className="text-purple-600 p-0 h-auto hover:bg-purple-100">
                      <Edit className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <div
                    className={`w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r ${getMoodGradient(currentUser.currentMood || "Happy")} rounded-full shadow-sm`}
                  ></div>
                  <span className="font-semibold text-gray-800 text-sm md:text-base">
                    {currentUser.currentMood || "Happy"}
                  </span>
                </div>

                {/* Message Usage for Free Users */}
                {subscriptionStatus === "free" && (
                  <div className="mb-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orange-700">Messages Used</span>
                      <span className="font-semibold text-orange-800">
                        {dailyMessageCount}/{monthlyMessageLimit}
                      </span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-orange-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(dailyMessageCount / monthlyMessageLimit) * 100}%` }}
                      ></div>
                    </div>
                    {dailyMessageCount >= monthlyMessageLimit && (
                      <Button
                        size="sm"
                        className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-7 text-xs"
                        onClick={() => router.push("/pricing")}
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Upgrade for Unlimited
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-purple-600">
                    <Bell className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-xs md:text-sm font-medium">
                      {availableForSupport ? "Available" : "Not Available"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAvailability}
                    className={`p-1 h-auto transition-colors ${availableForSupport ? "text-green-600 hover:bg-green-100" : "text-gray-400 hover:bg-gray-100"}`}
                  >
                    <Zap className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <nav className="p-4 md:p-6">
            <ul className="space-y-2">
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200/50 h-10 md:h-auto text-sm md:text-base"
                  onClick={() => {
                    router.push("/dashboard")
                    if (isMobile) setSidebarOpen(false)
                  }}
                >
                  <Search className="h-4 w-4 mr-3" />
                  Discover
                  <Sparkles className="h-3 w-3 ml-auto" />
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100 h-10 md:h-auto text-sm md:text-base"
                  onClick={() => {
                    router.push("/profile")
                    if (isMobile) setSidebarOpen(false)
                  }}
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100 h-10 md:h-auto text-sm md:text-base"
                  onClick={() => {
                    router.push("/messages")
                    if (isMobile) setSidebarOpen(false)
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-3" />
                  Messages
                  {activeConversations.some((conv) => conv.unreadCount > 0) && (
                    <div className="ml-auto w-2 h-2 bg-red-500 rounded-full shadow-sm animate-pulse"></div>
                  )}
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100 h-10 md:h-auto text-sm md:text-base"
                  onClick={() => {
                    router.push("/meetups")
                    if (isMobile) setSidebarOpen(false)
                  }}
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  Meetups
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100 h-10 md:h-auto text-sm md:text-base"
                  onClick={() => {
                    router.push("/safety")
                    if (isMobile) setSidebarOpen(false)
                  }}
                >
                  <Shield className="h-4 w-4 mr-3" />
                  Safety Center
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100 h-10 md:h-auto text-sm md:text-base"
                  onClick={() => {
                    router.push("/settings")
                    if (isMobile) setSidebarOpen(false)
                  }}
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </Button>
              </li>
              {subscriptionStatus === "professional" && (
                <li>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100 h-10 md:h-auto text-sm md:text-base"
                    onClick={() => {
                      router.push("/revenue-dashboard")
                      if (isMobile) setSidebarOpen(false)
                    }}
                  >
                    <TrendingUp className="h-4 w-4 mr-3" />
                    Revenue Dashboard
                  </Button>
                </li>
              )}
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100 h-10 md:h-auto text-sm md:text-base"
                  onClick={() => {
                    router.push("/pricing")
                    if (isMobile) setSidebarOpen(false)
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  {subscriptionStatus === "free" ? "Upgrade Plan" : "Manage Subscription"}
                </Button>
              </li>
              <li className="pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-10 md:h-auto text-sm md:text-base"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Log Out
                </Button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`${isMobile ? "ml-12" : ""} flex-1 min-w-0`}>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate">
                  Discover Nearby Support
                </h1>
                <div className="flex items-center text-gray-500 mt-1 md:mt-2 text-xs md:text-sm">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Real-time location • 5km radius</span>
                  <Badge className="ml-2 md:ml-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300 text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {totalNearby}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="hover:bg-purple-100 p-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/messages")}
                  className="hover:bg-purple-100 p-2"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/map")}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 p-2"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6">
            {/* Search Bar */}
            <div className="mb-4 md:mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, interests, or mood..."
                  className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-purple-300 focus:ring-purple-200 h-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Mood Filters */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-800">Filter by Mood</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-purple-600 hover:bg-purple-100 h-8 text-sm"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "Hide" : "Show"}
                </Button>
              </div>

              <div
                className={`flex items-center space-x-2 md:space-x-3 overflow-x-auto pb-2 ${showFilters ? "" : "max-h-16 overflow-hidden"}`}
              >
                <Button
                  className={`rounded-full px-4 md:px-6 whitespace-nowrap shadow-sm transition-all text-sm h-9 ${selectedMood === "All Moods" ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                  onClick={() => handleMoodFilter("All Moods")}
                >
                  All Moods
                </Button>
                {["Happy", "Calm", "Anxious", "Stressed", "Lonely", "Excited", "Peaceful", "Supportive"].map((mood) => {
                  const moodColors: Record<string, string> = {
                    Happy: "border-green-300 text-green-700 hover:bg-green-50",
                    Calm: "border-blue-300 text-blue-700 hover:bg-blue-50",
                    Anxious: "border-orange-300 text-orange-700 hover:bg-orange-50",
                    Stressed: "border-red-300 text-red-700 hover:bg-red-50",
                    Lonely: "border-purple-300 text-purple-700 hover:bg-purple-50",
                    Excited: "border-pink-300 text-pink-700 hover:bg-pink-50",
                    Peaceful: "border-teal-300 text-teal-700 hover:bg-teal-50",
                    Supportive: "border-cyan-300 text-cyan-700 hover:bg-cyan-50",
                  }

                  const dotColors: Record<string, string> = {
                    Happy: "from-green-400 to-green-500",
                    Calm: "from-blue-400 to-blue-500",
                    Anxious: "from-orange-400 to-orange-500",
                    Stressed: "from-red-400 to-red-500",
                    Lonely: "from-purple-400 to-purple-500",
                    Excited: "from-pink-400 to-pink-500",
                    Peaceful: "from-teal-400 to-teal-500",
                    Supportive: "from-cyan-400 to-cyan-500",
                  }

                  return (
                    <Button
                      key={mood}
                      variant="outline"
                      className={`rounded-full px-3 md:px-4 py-2 whitespace-nowrap shadow-sm transition-all text-sm h-9 ${selectedMood === mood ? `bg-gradient-to-r ${getMoodGradient(mood)} text-white shadow-lg border-transparent` : moodColors[mood]}`}
                      onClick={() => handleMoodFilter(mood)}
                    >
                      <div className={`w-2 h-2 bg-gradient-to-r ${dotColors[mood]} rounded-full mr-2 shadow-sm`}></div>
                      {mood}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Finding nearby users...</p>
              </div>
            )}

            {/* Nearby Users Grid */}
            {!loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
                {filteredUsers.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-6">
                      <Users className="h-10 w-10 md:h-12 md:w-12 text-purple-600" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-600 mb-3">
                      {selectedMood === "All Moods"
                        ? "No users found"
                        : `No ${selectedMood.toLowerCase()} users nearby`}
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm md:text-base px-4">
                      {selectedMood === "All Moods"
                        ? "Try refreshing or check back later for new users in your area"
                        : `Try selecting "All Moods" or a different mood filter to see more users`}
                    </p>
                    <Button
                      onClick={handleRefresh}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg h-12 px-6"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                ) : (
                  filteredUsers.map((user, index) => (
                    <Card
                      key={user.id}
                      className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start space-x-3 md:space-x-4">
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-12 h-12 md:w-14 md:h-14 ring-2 ring-purple-200 shadow-sm">
                              <AvatarImage
                                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
                              />
                              <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm">
                                {user.firstName?.[0]}
                                {user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-gradient-to-r ${getMoodGradient(user.currentMood)} border-2 border-white rounded-full shadow-sm`}
                            ></div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-800 text-base md:text-lg truncate">{user.name}</h3>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                {user.verificationStatus === "verified" && (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs border-blue-300">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                                <div className="flex items-center text-yellow-500">
                                  <Star className="h-3 w-3 fill-current" />
                                  <span className="text-xs ml-1">{user.helpfulRating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mb-3 flex-wrap gap-1">
                              <Badge
                                className={`bg-gradient-to-r ${getMoodGradient(user.currentMood)} text-white shadow-sm text-xs`}
                              >
                                {user.currentMood}
                              </Badge>
                              <span className="text-xs md:text-sm text-gray-500 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {user.distance}
                              </span>
                              {user.isAvailableForSupport && (
                                <Badge className="bg-green-100 text-green-700 text-xs border-green-300">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Available
                                </Badge>
                              )}
                              <span className="text-xs text-gray-400 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Active now
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">{user.message}</p>
                            <div className="flex space-x-2 md:space-x-3">
                              <Button
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-4 md:px-6 shadow-lg transition-all hover:shadow-xl h-9 md:h-10 text-sm"
                                onClick={() => handleStartChat(user.id)}
                                disabled={subscriptionStatus === "free" && dailyMessageCount >= monthlyMessageLimit}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                {subscriptionStatus === "free" && dailyMessageCount >= monthlyMessageLimit ? (
                                  <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Upgrade to Chat
                                  </>
                                ) : (
                                  "Chat"
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                className="rounded-full px-4 md:px-6 border-purple-300 text-purple-700 hover:bg-purple-50 shadow-sm h-9 md:h-10 text-sm"
                                onClick={() => handleScheduleMeetup(user.id)}
                              >
                                <Coffee className="h-4 w-4 mr-2" />
                                Meet
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Active Conversations */}
            {activeConversations.length > 0 && (
              <div className="mb-8 md:mb-12">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Active Conversations</h2>
                  <Button
                    variant="ghost"
                    className="text-purple-600 hover:bg-purple-100 h-8 text-sm"
                    onClick={() => router.push("/messages")}
                  >
                    View All
                  </Button>
                </div>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-3 md:space-y-4">
                      {activeConversations.slice(0, 3).map((conversation) => (
                        <div
                          key={conversation.id}
                          className="flex items-center space-x-3 md:space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleStartChat(conversation.user.id)}
                        >
                          <Avatar className="w-10 h-10 md:w-12 md:h-12 ring-2 ring-purple-200 flex-shrink-0">
                            <AvatarImage src={conversation.user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                              {conversation.user.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate">
                              {conversation.user.name}
                            </h4>
                            <p className="text-xs md:text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs text-gray-400">{formatTime(conversation.timestamp)}</span>
                            {conversation.unreadCount > 0 && (
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-1 ml-auto animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Live Location Tracker */}
            <div>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Live Location</h2>
                <Button
                  variant="ghost"
                  className="text-purple-600 hover:bg-purple-100 h-8 text-sm"
                  onClick={() => router.push("/map")}
                >
                  View Full Map
                </Button>
              </div>
              <LiveLocationTracker
                showNearbyCount={true}
                onLocationUpdate={(location) => {
                  setCurrentLocation(location)
                  updateUserLocation(location)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}