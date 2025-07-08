import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/db/mongodb"
import ResearchPaper from "@/lib/db/models/ResearchPaper"

interface Params {
  id: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = params
    const updateData = await request.json()

    await connectDB()

    const paper = await ResearchPaper.findById(id)
    
    if (!paper) {
      return NextResponse.json(
        { success: false, error: "Research paper not found" },
        { status: 404 }
      )
    }

    // Check if user owns the paper
    if (paper.uploadedBy.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      )
    }

    // Store the update request in the paper's metadata
    // This creates a pending change request that moderators can review
    const updatedPaper = await ResearchPaper.findByIdAndUpdate(
      id,
      {
        $set: {
          'pendingChanges': {
            ...updateData,
            requestedAt: new Date(),
            requestedBy: session.user.id,
            status: 'pending'
          }
        }
      },
      { new: true, runValidators: false } // Skip validation for pending changes
    )

    return NextResponse.json({
      success: true,
      data: updatedPaper,
      message: "Update request submitted successfully. Moderators will review your changes."
    })

  } catch (error) {
    console.error("Research paper update request error:", error)
    
    return NextResponse.json(
      { success: false, error: "Failed to submit update request" },
      { status: 500 }
    )
  }
}
