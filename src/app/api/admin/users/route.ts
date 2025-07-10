import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import { auditLogger } from '@/lib/audit/audit-logger'
import { AuditAction, AuditResource } from '@/types'
import { withRateLimit, rateLimiters } from '@/lib/rate-limit/rate-limiter'

async function getUsers(request: NextRequest) {
  try {
    // Check authentication and authorization - only admins can manage users
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userRole = token.role
    if (!userRole || !['admin', 'superadmin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const faculty = searchParams.get('faculty')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build query
    const query: any = {}
    
    if (faculty && faculty !== 'all') {
      query.faculty = faculty
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ]
    }

    // Get users (excluding password and sensitive fields)
    const users = await User
      .find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await User.countDocuments(query)

    // Log admin user list viewing
    await auditLogger.log({
      userId: token.sub || "unknown",
      userEmail: token.email || "unknown@email.com",
      userRole: token.role || "unknown",
      action: AuditAction.ADMIN_USER_MANAGEMENT,
      resource: AuditResource.USER,
      details: {
        action: "users_list_view",
        searchFilters: {
          search,
          faculty,
          page,
          limit
        },
        resultCount: users.length,
        totalUsers: total
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined
    })

    return NextResponse.json({
      success: true,
      data: users,
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
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// Apply rate limiting to the admin users endpoint
export const GET = withRateLimit(rateLimiters.admin, getUsers)
