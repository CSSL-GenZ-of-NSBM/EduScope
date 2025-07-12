import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
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
    const idea = await Idea.findById(id)
    
    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      )
    }

    const userId = session.user.id
    const hasVoted = idea.votedBy.includes(userId)

    let updatedIdea
    let action

    if (hasVoted) {
      // Remove vote
      updatedIdea = await Idea.findByIdAndUpdate(
        id,
        {
          $inc: { votes: -1 },
          $pull: { votedBy: userId }
        },
        { new: true }
      )
      action = 'unvoted'
    } else {
      // Add vote
      updatedIdea = await Idea.findByIdAndUpdate(
        id,
        {
          $inc: { votes: 1 },
          $addToSet: { votedBy: userId }
        },
        { new: true }
      )
      action = 'voted'
    }

    // Log the activity
    await auditLogger.log({
      action: AuditAction.IDEA_VOTE,
      userId: session.user.id,
      userEmail: session.user.email!,
      userRole: session.user.role || 'student',
      resource: AuditResource.IDEA,
      resourceId: id,
      details: {
        ideaId: id,
        title: idea.title,
        action,
        newVoteCount: updatedIdea.votes
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      data: {
        votes: updatedIdea.votes,
        hasVoted: !hasVoted,
        action
      },
      message: hasVoted ? 'Vote removed' : 'Vote added'
    })

  } catch (error) {
    console.error('Error toggling vote:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle vote' },
      { status: 500 }
    )
  }
}
