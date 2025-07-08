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

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Paper ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const paper = await ResearchPaper.findById(id)
      .populate('uploadedBy', 'name studentId faculty')
      .lean() as any

    if (!paper) {
      return NextResponse.json(
        { success: false, error: "Research paper not found" },
        { status: 404 }
      )
    }

    // Check if paper is approved or user has access
    const session = await getServerSession(authOptions)
    
    if (paper.status !== 'approved' && (!session?.user || session.user.id !== paper.uploadedBy?._id?.toString())) {
      return NextResponse.json(
        { success: false, error: "Research paper not found" },
        { status: 404 }
      )
    }

    // Track view if user is authenticated and specifically requests view tracking
    // Don't track view if this is a download request
    const shouldTrackView = request.nextUrl.searchParams.get('trackView') === 'true'
    const isDownloadRequest = request.nextUrl.searchParams.get('download') === 'true'
    
    if (session?.user?.id && shouldTrackView && !isDownloadRequest) {
      const userId = new Types.ObjectId(session.user.id)
      
      try {
        // Use atomic operation to prevent race conditions
        const updateResult = await ResearchPaper.findOneAndUpdate(
          { 
            _id: id,
            viewedBy: { $ne: userId } // Only update if user hasn't viewed yet
          },
          {
            $addToSet: { viewedBy: userId },
            $inc: { viewCount: 1 }
          },
          { new: true }
        )
        
        // Only create activity if the update actually happened (user wasn't already in viewedBy)
        if (updateResult) {
          await UserActivity.create({
            userId: userId,
            activityType: ActivityType.VIEW,
            targetId: paper._id,
            targetTitle: paper.title,
            metadata: {
              paperField: paper.field,
              paperYear: paper.year,
              fileName: paper.fileName
            }
          })
          
          // Update the paper object for response
          paper.viewCount = updateResult.viewCount
          paper.viewedBy = updateResult.viewedBy
        }
      } catch (error) {
        console.error('Error tracking view:', error)
        // Don't fail the whole request if view tracking fails
      }
    }

    return NextResponse.json({
      success: true,
      data: paper
    })

  } catch (error) {
    console.error("Research paper fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch research paper" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const body = await request.json()

    await connectDB()

    const paper = await ResearchPaper.findById(id)
    
    if (!paper) {
      return NextResponse.json(
        { success: false, error: "Research paper not found" },
        { status: 404 }
      )
    }

    // Check if user owns the paper or is admin
    if (paper.uploadedBy.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      )
    }

    // Update the paper
    const updatedPaper = await ResearchPaper.findByIdAndUpdate(
      id,
      { ...body, uploadedBy: paper.uploadedBy }, // Keep original uploader
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name studentId faculty')

    return NextResponse.json({
      success: true,
      data: updatedPaper,
      message: "Research paper updated successfully"
    })

  } catch (error) {
    console.error("Research paper update error:", error)
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to update research paper" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const body = await request.json()
    const { action } = body

    await connectDB()

    const paper = await ResearchPaper.findById(id)
    
    if (!paper) {
      return NextResponse.json(
        { success: false, error: "Research paper not found" },
        { status: 404 }
      )
    }

    // Handle download count increment
    if (action === 'download') {
      const userId = new Types.ObjectId(session.user.id)
      
      try {
        // Use atomic operation to prevent race conditions
        const updateResult = await ResearchPaper.findOneAndUpdate(
          { 
            _id: id,
            downloadedBy: { $ne: userId } // Only update if user hasn't downloaded yet
          },
          { 
            $addToSet: { downloadedBy: userId },
            $inc: { downloadCount: 1 } 
          },
          { new: true }
        )

        // Only create activity if the update actually happened (user wasn't already in downloadedBy)
        if (updateResult) {
          await UserActivity.create({
            userId: userId,
            activityType: ActivityType.DOWNLOAD,
            targetId: paper._id,
            targetTitle: paper.title,
            metadata: {
              paperField: paper.field,
              paperYear: paper.year,
              fileName: paper.fileName
            }
          })

          return NextResponse.json({
            success: true,
            data: updateResult,
            message: "Download count updated successfully"
          })
        } else {
          // User has already downloaded, don't increment count but still return success
          return NextResponse.json({
            success: true,
            data: paper,
            message: "Paper already downloaded by user"
          })
        }
      } catch (error) {
        console.error('Error tracking download:', error)
        return NextResponse.json(
          { success: false, error: "Failed to update download count" },
          { status: 500 }
        )
      }
    }

    // Handle save/unsave functionality
    if (action === 'save' || action === 'unsave') {
      const userId = new Types.ObjectId(session.user.id)
      
      try {
        let updateResult;
        
        if (action === 'save') {
          // Add user to savedBy array and increment save count
          updateResult = await ResearchPaper.findOneAndUpdate(
            { 
              _id: id,
              savedBy: { $ne: userId } // Only update if user hasn't saved yet
            },
            { 
              $addToSet: { savedBy: userId },
              $inc: { saveCount: 1 } 
            },
            { new: true }
          )

          // Only create activity if the update actually happened
          if (updateResult) {
            await UserActivity.create({
              userId: userId,
              activityType: ActivityType.SAVE,
              targetId: paper._id,
              targetTitle: paper.title,
              metadata: {
                paperField: paper.field,
                paperYear: paper.year,
                fileName: paper.fileName
              }
            })

            return NextResponse.json({
              success: true,
              data: updateResult,
              message: "Paper saved successfully"
            })
          } else {
            // User has already saved, return current paper
            return NextResponse.json({
              success: true,
              data: paper,
              message: "Paper already saved by user"
            })
          }
        } else { // unsave
          // Remove user from savedBy array and decrement save count
          updateResult = await ResearchPaper.findOneAndUpdate(
            { 
              _id: id,
              savedBy: userId // Only update if user has saved
            },
            { 
              $pull: { savedBy: userId },
              $inc: { saveCount: -1 } 
            },
            { new: true }
          )

          if (updateResult) {
            // Create unsave activity
            await UserActivity.create({
              userId: userId,
              activityType: ActivityType.UNSAVE,
              targetId: paper._id,
              targetTitle: paper.title,
              metadata: {
                paperField: paper.field,
                paperYear: paper.year,
                fileName: paper.fileName
              }
            })

            return NextResponse.json({
              success: true,
              data: updateResult,
              message: "Paper unsaved successfully"
            })
          } else {
            // User hasn't saved this paper, return current paper
            return NextResponse.json({
              success: true,
              data: paper,
              message: "Paper was not saved by user"
            })
          }
        }
      } catch (error) {
        console.error('Error handling save/unsave:', error)
        return NextResponse.json(
          { success: false, error: "Failed to update paper save status" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Research paper update error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update research paper" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await connectDB()

    const paper = await ResearchPaper.findById(id)
    
    if (!paper) {
      return NextResponse.json(
        { success: false, error: "Research paper not found" },
        { status: 404 }
      )
    }

    // Check if user owns the paper or is admin
    if (paper.uploadedBy.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      )
    }

    // Create deletion activity record before deleting
    const userId = new Types.ObjectId(session.user.id)
    await UserActivity.create({
      userId: userId,
      activityType: ActivityType.DELETE,
      targetId: paper._id,
      targetTitle: paper.title,
      metadata: {
        paperField: paper.field,
        paperYear: paper.year,
        fileName: paper.fileName
      }
    })

    await ResearchPaper.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Research paper deleted successfully"
    })

  } catch (error) {
    console.error("Research paper deletion error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete research paper" },
      { status: 500 }
    )
  }
}
