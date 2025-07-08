import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/mongodb"
import UserActivity from "@/lib/db/models/UserActivity"
import { Types } from "mongoose"

interface ActivityResponse {
  _id: string
  type: 'upload' | 'download' | 'view' | 'delete' | 'approve' | 'reject' | 'save' | 'unsave'
  title: string
  date: Date
  paperId?: string
  metadata?: {
    paperField?: string
    paperYear?: number
    fileName?: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const userId = new Types.ObjectId(session.user.id)

    // Get user's recent activities from UserActivity collection
    const activities = await UserActivity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Transform activities to the expected format
    const formattedActivities: ActivityResponse[] = activities.map((activity: any) => ({
      _id: activity._id.toString(),
      type: activity.activityType,
      title: activity.targetTitle,
      date: activity.createdAt,
      paperId: activity.targetId.toString(),
      metadata: activity.metadata
    }))

    console.log('Activity API response:', {
      userId: userId.toString(),
      activitiesCount: formattedActivities.length,
      activities: formattedActivities.map(a => ({ type: a.type, title: a.title }))
    })

    return NextResponse.json({
      success: true,
      data: formattedActivities
    })

  } catch (error) {
    console.error("Activity API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
