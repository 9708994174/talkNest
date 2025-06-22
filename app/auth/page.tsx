"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Mail, Lock, User, MapPin, Calendar, Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    age: "",
    mood: "Happy",
    bio: "",
    interests: [] as string[],
  })
  const [errors, setErrors] = useState<any>({})

  const moods = ["Happy", "Calm", "Anxious", "Stressed", "Lonely", "Excited", "Peaceful", "Supportive"]
  const interestOptions = [
    "Mental Health",
    "Anxiety Support",
    "Depression Support",
    "Stress Management",
    "Mindfulness",
    "Self Care",
    "Relationships",
    "Work Life Balance",
    "Student Life",
    "Parenting",
    "Career",
    "Health & Fitness",
    "Creative Arts",
    "Music",
    "Reading",
    "Travel",
    "Cooking",
    "Technology",
    "Sports",
    "Gaming",
  ]

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("talknest_token")
    if (token) {
      router.push("/dashboard")
    }

    // Get current location for registration
    getCurrentLocation()
  }, [router])

  const getCurrentLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
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

      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
    } catch (error) {
      console.error("Location error:", error)
      // Use default location
      setCurrentLocation({ lat: 37.7749, lng: -122.4194 })
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!isLogin) {
      if (!formData.firstName) newErrors.firstName = "First name is required"
      if (!formData.lastName) newErrors.lastName = "Last name is required"
      if (!formData.age) {
        newErrors.age = "Age is required"
      } else if (Number.parseInt(formData.age) < 13) {
        newErrors.age = "Must be at least 13 years old"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            ...formData,
            location: currentLocation,
          }

      console.log("Submitting to:", endpoint)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("Response status:", response.status)

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Failed to parse response:", parseError)
        setErrors({ general: "Server error. Please try again." })
        return
      }

      console.log("Response data:", data)

      if (data.success) {
        // Store user data and token
        localStorage.setItem("talknest_token", data.token)
        localStorage.setItem("talknest_user", JSON.stringify(data.user))

        console.log("Auth successful, redirecting to dashboard")

        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        setErrors({ general: data.error || "Authentication failed" })
      }
    } catch (error) {
      console.error("Auth error:", error)
      setErrors({ general: "Network error. Please check your connection and try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              TalkNest
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{isLogin ? "Welcome Back" : "Join TalkNest"}</h1>
          <p className="text-gray-600">
            {isLogin
              ? "Sign in to connect with your support community"
              : "Create your account to find emotional support nearby"}
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">{isLogin ? "Sign In" : "Create Account"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              {/* Registration Fields */}
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="First Name"
                          className={`pl-10 h-12 ${errors.firstName ? "border-red-300" : ""}`}
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Last Name"
                          className={`pl-10 h-12 ${errors.lastName ? "border-red-300" : ""}`}
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Age"
                        className={`pl-10 h-12 ${errors.age ? "border-red-300" : ""}`}
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        min="13"
                        max="120"
                      />
                    </div>
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email"
                    className={`pl-10 h-12 ${errors.email ? "border-red-300" : ""}`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className={`pl-10 pr-10 h-12 ${errors.password ? "border-red-300" : ""}`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Registration Additional Fields */}
              {!isLogin && (
                <>
                  {/* Current Mood */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Mood</label>
                    <div className="grid grid-cols-2 gap-2">
                      {moods.map((mood) => (
                        <Button
                          key={mood}
                          type="button"
                          variant={formData.mood === mood ? "default" : "outline"}
                          size="sm"
                          className={`h-10 text-sm ${
                            formData.mood === mood
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => setFormData({ ...formData, mood })}
                        >
                          {mood}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tell us about yourself (optional)
                    </label>
                    <textarea
                      placeholder="Share what kind of support you're looking for or what you're going through..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none h-20 text-sm"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200 characters</p>
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interests & Topics (select up to 5)
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {interestOptions.map((interest) => (
                        <Badge
                          key={interest}
                          variant={formData.interests.includes(interest) ? "default" : "outline"}
                          className={`cursor-pointer text-xs p-2 justify-center transition-colors ${
                            formData.interests.includes(interest)
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                              : "hover:bg-gray-50"
                          } ${formData.interests.length >= 5 && !formData.interests.includes(interest) ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={() => {
                            if (formData.interests.length < 5 || formData.interests.includes(interest)) {
                              handleInterestToggle(interest)
                            }
                          }}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formData.interests.length}/5 selected</p>
                  </div>

                  {/* Location Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">Location Access</p>
                        <p className="text-xs text-blue-600">
                          We'll use your location to find nearby support. Your exact location is never shared with other
                          users.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  <>{isLogin ? "Sign In" : "Create Account"}</>
                )}
              </Button>
            </form>

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <Button
                  variant="link"
                  className="ml-1 p-0 h-auto text-purple-600 hover:text-purple-700 font-semibold"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setErrors({})
                    setFormData({
                      email: "",
                      password: "",
                      firstName: "",
                      lastName: "",
                      age: "",
                      mood: "Happy",
                      bio: "",
                      interests: [],
                    })
                  }}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
