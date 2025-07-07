import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/mongodb"
import ResearchPaper from "@/lib/db/models/ResearchPaper"

// GET /api/research/stats - Get research statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    await connectDB()

    // Get total papers count
    const totalPapers = await ResearchPaper.countDocuments()

    // Get papers uploaded this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const papersThisWeek = await ResearchPaper.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    })

    // Get unique contributors (authors)
    const uniqueContributors = await ResearchPaper.distinct('uploadedBy').then(contributors => contributors.length)

    // Get total downloads (sum of downloadCount)
    const downloadStats = await ResearchPaper.aggregate([
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: '$downloadCount' }
        }
      }
    ])
    const totalDownloads = downloadStats.length > 0 ? downloadStats[0].totalDownloads : 0

    // Get papers by field distribution
    const papersByField = await ResearchPaper.aggregate([
      {
        $group: {
          _id: '$field',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ])

    // Get papers by year distribution
    const papersByYear = await ResearchPaper.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ])

    // Get most popular papers (by download count)
    const popularPapers = await ResearchPaper.find()
      .sort({ downloadCount: -1 })
      .limit(5)
      .select('title downloadCount')

    // Get recent papers
    const recentPapers = await ResearchPaper.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt')

    const stats = {
      totalPapers,
      papersThisWeek,
      uniqueContributors,
      totalDownloads,
      papersByField,
      papersByYear,
      popularPapers,
      recentPapers
    }

    return NextResponse.json({ 
      success: true, 
      data: stats 
    })

  } catch (error) {
    console.error('Failed to fetch research stats:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
