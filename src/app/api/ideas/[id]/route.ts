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

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
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
      .populate('author', 'name email studentId faculty')
      .populate('collaborators', 'name email studentId')
      .lean() as any

    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await Idea.findByIdAndUpdate(id, { $inc: { viewCount: 1 } })

    // Log the view activity
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      await auditLogger.log({
        action: AuditAction.IDEA_VIEW,
        userId: session.user.id,
        userEmail: session.user.email!,
        userRole: session.user.role || 'student',
        resource: AuditResource.IDEA,
        resourceId: id,
        details: {
          ideaId: id,
          title: idea.title
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
    }

    return NextResponse.json({
      success: true,
      data: idea
    })

  } catch (error) {
    console.error('Error fetching idea:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch idea' },
      { status: 500 }
    )
  }
}

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

    const { id } = params
    const body = await request.json()

    const idea = await Idea.findById(id)
    
    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      )
    }

    // Check if user is the author or has admin/moderator role
    const canEdit = idea.author.toString() === session.user.id || 
                   ['admin', 'moderator', 'superadmin'].includes(session.user.role)

    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to edit this idea' },
        { status: 403 }
      )
    }

    // Update allowed fields
    const updateFields: any = {}
    const allowedFields = [
      'title', 'description', 'field', 'tags', 'priority', 'feasibility',
      'estimatedCost', 'targetAudience', 'expectedOutcome', 'resourcesNeeded',
      'isImplemented', 'implementationDetails'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateFields[field] = body[field]
      }
    })

    // If admin/moderator is updating status
    if (['admin', 'moderator', 'superadmin'].includes(session.user.role) && body.status) {
      updateFields.status = body.status
    }

    const updatedIdea = await Idea.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('author', 'name email studentId')

    // Log the activity
    await auditLogger.log({
      action: AuditAction.IDEA_UPDATE,
      userId: session.user.id,
      userEmail: session.user.email!,
      userRole: session.user.role || 'student',
      resource: AuditResource.IDEA,
      resourceId: id,
      details: {
        ideaId: id,
        title: updatedIdea.title,
        updatedFields: Object.keys(updateFields)
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      data: updatedIdea,
      message: 'Idea updated successfully'
    })

  } catch (error) {
    console.error('Error updating idea:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update idea' },
      { status: 500 }
    )
  }
}

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

    const { id } = params
    const idea = await Idea.findById(id)
    
    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      )
    }

    // Check if user is the author or has admin/moderator role
    const canDelete = idea.author.toString() === session.user.id || 
                     ['admin', 'moderator', 'superadmin'].includes(session.user.role)

    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this idea' },
        { status: 403 }
      )
    }

    await Idea.findByIdAndDelete(id)

    // Log the activity
    await auditLogger.log({
      action: AuditAction.IDEA_DELETE,
      userId: session.user.id,
      userEmail: session.user.email!,
      userRole: session.user.role || 'student',
      resource: AuditResource.IDEA,
      resourceId: id,
      details: {
        ideaId: id,
        title: idea.title
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      message: 'Idea deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting idea:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete idea' },
      { status: 500 }
    )
  }
}
