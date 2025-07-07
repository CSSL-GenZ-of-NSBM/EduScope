import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/db/mongodb"
import ResearchPaper from "@/lib/db/models/ResearchPaper"

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Paper ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const paper = await ResearchPaper.findById(id)
      .populate('uploadedBy', 'name studentId faculty')
      .lean() as any

    if (!paper) {
      return NextResponse.json(
        { success: false, error: "Research paper not found" },
        { status: 404 }
      )
    }

    // Check if paper is approved or user has access
    const session = await getServerSession(authOptions)
    
    if (paper.status !== 'approved' && (!session?.user || session.user.id !== paper.uploadedBy?._id?.toString())) {
      return NextResponse.json(
        { success: false, error: "Research paper not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: paper
    })

  } catch (error) {
    console.error("Research paper fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch research paper" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()

    await connectDB()

    const paper = await ResearchPaper.findById(id)
    
    if (!paper) {
      return NextResponse.json(
        { success: false, error: "Research paper not found" },
        { status: 404 }
      )
    }

    // Check if user owns the paper or is admin
    if (paper.uploadedBy.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      )
    }

    // Update the paper
    const updatedPaper = await ResearchPaper.findByIdAndUpdate(
      id,
      { ...body, uploadedBy: paper.uploadedBy }, // Keep original uploader
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name studentId faculty')

    return NextResponse.json({
      success: true,
      data: updatedPaper,
      message: "Research paper updated successfully"
    })

  } catch (error) {
    console.error("Research paper update error:", error)
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to update research paper" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { action } = body

    await connectDB()

    const paper = await ResearchPaper.findById(id)
    
    if (!paper) {
      return NextResponse.json(
        { success: false, error: "Research paper not found" },
        { status: 404 }
      )
    }

    // Handle download count increment
    if (action === 'download') {
      const updatedPaper = await ResearchPaper.findByIdAndUpdate(
        id,
        { $inc: { downloadCount: 1 } },
        { new: true }
      )

      return NextResponse.json({
        success: true,
        data: updatedPaper,
        message: "Download count updated successfully"
      })
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Research paper update error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update research paper" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = params

    await connectDB()

    const paper = await ResearchPaper.findById(id)
    
    if (!paper) {
      return NextResponse.json(
        { success: false, error: "Research paper not found" },
        { status: 404 }
      )
    }

    // Check if user owns the paper or is admin
    if (paper.uploadedBy.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      )
    }

    await ResearchPaper.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Research paper deleted successfully"
    })

  } catch (error) {
    console.error("Research paper deletion error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete research paper" },
      { status: 500 }
    )
  }
}
