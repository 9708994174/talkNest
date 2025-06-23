"use client"
export const dynamic = "force-dynamic"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  })
  const [errors, setErrors] = useState<any>({})
  const [isCheckingToken, setIsCheckingToken] = useState(true)

  const moods = ["Happy", "Calm", "Anxious", "Stressed", "Lonely", "Excited", "Peaceful", "Supportive"]

  useEffect(() => {
    console.log("Checking token in useEffect");
    const token = localStorage.getItem("talknest_token")
    if (token) {
      console.log("Token found, redirecting to dashboard");
      router.push("/dashboard")
    } else {
      console.log("No token, rendering form");
      setIsCheckingToken(false)
      getCurrentLocation()
    }
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
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            age: formData.age,
            mood: formData.mood,
            bio: formData.bio,
            location: currentLocation,
          }
      console.log("Submitting to:", endpoint, "Payload:", payload)
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
        localStorage.setItem("talknest_token", data.token)
        localStorage.setItem("talknest_user", JSON.stringify(data.user))
        console.log("Auth successful, redirecting to dashboard")
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

  if (isCheckingToken) {
    console.log("Rendering loading spinner due to isCheckingToken");
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
      </div>
    )
  }

  console.log("Rendering form, isLogin:", isLogin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-2">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl shadow-xl overflow-hidden h-[600px]">
        {/* Promotional Section */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 flex flex-col justify-center text-white">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">TalkNest</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {isLogin ? "Welcome Back!" : "Join Our Community"}
          </h2>
          <p className="text-sm mb-4">
            {isLogin
              ? "Sign in to connect with your support network."
              : "Sign up to find emotional support nearby."}
          </p>
          <ul className="space-y-1 text-xs">
            <li className="flex items-center">
              <span className="mr-1">✓</span> Safe environment
            </li>
            <li className="flex items-center">
              <span className="mr-1">✓</span> Connect with others
            </li>
            <li className="flex items-center">
              <span className="mr-1">✓</span> Secure platform
            </li>
          </ul>
        </div>

        {/* Form Section */}
        <div className={`p-6 flex flex-col ${isLogin ? 'justify-center' : 'overflow-y-auto'}`}>
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-lg text-center text-gray-800">
                {isLogin ? "Sign In" : "Create Account"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <form onSubmit={handleSubmit} className="space-y-2">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
                    {errors.general}
                  </div>
                )}
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="relative">
                          <User className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="First Name"
                            className={`pl-8 h-9 text-sm transition-all duration-200 ${errors.firstName ? "border-red-300" : "focus:ring-purple-500"}`}
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        {errors.firstName && <p className="text-red-500 text-xs mt-0.5">{errors.firstName}</p>}
                      </div>
                      <div>
                        <div className="relative">
                          <User className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Last Name"
                            className={`pl-8 h-9 text-sm transition-all duration-200 ${errors.lastName ? "border-red-300" : "focus:ring-purple-500"}`}
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                        {errors.lastName && <p className="text-red-500 text-xs mt-0.5">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <Calendar className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="Age"
                          className={`pl-8 h-9 text-sm transition-all duration-200 ${errors.age ? "border-red-300" : "focus:ring-purple-500"}`}
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          min="13"
                          max="120"
                        />
                      </div>
                      {errors.age && <p className="text-red-500 text-xs mt-0.5">{errors.age}</p>}
                    </div>
                  </>
                )}
                <div>
                  <div className="relative">
                    <Mail className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email"
                      className={`pl-8 h-9 text-sm transition-all duration-200 ${errors.email ? "border-red-300" : "focus:ring-purple-500"}`}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
                </div>
                <div>
                  <div className="relative">
                    <Lock className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className={`pl-8 pr-8 h-9 text-sm transition-all duration-200 ${errors.password ? "border-red-300" : "focus:ring-purple-500"}`}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-gray-100"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3 w-3 text-gray-500" /> : <Eye className="h-3 w-3 text-gray-500" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-0.5">{errors.password}</p>}
                </div>
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Current Mood</label>
                      <div className="grid grid-cols-3 gap-1">
                        {moods.map((mood) => (
                          <Button
                            key={mood}
                            type="button"
                            variant={formData.mood === mood ? "default" : "outline"}
                            size="sm"
                            className={`h-8 text-xs transition-all duration-200 ${
                              formData.mood === mood
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                : "hover:bg-gray-100 border-gray-300"
                            }`}
                            onClick={() => setFormData({ ...formData, mood })}
                          >
                            {mood}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tell us about yourself (optional)
                      </label>
                      <textarea
                        placeholder="Share your support needs..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none h-16 text-xs transition-all duration-200"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500 mt-0.5">{formData.bio.length}/200</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                      <div className="flex items-start space-x-1">
                        <MapPin className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-blue-800 font-medium">Location Access</p>
                          <p className="text-xs text-blue-600">
                            We use your location to find nearby support. It's never shared.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <Button
                  type="submit"
                  className="w-full h-9 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-sm shadow-md transition-all duration-200 z-10"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : (
                    <>{isLogin ? "Sign In" : "Create Account"}</>
                  )}
                </Button>
              </form>
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-600">
                  {isLogin ? "No account?" : "Have an account?"}
                  <Button
                    variant="link"
                    className="ml-1 p-0 h-auto text-purple-600 hover:text-purple-700 font-semibold text-xs"
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
                      })
                    }}
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </Button>
                </p>
              </div>
              <p className="text-center text-xs text-gray-500 mt-2">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}