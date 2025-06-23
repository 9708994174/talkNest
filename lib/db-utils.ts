import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"

export async function getDatabase() {
  const client = await clientPromise
  return client.db("abc") // Replace with your database name
}

export async function getUserById(userId: string) {
  const db = await getDatabase()
  return await db.collection("users").findOne({ _id: new ObjectId(userId) })
}

export async function createUser(userData: any) {
  const db = await getDatabase()
  return await db.collection("users").insertOne({
    ...userData,
    createdAt: new Date(),
    subscription: "free", // Default to free tier
  })
}

export async function updateUserSubscription(userId: string, subscriptionType: string) {
  const db = await getDatabase()
  return await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        subscription: subscriptionType,
        subscriptionUpdatedAt: new Date(),
      },
    },
  )
}
