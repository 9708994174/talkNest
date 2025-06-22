"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  Flag,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  FileText,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function SafetyPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [reportForm, setReportForm] = useState({
    type: "",
    userId: "",
    description: "",
    evidence: "",
  })

  // Mock safety data
  const safetyStats = {
    totalReports: 12,
    resolvedReports: 10,
    activeReports: 2,
    verifiedUsers: 1247,
    safetyScore: 98.5,
  }

  const emergencyContacts = [
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      description: "24/7 crisis support",
    },
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      description: "24/7 text-based crisis support",
    },
    {
      name: "Emergency Services",
      number: "911",
      description: "For immediate emergencies",
    },
  ]

  const safetyTips = [
    {
      title: "Meet in Public Places",
      description: "Always choose well-lit, populated areas for meetups",
      icon: <MapPin className="h-5 w-5 text-green-600" />,
    },
    {
      title: "Tell Someone Your Plans",
      description: "Inform a trusted friend about your meetup details",
      icon: <MessageCircle className="h-5 w-5 text-blue-600" />,
    },
    {
      title: "Trust Your Instincts",
      description: "If something feels wrong, leave immediately",
      icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
    },
    {
      title: "Verify Profiles",
      description: "Look for verified badges and complete profiles",
      icon: <CheckCircle className="h-5 w-5 text-purple-600" />,
    },
  ]

  const recentReports = [
    {
      id: 1,
      type: "Inappropriate Behavior",
      status: "resolved",
      date: "2024-06-20",
      description: "User sent inappropriate messages",
    },
    {
      id: 2,
      type: "Fake Profile",
      status: "investigating",
      date: "2024-06-19",
      description: "Suspected fake profile with stolen photos",
    },
    {
      id: 3,
      type: "Harassment",
      status: "resolved",
      date: "2024-06-18",
      description: "Persistent unwanted contact after blocking",
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

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportForm.type || !reportForm.description) {
      alert("Please fill in all required fields")
      return
    }

    // Simulate API call
    console.log("Submitting report:", reportForm)
    alert("Report submitted successfully. Our safety team will review it within 24 hours.")

    // Reset form
    setReportForm({
      type: "",
      userId: "",
      description: "",
      evidence: "",
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setReportForm((prev) => ({ ...prev, [field]: value }))
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading safety center...</p>
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
                <Shield className="h-6 w-6 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-800">Safety Center</h1>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700">Safety Score: {safetyStats.safetyScore}%</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Safety Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Verified Users</h3>
              <p className="text-2xl font-bold text-green-600">{safetyStats.verifiedUsers}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Resolved Reports</h3>
              <p className="text-2xl font-bold text-blue-600">{safetyStats.resolvedReports}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Active Reports</h3>
              <p className="text-2xl font-bold text-orange-600">{safetyStats.activeReports}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6 text-center">
              <Flag className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Total Reports</h3>
              <p className="text-2xl font-bold text-purple-600">{safetyStats.totalReports}</p>
            </CardContent>
          </Card>
        </div>

        {/* Safety Tabs */}
        <Tabs defaultValue="guidelines" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="guidelines">Safety Guidelines</TabsTrigger>
            <TabsTrigger value="report">Report Issue</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="reports">My Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="guidelines" className="space-y-6">
            {/* Safety Tips */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Safety Guidelines</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {safetyTips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      {tip.icon}
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">{tip.title}</h3>
                        <p className="text-sm text-gray-600">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Standards */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle>Community Standards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Be Respectful</h4>
                      <p className="text-sm text-gray-600">Treat all community members with kindness and respect</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Stay Supportive</h4>
                      <p className="text-sm text-gray-600">Focus on providing emotional support and understanding</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Protect Privacy</h4>
                      <p className="text-sm text-gray-600">Never share personal information without consent</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Report Issues</h4>
                      <p className="text-sm text-gray-600">
                        Help keep the community safe by reporting inappropriate behavior
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flag className="h-5 w-5 text-red-600" />
                  <span>Report an Issue</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReportSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Report Type *</Label>
                    <Select value={reportForm.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="harassment">Harassment</SelectItem>
                        <SelectItem value="inappropriate-content">Inappropriate Content</SelectItem>
                        <SelectItem value="fake-profile">Fake Profile</SelectItem>
                        <SelectItem value="spam">Spam</SelectItem>
                        <SelectItem value="safety-concern">Safety Concern</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-id">User ID (Optional)</Label>
                    <Input
                      id="user-id"
                      placeholder="Enter user ID if reporting a specific user"
                      value={reportForm.userId}
                      onChange={(e) => handleInputChange("userId", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide detailed information about the issue..."
                      rows={4}
                      value={reportForm.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evidence">Evidence (Optional)</Label>
                    <Textarea
                      id="evidence"
                      placeholder="Any additional evidence or context..."
                      rows={2}
                      value={reportForm.evidence}
                      onChange={(e) => handleInputChange("evidence", e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Submit Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-red-600" />
                  <span>Emergency Contacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                          <p className="text-sm text-gray-600">{contact.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">{contact.number}</p>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white mt-2"
                            onClick={() => window.open(`tel:${contact.number.replace(/\D/g, "")}`)}
                          >
                            Call Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle>Crisis Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Mental Health Resources</h4>
                    <p className="text-sm text-blue-600">Access professional mental health support and resources</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Support Groups</h4>
                    <p className="text-sm text-green-600">Find local and online support groups in your area</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800">Self-Care Tips</h4>
                    <p className="text-sm text-purple-600">Learn healthy coping strategies and self-care techniques</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span>My Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentReports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No reports submitted</h3>
                    <p className="text-gray-500">Your safety reports will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800">{report.type}</h3>
                          <Badge
                            className={`${
                              report.status === "resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          Submitted on {report.date}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
