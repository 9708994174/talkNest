import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getDatabase } from "@/lib/db-utils"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function POST(request: NextRequest) {
  try {
    const { userId, priceId, planType } = await request.json()

    // Get user from database
    const db = await getDatabase()
    const user = await db.collection("users").findOne({ _id: userId })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create Stripe customer if doesn't exist
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: userId,
        },
      })
      customerId = customer.id

      // Update user with Stripe customer ID
      await db.collection("users").updateOne({ _id: userId }, { $set: { stripeCustomerId: customerId } })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        planType: planType,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: "Error creating subscription" }, { status: 500 })
  }
}
