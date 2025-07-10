import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/db/mongodb"
import ResearchPaper from "@/lib/db/models/ResearchPaper"
import UserActivity, { ActivityType } from "@/lib/db/models/UserActivity"
import { Types } from "mongoose"

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

    if (session.user.role !== 'admin' && session.user.role !== 'moderator' && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      )
    }

    const { id } = params
    const { action, reason } = await request.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      )
    }

    await connectDB()

    const paper = await ResearchPaper.findById(id)
    
    if (!paper || !paper.pendingChanges) {
      return NextResponse.json(
        { success: false, error: "Pending update request not found" },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Apply the pending changes to the main paper
      const updates = paper.pendingChanges
      
      const updatedPaper = await ResearchPaper.findByIdAndUpdate(
        id,
        {
          $set: {
            ...(updates.title && { title: updates.title }),
            ...(updates.authors && { authors: updates.authors }),
            ...(updates.abstract && { abstract: updates.abstract }),
            ...(updates.field && { field: updates.field }),
            ...(updates.faculty && { faculty: updates.faculty }),
            ...(updates.year && { year: updates.year }),
            ...(updates.keywords && { keywords: updates.keywords }),
            ...(updates.tags && { tags: updates.tags }),
            ...(updates.supervisor && { supervisor: updates.supervisor }),
            ...(updates.department && { department: updates.department }),
          },
          $unset: {
            pendingChanges: ""
          }
        },
        { new: true, runValidators: true }
      )

      // Log activity
      await UserActivity.create({
        userId: new Types.ObjectId(session.user.id),
        activityType: ActivityType.UPDATE,
        targetId: paper._id,
        targetTitle: paper.title,
        metadata: {
          action: 'approved_update',
          paperField: paper.field,
          moderatedBy: session.user.name
        }
      })

      return NextResponse.json({
        success: true,
        data: updatedPaper,
        message: "Update request approved and changes applied successfully"
      })
    } else {
      // Reject the update request
      await ResearchPaper.findByIdAndUpdate(
        id,
        {
          $set: {
            'pendingChanges.status': 'rejected'
          }
        }
      )

      return NextResponse.json({
        success: true,
        message: "Update request rejected successfully"
      })
    }

  } catch (error) {
    console.error("Error processing update request:", error)
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to process update request" },
      { status: 500 }
    )
  }
}
