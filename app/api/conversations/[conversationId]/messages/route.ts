import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const conversationId = params.conversationId

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("talknest")

    // Get messages for the conversation
    const messages = await db
      .collection("messages")
      .find({ conversationId: new ObjectId(conversationId) })
      .sort({ timestamp: 1 })
      .limit(100) // Limit to last 100 messages
      .toArray()

    // Transform messages for frontend
    const transformedMessages = messages.map((msg) => ({
      id: msg._id,
      senderId: msg.senderId.toString(),
      text: msg.content,
      timestamp: msg.timestamp,
      type: msg.type || "text",
      status: msg.status || "delivered",
    }))

    return NextResponse.json({ success: true, messages: transformedMessages })
  } catch (error) {
    console.error("Error fetching conversation messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const conversationId = params.conversationId
    const { senderId, content, type = "text" } = await request.json()

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
      },
    )

    // Get sender info for real-time broadcast
    const sender = await db.collection("users").findOne({ _id: new ObjectId(senderId) })

    const messageForBroadcast = {
      id: result.insertedId,
      senderId: senderId,
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
