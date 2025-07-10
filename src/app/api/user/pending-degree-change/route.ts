import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"

// GET /api/user/pending-degree-change - Get pending degree change request
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    await connectDB()

    // Get current user with pending degree change
    const user = await User.findById(session.user.id).select('pendingDegreeChange')
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    if (user.pendingDegreeChange && user.pendingDegreeChange.status === 'pending') {
      return NextResponse.json({ 
        success: true,
        hasPendingRequest: true,
        request: {
          id: user._id,
          currentDegree: user.pendingDegreeChange.currentDegree,
          requestedDegree: user.pendingDegreeChange.requestedDegree,
          status: user.pendingDegreeChange.status,
          createdAt: user.pendingDegreeChange.createdAt
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      hasPendingRequest: false,
      request: null
    })

  } catch (error) {
    console.error('Failed to fetch pending degree change request:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
