import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/db/mongodb"
import ResearchPaper from "@/lib/db/models/ResearchPaper"
import { Types } from "mongoose"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    await connectDB()

    const userId = new Types.ObjectId(session.user.id)

    // Find all papers where the current user is in the savedBy array
    const savedPapers = await ResearchPaper.find({
      savedBy: userId,
      status: 'approved' // Only show approved papers
    })
    .populate('uploadedBy', 'name studentId faculty')
    .sort({ createdAt: -1 }) // Sort by most recently saved (we could add a savedAt timestamp if needed)
    .lean()

    return NextResponse.json({
      success: true,
      data: savedPapers,
      count: savedPapers.length
    })

  } catch (error) {
    console.error("Saved papers fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch saved papers" },
      { status: 500 }
    )
  }
}
