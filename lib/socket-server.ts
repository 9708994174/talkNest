import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

export class SocketManager {
  private io: SocketIOServer
  private users: Map<string, string> = new Map() // userId -> socketId

  constructor(server: HTTPServer) {
    const allowedOrigins =
      process.env.NODE_ENV === "production"
        ? [process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"]
        : ["http://localhost:3000", "http://127.0.0.1:3000", `http://localhost:${process.env.PORT || 3000}`]

    this.io = new SocketIOServer(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    })

    console.log("Socket server initialized with CORS origins:", allowedOrigins)
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log("User connected:", socket.id)

      // User joins with their ID
      socket.on("join", (userId: string) => {
        this.users.set(userId, socket.id)
        socket.join(`user_${userId}`)

        // Notify others that user is online
        socket.broadcast.emit("user_online", { userId })
        console.log(`User ${userId} joined`)
      })

      // Join conversation room
      socket.on("join_conversation", (conversationId: string) => {
        socket.join(`conversation_${conversationId}`)
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`)
      })

      // Handle new message
      socket.on("send_message", (data) => {
        const { conversationId, message } = data
        // Broadcast to all users in the conversation
        socket.to(`conversation_${conversationId}`).emit("new_message", message)
      })

      // Handle typing indicators
      socket.on("typing_start", (data) => {
        const { conversationId, userId, userName } = data
        socket.to(`conversation_${conversationId}`).emit("user_typing", { userId, userName, isTyping: true })
      })

      socket.on("typing_stop", (data) => {
        const { conversationId, userId } = data
        socket.to(`conversation_${conversationId}`).emit("user_typing", { userId, isTyping: false })
      })

      // Handle location updates
      socket.on("location_update", (data) => {
        const { userId, location } = data
        socket.broadcast.emit("user_location_update", { userId, location })
      })

      // Handle disconnect
      socket.on("disconnect", () => {
        // Find and remove user
        for (const [userId, socketId] of this.users.entries()) {
          if (socketId === socket.id) {
            this.users.delete(userId)
            socket.broadcast.emit("user_offline", { userId })
            console.log(`User ${userId} disconnected`)
            break
          }
        }
      })
    })
  }

  public getIO() {
    return this.io
  }
}
