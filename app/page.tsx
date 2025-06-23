"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, MessageCircle, Users, ArrowRight, User, MoreHorizontal, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold">TalkNest</span>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-6">
              <a href="#features" className="text-white/90 hover:text-white transition-colors text-sm">
                Features
              </a>
              <a href="#how-it-works" className="text-white/90 hover:text-white transition-colors text-sm">
                How It Works
              </a>
              <a href="#safety" className="text-white/90 hover:text-white transition-colors text-sm">
                Safety
              </a>
            </nav>
            <Link href="/auth">
              <Button className="bg-white text-purple-600 hover:bg-white/90 rounded-full px-6">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 text-white min-h-screen flex items-center py-10">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your digital shoulder 
                <br />
                to lean on when you 
                <br />
                need it most.
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Connect with caring individuals in your area who understand what you're going through.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-white/90 rounded-full px-8 py-4 text-lg font-semibold"
                  >
                    Get Started - It's Free
                  </Button>
                </Link>
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-white/90 rounded-full px-8 py-4 text-lg font-semibold"
                  onClick={toggleModal}
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Chat Mockup */}
            <div className="relative">
              <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-500 text-sm">Tap to update</span>
                  </div>
                  <MoreHorizontal className="h-5 w-5 text-gray-400" />
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4 min-h-[200px]">{/* Chat area placeholder */}</div>

                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-100 rounded-full px-4 py-3">
                    <span className="text-gray-400 text-sm">Type a message...</span>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learn More Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Learn More About TalkNest</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-8 w-8"
                  onClick={toggleModal}
                >
                  <X className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  TalkNest is your platform for finding emotional support and building meaningful connections with people nearby. Whether you're feeling happy, anxious, or just need someone to talk to, our community is here for you.
                </p>
                <p>
                  <strong>Why Choose TalkNest?</strong>
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Connect with people within 100-200 meters who share your interests or mood.</li>
                  <li>Enjoy secure, end-to-end encrypted chats with AI moderation for safety.</li>
                  <li>Arrange safe meetups in public spaces with verified users.</li>
                  <li>Express yourself through mood tags and personalized profiles.</li>
                </ul>
                <p>
                  Join TalkNest today to start your journey toward emotional well-being and community support.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <Link href="/auth">
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-full px-6"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* How TalkNest Helps You */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How TalkNest Helps You</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg bg-white text-center p-8">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Nearby Support</h3>
                <p className="text-gray-600 leading-relaxed">
                  Find people within 100-200 meters who are ready to listen and offer emotional support.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white text-center p-8">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Safe Chat</h3>
                <p className="text-gray-600 leading-relaxed">
                  End-to-end encrypted messaging with AI moderation to keep conversations supportive.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white text-center p-8">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Meet Safely</h3>
                <p className="text-gray-600 leading-relaxed">
                  Arrange meetups in public places with mutual consent and safety checks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <div className="mb-12">
                <h3 className="text-3xl font-bold text-gray-800 mb-6">1. Share Your Mood</h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  Let others know how you're feeling today by selecting from our mood tags. This helps match you with
                  people who can best support you.
                </p>
              </div>

              {/* Mood Selection Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-2xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">😊</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Happy</span>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-2xl">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">😰</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Anxious</span>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-2xl">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">😢</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Sad</span>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-2xl">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">💚</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Loving</span>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-2xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">😡</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Angry</span>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-2xl">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🤩</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Excited</span>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="flex justify-center">
              <Card className="border-0 shadow-xl bg-white max-w-sm w-full">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Your Profile</h4>
                      <p className="text-sm text-gray-500">Update your mood</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Current Mood:</span>
                      <Badge className="bg-purple-100 text-purple-700">Anxious</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className="bg-green-100 text-green-700">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Privacy:</span>
                      <Badge className="bg-blue-100 text-blue-700">Verified</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Support Network?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands who have found comfort, understanding, and friendship through TalkNest.
          </p>
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-white/90 rounded-full px-12 py-4 text-lg font-semibold"
            >
              Start Your Journey Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold">TalkNest</span>
              </div>
              <p className="text-gray-400">
                Your digital shoulder to lean on. Connecting hearts, one conversation at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Real-time Chat</li>
                <li>Nearby Discovery</li>
                <li>Safe Meetups</li>
                <li>Mood Matching</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Safety</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Profile Verification</li>
                <li>AI Moderation</li>
                <li>Report System</li>
                <li>Privacy Protection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Community Guidelines</li>
                <li>Contact Us</li>
                <li>Crisis Resources</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 TalkNest. All rights reserved. Made with ❤️ for emotional well-being.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}