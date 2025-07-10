import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import dbConnect from '@/lib/db/mongodb'
import ResearchPaper from '@/lib/db/models/ResearchPaper'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user is admin, moderator, or super admin
    if (session.user.role !== 'admin' && session.user.role !== 'moderator' && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      )
    }

    await dbConnect()

    // Update all pending papers to approved
    const result = await ResearchPaper.updateMany(
      { status: 'pending' },
      { status: 'approved' }
    )

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} papers to approved status`,
      data: { modifiedCount: result.modifiedCount }
    })

  } catch (error) {
    console.error('Error approving papers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to approve papers' },
      { status: 500 }
    )
  }
}
