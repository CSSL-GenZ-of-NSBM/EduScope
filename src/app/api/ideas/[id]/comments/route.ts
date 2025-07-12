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
  }
}

// GET /api/ideas/[id]/comments - Fetch comments for an idea
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const connection = await connectDB()
    
    // Handle build-time case
    if (!connection) {
      return NextResponse.json({
        success: true,
        data: {
          comments: [],
          totalComments: 0
        }
      })
    }

    const { id } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Verify idea exists
    const idea = await Idea.findById(id)
    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      )
    }

    // Fetch comments with pagination
    const comments = await IdeaComment.find({ ideaId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalComments = await IdeaComment.countDocuments({ ideaId: id })

    return NextResponse.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total: totalComments,
          totalPages: Math.ceil(totalComments / limit),
          hasNext: page * limit < totalComments,
          hasPrev: page > 1
        },
        totalComments
      }
    })

  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/ideas/[id]/comments - Add a comment to an idea
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const { id } = params
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

    // Verify idea exists
    const idea = await Idea.findById(id)
    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      )
    }

    // Create comment
    const comment = new IdeaComment({
      ideaId: id,
      userId: session.user.id,
      content: content.trim(),
      author: {
        name: session.user.name,
        email: session.user.email,
        studentId: session.user.studentId,
        faculty: session.user.faculty
      }
    })

    await comment.save()

    // Update idea's comment count
    await Idea.findByIdAndUpdate(id, { $inc: { comments: 1 } })

    // Log the activity
    await auditLogger.log({
      action: AuditAction.IDEA_COMMENT,
      userId: session.user.id,
      userEmail: session.user.email!,
      userRole: session.user.role || 'student',
      resource: AuditResource.IDEA,
      resourceId: id,
      details: {
        ideaId: id,
        commentId: comment._id.toString(),
        ideaTitle: idea.title,
        commentLength: content.trim().length
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      data: comment,
      message: 'Comment added successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
