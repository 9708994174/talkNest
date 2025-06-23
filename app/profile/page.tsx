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
import { ArrowLeft, Heart, Edit, Save, MapPin, Mail, Calendar, Shield, Crown, Star, Camera } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
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
    const user = localStorage.getItem("talknest_user")

    if (!token || !user) {
      router.push("/auth")
      return
    }

    try {
      const userData = JSON.parse(user)
      setCurrentUser(userData)
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        interests: userData.interests || [],
        currentMood: userData.currentMood || "",
        location: userData.location || "",
      })
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/auth")
    }
  }, [router])

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("talknest_token")}`,
        },
        body: JSON.stringify({
          userId: currentUser.id,
          ...formData,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setCurrentUser(updatedUser.user)
        localStorage.setItem("talknest_user", JSON.stringify(updatedUser.user))
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 md:p-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
                My Profile
              </span>
            </div>
          </div>
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Profile Header */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-purple-200 shadow-lg">
                  <AvatarImage
                    src={
                      currentUser.profilePicture ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.firstName || "/placeholder.svg"}`
                    }
                  />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                    {currentUser.firstName?.[0]}
                    {currentUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-purple-600 hover:bg-purple-700"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {currentUser.firstName} {currentUser.lastName}
                  </h1>
                  {currentUser.subscription !== "free" && (
                    <Badge
                      className={`${currentUser.subscription === "premium" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-yellow-500 to-orange-500"} text-white`}
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      {currentUser.subscription === "premium" ? "Premium" : "Professional"}
                    </Badge>
                  )}
                  {currentUser.verificationStatus === "verified" && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    <span className="text-sm">{currentUser.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">Joined {new Date(currentUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{currentUser.helpfulRating || "5.0"} rating</span>
                  <span className="text-sm text-gray-500">• {currentUser.totalSessions || 0} sessions</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
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
                    />
                  ) : (
                    <p className="mt-1 text-gray-800">{currentUser.lastName}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
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
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{currentUser.phone || "Not provided"}</p>
                )}
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{currentUser.bio || "No bio provided"}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <SubscriptionManager
            userId={currentUser.id}
            currentPlan={currentUser.subscription || "free"}
            onPlanChange={(newPlan) => {
              setCurrentUser((prev: any) => ({ ...prev, subscription: newPlan }))
            }}
          />
        </div>

        {/* Current Mood & Preferences */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Mood & Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentMood">Current Mood</Label>
                {isEditing ? (
                  <select
                    id="currentMood"
                    value={formData.currentMood}
                    onChange={(e) => handleInputChange("currentMood", e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
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
                  <div className="mt-1 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                    <span className="text-gray-800">{currentUser.currentMood || "Not set"}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, State"
                  />
                ) : (
                  <div className="mt-1 flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-800">{currentUser.location || "Not provided"}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
