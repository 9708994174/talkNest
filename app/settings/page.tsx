"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Settings, User, Bell, Shield, MapPin, Trash2, Save, Camera } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    bio: "",
    mood: "",
    interests: [] as string[],
    profilePicture: "",
  })
  const [notifications, setNotifications] = useState({
    newMessages: true,
    meetupRequests: true,
    nearbyUsers: false,
    safetyAlerts: true,
    emailUpdates: false,
    pushNotifications: true,
  })
  const [privacy, setPrivacy] = useState({
    showOnlineStatus: true,
    allowLocationSharing: true,
    profileVisibility: "public",
    messageRequests: "everyone",
    meetupRequests: "verified",
  })
  const [location, setLocation] = useState({
    enabled: true,
    radius: "2",
    autoUpdate: true,
  })

  const moods = [
    "Anxious",
    "Depressed",
    "Lonely",
    "Stressed",
    "Overwhelmed",
    "Grieving",
    "Confused",
    "Hopeful",
    "Seeking Support",
    "Want to Help Others",
    "Happy",
    "Calm",
    "Excited",
    "Grateful",
    "Peaceful",
  ]

  const interests = [
    "Mental Health",
    "Anxiety Support",
    "Depression Support",
    "Stress Management",
    "Mindfulness",
    "Meditation",
    "Exercise",
    "Reading",
    "Music",
    "Art",
    "Cooking",
    "Travel",
    "Nature",
    "Photography",
    "Writing",
    "Gaming",
  ]

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("talknest_token")
    const user = localStorage.getItem("talknest_user")

    if (!token || !user) {
      router.push("/auth")
      return
    }

    const userData = JSON.parse(user)
    setCurrentUser(userData)

    // Load user profile data
    setProfileData({
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      age: userData.age || "",
      bio: userData.bio || "",
      mood: userData.mood || "",
      interests: userData.interests || [],
      profilePicture: userData.profilePicture || "",
    })
  }, [router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate API call
    console.log("Updating profile:", profileData)

    // Update localStorage
    const updatedUser = { ...currentUser, ...profileData }
    localStorage.setItem("talknest_user", JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)

    alert("Profile updated successfully!")
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }))
  }

  const handleLocationChange = (key: string, value: string | boolean) => {
    setLocation((prev) => ({ ...prev, [key]: value }))
  }

  const handleInterestToggle = (interest: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Simulate account deletion
      localStorage.removeItem("talknest_token")
      localStorage.removeItem("talknest_user")
      alert("Account deleted successfully")
      router.push("/")
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-purple-600 hover:text-purple-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-purple-600" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profileData.profilePicture || "/placeholder.svg"} />
                      <AvatarFallback className="bg-purple-500 text-white text-xl">
                        {profileData.firstName?.[0]}
                        {profileData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" className="mb-2">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                      <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</p>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileData.age}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, age: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mood">Current Mood</Label>
                    <Select
                      value={profileData.mood}
                      onValueChange={(value) => setProfileData((prev) => ({ ...prev, mood: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current mood" />
                      </SelectTrigger>
                      <SelectContent>
                        {moods.map((mood) => (
                          <SelectItem key={mood} value={mood}>
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell others about yourself..."
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>

                  {/* Interests */}
                  <div className="space-y-2">
                    <Label>Interests</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {interests.map((interest) => (
                        <div
                          key={interest}
                          className={`p-2 text-sm rounded-lg cursor-pointer transition-colors ${
                            profileData.interests.includes(interest)
                              ? "bg-purple-100 text-purple-700 border border-purple-300"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => handleInterestToggle(interest)}
                        >
                          {interest}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-purple-600" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">New Messages</h3>
                    <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                  </div>
                  <Switch
                    checked={notifications.newMessages}
                    onCheckedChange={(checked) => handleNotificationChange("newMessages", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Meetup Requests</h3>
                    <p className="text-sm text-gray-500">Get notified when someone wants to meet up</p>
                  </div>
                  <Switch
                    checked={notifications.meetupRequests}
                    onCheckedChange={(checked) => handleNotificationChange("meetupRequests", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Nearby Users</h3>
                    <p className="text-sm text-gray-500">Get notified when compatible users are nearby</p>
                  </div>
                  <Switch
                    checked={notifications.nearbyUsers}
                    onCheckedChange={(checked) => handleNotificationChange("nearbyUsers", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Safety Alerts</h3>
                    <p className="text-sm text-gray-500">Important safety and security notifications</p>
                  </div>
                  <Switch
                    checked={notifications.safetyAlerts}
                    onCheckedChange={(checked) => handleNotificationChange("safetyAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Email Updates</h3>
                    <p className="text-sm text-gray-500">Receive weekly summaries and updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailUpdates}
                    onCheckedChange={(checked) => handleNotificationChange("emailUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Enable push notifications on your device</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>Privacy Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Show Online Status</h3>
                    <p className="text-sm text-gray-500">Let others see when you're online</p>
                  </div>
                  <Switch
                    checked={privacy.showOnlineStatus}
                    onCheckedChange={(checked) => handlePrivacyChange("showOnlineStatus", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Location Sharing</h3>
                    <p className="text-sm text-gray-500">Allow the app to use your location for nearby matches</p>
                  </div>
                  <Switch
                    checked={privacy.allowLocationSharing}
                    onCheckedChange={(checked) => handlePrivacyChange("allowLocationSharing", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                      <SelectItem value="verified">Verified Users Only</SelectItem>
                      <SelectItem value="private">Private - Only matched users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message Requests</Label>
                  <Select
                    value={privacy.messageRequests}
                    onValueChange={(value) => handlePrivacyChange("messageRequests", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="verified">Verified Users Only</SelectItem>
                      <SelectItem value="matched">Matched Users Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Meetup Requests</Label>
                  <Select
                    value={privacy.meetupRequests}
                    onValueChange={(value) => handlePrivacyChange("meetupRequests", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="verified">Verified Users Only</SelectItem>
                      <SelectItem value="chatted">Users I've Chatted With</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <span>Location Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Enable Location Services</h3>
                    <p className="text-sm text-gray-500">Required to find nearby users and suggest meetup places</p>
                  </div>
                  <Switch
                    checked={location.enabled}
                    onCheckedChange={(checked) => handleLocationChange("enabled", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Search Radius</Label>
                  <Select value={location.radius} onValueChange={(value) => handleLocationChange("radius", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 km</SelectItem>
                      <SelectItem value="2">2 km</SelectItem>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">How far to search for nearby users</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Auto-Update Location</h3>
                    <p className="text-sm text-gray-500">Automatically update your location when you move</p>
                  </div>
                  <Switch
                    checked={location.autoUpdate}
                    onCheckedChange={(checked) => handleLocationChange("autoUpdate", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <span>Account Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Account Verification</h3>
                  <p className="text-sm text-blue-600 mb-3">Verify your account to increase trust and safety</p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Verify Account</Button>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Data Export</h3>
                  <p className="text-sm text-green-600 mb-3">Download a copy of your data</p>
                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-100">
                    Export Data
                  </Button>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">Deactivate Account</h3>
                  <p className="text-sm text-yellow-600 mb-3">Temporarily disable your account</p>
                  <Button variant="outline" className="border-yellow-200 text-yellow-700 hover:bg-yellow-100">
                    Deactivate
                  </Button>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-medium text-red-800 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-600 mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
