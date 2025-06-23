export interface SubscriptionData {
  plan: "free" | "premium" | "professional"
  status: string
  nextBillingDate: Date | null
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: Date | null
}

export interface PaymentSession {
  sessionId: string
  url: string
}

export interface SubscriptionCreateRequest {
  userId: string
  priceId: string
  planType: "premium" | "professional"
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  bio?: string
  interests?: string[]
  currentMood?: string
  location?: string
  subscription: "free" | "premium" | "professional"
  stripeCustomerId?: string
  profilePicture?: string
  verificationStatus?: "verified" | "pending" | "unverified"
  helpfulRating?: number
  totalSessions?: number
  createdAt: Date
  updatedAt?: Date
}
