import mongoose from 'mongoose'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

// Log the MongoDB URI being used (without credentials if any)
console.log(`Using MongoDB URI: ${MONGODB_URI.replace(/:\/\/([^:]+):[^@]+@/, '://$1:****@')}`)

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
  // Skip database connection during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    console.log('Skipping database connection during build time')
    return null
  }

  // If we already have a connection, return it
  if (cached.conn) {
    return cached.conn
  }

  // If there's no active connection promise, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Allow buffering per the Stack Overflow advice
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Increase socket timeout
      family: 4, // Use IPv4
      connectTimeoutMS: 30000, // Increase connect timeout
      maxPoolSize: 10, // Increase pool size
    }

    console.log('Connecting to MongoDB with mongoose...')
    
    // Make sure to await the connection
    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('Mongoose connection established successfully')
        return mongoose
      })
      .catch((error) => {
        console.error('Mongoose connection error:', error)
        cached.promise = null
        throw error
      })
  }

  try {
    // Await the promise to get the connection
    cached.conn = await cached.promise
    
    // Ensure mongoose connection is ready (1 = connected)
    const readyState = Number(mongoose.connection.readyState);
    if (readyState !== 1) {
      console.log(`Mongoose connection not ready (state: ${readyState}), waiting...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newReadyState = Number(mongoose.connection.readyState);
      if (newReadyState !== 1) {
        console.error(`Mongoose connection failed to establish in time (state: ${newReadyState})`)
        cached.promise = null
        throw new Error('Failed to establish Mongoose connection')
      }
    }
  } catch (e) {
    console.error('Error resolving MongoDB connection:', e)
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
    console.log('Creating new MongoDB client connection')
    
    cachedClient.promise = MongoClient.connect(MONGODB_URI!, {
      serverSelectionTimeoutMS: 20000, // Increase timeout to 20 seconds
      connectTimeoutMS: 20000, // Connection timeout
      socketTimeoutMS: 45000, // Socket timeout
      maxPoolSize: 10, // Increase pool size
    })
  }

  try {
    cachedClient.client = await cachedClient.promise
    console.log('MongoDB client connected successfully')
  } catch (e) {
    console.error('MongoDB client connection error:', e)
    cachedClient.promise = null
    throw e
  }

  return cachedClient.client
}

export default dbConnect

// Export dbConnect as the primary connection method for Mongoose
export const connectDB = async () => {
  // Skip database connection during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    console.log('Skipping database connection during build time')
    return null
  }
  return await dbConnect()
}

// Export getMongoClient for GridFS usage
export const getMongoDBClient = async () => {
  // Skip database connection during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    console.log('Skipping MongoDB client connection during build time')
    throw new Error('Database connection not available during build time')
  }
  return await getMongoClient()
}

// Export MongoClient for GridFS usage
export { MongoClient }
