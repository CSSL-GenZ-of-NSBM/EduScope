import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import IdeaComment from '@/lib/db/models/IdeaComment'
import { Idea } from '@/lib/db/models/Idea'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { AuditAction, AuditResource } from '@/types'
import { auditLogger } from '@/lib/audit/audit-logger'

interface RouteParams {
  params: {
    id: string
    commentId: string
  }
}

// PUT /api/ideas/[id]/comments/[commentId] - Update a comment
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const connection = await connectDB()
    
    // Handle build-time case
    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      )
    }

    const { id, commentId } = params
    const { content } = await request.json()

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      )
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Comment cannot exceed 1000 characters' },
        { status: 400 }
      )
    }

    // Find the comment
    const comment = await IdeaComment.findById(commentId)
    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Verify comment belongs to the idea
    if (comment.ideaId.toString() !== id) {
      return NextResponse.json(
        { success: false, error: 'Comment does not belong to this idea' },
        { status: 400 }
      )
    }

    // Check if user owns the comment or is admin/moderator
    const canEdit = comment.userId.toString() === session.user.id || 
                   ['admin', 'moderator', 'superadmin'].includes(session.user.role)

    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to edit this comment' },
        { status: 403 }
      )
    }

    // Update comment
    const updatedComment = await IdeaComment.findByIdAndUpdate(
      commentId,
      { 
        content: content.trim(),
        isEdited: true
      },
      { new: true }
    )

    // Get idea details for logging
    const idea = await Idea.findById(id, 'title')

    // Log the activity
    await auditLogger.log({
      action: AuditAction.IDEA_COMMENT_UPDATE,
      userId: session.user.id,
      userEmail: session.user.email!,
      userRole: session.user.role || 'student',
      resource: AuditResource.IDEA,
      resourceId: id,
      details: {
        ideaId: id,
        commentId,
        ideaTitle: idea?.title,
        newContentLength: content.trim().length
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      data: updatedComment,
      message: 'Comment updated successfully'
    })

  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

// DELETE /api/ideas/[id]/comments/[commentId] - Delete a comment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const connection = await connectDB()
    
    // Handle build-time case
    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      )
    }

    const { id, commentId } = params

    // Find the comment
    const comment = await IdeaComment.findById(commentId)
    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Verify comment belongs to the idea
    if (comment.ideaId.toString() !== id) {
      return NextResponse.json(
        { success: false, error: 'Comment does not belong to this idea' },
        { status: 400 }
      )
    }

    // Check if user owns the comment or is admin/moderator
    const canDelete = comment.userId.toString() === session.user.id || 
                     ['admin', 'moderator', 'superadmin'].includes(session.user.role)

    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this comment' },
        { status: 403 }
      )
    }

    // Delete comment
    await IdeaComment.findByIdAndDelete(commentId)

    // Update idea's comment count
    await Idea.findByIdAndUpdate(id, { $inc: { comments: -1 } })

    // Get idea details for logging
    const idea = await Idea.findById(id, 'title')

    // Log the activity
    await auditLogger.log({
      action: AuditAction.IDEA_COMMENT_DELETE,
      userId: session.user.id,
      userEmail: session.user.email!,
      userRole: session.user.role || 'student',
      resource: AuditResource.IDEA,
      resourceId: id,
      details: {
        ideaId: id,
        commentId,
        ideaTitle: idea?.title,
        deletedContent: comment.content.substring(0, 100) // First 100 chars for audit
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
