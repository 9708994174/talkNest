import { io, type Socket } from "socket.io-client"

class SocketClient {
  private socket: Socket | null = null
  private static instance: SocketClient

  static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient()
    }
    return SocketClient.instance
  }

  connect(userId: string): Socket {
    if (!this.socket || !this.socket.connected) {
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL ||
        (typeof window !== "undefined"
          ? `${window.location.protocol}//${window.location.hostname}:${process.env.NEXT_PUBLIC_SOCKET_PORT || "3001"}`
          : "http://localhost:3001")

      console.log("Connecting to socket server:", socketUrl)

      this.socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
      })

      this.socket.on("connect", () => {
        console.log("Connected to socket server")
        this.socket?.emit("join", userId)
      })

      this.socket.on("disconnect", () => {
        console.log("Disconnected from socket server")
      })

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
      })
    }

    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  // Message methods
  joinConversation(conversationId: string): void {
    this.socket?.emit("join_conversation", conversationId)
  }

  sendMessage(conversationId: string, message: any): void {
    this.socket?.emit("send_message", { conversationId, message })
  }

  // Typing methods
  startTyping(conversationId: string, userId: string, userName: string): void {
    this.socket?.emit("typing_start", { conversationId, userId, userName })
  }

  stopTyping(conversationId: string, userId: string): void {
    this.socket?.emit("typing_stop", { conversationId, userId })
  }

  // Location methods
  updateLocation(userId: string, location: { lat: number; lng: number }): void {
    this.socket?.emit("location_update", { userId, location })
  }

  // Event listeners
  onNewMessage(callback: (message: any) => void): void {
    this.socket?.on("new_message", callback)
  }

  onUserTyping(callback: (data: { userId: string; userName?: string; isTyping: boolean }) => void): void {
    this.socket?.on("user_typing", callback)
  }

  onUserOnline(callback: (data: { userId: string }) => void): void {
    this.socket?.on("user_online", callback)
  }

  onUserOffline(callback: (data: { userId: string }) => void): void {
    this.socket?.on("user_offline", callback)
  }

  onLocationUpdate(callback: (data: { userId: string; location: { lat: number; lng: number } }) => void): void {
    this.socket?.on("user_location_update", callback)
  }

  // Remove listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners()
  }
}

export default SocketClient
