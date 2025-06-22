"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Star,
  Heart,
  MessageCircle,
  Coffee,
  Shield,
  Edit,
  Camera,
  Award,
  TrendingUp,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Mock profile data
  const profileStats = {
    totalChats: 47,
    meetupsCompleted: 12,
    helpfulRating: 4.8,
    joinedDate: "March 2024",
    verificationStatus: "verified",
  }

  const recentActivity = [
    {
      type: "meetup",
      description: "Had a supportive coffee chat with Sarah",
      date: "2 days ago",
      rating: 5,
    },
    {
      type: "chat",
      description: "Provided emotional support to Alex",
      date: "1 week ago",
      rating: 4.5,
    },
    {
      type: "meetup",
      description: "Park walk with Michael for stress relief",
      date: "2 weeks ago",
      rating: 5,
    },
  ]

  const achievements = [
    {
      title: "Good Listener",
      description: "Completed 10+ supportive conversations",
      icon: <MessageCircle className="h-6 w-6 text-blue-600" />,
      earned: true,
    },
    {
      title: "Meetup Master",
      description: "Successfully completed 10+ meetups",
      icon: <Coffee className="h-6 w-6 text-green-600" />,
      earned: true,
    },
    {
      title: "Trusted Helper",
      description: "Maintained 4.5+ star rating",
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      earned: true,
    },
    {
      title: "Community Builder",
      description: "Helped 50+ community members",
      icon: <Heart className="h-6 w-6 text-red-600" />,
      earned: false,
    },
  ]

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("talknest_token")
    const user = localStorage.getItem("talknest_user")

    if (!token || !user) {
      router.push("/auth")
      return
    }

    setCurrentUser(JSON.parse(user))
  }, [router])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
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
              <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            </div>
            <Button onClick={() => router.push("/settings")} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="border-0 shadow-lg bg-white mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src="/placeholder.svg?height=128&width=128" />
                  <AvatarFallback className="bg-purple-500 text-white text-3xl">
                    {currentUser.firstName?.[0]}
                    {currentUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-purple-600 hover:bg-purple-700"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {currentUser.firstName} {currentUser.lastName}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start space-x-2 mt-2 md:mt-0">
                    <Badge className="bg-green-100 text-green-700">{currentUser.mood || "Seeking Support"}</Badge>
                    {profileStats.verificationStatus === "verified" && (
                      <Badge className="bg-blue-100 text-blue-700 flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>Verified</span>
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-4 text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {profileStats.joinedDate}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{profileStats.helpfulRating}/5.0</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 max-w-2xl">
                  {currentUser.bio ||
                    "Looking for emotional support and meaningful connections. I believe in the power of listening and being there for each other during difficult times."}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{profileStats.totalChats}</div>
                    <div className="text-sm text-gray-500">Conversations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profileStats.meetupsCompleted}</div>
                    <div className="text-sm text-gray-500">Meetups</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{profileStats.helpfulRating}</div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="interests" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Interests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No recent activity</h3>
                    <p className="text-gray-500">Start chatting or schedule a meetup to see your activity here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div
                          className={`p-2 rounded-full ${activity.type === "meetup" ? "bg-green-100" : "bg-blue-100"}`}
                        >
                          {activity.type === "meetup" ? (
                            <Coffee className="h-5 w-5 text-green-600" />
                          ) : (
                            <MessageCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800">{activity.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">{activity.date}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">{activity.rating}/5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-lg border-2 ${
                        achievement.earned ? "border-purple-200 bg-purple-50" : "border-gray-200 bg-gray-50 opacity-60"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-full ${achievement.earned ? "bg-white" : "bg-gray-200"}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold mb-2 ${achievement.earned ? "text-gray-800" : "text-gray-500"}`}
                          >
                            {achievement.title}
                          </h3>
                          <p className={`text-sm ${achievement.earned ? "text-gray-600" : "text-gray-400"}`}>
                            {achievement.description}
                          </p>
                          {achievement.earned && (
                            <Badge className="bg-green-100 text-green-700 mt-2">
                              <Award className="h-3 w-3 mr-1" />
                              Earned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interests" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle>Interests & Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(
                    currentUser.interests || [
                      "Mental Health",
                      "Anxiety Support",
                      "Stress Management",
                      "Mindfulness",
                      "Reading",
                      "Nature Walks",
                    ]
                  ).map((interest: string, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-purple-50 text-purple-700 rounded-lg text-center text-sm font-medium border border-purple-200"
                    >
                      {interest}
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Looking for support with:</h4>
                  <p className="text-sm text-blue-600">
                    Work stress, anxiety management, and building meaningful connections with others who understand.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
