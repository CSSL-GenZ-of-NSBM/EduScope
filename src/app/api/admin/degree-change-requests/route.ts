import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import Degree from "@/lib/db/models/Degree"

// GET /api/admin/degree-change-requests - Get all pending degree change requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    // Check if user is admin, moderator, or super admin
    if (session.user.role !== 'admin' && session.user.role !== 'moderator' && session.user.role !== 'superadmin') {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Admin, moderator, or super admin role required." 
      }, { status: 403 })
    }

    await connectDB()

    // Find all users with pending degree change requests
    const usersWithPendingRequests = await User.find({
      'pendingDegreeChange.status': 'pending'
    })

    // Format the response
    const requests = await Promise.all(usersWithPendingRequests.map(async (user) => {
      let currentDegree = null
      let requestedDegree = null

      // Get current degree info
      if (user.degree) {
        currentDegree = await Degree.findById(user.degree)
      }

      // Get requested degree info
      if (user.pendingDegreeChange?.requestedDegree) {
        requestedDegree = await Degree.findById(user.pendingDegreeChange.requestedDegree)
      }

      return {
        id: user._id,
        userName: user.name,
        userEmail: user.email,
        currentYear: user.year, // Fixed: use 'year' instead of 'currentYear'
        currentDegree: currentDegree ? {
          _id: currentDegree._id,
          name: currentDegree.degreeName, // Use degreeName field
          faculty: currentDegree.faculty
        } : null,
        requestedDegree: requestedDegree ? {
          _id: requestedDegree._id,
          name: requestedDegree.degreeName, // Use degreeName field
          faculty: requestedDegree.faculty
        } : null,
        status: user.pendingDegreeChange.status,
        createdAt: user.pendingDegreeChange.createdAt
      }
    }))

    return NextResponse.json({ 
      success: true,
      requests 
    })

  } catch (error) {
    console.error('Failed to fetch degree change requests:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

// PUT /api/admin/degree-change-requests - Approve or reject degree change request
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    // Check if user is admin, moderator, or super admin
    if (session.user.role !== 'admin' && session.user.role !== 'moderator' && session.user.role !== 'superadmin') {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Admin, moderator, or super admin role required." 
      }, { status: 403 })
    }

    await connectDB()

    const { userId, action, reason } = await request.json()

    if (!userId || !action || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid request parameters" 
      }, { status: 400 })
    }

    // Find the user with pending degree change request
    const user = await User.findById(userId)
    if (!user || !user.pendingDegreeChange || user.pendingDegreeChange.status !== 'pending') {
      return NextResponse.json({ 
        success: false, 
        error: "No pending degree change request found for this user" 
      }, { status: 404 })
    }

    if (action === 'approve') {
      // Update user's degree to the requested degree
      await User.findByIdAndUpdate(userId, {
        degree: user.pendingDegreeChange.requestedDegree,
        pendingDegreeChange: null,
        updatedAt: new Date()
      })

      return NextResponse.json({ 
        success: true, 
        message: "Degree change request approved successfully" 
      })

    } else if (action === 'reject') {
      // Remove the pending degree change request
      await User.findByIdAndUpdate(userId, {
        pendingDegreeChange: null,
        updatedAt: new Date()
      })

      return NextResponse.json({ 
        success: true, 
        message: "Degree change request rejected successfully" 
      })
    }

  } catch (error) {
    console.error('Failed to process degree change request:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
