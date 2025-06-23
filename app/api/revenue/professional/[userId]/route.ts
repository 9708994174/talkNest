import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-utils"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const db = await getDatabase()

    // Get user and verify professional status
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user || user.subscription !== "professional") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get revenue data
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const sessions = await db
      .collection("sessions")
      .find({
        professionalId: new ObjectId(userId),
        createdAt: { $gte: currentMonth },
        status: "completed",
      })
      .toArray()

    const totalEarnings = sessions.reduce((sum, session) => sum + (session.amount || 0), 0)
    const sessionsCompleted = sessions.length
    const averageRating =
      sessions.length > 0 ? sessions.reduce((sum, session) => sum + (session.rating || 0), 0) / sessions.length : 0

    // Get upcoming bookings
    const upcomingBookings = await db.collection("bookings").countDocuments({
      professionalId: new ObjectId(userId),
      scheduledDate: { $gte: new Date() },
      status: "confirmed",
    })

    return NextResponse.json({
      totalEarnings: totalEarnings / 100, // Convert from cents
      sessionsCompleted,
      averageRating: Math.round(averageRating * 10) / 10,
      upcomingBookings,
    })
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
