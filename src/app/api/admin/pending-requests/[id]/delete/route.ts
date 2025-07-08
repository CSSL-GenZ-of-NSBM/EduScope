import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/db/mongodb"
import ResearchPaper from "@/lib/db/models/ResearchPaper"
import UserActivity, { ActivityType } from "@/lib/db/models/UserActivity"
import { gridfsService } from "@/lib/file-upload/gridfs"
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

    if (session.user.role !== 'admin' && session.user.role !== 'moderator') {
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
    
    if (!paper || !paper.pendingDeletion) {
      return NextResponse.json(
        { success: false, error: "Pending deletion request not found" },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Delete the file from GridFS
      try {
        await gridfsService.deleteFile(paper.fileId)
      } catch (error) {
        console.error('Error deleting file from GridFS:', error)
        // Continue with paper deletion even if file deletion fails
      }

      // Log activity before deletion
      await UserActivity.create({
        userId: new Types.ObjectId(session.user.id),
        activityType: ActivityType.DELETE,
        targetId: paper._id,
        targetTitle: paper.title,
        metadata: {
          action: 'approved_deletion',
          paperField: paper.field,
          moderatedBy: session.user.name
        }
      })

      // Delete the paper from database
      await ResearchPaper.findByIdAndDelete(id)

      return NextResponse.json({
        success: true,
        message: "Delete request approved and paper deleted successfully"
      })
    } else {
      // Reject the deletion request
      await ResearchPaper.findByIdAndUpdate(
        id,
        {
          $set: {
            'pendingDeletion.status': 'rejected'
          }
        }
      )

      return NextResponse.json({
        success: true,
        message: "Delete request rejected successfully"
      })
    }

  } catch (error) {
    console.error("Error processing delete request:", error)
    
    return NextResponse.json(
      { success: false, error: "Failed to process delete request" },
      { status: 500 }
    )
  }
}
