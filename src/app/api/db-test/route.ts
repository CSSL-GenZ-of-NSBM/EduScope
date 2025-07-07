import dbConnect from '@/lib/db/mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    await dbConnect()
    
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
