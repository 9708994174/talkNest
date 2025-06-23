import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db-utils"
import { ObjectId } from "mongodb"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const db = await getDatabase()

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let subscriptionData = {
      plan: user.subscription || "free",
      status: "active",
      nextBillingDate: null as Date | null,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null as Date | null,
    }

    // If user has a Stripe customer ID, get subscription details
    if (user.stripeCustomerId) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: "active",
          limit: 1,
        })

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0]
          subscriptionData = {
            plan: user.subscription || "free",
            status: subscription.status,
            nextBillingDate: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          }
        }
      } catch (stripeError) {
        console.error("Error fetching Stripe subscription:", stripeError)
      }
    }

    return NextResponse.json(subscriptionData)
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
