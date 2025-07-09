import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { connectDB } from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import UserActivity from '@/lib/db/models/UserActivity'
import { ActivityType } from '@/types/activity'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    // Fetch the current user data from the database
    const user = await User.findById(session.user.id).select('-password')
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      studentId: user.studentId,
      faculty: user.faculty,
      role: user.role,
      year: user.year,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { newAcademicYear } = await request.json()

    if (!newAcademicYear || newAcademicYear < 1 || newAcademicYear > 4) {
      return NextResponse.json(
        { error: 'Valid academic year is required (1-4)' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find the user
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is requesting their current year
    if (user.year && user.year === newAcademicYear) {
      return NextResponse.json(
        { error: 'You cannot request a change to your current academic year' },
        { status: 400 }
      )
    }

    // Check if user already has a pending year change request
    const existingRequest = await UserActivity.findOne({
      userId: session.user.id,
      activityType: ActivityType.YEAR_CHANGE_REQUEST,
      'details.status': 'pending'
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending year change request' },
        { status: 400 }
      )
    }

    // Create a year change request activity
    const yearChangeActivity = new UserActivity({
      userId: session.user.id,
      activityType: ActivityType.YEAR_CHANGE_REQUEST,
      details: {
        currentYear: user.year,
        requestedYear: newAcademicYear,
        status: 'pending'
      }
    })

    await yearChangeActivity.save()

    return NextResponse.json(
      { 
        success: true, 
        message: 'Academic year change request submitted',
        activityId: yearChangeActivity._id
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error submitting year change request:', error.message)
    return NextResponse.json(
      { error: 'Failed to submit academic year change request', details: error.message },
      { status: 500 }
    )
  }
}
