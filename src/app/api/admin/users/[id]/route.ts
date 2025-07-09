import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import ResearchPaper from "@/lib/db/models/ResearchPaper"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

// GET /api/admin/users/[id] - Get individual user profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Admin role required." 
      }, { status: 403 })
    }

    await connectDB()

    const userId = params.id
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid user ID" 
      }, { status: 400 })
    }

    // Get user profile
    const user = await User.findById(userId).select('-password')
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    // Get user statistics
    const researchPapersCount = await ResearchPaper.countDocuments({ 
      uploadedBy: userId 
    })

    // TODO: Add ideas count when ideas collection is implemented
    const ideasCount = 0

    const userProfile = {
      ...user.toObject(),
      researchPapers: researchPapersCount,
      ideas: ideasCount
    }

    return NextResponse.json({ 
      success: true, 
      data: userProfile 
    })

  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

// PUT /api/admin/users/[id] - Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Admin role required." 
      }, { status: 403 })
    }

    await connectDB()

    const userId = params.id
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid user ID" 
      }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, studentId, faculty, role, year, password } = body

    // Validate required fields
    if (!name || !email || !studentId || !faculty || !role) {
      return NextResponse.json({ 
        success: false, 
        error: "All fields are required" 
      }, { status: 400 })
    }

    // Validate year if provided
    if (year !== null && year !== undefined && year !== "not-set") {
      const yearNum = parseInt(year)
      if (isNaN(yearNum) || yearNum < 1 || yearNum > 4) {
        return NextResponse.json({ 
          success: false, 
          error: "Academic year must be between 1 and 4" 
        }, { status: 400 })
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid email format" 
      }, { status: 400 })
    }

    // Validate role
    const validRoles = ['student', 'moderator', 'admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid role" 
      }, { status: 400 })
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: userId } 
    })
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: "Email is already taken by another user" 
      }, { status: 400 })
    }

    // Check if student ID is already taken by another user
    const existingStudentId = await User.findOne({ 
      studentId, 
      _id: { $ne: userId } 
    })
    if (existingStudentId) {
      return NextResponse.json({ 
        success: false, 
        error: "Student ID is already taken by another user" 
      }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      studentId,
      faculty,
      role,
      year: year === "not-set" || year === null || year === undefined ? null : parseInt(year),
      updatedAt: new Date()
    }

    // Hash password if provided
    if (password && password.trim()) {
      if (password.length < 6) {
        return NextResponse.json({ 
          success: false, 
          error: "Password must be at least 6 characters long" 
        }, { status: 400 })
      }
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    )

    if (!updatedUser) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedUser,
      message: "User updated successfully" 
    })

  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user (optional functionality)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Admin role required." 
      }, { status: 403 })
    }

    await connectDB()

    const userId = params.id
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid user ID" 
      }, { status: 400 })
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot delete your own account" 
      }, { status: 400 })
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId)
    if (!deletedUser) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    // TODO: Also delete user's research papers and ideas when implementing soft delete
    // For now, we'll keep the content but remove the association

    return NextResponse.json({ 
      success: true, 
      message: "User deleted successfully" 
    })

  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
