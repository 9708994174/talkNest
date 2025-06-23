const { MongoClient } = require("mongodb")

async function setupDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI environment variable is required")
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    console.log("🔄 Connecting to MongoDB...")
    await client.connect()
    console.log("✅ Connected to MongoDB successfully!")

    const db = client.db("abc")

    // Create collections with proper indexes
    console.log("🔄 Setting up collections and indexes...")

    // Users collection with geospatial index
    await db.collection("users").createIndex({ location: "2dsphere" })
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("users").createIndex({ isOnline: 1 })
    await db.collection("users").createIndex({ isAvailableForSupport: 1 })

    // Messages collection
    await db.collection("messages").createIndex({ conversationId: 1, createdAt: 1 })
    await db.collection("messages").createIndex({ senderId: 1 })
    await db.collection("messages").createIndex({ receiverId: 1 })

    // Conversations collection
    await db.collection("conversations").createIndex({ participants: 1 })
    await db.collection("conversations").createIndex({ lastMessageAt: -1 })

    // Meetups collection
    await db.collection("meetups").createIndex({ organizerId: 1 })
    await db.collection("meetups").createIndex({ participantId: 1 })
    await db.collection("meetups").createIndex({ location: "2dsphere" })
    await db.collection("meetups").createIndex({ scheduledFor: 1 })

    console.log("✅ Database setup completed successfully!")
    console.log("📊 Collections created:")
    console.log("  - users (with geospatial and email indexes)")
    console.log("  - messages (with conversation and user indexes)")
    console.log("  - conversations (with participant indexes)")
    console.log("  - meetups (with location and time indexes)")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("🔌 Database connection closed")
  }
}

setupDatabase()
