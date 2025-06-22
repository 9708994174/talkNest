import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 },
      )
    }

    let client
    try {
      client = await clientPromise
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
        },
        { status: 500 },
      )
    }

    const db = client.db("talknest")

    try {
      const user = await db.collection("users").findOne({
        _id: new ObjectId(userId),
      })

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 },
        )
      }

      // Remove sensitive information
      const { password, ...userWithoutPassword } = user
      const responseUser = {
        ...userWithoutPassword,
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.profilePicture,
      }

      return NextResponse.json({
        success: true,
        user: responseUser,
      })
    } catch (error) {
      console.error("Error fetching user:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch user",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("User API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
