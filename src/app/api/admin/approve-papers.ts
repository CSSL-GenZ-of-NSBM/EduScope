import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import ResearchPaper from '@/lib/db/models/ResearchPaper'

export async function POST(request: NextRequest) {
  try {
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
