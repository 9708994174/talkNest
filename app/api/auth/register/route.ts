import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, age, mood, bio, interests, location } = body

    console.log("Registration attempt:", { email, firstName, lastName })

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    let client
    try {
      client = await clientPromise
      console.log("Database connected successfully")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed. Please try again later.",
        },
        { status: 500 },
      )
    }

    const db = client.db("talknest")

    // Check if user already exists
    try {
      const existingUser = await db.collection("users").findOne({ email })
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this email already exists",
          },
          { status: 400 },
        )
      }
    } catch (error) {
      console.error("Error checking existing user:", error)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user document with proper location structure
    const newUser = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      age: Number.parseInt(age) || 25,
      currentMood: mood || "Happy",
      bio: bio || "",
      interests: interests || [],
      location: location
        ? {
            type: "Point",
            coordinates: [Number.parseFloat(location.lng), Number.parseFloat(location.lat)],
            lat: Number.parseFloat(location.lat),
            lng: Number.parseFloat(location.lng),
          }
        : {
            type: "Point",
            coordinates: [-122.4194, 37.7749], // Default SF coordinates
            lat: 37.7749,
            lng: -122.4194,
          },
      isOnline: true,
      isAvailableForSupport: true,
      lastActive: new Date(),
      joinedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      verificationStatus: "unverified",
      helpfulRating: 5.0,
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}&backgroundColor=b6e3f4`,
      safetyRating: 100,
      totalChats: 0,
      totalMeetups: 0,
      currentMessage: bio || "Looking for emotional support and meaningful connections.",
    }

    let result
    try {
      // Ensure geospatial index exists
      await db.collection("users").createIndex({ location: "2dsphere" })

      result = await db.collection("users").insertOne(newUser)
      console.log("User created successfully:", result.insertedId)
    } catch (error) {
      console.error("Error creating user:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create user account. Please try again.",
        },
        { status: 500 },
      )
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        email,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser
    const responseUser = {
      ...userWithoutPassword,
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
    }

    return NextResponse.json({
      success: true,
      user: responseUser,
      token,
      message: "Account created successfully! Welcome to TalkNest.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Registration failed. Please check your information and try again.",
      },
      { status: 500 },
    )
  }
}
