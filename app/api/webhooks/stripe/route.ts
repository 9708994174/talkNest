import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getDatabase, updateUserSubscription } from "@/lib/db-utils"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const db = await getDatabase()

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const planType = session.metadata?.planType

      if (userId && planType) {
        // Update user subscription in database
        await updateUserSubscription(userId, planType)

        // Store subscription details
        await db.collection("subscriptions").insertOne({
          userId,
          stripeCustomerId: session.customer,
          subscriptionId: session.subscription,
          planType,
          status: "active",
          createdAt: new Date(),
        })
      }
      break

    case "customer.subscription.updated":
      const updatedSubscription = event.data.object as Stripe.Subscription
      const customerId = updatedSubscription.customer as string

      // Find user by Stripe customer ID
      const user = await db.collection("users").findOne({ stripeCustomerId: customerId })
      if (user) {
        // Update subscription status
        await db.collection("subscriptions").updateOne(
          { userId: user._id.toString() },
          {
            $set: {
              status: updatedSubscription.status,
              cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
              updatedAt: new Date(),
            },
          },
        )

        // If subscription is canceled, update user plan
        if (updatedSubscription.status === "canceled") {
          await updateUserSubscription(user._id.toString(), "free")
        }
      }
      break

    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object as Stripe.Subscription
      const deletedCustomerId = deletedSubscription.customer as string

      // Find user and update to free plan
      const deletedUser = await db.collection("users").findOne({ stripeCustomerId: deletedCustomerId })
      if (deletedUser) {
        await updateUserSubscription(deletedUser._id.toString(), "free")
        await db.collection("subscriptions").updateOne(
          { userId: deletedUser._id.toString() },
          {
            $set: {
              status: "canceled",
              updatedAt: new Date(),
            },
          },
        )
      }
      break

    case "invoice.payment_failed":
      const failedInvoice = event.data.object as Stripe.Invoice
      const failedCustomerId = failedInvoice.customer as string

      // Handle failed payment - could send email notification
      console.log(`Payment failed for customer: ${failedCustomerId}`)
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
