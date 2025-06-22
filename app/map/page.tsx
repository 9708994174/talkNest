"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Users, Navigation, Zap, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { NearbyUsersMap } from "@/components/maps/nearby-users-map"
import { MeetupLocationPicker } from "@/components/maps/meetup-location-picker"
import type { NearbyPlace } from "@/lib/maps"

export default function MapPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState<NearbyPlace | undefined>()
  const [isLiveTracking, setIsLiveTracking] = useState(false)
  const [filterMood, setFilterMood] = useState("all")

  // Mock nearby users with locations
  const mockNearbyUsers = [
    {
      id: 1,
      name: "Sarah Johnson",
      mood: "Happy",
      distance: 120,
      location: { lat: 37.7749, lng: -122.4194 },
      isOnline: true,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Michael Chen",
      mood: "Calm",
      distance: 80,
      location: { lat: 37.7849, lng: -122.4094 },
      isOnline: true,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Alex Taylor",
      mood: "Anxious",
      distance: 150,
      location: { lat: 37.7649, lng: -122.4294 },
      isOnline: true,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "Emma Wilson",
      mood: "Supportive",
      distance: 200,
      location: { lat: 37.7549, lng: -122.4394 },
      isOnline: true,
      avatar: "/placeholder.svg?height=40&width=40",
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
    setNearbyUsers(mockNearbyUsers)
  }, [router])

  const handleUserSelect = (user: any) => {
    router.push(`/chat/${user.id}`)
  }

  const handleLocationSelect = (place: NearbyPlace) => {
    setSelectedLocation(place)
  }

  const filteredUsers = nearbyUsers.filter(
    (user) => filterMood === "all" || user.mood.toLowerCase() === filterMood.toLowerCase(),
  )

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading map...</p>
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
                <MapPin className="h-6 w-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-800">Live Map</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-700">
                <Users className="h-3 w-3 mr-1" />
                {filteredUsers.length} nearby
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiveTracking(!isLiveTracking)}
                className={isLiveTracking ? "border-green-500 text-green-700" : ""}
              >
                <Zap className="h-4 w-4 mr-2" />
                {isLiveTracking ? "Live" : "Start Live"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="nearby" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="nearby" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Nearby Users</span>
            </TabsTrigger>
            <TabsTrigger value="places" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Meeting Places</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="space-y-6">
            {/* Filters */}
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Filter by mood:</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={filterMood === "all" ? "default" : "outline"}
                      onClick={() => setFilterMood("all")}
                      className={filterMood === "all" ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={filterMood === "happy" ? "default" : "outline"}
                      onClick={() => setFilterMood("happy")}
                      className={filterMood === "happy" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      Happy
                    </Button>
                    <Button
                      size="sm"
                      variant={filterMood === "calm" ? "default" : "outline"}
                      onClick={() => setFilterMood("calm")}
                      className={filterMood === "calm" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      Calm
                    </Button>
                    <Button
                      size="sm"
                      variant={filterMood === "anxious" ? "default" : "outline"}
                      onClick={() => setFilterMood("anxious")}
                      className={filterMood === "anxious" ? "bg-orange-600 hover:bg-orange-700" : ""}
                    >
                      Anxious
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <NearbyUsersMap users={filteredUsers} onUserSelect={handleUserSelect} showLiveTracking={isLiveTracking} />

            {/* Live Tracking Info */}
            {isLiveTracking && (
              <Card className="border-0 shadow-lg bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="font-medium text-green-800">Live Tracking Active</h3>
                      <p className="text-sm text-green-600">
                        Your location is being updated in real-time to help you find nearby users
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="places" className="space-y-6">
            <MeetupLocationPicker onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />

            {selectedLocation && (
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle>Selected Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{selectedLocation.name}</h3>
                      <p className="text-gray-600">{selectedLocation.address}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => router.push(`/meetup/schedule?place=${selectedLocation.id}`)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Schedule Meetup Here
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `https://maps.google.com/maps?q=${selectedLocation.location.lat},${selectedLocation.location.lng}`,
                          )
                        }
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
