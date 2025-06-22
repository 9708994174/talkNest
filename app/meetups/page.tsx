"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Coffee,
  TreePine,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

export default function MeetupsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [meetups, setMeetups] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Mock meetups data
  const mockMeetups = [
    {
      id: 1,
      type: "incoming",
      user: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        mood: "Happy",
        rating: 4.8,
      },
      place: {
        name: "Starbucks Coffee",
        address: "123 Main St, San Francisco, CA",
        type: "Cafe",
        icon: <Coffee className="h-4 w-4" />,
      },
      date: "2024-06-22",
      time: "3:00 PM",
      status: "pending",
      message: "Hi! Would love to meet up and chat over coffee. I think we could really support each other.",
      createdAt: "2 hours ago",
      safetyChecked: true,
    },
    {
      id: 2,
      type: "outgoing",
      user: {
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        mood: "Calm",
        rating: 4.6,
      },
      place: {
        name: "Central Park",
        address: "456 Park Ave, San Francisco, CA",
        type: "Park",
        icon: <TreePine className="h-4 w-4" />,
      },
      date: "2024-06-23",
      time: "11:00 AM",
      status: "confirmed",
      message: "Looking forward to our walk in the park. Fresh air always helps with stress!",
      createdAt: "1 day ago",
      safetyChecked: true,
    },
    {
      id: 3,
      type: "incoming",
      user: {
        name: "Alex Taylor",
        avatar: "/placeholder.svg?height=40&width=40",
        mood: "Anxious",
        rating: 4.5,
      },
      place: {
        name: "City Library",
        address: "789 Library St, San Francisco, CA",
        type: "Library",
        icon: <Building className="h-4 w-4" />,
      },
      date: "2024-06-24",
      time: "2:00 PM",
      status: "declined",
      message: "Would like to meet in a quiet place to talk about anxiety management techniques.",
      createdAt: "3 days ago",
      safetyChecked: false,
    },
    {
      id: 4,
      type: "outgoing",
      user: {
        name: "Emma Wilson",
        avatar: "/placeholder.svg?height=40&width=40",
        mood: "Supportive",
        rating: 4.9,
      },
      place: {
        name: "Peaceful Cafe",
        address: "321 Quiet St, San Francisco, CA",
        type: "Cafe",
        icon: <Coffee className="h-4 w-4" />,
      },
      date: "2024-06-25",
      time: "4:30 PM",
      status: "completed",
      message: "Thank you for being such a good listener. This meetup really helped!",
      createdAt: "1 week ago",
      safetyChecked: true,
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
    setMeetups(mockMeetups)
  }, [router])

  const handleAcceptMeetup = async (meetupId: number) => {
    setMeetups((prev) => prev.map((meetup) => (meetup.id === meetupId ? { ...meetup, status: "confirmed" } : meetup)))
  }

  const handleDeclineMeetup = async (meetupId: number) => {
    setMeetups((prev) => prev.map((meetup) => (meetup.id === meetupId ? { ...meetup, status: "declined" } : meetup)))
  }

  const handleCompleteMeetup = async (meetupId: number) => {
    setMeetups((prev) => prev.map((meetup) => (meetup.id === meetupId ? { ...meetup, status: "completed" } : meetup)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "confirmed":
        return "bg-green-100 text-green-700"
      case "declined":
        return "bg-red-100 text-red-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "declined":
        return <XCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredMeetups = meetups.filter((meetup) => {
    const matchesSearch =
      meetup.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meetup.place.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || meetup.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const pendingMeetups = filteredMeetups.filter((m) => m.status === "pending")
  const upcomingMeetups = filteredMeetups.filter((m) => m.status === "confirmed")
  const pastMeetups = filteredMeetups.filter((m) => m.status === "completed" || m.status === "declined")

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading meetups...</p>
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
              <h1 className="text-2xl font-bold text-gray-800">Meetups</h1>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule New
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search meetups by person or place..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              className={filterStatus === "all" ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              All
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              className={filterStatus === "pending" ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === "confirmed" ? "default" : "outline"}
              onClick={() => setFilterStatus("confirmed")}
              className={filterStatus === "confirmed" ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              Confirmed
            </Button>
          </div>
        </div>

        {/* Meetups Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Pending ({pendingMeetups.length})</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Upcoming ({upcomingMeetups.length})</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Past ({pastMeetups.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingMeetups.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No pending meetups</h3>
                  <p className="text-gray-500">All your meetup requests have been responded to.</p>
                </CardContent>
              </Card>
            ) : (
              pendingMeetups.map((meetup) => (
                <Card key={meetup.id} className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={meetup.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-purple-500 text-white">
                          {meetup.user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-800">{meetup.user.name}</h3>
                            <Badge className="bg-green-100 text-green-700">{meetup.user.mood}</Badge>
                            <Badge className={`${getStatusColor(meetup.status)} flex items-center space-x-1`}>
                              {getStatusIcon(meetup.status)}
                              <span className="capitalize">{meetup.status}</span>
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">{meetup.createdAt}</span>
                        </div>

                        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            {meetup.place.icon}
                            <span>{meetup.place.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{meetup.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{meetup.time}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">{meetup.message}</p>

                        {meetup.type === "incoming" && meetup.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleAcceptMeetup(meetup.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDeclineMeetup(meetup.id)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingMeetups.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No upcoming meetups</h3>
                  <p className="text-gray-500">Schedule a new meetup to connect with someone nearby.</p>
                </CardContent>
              </Card>
            ) : (
              upcomingMeetups.map((meetup) => (
                <Card key={meetup.id} className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={meetup.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-purple-500 text-white">
                          {meetup.user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-800">{meetup.user.name}</h3>
                            <Badge className="bg-green-100 text-green-700">{meetup.user.mood}</Badge>
                            <Badge className={`${getStatusColor(meetup.status)} flex items-center space-x-1`}>
                              {getStatusIcon(meetup.status)}
                              <span className="capitalize">{meetup.status}</span>
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">{meetup.createdAt}</span>
                        </div>

                        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            {meetup.place.icon}
                            <span>{meetup.place.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{meetup.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{meetup.time}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">{meetup.message}</p>

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleCompleteMeetup(meetup.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Mark as Complete
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/chat/${meetup.user.name.replace(" ", "").toLowerCase()}`)}
                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                          >
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastMeetups.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No past meetups</h3>
                  <p className="text-gray-500">Your completed meetups will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              pastMeetups.map((meetup) => (
                <Card key={meetup.id} className="border-0 shadow-lg bg-white opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={meetup.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-purple-500 text-white">
                          {meetup.user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-800">{meetup.user.name}</h3>
                            <Badge className="bg-green-100 text-green-700">{meetup.user.mood}</Badge>
                            <Badge className={`${getStatusColor(meetup.status)} flex items-center space-x-1`}>
                              {getStatusIcon(meetup.status)}
                              <span className="capitalize">{meetup.status}</span>
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">{meetup.createdAt}</span>
                        </div>

                        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            {meetup.place.icon}
                            <span>{meetup.place.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{meetup.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{meetup.time}</span>
                          </div>
                        </div>

                        <p className="text-gray-600">{meetup.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
