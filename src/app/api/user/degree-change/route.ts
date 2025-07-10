import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import { ObjectId } from "mongodb"

// POST /api/user/degree-change - Submit a degree change request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    await connectDB()

    const { newDegree } = await request.json()

    if (!newDegree) {
      return NextResponse.json({ 
        success: false, 
        error: "New degree is required" 
      }, { status: 400 })
    }

    // Validate that the new degree ID is a valid ObjectId
    if (!ObjectId.isValid(newDegree)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid degree ID" 
      }, { status: 400 })
    }

    // Get current user
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    // Check if user already has a pending degree change request
    if (user.pendingDegreeChange) {
      return NextResponse.json({ 
        success: false, 
        error: "You already have a pending degree change request" 
      }, { status: 400 })
    }

    // Check if the requested degree is different from current degree
    if (user.degree && user.degree.toString() === newDegree) {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot request a change to your current degree" 
      }, { status: 400 })
    }

    // Create degree change request
    const degreeChangeRequest = {
      currentDegree: user.degree,
      requestedDegree: newDegree,
      status: 'pending',
      createdAt: new Date()
    }

    // Update user with pending degree change request
    await User.findByIdAndUpdate(
      session.user.id,
      { 
        pendingDegreeChange: degreeChangeRequest,
        updatedAt: new Date()
      }
    )

    return NextResponse.json({ 
      success: true, 
      message: "Degree change request submitted successfully" 
    })

  } catch (error) {
    console.error('Failed to submit degree change request:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
