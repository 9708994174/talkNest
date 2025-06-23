import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-utils"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const body = await request.json()
    const { firstName, lastName, email, phone, bio, interests, currentMood, location } = body

    const db = await getDatabase()

    // Update user profile
    const updateData = {
      firstName,
      lastName,
      email,
      phone,
      bio,
      interests,
      currentMood,
      location,
      updatedAt: new Date(),
    }

    const result = await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get updated user
    const updatedUser = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser?._id,
        ...updatedUser,
      },
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
