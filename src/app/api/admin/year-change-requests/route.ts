import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { connectDB } from '@/lib/db/mongodb'
import UserActivity from '@/lib/db/models/UserActivity'
import User from '@/lib/db/models/User'
import { ActivityType } from '@/types/activity'
import { UserRole } from '@/types'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin, moderator, or super admin
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MODERATOR && session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get('status') || 'pending'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    await connectDB()

    // Find all year change request activities with the specified status
    const query = { 
      activityType: ActivityType.YEAR_CHANGE_REQUEST,
      'details.status': status
    }

    const [activities, total] = await Promise.all([
      UserActivity.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserActivity.countDocuments(query)
    ])

    // Get user details for each activity
    const userIds = activities.map(activity => activity.userId)
    const users = await User.find({ _id: { $in: userIds } })
        .select('name email studentId faculty year')
        .lean()

    // Map user details to activities
    const activitiesWithUserDetails = activities.map(activity => {
      const user = users.find(u => 
        (u as any)._id.toString() === activity.userId.toString()
      )
      
      return {
        ...activity,
        user: user ? {
          id: (user as any)._id,
          name: (user as any).name,
          email: (user as any).email,
          studentId: (user as any).studentId,
          faculty: (user as any).faculty,
          year: (user as any).year
        } : null
      }
    })

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      success: true,
      data: activitiesWithUserDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    })
  } catch (error: any) {
    console.error('Error fetching year change requests:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch year change requests', details: error.message },
      { status: 500 }
    )
  }
}
