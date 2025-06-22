import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const client = await clientPromise
    const db = client.db("talknest")

    const meetups = await db
      .collection("meetups")
      .find({
        $or: [{ requesterId: userId }, { receiverId: userId }],
      })
      .sort({ scheduledDate: 1 })
      .toArray()

    return NextResponse.json({ meetups })
  } catch (error) {
    console.error("Error fetching meetups:", error)
    return NextResponse.json({ error: "Failed to fetch meetups" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { requesterId, receiverId, place, date, time, message, location } = await request.json()

    const client = await clientPromise
    const db = client.db("talknest")

    const meetup = await db.collection("meetups").insertOne({
      requesterId,
      receiverId,
      place,
      scheduledDate: new Date(`${date} ${time}`),
      message,
      location,
      status: "pending",
      createdAt: new Date(),
      safetyChecked: false,
    })

    return NextResponse.json({ success: true, meetupId: meetup.insertedId })
  } catch (error) {
    console.error("Error creating meetup:", error)
    return NextResponse.json({ error: "Failed to create meetup" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { meetupId, status, safetyChecked } = await request.json()

    const client = await clientPromise
    const db = client.db("talknest")

    const updateData: any = {}
    if (status) updateData.status = status
    if (safetyChecked !== undefined) updateData.safetyChecked = safetyChecked

    await db.collection("meetups").updateOne({ _id: meetupId }, { $set: updateData })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating meetup:", error)
    return NextResponse.json({ error: "Failed to update meetup" }, { status: 500 })
  }
}
