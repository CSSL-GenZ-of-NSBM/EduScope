import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/db/mongodb'
import ResearchPaper from '@/lib/db/models/ResearchPaper'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userRole = token.role
    if (!userRole || !['admin', 'superadmin', 'moderator'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Admin, superadmin, or moderator access required' },
        { status: 403 }
      )
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build query
    const query: any = {}
    
    if (status && status !== 'all') {
      query.status = status
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authors: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }

    // Get papers with populated user data
    const papers = await ResearchPaper
      .find(query)
      .populate('uploadedBy', 'name studentId email faculty')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await ResearchPaper.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: papers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching admin research papers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch research papers' },
      { status: 500 }
    )
  }
}

// Bulk update papers
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication and authorization
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userRole = token.role
    if (!userRole || !['admin', 'superadmin', 'moderator'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Admin, superadmin, or moderator access required' },
        { status: 403 }
      )
    }

    await dbConnect()

    const { paperIds, status } = await request.json()

    if (!paperIds || !Array.isArray(paperIds) || !status) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const result = await ResearchPaper.updateMany(
      { _id: { $in: paperIds } },
      { status, updatedAt: new Date() }
    )

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} papers`,
      data: { modifiedCount: result.modifiedCount }
    })

  } catch (error) {
    console.error('Error bulk updating papers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update papers' },
      { status: 500 }
    )
  }
}
