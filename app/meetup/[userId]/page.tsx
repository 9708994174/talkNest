"use client"

export const dynamic = "force-dynamic"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  MapPin,
  Coffee,
  TreePine,
  Building,
  Star,
  Calendar,
  MessageCircle,
  Shield,
  CheckCircle,
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export default function MeetupPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [meetupUser, setMeetupUser] = useState<any>(null)
  const [selectedPlace, setSelectedPlace] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Suggested places (these can be static for now)
  const suggestedPlaces = [
    {
      id: 1,
      name: "Starbucks Coffee",
      type: "Cafe",
      address: "123 Main St, San Francisco, CA",
      distance: "0.2 km",
      rating: 4.5,
      icon: <Coffee className="h-4 w-4" />,
      safetyFeatures: ["Well-lit", "Public space", "Security cameras"],
    },
    {
      id: 2,
      name: "Central Park",
      type: "Park",
      address: "456 Park Ave, San Francisco, CA",
      distance: "0.4 km",
      rating: 4.8,
      icon: <TreePine className="h-4 w-4" />,
      safetyFeatures: ["Open area", "Regular patrols", "Emergency phones"],
    },
    {
      id: 3,
      name: "City Library",
      type: "Public Space",
      address: "789 Library St, San Francisco, CA",
      distance: "0.6 km",
      rating: 4.3,
      icon: <Building className="h-4 w-4" />,
      safetyFeatures: ["Security staff", "Public space", "Well-monitored"],
    },
  ]

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
  ]

  useEffect(() => {
    initializePage()
  }, [router, userId])

  const initializePage = async () => {
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

      // Fetch the meetup user data
      await fetchMeetupUser(userId)
    } catch (error) {
      console.error("Error initializing page:", error)
      router.push("/auth")
    }
  }

  const fetchMeetupUser = async (targetUserId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${targetUserId}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setMeetupUser(data.user)
        } else {
          console.error("User not found")
          router.push("/dashboard")
        }
      } else {
        console.error("Failed to fetch user")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching meetup user:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitMeetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlace || !selectedDate || !selectedTime) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/meetups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: currentUser.id,
          toUserId: userId,
          placeId: selectedPlace,
          date: selectedDate,
          time: selectedTime,
          message: message,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert(`Meetup request sent successfully! ${meetupUser.firstName} will be notified.`)
          router.push("/dashboard")
        } else {
          alert(data.error || "Failed to send meetup request")
        }
      } else {
        alert("Failed to send meetup request")
      }
    } catch (error) {
      console.error("Error submitting meetup:", error)
      alert("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading meetup details...</p>
        </div>
      </div>
    )
  }

  if (!currentUser || !meetupUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found</p>
          <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
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
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">Schedule Meetup</h1>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/chat/${userId}`)}
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Continue Chat
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - User Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Meetup Partner Card */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={meetupUser.avatar || meetupUser.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback className="bg-purple-500 text-white text-xl">
                    {meetupUser.firstName?.[0]}
                    {meetupUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {meetupUser.firstName} {meetupUser.lastName}
                </CardTitle>
                <Badge className="bg-green-100 text-green-700">{meetupUser.currentMood}</Badge>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="flex justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Nearby
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    {meetupUser.helpfulRating || 5.0}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{meetupUser.bio || meetupUser.currentMessage}</p>
              </CardContent>
            </Card>

            {/* Safety Guidelines */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Safety Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Meet in Public</p>
                    <p className="text-xs text-gray-500">Always choose well-lit, populated areas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Tell Someone</p>
                    <p className="text-xs text-gray-500">Inform a friend about your meetup plans</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Trust Your Instincts</p>
                    <p className="text-xs text-gray-500">Leave if you feel uncomfortable</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Meetup Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Calendar className="h-6 w-6 mr-2 text-purple-600" />
                  Plan Your Meetup
                </CardTitle>
                <p className="text-gray-600">Choose a safe, public place and time to meet {meetupUser.firstName}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitMeetup} className="space-y-6">
                  {/* Suggested Places */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Choose a Meeting Place</Label>
                    <div className="grid gap-4">
                      {suggestedPlaces.map((place) => (
                        <Card
                          key={place.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedPlace === place.id.toString()
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                          onClick={() => setSelectedPlace(place.id.toString())}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="text-purple-600">{place.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-gray-800">{place.name}</h3>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                    {place.rating}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{place.address}</p>
                                <div className="flex items-center justify-between">
                                  <Badge variant="secondary" className="text-xs">
                                    {place.type} • {place.distance}
                                  </Badge>
                                  <div className="flex items-center space-x-1">
                                    {place.safetyFeatures.slice(0, 2).map((feature, index) => (
                                      <Badge key={index} className="bg-green-100 text-green-700 text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-lg font-semibold">
                      Select Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Select Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="Choose a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Optional Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-lg font-semibold">
                      Message (Optional)
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Add a personal message to your meetup request..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-4 pt-6">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending Request..." : "Send Meetup Request"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/chat/${userId}`)}
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 py-3 px-6"
                    >
                      Chat First
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
