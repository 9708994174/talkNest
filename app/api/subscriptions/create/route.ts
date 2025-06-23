import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-utils"
import { createCheckoutSession, createStripeCustomer } from "@/lib/stripe-utils"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { userId, priceId, planType } = await request.json()

    if (!userId || !priceId || !planType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user from database
    const db = await getDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create Stripe customer if doesn't exist
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await createStripeCustomer(user.email, `${user.firstName} ${user.lastName}`, userId)
      customerId = customer.id

      // Update user with Stripe customer ID
      await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: { stripeCustomerId: customerId } })
    }

    // Create checkout session
    const session = await createCheckoutSession(customerId, priceId, userId, planType)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json(
      {
        error: "Error creating subscription. Please try again.",
      },
      { status: 500 },
    )
  }
}
