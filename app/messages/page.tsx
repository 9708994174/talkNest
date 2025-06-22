"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Heart,
  Search,
  ArrowLeft,
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Send,
  Smile,
  ImageIcon,
  Mic,
  CheckCheck,
  Check,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function MessagesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setShowSidebar(!mobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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
      fetchConversations(userData.id)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/auth")
    }
  }, [router])

  const fetchConversations = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/conversations?userId=${userId}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setConversations(data.conversations || [])
        } else {
          setConversations([])
        }
      } else {
        setConversations([])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages(data.messages || [])
        } else {
          setMessages([])
        }
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
    }
  }

  const handleSelectChat = (conversation: any) => {
    setSelectedChat(conversation)
    fetchMessages(conversation.id)

    if (isMobile) {
      setShowSidebar(false)
    }

    // Mark as read
    setConversations((prev) =>
      prev.map((conv) => (conv.id === conversation.id ? { ...conv, unreadCount: 0, isRead: true } : conv)),
    )
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat || !currentUser) return

    const tempMessage = {
      id: Date.now(),
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date(),
      type: "text",
      status: "sending",
    }

    setMessages((prev) => [...prev, tempMessage])
    setNewMessage("")

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedChat.id,
          senderId: currentUser.id,
          text: newMessage,
          type: "text",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update message status
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempMessage.id ? { ...msg, id: data.messageId, status: "delivered" } : msg)),
          )

          // Update conversation list
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === selectedChat.id ? { ...conv, lastMessage: newMessage, timestamp: new Date() } : conv,
            ),
          )
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Remove failed message
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
    }
  }

  const handleSendHug = async () => {
    if (!selectedChat || !currentUser) return

    const hugMessage = {
      id: Date.now(),
      senderId: currentUser.id,
      text: "💜",
      timestamp: new Date(),
      type: "hug",
      status: "sending",
    }

    setMessages((prev) => [...prev, hugMessage])

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedChat.id,
          senderId: currentUser.id,
          text: "💜",
          type: "hug",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === hugMessage.id ? { ...msg, id: data.messageId, status: "delivered" } : msg)),
          )
        }
      }
    } catch (error) {
      console.error("Error sending hug:", error)
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTime = (timestamp: string | Date) => {
    if (typeof timestamp === "string") return timestamp
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            {selectedChat ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedChat(null)
                    setShowSidebar(true)
                  }}
                  className="text-purple-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedChat.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-purple-500 text-white text-xs">
                      {selectedChat.user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{selectedChat.user.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="text-purple-600">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-lg font-semibold">Messages</h1>
                <div className="w-8" />
              </>
            )}
          </div>
        </div>
      )}

      {/* Conversations Sidebar */}
      <div
        className={`${isMobile ? "fixed inset-y-0 left-0 z-40 transform transition-transform" : "relative"} ${isMobile && !showSidebar ? "-translate-x-full" : "translate-x-0"} w-full md:w-80 border-r border-gray-200 flex flex-col bg-white ${isMobile ? "pt-20" : ""}`}
      >
        {/* Desktop Header */}
        {!isMobile && (
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-purple-600 hover:text-purple-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold">Messages</h1>
              <div className="w-8" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 bg-gray-50 border-gray-200 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Mobile Search */}
        {isMobile && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 bg-gray-50 border-gray-200 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No conversations yet</h3>
              <p className="text-gray-500 text-sm">Start chatting with people from the discover page</p>
              <Button
                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                onClick={() => router.push("/dashboard")}
              >
                Discover People
              </Button>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === conversation.id ? "bg-purple-50 border-purple-200" : ""
                }`}
                onClick={() => handleSelectChat(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-purple-500 text-white">
                        {conversation.user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">{conversation.user.name}</h3>
                      <span className="text-xs text-gray-500">{formatTime(conversation.timestamp)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${conversation.isRead ? "text-gray-500" : "text-gray-800 font-medium"}`}
                      >
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-purple-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && showSidebar && selectedChat && (
        <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setShowSidebar(false)} />
      )}

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${isMobile ? "pt-20" : ""} ${isMobile && showSidebar ? "hidden" : "flex"}`}>
        {selectedChat ? (
          <>
            {/* Desktop Chat Header */}
            {!isMobile && (
              <div className="p-4 md:p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedChat.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-purple-500 text-white">
                          {selectedChat.user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {selectedChat.user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-800">{selectedChat.user.name}</h2>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-700 text-xs">{selectedChat.user.mood}</Badge>
                        {selectedChat.user.isOnline && <span className="text-xs text-green-600">Active now</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md ${message.senderId === currentUser.id ? "order-2" : "order-1"}`}
                    >
                      {message.type === "hug" ? (
                        <div
                          className={`p-3 rounded-2xl ${
                            message.senderId === currentUser.id
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">🤗</div>
                            <p className="text-xs opacity-90">Virtual hug</p>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`p-3 rounded-2xl ${
                            message.senderId === currentUser.id
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      )}
                      <div
                        className={`flex items-center mt-1 space-x-1 ${
                          message.senderId === currentUser.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                        {message.senderId === currentUser.id && getMessageStatus(message.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl">
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
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2 md:space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSendHug}
                  className="text-purple-600 hover:text-purple-700 p-2"
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 p-2">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="pr-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-full h-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 p-2">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-3"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
