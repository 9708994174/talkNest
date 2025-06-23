import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-utils"
import { ObjectId } from "mongodb"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const db = await getDatabase()

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 })
    }

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 })
    }

    // Cancel the subscription at period end
    const subscription = subscriptions.data[0]
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    })

    // Update local database
    await db.collection("subscriptions").updateOne(
      { userId: userId },
      {
        $set: {
          cancelAtPeriodEnd: true,
          cancelAt: new Date(updatedSubscription.current_period_end * 1000),
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Subscription will be canceled at the end of the current billing period",
      cancelAt: new Date(updatedSubscription.current_period_end * 1000),
    })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
