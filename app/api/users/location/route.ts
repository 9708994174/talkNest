import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { userId, location } = await request.json()

    if (!userId || !location) {
      return NextResponse.json({ error: "User ID and location are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("talknest")

    // Update user location
    await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
          lastActive: new Date(),
          isOnline: true,
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating location:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}
