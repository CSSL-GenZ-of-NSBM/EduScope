import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { Idea } from '@/lib/db/models/Idea'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { AuditAction, AuditResource } from '@/types'
import { auditLogger } from '@/lib/audit/audit-logger'

interface RouteParams {
  params: {
    slug: string
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
    
    const { slug } = params
    
    const idea = await Idea.findOne({ slug })
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
    await Idea.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } })

    // Log the view activity
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      await auditLogger.log({
        action: AuditAction.IDEA_VIEW,
        userId: session.user.id,
        userEmail: session.user.email!,
        userRole: session.user.role,
        resource: AuditResource.IDEA,
        resourceId: idea._id.toString(),
        details: {
          title: idea.title,
          slug: idea.slug
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: idea
    })

  } catch (error) {
    console.error('Error fetching idea by slug:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
