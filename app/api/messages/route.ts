import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const chatId = searchParams.get("chatId")

    const client = await clientPromise
    const db = client.db("talknest")

    if (chatId) {
      // Get messages for specific chat
      const messages = await db.collection("messages").find({ chatId }).sort({ timestamp: 1 }).toArray()

      return NextResponse.json({ messages })
    } else {
      // Get all conversations for user
      const conversations = await db
        .collection("conversations")
        .find({ participants: userId })
        .sort({ lastMessage: -1 })
        .toArray()

      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId, message, type = "text" } = await request.json()

    const client = await clientPromise
    const db = client.db("talknest")

    // Create or find conversation
    let conversation = await db.collection("conversations").findOne({
      participants: { $all: [senderId, receiverId] },
    })

    if (!conversation) {
      conversation = await db.collection("conversations").insertOne({
        participants: [senderId, receiverId],
        createdAt: new Date(),
        lastMessage: new Date(),
      })
    }

    // Insert message
    const newMessage = await db.collection("messages").insertOne({
      chatId: conversation._id,
      senderId,
      receiverId,
      message,
      type,
      timestamp: new Date(),
      read: false,
    })

    // Update conversation last message
    await db.collection("conversations").updateOne({ _id: conversation._id }, { $set: { lastMessage: new Date() } })

    return NextResponse.json({ success: true, messageId: newMessage.insertedId })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
