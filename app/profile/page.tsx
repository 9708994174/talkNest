"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SubscriptionManager } from "@/components/subscription-manager"
import { ArrowLeft, Heart, Edit, Save, MapPin, Mail, Calendar, Shield, Crown, Star, Camera, X } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [formData, setFormData] = useState<{
    firstName: string
    lastName: string
    email: string
    phone: string
    bio: string
    interests: any[]
    currentMood: string
    location: string | { lat: number; lng: number }
  }>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    interests: [],
    currentMood: "",
    location: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("talknest_token")
    const user = localStorage.getItem("talknest_user") // Fixed key

    if (!token || !user) {
      console.error("Missing token or user data, redirecting to /auth")
      router.push("/auth")
      return
    }

    try {
      const userData = JSON.parse(user)
      console.log("Parsed user data:", userData) // Debug log
      setCurrentUser(userData)
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        interests: userData.interests || [],
        currentMood: userData.currentMood || "",
        location: userData.location
          ? `${userData.location.lat}, ${userData.location.lng}`
          : "",
      })
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/auth")
    }
  }, [router])

  const handleSave = async () => {
    setLoading(true)
    try {
      let locationData = formData.location
      if (formData.location && typeof formData.location === "string") {
        const [lat, lng] = formData.location.split(",").map((v) => parseFloat(v.trim()))
        locationData = { lat, lng }
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("talknest_token")}`,
        },
        body: JSON.stringify({
          userId: currentUser.id,
          ...formData,
          location: locationData,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        console.log("Updated user:", updatedUser) // Debug log
        setCurrentUser(updatedUser.user)
        localStorage.setItem("talknest_user", JSON.stringify(updatedUser.user)) // Fixed key
        setIsEditing(false)
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-lg font-medium mt-4">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Sticky Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                console.log("Navigating to /dashboard") // Debug log
                router.push("/dashboard")
              }}
              className="text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-600">My Profile</span>
            </div>
          </div>
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {loading ? (
              "Saving..."
            ) : isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 flex-1">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="border-0 shadow-md bg-white rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-2 ring-blue-100">
                    <AvatarImage
                      src={
                        currentUser.profilePicture ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.firstName || "/placeholder.svg"}`
                      }
                    />
                    <AvatarFallback className="bg-blue-500 text-white text-xl">
                      {currentUser.firstName?.[0]}
                      {currentUser.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700"
                    >
                      <Camera className="h-4 w-4 text-white" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-xl font-bold text-gray-800">
                      {currentUser.firstName} {currentUser.lastName}
                    </h1>
                    {currentUser.subscription !== "free" && (
                      <Badge
                        className={`${
                          currentUser.subscription === "premium" ? "bg-blue-600" : "bg-yellow-500"
                        } text-white text-xs`}
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        {currentUser.subscription === "premium" ? "Premium" : "Professional"}
                      </Badge>
                    )}
                    {currentUser.verificationStatus === "verified" && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 mb-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      <span className="text-sm">{currentUser.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">Joined {new Date(currentUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{currentUser.helpfulRating || "5.0"} rating</span>
                    <span className="text-sm text-gray-500">• {currentUser.totalSessions || 0} sessions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="border-0 shadow-md bg-white rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="rounded-lg"
                    />
                  ) : (
                    <p className="mt-1 text-gray-800">{currentUser.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="rounded-lg"
                    />
                  ) : (
                    <p className="mt-1 text-gray-800">{currentUser.lastName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="rounded-lg"
                    />
                  ) : (
                    <p className="mt-1 text-gray-800">{currentUser.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="rounded-lg"
                    />
                  ) : (
                    <p className="mt-1 text-gray-800">{currentUser.phone || "Not provided"}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                    className="rounded-lg"
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{currentUser.bio || "No bio provided"}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mood & Preferences */}
          <Card className="border-0 shadow-md bg-white rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">Mood & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentMood">Current Mood</Label>
                  {isEditing ? (
                    <select
                      id="currentMood"
                      value={formData.currentMood}
                      onChange={(e) => handleInputChange("currentMood", e.target.value)}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select mood</option>
                      {["Happy", "Calm", "Anxious", "Stressed", "Lonely", "Excited", "Peaceful", "Supportive"].map(
                        (mood) => (
                          <option key={mood} value={mood}>
                            {mood}
                          </option>
                        ),
                      )}
                    </select>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-800">{currentUser.currentMood || "Not set"}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={
                        typeof formData.location === "string"
                          ? formData.location
                          : formData.location
                          ? `${formData.location.lat}, ${formData.location.lng}`
                          : ""
                      }
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="Latitude, Longitude (e.g., 37.7749, -122.4194)"
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-800">
                        {currentUser.location
                          ? `Lat: ${currentUser.location.lat}, Lng: ${currentUser.location.lng}`
                          : "Not provided"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Button */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            onClick={() => setShowSubscriptionModal(true)}
          >
            <Crown className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>
        </div>
      </main>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
          <Card className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Manage Subscription</h2>
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:bg-blue-50"
                  onClick={() => setShowSubscriptionModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SubscriptionManager
                userId={currentUser.id}
                currentPlan={currentUser.subscription || "free"}
                onPlanChange={(newPlan) => {
                  setCurrentUser((prev: any) => ({ ...prev, subscription: newPlan }))
                  setShowSubscriptionModal(false)
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
