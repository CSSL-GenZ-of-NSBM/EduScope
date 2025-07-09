import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { connectDB } from '@/lib/db/mongodb'
import UserActivity from '@/lib/db/models/UserActivity'
import { ActivityType } from '@/types/activity'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    // Find any pending year change requests for this user
    const pendingRequest = await UserActivity.findOne({
      userId: session.user.id,
      activityType: ActivityType.YEAR_CHANGE_REQUEST,
      'details.status': 'pending'
    }).sort({ createdAt: -1 })

    if (pendingRequest) {
      return NextResponse.json({
        hasPendingRequest: true,
        request: {
          id: pendingRequest._id.toString(),
          currentYear: pendingRequest.details.currentYear,
          requestedYear: pendingRequest.details.requestedYear,
          createdAt: pendingRequest.createdAt,
          status: pendingRequest.details.status
        }
      })
    }

    return NextResponse.json({
      hasPendingRequest: false,
      request: null
    })
  } catch (error) {
    console.error('Error checking pending year change requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
