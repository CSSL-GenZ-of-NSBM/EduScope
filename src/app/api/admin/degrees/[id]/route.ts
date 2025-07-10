import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/mongodb"
import Degree from "@/lib/db/models/Degree"
import { ObjectId } from "mongodb"

// GET /api/admin/degrees/[id] - Get individual degree
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Admin or super admin role required." 
      }, { status: 403 })
    }

    await connectDB()

    const degreeId = params.id
    if (!ObjectId.isValid(degreeId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid degree ID" 
      }, { status: 400 })
    }

    // Get degree
    const degree = await Degree.findById(degreeId)
    if (!degree) {
      return NextResponse.json({ 
        success: false, 
        error: "Degree not found" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: degree 
    })

  } catch (error) {
    console.error('Failed to fetch degree:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

// PUT /api/admin/degrees/[id] - Update degree
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Admin or super admin role required." 
      }, { status: 403 })
    }

    await connectDB()

    const degreeId = params.id
    if (!ObjectId.isValid(degreeId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid degree ID" 
      }, { status: 400 })
    }

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
      careerPaths,
      isActive
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

    // Check if degree name already exists (excluding current degree)
    const existingDegree = await Degree.findOne({ 
      degreeName, 
      _id: { $ne: degreeId } 
    })
    if (existingDegree) {
      return NextResponse.json({ 
        success: false, 
        error: "A degree with this name already exists" 
      }, { status: 400 })
    }

    // Update degree
    const updatedDegree = await Degree.findByIdAndUpdate(
      degreeId,
      {
        degreeName,
        faculty,
        affiliatedUniversity,
        duration,
        price,
        modules: modules || [],
        description,
        admissionRequirements: admissionRequirements || [],
        careerPaths: careerPaths || [],
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!updatedDegree) {
      return NextResponse.json({ 
        success: false, 
        error: "Degree not found" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedDegree,
      message: "Degree updated successfully" 
    })

  } catch (error) {
    console.error('Failed to update degree:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

// DELETE /api/admin/degrees/[id] - Delete degree
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Admin or super admin role required." 
      }, { status: 403 })
    }

    await connectDB()

    const degreeId = params.id
    if (!ObjectId.isValid(degreeId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid degree ID" 
      }, { status: 400 })
    }

    // Check if any users are enrolled in this degree
    // We'll implement this check once we add the degree field to users
    
    // Delete degree
    const deletedDegree = await Degree.findByIdAndDelete(degreeId)
    if (!deletedDegree) {
      return NextResponse.json({ 
        success: false, 
        error: "Degree not found" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Degree deleted successfully" 
    })

  } catch (error) {
    console.error('Failed to delete degree:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
