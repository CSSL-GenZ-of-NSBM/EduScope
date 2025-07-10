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
    
    if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
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
    
    if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
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

    // Get the target user to check their role
    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    // Role hierarchy authorization check
    const currentUserRole = session.user.role
    const targetUserRole = targetUser.role

    // Super admin can update anyone
    // Regular admin cannot update other admins or super admins
    if (currentUserRole === 'admin' && ['admin', 'superadmin'].includes(targetUserRole)) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Cannot modify admin or super admin accounts." 
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, studentId, faculty, role, year, degree, password } = body

    // Validate required fields
    if (!name || !email || !studentId || !faculty || !role) {
      return NextResponse.json({ 
        success: false, 
        error: "All fields are required" 
      }, { status: 400 })
    }

    // Role validation based on current user's permissions
    let validRoles = ['student', 'moderator']
    if (currentUserRole === 'superadmin') {
      // Super admin can assign any role including admin and superadmin
      validRoles = ['student', 'moderator', 'admin', 'superadmin']
    } else if (currentUserRole === 'admin') {
      // Regular admin can assign student, moderator, and admin roles
      validRoles = ['student', 'moderator', 'admin']
    }

    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid role. Available roles: ${validRoles.join(', ')}` 
      }, { status: 400 })
    }

    // Prevent non-super-admins from creating/updating to super admin
    if (role === 'superadmin' && currentUserRole !== 'superadmin') {
      return NextResponse.json({ 
        success: false, 
        error: "Only super admin can assign super admin role" 
      }, { status: 403 })
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
    // (Role validation moved above with authorization check)

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
      degree: degree === "not-set" || degree === null || degree === undefined ? null : degree,
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
    
    if (!session?.user?.role || !['admin', 'superadmin'].includes(session.user.role)) {
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

    // Get the target user to check their role
    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    // Role hierarchy authorization check for deletion
    const currentUserRole = session.user.role
    const targetUserRole = targetUser.role

    // Regular admin cannot delete other admins or super admins
    if (currentUserRole === 'admin' && ['admin', 'superadmin'].includes(targetUserRole)) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Cannot delete admin or super admin accounts." 
      }, { status: 403 })
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
