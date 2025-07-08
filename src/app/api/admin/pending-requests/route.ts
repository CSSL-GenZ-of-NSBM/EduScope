import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/db/mongodb"
import ResearchPaper from "@/lib/db/models/ResearchPaper"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin' && session.user.role !== 'moderator') {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      )
    }

    await connectDB()

    // Get papers with pending updates
    const pendingUpdates = await ResearchPaper.find({
      'pendingChanges.status': 'pending'
    }).populate('uploadedBy', 'name email')
      .populate('pendingChanges.requestedBy', 'name email')
      .lean()

    // Get papers with pending deletions
    const pendingDeletions = await ResearchPaper.find({
      'pendingDeletion.status': 'pending'
    }).populate('uploadedBy', 'name email')
      .populate('pendingDeletion.requestedBy', 'name email')
      .lean()

    return NextResponse.json({
      success: true,
      data: {
        pendingUpdates,
        pendingDeletions
      }
    })

  } catch (error) {
    console.error("Error fetching pending requests:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending requests" },
      { status: 500 }
    )
  }
}
