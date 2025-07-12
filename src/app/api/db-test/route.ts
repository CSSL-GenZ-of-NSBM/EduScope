import { connectDB } from '@/lib/db/mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if we're in build time
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return NextResponse.json({
        success: false,
        message: 'Database connection not available during build time',
        timestamp: new Date().toISOString()
      })
    }

    const connection = await connectDB()
    
    if (!connection) {
      return NextResponse.json({
        success: false,
        message: 'Database connection skipped during build time',
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    )
  }
}
