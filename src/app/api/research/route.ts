import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import connectDB from "@/lib/db/mongodb"
import ResearchPaper from "@/lib/db/models/ResearchPaper"
import { z } from "zod"

const searchSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("12"),
  search: z.string().optional(),
  field: z.string().optional(),
  faculty: z.string().optional(),
  year: z.string().optional(),
  sortBy: z.enum(["createdAt", "downloadCount", "title", "year"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    const {
      page,
      limit,
      search,
      field,
      faculty,
      year,
      sortBy,
      sortOrder
    } = searchSchema.parse(params)

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    await connectDB()

    // Build query - show approved papers and user's own papers
    const session = await getServerSession(authOptions)
    const query: any = {
      $or: [
        { status: 'approved' },
        ...(session?.user?.id ? [{ uploadedBy: session.user.id }] : [])
      ]
    }
    
    if (search) {
      query.$and = query.$and || []
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { abstract: { $regex: search, $options: 'i' } },
          { authors: { $in: [new RegExp(search, 'i')] } },
          { keywords: { $in: [new RegExp(search, 'i')] } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      })
    }
    
    if (field) {
      query.field = field
    }
    
    if (faculty) {
      query.faculty = faculty
    }
    
    if (year) {
      query.year = parseInt(year)
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Get total count
    const total = await ResearchPaper.countDocuments(query)
    
    // Get papers with pagination
    const papers = await ResearchPaper.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('uploadedBy', 'name studentId faculty')
      .lean()

    console.log('Research API Debug:', {
      query,
      total,
      papersCount: papers.length,
      firstPaper: papers[0] ? { 
        id: papers[0]._id, 
        title: papers[0].title, 
        status: papers[0].status 
      } : null
    })

    const totalPages = Math.ceil(total / limitNum)

    return NextResponse.json({
      success: true,
      data: papers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    })

  } catch (error) {
    console.error("Research papers fetch error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch research papers" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fileId
    if (!body.fileId) {
      return NextResponse.json(
        { success: false, error: "File ID is required" },
        { status: 400 }
      )
    }

    // Get file information from GridFS
    const { gridfsService } = await import('@/lib/file-upload/gridfs')
    const fileInfo = await gridfsService.getFileInfo(body.fileId)
    
    if (!fileInfo) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      )
    }

    // Verify file ownership
    if (fileInfo.metadata?.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized file access" },
        { status: 403 }
      )
    }
    
    const paperData = {
      ...body,
      uploadedBy: session.user.id,
      downloadCount: 0,
      status: 'approved', // Auto-approve for now, can be changed to 'pending' later
      fileName: fileInfo.filename,
      fileSize: fileInfo.length,
      mimeType: fileInfo.metadata?.contentType || 'application/octet-stream'
    }

    await connectDB()
    
    const paper = await ResearchPaper.create(paperData)
    
    // Populate the created paper
    await paper.populate('uploadedBy', 'name studentId faculty')

    return NextResponse.json({
      success: true,
      data: paper,
      message: "Research paper created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Research paper creation error:", error)
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to create research paper" },
      { status: 500 }
    )
  }
}
