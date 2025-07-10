import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/db/mongodb'
import ResearchPaper from '@/lib/db/models/ResearchPaper'
import User from '@/lib/db/models/User'

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

    // Research paper stats
    const researchStats = await ResearchPaper.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const research = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0
    }

    researchStats.forEach((stat) => {
      research.total += stat.count
      research[stat._id as keyof typeof research] = stat.count
    })

    // User stats
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })

    // Download stats
    const downloadStats = await ResearchPaper.aggregate([
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: '$downloadCount' }
        }
      }
    ])

    const currentMonth = new Date()
    currentMonth.setDate(1)
    const thisMonthDownloads = await ResearchPaper.aggregate([
      {
        $match: {
          updatedAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          downloads: { $sum: '$downloadCount' }
        }
      }
    ])

    // Request stats
    const degreeChangeRequests = await User.countDocuments({
      'pendingDegreeChange.status': 'pending'
    })

    const yearChangeRequests = await User.countDocuments({
      'pendingYearChange.status': 'pending'
    })

    const accountDeletionRequests = await User.countDocuments({
      'pendingAccountDeletion': true
    })

    const stats = {
      research,
      ideas: {
        total: 0, // TODO: Implement when Ideas collection is created
        approved: 0,
        pending: 0
      },
      users: {
        total: totalUsers,
        active: activeUsers
      },
      downloads: {
        total: downloadStats[0]?.totalDownloads || 0,
        thisMonth: thisMonthDownloads[0]?.downloads || 0
      },
      requests: {
        degreeChanges: degreeChangeRequests,
        yearChanges: yearChangeRequests,
        accountDeletions: accountDeletionRequests
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
}
