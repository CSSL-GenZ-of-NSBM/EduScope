import mongoose from 'mongoose'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

// Cache for raw MongoDB client
let cachedClient = (global as any).mongoClient

if (!cachedClient) {
  cachedClient = (global as any).mongoClient = { client: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Function to get raw MongoDB client for GridFS
async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient.client) {
    return cachedClient.client
  }

  if (!cachedClient.promise) {
    cachedClient.promise = MongoClient.connect(MONGODB_URI!)
  }

  try {
    cachedClient.client = await cachedClient.promise
  } catch (e) {
    cachedClient.promise = null
    throw e
  }

  return cachedClient.client
}

export default dbConnect

// Add a named export for backwards compatibility
export const connectDB = getMongoClient

// Export MongoClient for GridFS usage
export { MongoClient }
