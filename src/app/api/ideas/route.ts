import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { Idea } from '@/lib/db/models/Idea'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { AcademicField, ContentStatus, AuditAction, AuditResource } from '@/types'
import { auditLogger } from '@/lib/audit/audit-logger'

export async function GET(request: NextRequest) {
  try {
    const connection = await connectDB()
    
    // Handle build-time case
    if (!connection) {
      return NextResponse.json({
        success: true,
        data: {
          ideas: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          },
          stats: {
            totalIdeas: 0,
            totalVotes: 0,
            totalViews: 0,
            totalComments: 0,
            implementedIdeas: 0,
            trendingThisWeek: 0
          }
        }
      })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const field = searchParams.get('field') as AcademicField
    const status = searchParams.get('status') as ContentStatus
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') === 'asc' ? 1 : -1
    const trending = searchParams.get('trending') === 'true'
    const popular = searchParams.get('popular') === 'true'

    const skip = (page - 1) * limit

    // Build query
    let query: any = {}
    
    // Default to approved ideas for public view
    if (!status) {
      query.status = ContentStatus.APPROVED
    } else {
      query.status = status
    }

    if (field) {
      query.field = field
    }

    if (search) {
      query.$text = { $search: search }
    }

    // Special filters
    if (trending) {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query.createdAt = { $gte: weekAgo }
      query.votes = { $gte: 5 }
    }

    if (popular) {
      query.$or = [
        { votes: { $gte: 10 } },
        { viewCount: { $gte: 50 } }
      ]
    }

    // Execute query with pagination
    const ideas = await Idea.find(query)
      .populate('author', 'name email studentId')
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Idea.countDocuments(query)

    // Calculate stats
    const stats = await Idea.aggregate([
      { $match: { status: ContentStatus.APPROVED } },
      {
        $group: {
          _id: null,
          totalIdeas: { $sum: 1 },
          totalVotes: { $sum: '$votes' },
          totalViews: { $sum: '$viewCount' },
          totalComments: { $sum: '$comments' },
          implementedIdeas: {
            $sum: { $cond: ['$isImplemented', 1, 0] }
          }
        }
      }
    ])

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const trendingCount = await Idea.countDocuments({
      status: ContentStatus.APPROVED,
      createdAt: { $gte: weekAgo },
      votes: { $gte: 5 }
    })

    return NextResponse.json({
      success: true,
      data: {
        ideas,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        stats: {
          totalIdeas: stats[0]?.totalIdeas || 0,
          totalVotes: stats[0]?.totalVotes || 0,
          totalViews: stats[0]?.totalViews || 0,
          totalComments: stats[0]?.totalComments || 0,
          implementedIdeas: stats[0]?.implementedIdeas || 0,
          trendingThisWeek: trendingCount
        }
      }
    })

  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ideas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      title,
      description,
      field,
      tags,
      priority,
      feasibility,
      estimatedCost,
      targetAudience,
      expectedOutcome,
      resourcesNeeded,
      attachments
    } = body

    // Validate required fields
    if (!title || !description || !field || !expectedOutcome) {
      return NextResponse.json(
        { success: false, error: 'Title, description, field, and expected outcome are required' },
        { status: 400 }
      )
    }

    // Validate field
    if (!Object.values(AcademicField).includes(field)) {
      return NextResponse.json(
        { success: false, error: 'Invalid academic field' },
        { status: 400 }
      )
    }

    // Validate text lengths
    if (title.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Title cannot exceed 200 characters' },
        { status: 400 }
      )
    }

    if (description.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Description cannot exceed 2000 characters' },
        { status: 400 }
      )
    }

    if (expectedOutcome.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Expected outcome cannot exceed 500 characters' },
        { status: 400 }
      )
    }

    // Clean and validate tags
    const cleanTags = tags?.filter((tag: string) => tag.trim()).map((tag: string) => tag.trim().toLowerCase()) || []
    if (cleanTags.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 tags allowed' },
        { status: 400 }
      )
    }

    // Create idea
    const idea = new Idea({
      title: title.trim(),
      description: description.trim(),
      field,
      tags: cleanTags,
      author: session.user.id,
      authorName: session.user.name,
      authorFaculty: session.user.faculty || 'Unknown',
      priority: priority || 'medium',
      feasibility: feasibility || 'medium',
      estimatedCost: estimatedCost?.trim() || '',
      targetAudience: targetAudience?.filter((audience: string) => audience.trim()) || [],
      expectedOutcome: expectedOutcome.trim(),
      resourcesNeeded: resourcesNeeded?.filter((resource: string) => resource.trim()) || [],
      attachments: attachments || [],
      status: ContentStatus.APPROVED // Changed from PENDING to APPROVED for immediate visibility
    })

    await idea.save()

    // Log the activity
    await auditLogger.log({
      action: AuditAction.IDEA_CREATE,
      userId: session.user.id,
      userEmail: session.user.email!,
      userRole: session.user.role || 'student',
      resource: AuditResource.IDEA,
      resourceId: idea._id.toString(),
      details: {
        ideaId: idea._id,
        title: idea.title,
        field: idea.field
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      data: idea,
      message: 'Idea submitted successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating idea:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create idea' },
      { status: 500 }
    )
  }
}
