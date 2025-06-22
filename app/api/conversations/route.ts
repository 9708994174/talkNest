import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("talknest")

    // Get conversations where user is participant
    const conversations = await db
      .collection("conversations")
      .find({
        participants: new ObjectId(userId),
      })
      .sort({ lastMessageTime: -1 })
      .limit(10)
      .toArray()

    // Get participant details for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipantId = conv.participants.find((p: ObjectId) => p.toString() !== userId)

        const otherUser = await db.collection("users").findOne({ _id: otherParticipantId })

        return {
          id: conv._id,
          user: {
            id: otherUser?._id,
            name: `${otherUser?.firstName} ${otherUser?.lastName}`,
            avatar: otherUser?.profilePicture,
            isOnline: otherUser?.isOnline || false,
            mood: otherUser?.currentMood,
          },
          lastMessage: conv.lastMessage || "No messages yet",
          timestamp: conv.lastMessageTime || conv.createdAt,
          unreadCount: conv.unreadCount || 0,
          isRead: conv.isRead || false,
        }
      }),
    )

    return NextResponse.json({ success: true, conversations: conversationsWithDetails })
  } catch (error) {
    console.error("Conversations fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, otherUserId } = await request.json()

    if (!userId || !otherUserId) {
      return NextResponse.json({ error: "Both user IDs are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("talknest")

    // Check if conversation already exists
    const existingConversation = await db.collection("conversations").findOne({
      participants: {
        $all: [new ObjectId(userId), new ObjectId(otherUserId)],
      },
    })

    if (existingConversation) {
      return NextResponse.json({ success: true, conversationId: existingConversation._id })
    }

    // Create new conversation
    const newConversation = {
      participants: [new ObjectId(userId), new ObjectId(otherUserId)],
      createdAt: new Date(),
      lastMessage: null,
      lastMessageTime: null,
      unreadCount: 0,
      isRead: false,
    }

    const result = await db.collection("conversations").insertOne(newConversation)

    return NextResponse.json({ success: true, conversationId: result.insertedId })
  } catch (error) {
    console.error("Conversation creation error:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
