import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import Degree from "@/lib/db/models/Degree"

// GET /api/degrees - Get all degrees (public endpoint for forms)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const faculty = searchParams.get('faculty')
    
    // Build query
    const query: any = {}
    
    if (faculty && faculty !== 'all') {
      query.faculty = faculty
    }

    // Get all degrees, sorted by name
    const degrees = await Degree.find(query)
      .sort({ degreeName: 1 })
      .lean()

    return NextResponse.json({ 
      success: true, 
      data: degrees
    })

  } catch (error) {
    console.error('Failed to fetch degrees:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
