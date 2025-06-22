"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Heart,
  Smile,
  Calendar,
  Shield,
  Flag,
  BlocksIcon as Block,
  ImageIcon,
  Mic,
  CheckCheck,
  Check,
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import SocketClient from "@/lib/socket-client"

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [chatUser, setChatUser] = useState<any>(null)
  const [conversation, setConversation] = useState<any>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const socketClient = SocketClient.getInstance()

  useEffect(() => {
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

      // Initialize socket connection
      const socket = socketClient.connect(userData.id)

      // Fetch chat user and conversation
      fetchChatUser(userId)
      initializeConversation(userData.id, userId)

      // Setup socket listeners
      setupSocketListeners()
    } catch (error) {
      console.error("Error initializing chat:", error)
      router.push("/auth")
    }

    return () => {
      // Cleanup
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      socketClient.removeAllListeners()
    }
  }, [router, userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const setupSocketListeners = () => {
    // Listen for new messages
    socketClient.onNewMessage((newMessage) => {
      setMessages((prev) => [...prev, newMessage])
    })

    // Listen for typing indicators
    socketClient.onUserTyping((data) => {
      if (data.userId !== currentUser?.id) {
        setIsTyping(data.isTyping)
        if (data.isTyping && data.userName) {
          setTypingUser(data.userName)
        }

        // Auto-hide typing indicator after 3 seconds
        if (data.isTyping) {
          setTimeout(() => {
            setIsTyping(false)
            setTypingUser("")
          }, 3000)
        }
      }
    })

    // Listen for online status updates
    socketClient.onUserOnline((data) => {
      if (data.userId === userId) {
        setChatUser((prev: any) => (prev ? { ...prev, isOnline: true } : null))
      }
    })

    socketClient.onUserOffline((data) => {
      if (data.userId === userId) {
        setChatUser((prev: any) => (prev ? { ...prev, isOnline: false } : null))
      }
    })
  }

  const fetchChatUser = async (targetUserId: string) => {
    try {
      const response = await fetch(`/api/users/${targetUserId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setChatUser(data.user)
        }
      }
    } catch (error) {
      console.error("Error fetching chat user:", error)
    }
  }

  const initializeConversation = async (currentUserId: string, targetUserId: string) => {
    try {
      setLoading(true)

      // Create or get conversation
      const convResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          otherUserId: targetUserId,
        }),
      })

      if (convResponse.ok) {
        const convData = await convResponse.json()
        if (convData.success) {
          const conversationId = convData.conversationId
          setConversation({ id: conversationId })

          // Join conversation room
          socketClient.joinConversation(conversationId)

          // Fetch messages
          await fetchMessages(conversationId)
        }
      }
    } catch (error) {
      console.error("Error initializing conversation:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages(data.messages || [])
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !conversation || !currentUser || sending) return

    setSending(true)
    const messageText = message
    setMessage("")

    // Stop typing indicator
    handleStopTyping()

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          senderId: currentUser.id,
          content: messageText,
          type: "text",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Add message to local state
          const newMessage = {
            id: data.messageId,
            senderId: currentUser.id,
            text: messageText,
            timestamp: new Date(),
            type: "text",
            status: "delivered",
          }

          setMessages((prev) => [...prev, newMessage])

          // Broadcast via socket
          socketClient.sendMessage(conversation.id, newMessage)
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Re-add message to input on error
      setMessage(messageText)
    } finally {
      setSending(false)
    }
  }

  const handleSendHug = async () => {
    if (!conversation || !currentUser || sending) return

    setSending(true)

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          senderId: currentUser.id,
          content: "💜",
          type: "hug",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const hugMessage = {
            id: data.messageId,
            senderId: currentUser.id,
            text: "💜",
            timestamp: new Date(),
            type: "hug",
            status: "delivered",
          }

          setMessages((prev) => [...prev, hugMessage])
          socketClient.sendMessage(conversation.id, hugMessage)
        }
      }
    } catch (error) {
      console.error("Error sending hug:", error)
    } finally {
      setSending(false)
    }
  }

  const handleStartTyping = () => {
    if (conversation && currentUser && chatUser) {
      socketClient.startTyping(conversation.id, currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`)
    }
  }

  const handleStopTyping = () => {
    if (conversation && currentUser) {
      socketClient.stopTyping(conversation.id, currentUser.id)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)

    // Handle typing indicators
    if (e.target.value.trim() && !typingTimeoutRef.current) {
      handleStartTyping()
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
      typingTimeoutRef.current = undefined
    }, 1000)
  }

  const handleScheduleMeetup = () => {
    router.push(`/meetup/${userId}`)
  }

  const handlePhoneCall = () => {
    // TODO: Implement phone call functionality
    alert("Phone call feature coming soon!")
  }

  const handleVideoCall = () => {
    // TODO: Implement video call functionality
    alert("Video call feature coming soon!")
  }

  const handleReportUser = () => {
    // TODO: Implement user reporting
    alert("User reporting feature coming soon!")
  }

  const handleBlockUser = () => {
    // TODO: Implement user blocking
    if (confirm("Are you sure you want to block this user?")) {
      alert("User blocking feature coming soon!")
    }
  }

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getMessageStatus = (status: string) => {
    switch (status) {
      case "sending":
        return <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
      case "delivered":
        return <Check className="h-3 w-3 text-gray-400" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!chatUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found</p>
          <Button onClick={() => router.push("/dashboard")} className="bg-purple-600 hover:bg-purple-700 text-white">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Chat Header */}
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

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={
                        chatUser.profilePicture ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUser.firstName}`
                      }
                    />
                    <AvatarFallback className="bg-purple-500 text-white">
                      {chatUser.firstName?.[0]}
                      {chatUser.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {chatUser.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div>
                  <h2 className="font-semibold text-gray-800">{chatUser.name}</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Badge className="bg-green-100 text-green-700 text-xs">{chatUser.currentMood}</Badge>
                    <span>•</span>
                    <span className="flex items-center">
                      {chatUser.isOnline ? (
                        <span className="text-green-600">Online</span>
                      ) : (
                        <span className="text-gray-500">Offline</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
                onClick={handlePhoneCall}
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
                onClick={handleVideoCall}
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
                onClick={handleScheduleMeetup}
              >
                <Calendar className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/safety")}>
                    <Shield className="h-4 w-4 mr-2" />
                    View Safety Info
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={handleReportUser}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report User
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={handleBlockUser}>
                    <Block className="h-4 w-4 mr-2" />
                    Block User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 container mx-auto px-4 py-6 overflow-hidden">
        <Card className="h-full border-0 shadow-lg bg-white flex flex-col">
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Start the conversation</h3>
                    <p className="text-gray-500 text-sm">Send a message to begin chatting with {chatUser.firstName}</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === currentUser.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md ${msg.senderId === currentUser.id ? "order-2" : "order-1"}`}
                      >
                        {msg.type === "hug" ? (
                          <div
                            className={`p-4 rounded-2xl ${
                              msg.senderId === currentUser.id
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-3xl mb-2">🤗</div>
                              <p className="text-sm opacity-90">Sent a virtual hug</p>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`p-4 rounded-2xl ${
                              msg.senderId === currentUser.id
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                          </div>
                        )}
                        <div
                          className={`flex items-center mt-1 space-x-1 ${
                            msg.senderId === currentUser.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                          {msg.senderId === currentUser.id && getMessageStatus(msg.status)}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md">
                      <div className="bg-gray-100 p-4 rounded-2xl">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{typingUser} is typing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-6">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSendHug}
                    disabled={sending}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      value={message}
                      onChange={handleInputChange}
                      placeholder="Type your message..."
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      disabled={sending}
                    />
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full"
                    disabled={!message.trim() || sending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
