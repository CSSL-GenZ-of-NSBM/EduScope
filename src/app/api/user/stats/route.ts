import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import ResearchPaper from '@/lib/db/models/ResearchPaper'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    await dbConnect()

    const userId = session.user.id
    console.log('Session user ID:', userId, 'Type:', typeof userId)

    // Try both string and ObjectId versions for compatibility
    const userIdAsObjectId = ObjectId.isValid(userId) ? new ObjectId(userId) : null
    
    // Get user's uploaded papers count - try both string and ObjectId
    let uploadsCount = await ResearchPaper.countDocuments({
      uploadedBy: userId
    })
    
    if (uploadsCount === 0 && userIdAsObjectId) {
      uploadsCount = await ResearchPaper.countDocuments({
        uploadedBy: userIdAsObjectId
      })
    }

    // Debug: Check what statuses the papers have
    let userPapers = await ResearchPaper.find({ uploadedBy: userId }).select('status title downloadCount').lean()
    
    if (userPapers.length === 0 && userIdAsObjectId) {
      userPapers = await ResearchPaper.find({ uploadedBy: userIdAsObjectId }).select('status title downloadCount').lean()
    }
    
    console.log('User Stats Debug:', {
      userId: userId,
      userIdType: typeof userId,
      userIdAsObjectId: userIdAsObjectId?.toString(),
      uploadsCount,
      foundPapers: userPapers.length,
      paperStatuses: userPapers.map(p => ({ title: p.title, status: p.status, downloads: p.downloadCount }))
    })

    // Get total downloads of user's papers - try both formats
    let downloadStats = await ResearchPaper.aggregate([
      { $match: { uploadedBy: userId } },
      { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } }
    ])
    
    if (downloadStats.length === 0 && userIdAsObjectId) {
      downloadStats = await ResearchPaper.aggregate([
        { $match: { uploadedBy: userIdAsObjectId } },
        { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } }
      ])
    }

    const totalDownloads = downloadStats.length > 0 ? downloadStats[0].totalDownloads : 0

    console.log('Download Stats Debug:', {
      downloadStats,
      totalDownloads,
      userPapersWithDownloads: userPapers.map(p => ({ title: p.title, downloads: p.downloadCount }))
    })

    // TODO: Get ideas count when idea bank is implemented
    const ideasCount = 0

    return NextResponse.json({
      success: true,
      data: {
        uploads: uploadsCount,
        downloads: totalDownloads,
        ideas: ideasCount
      }
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
}
