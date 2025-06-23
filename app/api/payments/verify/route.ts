import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      success: true,
      planType: session.metadata?.planType,
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
      currency: session.currency,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Error verifying payment" }, { status: 500 })
  }
}
