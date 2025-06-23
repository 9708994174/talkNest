import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    await client.db("admin").command({ ping: 1 })

    const db = client.db("abc")
    const collections = await db.listCollections().toArray()

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      collections: collections.map((c) => c.name),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
