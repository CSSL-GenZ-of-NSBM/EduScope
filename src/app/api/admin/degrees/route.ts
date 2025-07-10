import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/mongodb"
import Degree from "@/lib/db/models/Degree"

// GET /api/admin/degrees - Get all degrees with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Admin or superadmin role required." 
      }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const faculty = searchParams.get('faculty')
    const university = searchParams.get('university')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { degreeName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (faculty && faculty !== 'all') {
      query.faculty = faculty
    }
    
    if (university && university !== 'all') {
      query.affiliatedUniversity = university
    }

    // Get degrees with pagination
    const degrees = await Degree.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Degree.countDocuments(query)

    return NextResponse.json({ 
      success: true, 
      data: degrees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Failed to fetch degrees:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

// POST /api/admin/degrees - Create a new degree
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Admin role required." 
      }, { status: 403 })
    }

    await connectDB()

    const body = await request.json()
    const { 
      degreeName, 
      faculty, 
      affiliatedUniversity, 
      duration, 
      price, 
      modules,
      description,
      admissionRequirements,
      careerPaths
    } = body

    // Validate required fields
    if (!degreeName || !faculty || !affiliatedUniversity || !duration || price === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: "Required fields: degreeName, faculty, affiliatedUniversity, duration, price" 
      }, { status: 400 })
    }

    // Validate duration
    if (duration < 1 || duration > 6) {
      return NextResponse.json({ 
        success: false, 
        error: "Duration must be between 1 and 6 years" 
      }, { status: 400 })
    }

    // Validate price
    if (price < 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Price cannot be negative" 
      }, { status: 400 })
    }

    // Check if degree name already exists
    const existingDegree = await Degree.findOne({ degreeName })
    if (existingDegree) {
      return NextResponse.json({ 
        success: false, 
        error: "A degree with this name already exists" 
      }, { status: 400 })
    }

    // Create degree
    const newDegree = new Degree({
      degreeName,
      faculty,
      affiliatedUniversity,
      duration,
      price,
      modules: modules || [],
      description,
      admissionRequirements: admissionRequirements || [],
      careerPaths: careerPaths || [],
      isActive: true
    })

    await newDegree.save()

    return NextResponse.json({ 
      success: true, 
      data: newDegree,
      message: "Degree created successfully" 
    })

  } catch (error) {
    console.error('Failed to create degree:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
