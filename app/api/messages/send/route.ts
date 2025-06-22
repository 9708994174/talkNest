import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { conversationId, senderId, content, type = "text" } = await request.json()

    if (!conversationId || !senderId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("talknest")

    // Create new message
    const newMessage = {
      conversationId: new ObjectId(conversationId),
      senderId: new ObjectId(senderId),
      content,
      type,
      timestamp: new Date(),
      status: "delivered",
      read: false,
    }

    const result = await db.collection("messages").insertOne(newMessage)

    // Update conversation with last message
    await db.collection("conversations").updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          lastMessage: content,
          lastMessageTime: new Date(),
        },
        $inc: { unreadCount: 1 },
      },
    )

    // Get sender info for real-time broadcast
    const sender = await db.collection("users").findOne({ _id: new ObjectId(senderId) })

    const messageForBroadcast = {
      id: result.insertedId,
      senderId,
      senderName: `${sender?.firstName} ${sender?.lastName}`,
      text: content,
      timestamp: new Date(),
      type,
      status: "delivered",
    }

    return NextResponse.json({
      success: true,
      messageId: result.insertedId,
      message: messageForBroadcast,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
