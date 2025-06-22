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
      .toArray()

    // Transform messages for frontend
    const transformedMessages = messages.map((msg) => ({
      id: msg._id,
      senderId: msg.senderId,
      text: msg.content,
      timestamp: msg.timestamp,
      type: msg.type || "text",
      status: msg.status || "delivered",
    }))

    return NextResponse.json({ success: true, messages: transformedMessages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
