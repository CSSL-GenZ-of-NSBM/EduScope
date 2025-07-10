import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { connectDB } from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import UserActivity from '@/lib/db/models/UserActivity'
import { ActivityType } from '@/types/activity'
import { UserRole } from '@/types'

export async function POST(request: NextRequest, { params }: { params: { id: string }}) {
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

    const activityId = params.id
    const { action, reason } = await request.json()

    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find the activity
    const activity = await UserActivity.findById(activityId)

    if (!activity || activity.activityType !== ActivityType.YEAR_CHANGE_REQUEST) {
      return NextResponse.json(
        { error: 'Year change request not found' },
        { status: 404 }
      )
    }

    // Check if the request is already processed
    if (activity.details.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been processed' },
        { status: 400 }
      )
    }

    // Update the activity status using MongoDB update operators
    console.log('Before update:', activity.details)
    
    const updateData = {
      'details.status': action === 'approve' ? 'approved' : 'rejected',
      'details.reviewedBy': session.user.id,
      'details.reviewedAt': new Date(),
      'details.comments': reason || ''
    }
    
    const updatedActivity = await UserActivity.findByIdAndUpdate(
      activityId,
      { $set: updateData },
      { new: true }
    )
    
    console.log('After update:', updatedActivity?.details)

    // If approved, update the user's academic year
    if (action === 'approve') {
      const user = await User.findById(activity.userId)
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      user.year = activity.details.requestedYear
      await user.save()
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Year change request ${action === 'approve' ? 'approved' : 'rejected'}` 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error processing year change request:', error.message)
    return NextResponse.json(
      { error: 'Failed to process year change request', details: error.message },
      { status: 500 }
    )
  }
}
