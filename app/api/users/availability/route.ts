import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { userId, isAvailable } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("talknest")

    // Update user availability
    const result = await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          isAvailableForSupport: isAvailable,
          lastActive: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Availability updated to ${isAvailable ? "available" : "unavailable"}`,
    })
  } catch (error) {
    console.error("Error updating availability:", error)
    return NextResponse.json(
      {
        error: "Failed to update availability",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
