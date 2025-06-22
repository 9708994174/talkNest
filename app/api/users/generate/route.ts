import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { centerLat, centerLng, count = 25 } = await request.json()

    const client = await clientPromise
    const db = client.db("talknest")

    // Check if we already have users in the database
    const existingUsersCount = await db.collection("users").countDocuments()

    if (existingUsersCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Users already exist in database",
        count: existingUsersCount,
      })
    }

    // Only generate demo users if database is empty (for development)
    if (process.env.NODE_ENV === "development") {
      // Generate demo users for development
      const demoUsers = []

      for (let i = 0; i < count; i++) {
        const user = {
          _id: `demo_user_${i}`,
          firstName: `User${i}`,
          lastName: `Demo`,
          email: `demo${i}@example.com`,
          currentMood: ["Happy", "Calm", "Anxious", "Stressed"][i % 4],
          message: "This is a demo user for development",
          location: {
            type: "Point",
            coordinates: [centerLng + (Math.random() - 0.5) * 0.01, centerLat + (Math.random() - 0.5) * 0.01],
          },
          isOnline: true,
          isAvailableForSupport: true,
          lastActive: new Date(),
          joinedDate: new Date(),
          verificationStatus: "verified",
          helpfulRating: 4.5,
        }
        demoUsers.push(user)
      }

      await db.collection("users").insertMany(demoUsers)

      return NextResponse.json({
        success: true,
        message: "Demo users generated for development",
        count: demoUsers.length,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Production mode - no demo users generated",
    })
  } catch (error) {
    console.error("Error in generate users:", error)
    return NextResponse.json({ success: false, error: "Failed to generate users" }, { status: 500 })
  }
}
