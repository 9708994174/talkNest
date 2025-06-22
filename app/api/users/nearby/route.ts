import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { userId, location, moodFilter, radius = 5000 } = await request.json()

    console.log("Nearby users request:", { userId, location, moodFilter })

    if (!userId || !location) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and location are required",
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

    // Build query
    const query: any = {
      _id: { $ne: new ObjectId(userId) }, // Exclude current user
      isOnline: true,
      isAvailableForSupport: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number.parseFloat(location.lng), Number.parseFloat(location.lat)],
          },
          $maxDistance: radius, // 5km radius
        },
      },
    }

    // Add mood filter if specified
    if (moodFilter && moodFilter !== "All Moods") {
      query.currentMood = moodFilter
    }

    try {
      // Ensure geospatial index exists
      await db.collection("users").createIndex({ location: "2dsphere" })

      const nearbyUsers = await db.collection("users").find(query).limit(20).toArray()

      // Calculate distances and format response
      const usersWithDistance = nearbyUsers.map((user) => {
        const distance = calculateDistance(
          location.lat,
          location.lng,
          user.location?.lat || 37.7749,
          user.location?.lng || -122.4194,
        )

        return {
          id: user._id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          currentMood: user.currentMood,
          bio: user.bio,
          message: user.currentMessage || user.bio,
          distance: `${Math.round(distance)}m`,
          distanceMeters: Math.round(distance),
          isOnline: user.isOnline,
          isAvailableForSupport: user.isAvailableForSupport,
          helpfulRating: user.helpfulRating || 5.0,
          verificationStatus: user.verificationStatus || "unverified",
          avatar: user.profilePicture,
          interests: user.interests || [],
          location: user.location,
        }
      })

      // Sort by distance
      usersWithDistance.sort((a, b) => a.distanceMeters - b.distanceMeters)

      return NextResponse.json({
        success: true,
        users: usersWithDistance,
        totalFound: usersWithDistance.length,
        message: `Found ${usersWithDistance.length} users nearby`,
      })
    } catch (error) {
      console.error("Error finding nearby users:", error)
      return NextResponse.json({
        success: true,
        users: [],
        totalFound: 0,
        message: "No users found nearby",
      })
    }
  } catch (error) {
    console.error("Nearby users API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to find nearby users",
      },
      { status: 500 },
    )
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
