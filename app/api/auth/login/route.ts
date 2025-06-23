import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable")
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("Login attempt:", email)

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
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

    const db = client.db("abc")

    // Find user
    const user = await db.collection("users").findOne({ email })
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Update last active and online status
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          lastActive: new Date(),
          isOnline: true,
          updatedAt: new Date(),
        },
      },
    )

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    )

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    const responseUser = {
      ...userWithoutPassword,
      id: user._id.toString(),
      _id: user._id.toString(),
    }

    return NextResponse.json({
      success: true,
      user: responseUser,
      token,
      message: "Login successful! Welcome back.",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Login failed. Please try again.",
      },
      { status: 500 },
    )
  }
}
