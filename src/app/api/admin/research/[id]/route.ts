import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/db/mongodb'
import ResearchPaper from '@/lib/db/models/ResearchPaper'
import { GridFSBucket, ObjectId } from 'mongodb'
import { connectDB } from '@/lib/db/mongodb'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { status, ...updateData } = await request.json()
    const paperId = params.id

    const updatedPaper = await ResearchPaper.findByIdAndUpdate(
      paperId,
      { ...updateData, status, updatedAt: new Date() },
      { new: true }
    )

    if (!updatedPaper) {
      return NextResponse.json(
        { success: false, error: 'Research paper not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Research paper updated successfully',
      data: updatedPaper
    })

  } catch (error) {
    console.error('Error updating research paper:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update research paper' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const paperId = params.id

    // Get the paper to find the fileId
    const paper = await ResearchPaper.findById(paperId)
    if (!paper) {
      return NextResponse.json(
        { success: false, error: 'Research paper not found' },
        { status: 404 }
      )
    }

    // Delete the file from GridFS
    try {
      const client = await connectDB()
      const db = client.db(process.env.MONGODB_DB_NAME || 'eduscope')
      const bucket = new GridFSBucket(db, { bucketName: 'uploads' })
      await bucket.delete(new ObjectId(paper.fileId))
    } catch (fileError) {
      console.error('Error deleting file from GridFS:', fileError)
      // Continue with paper deletion even if file deletion fails
    }

    // Delete the paper document
    await ResearchPaper.findByIdAndDelete(paperId)

    return NextResponse.json({
      success: true,
      message: 'Research paper deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting research paper:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete research paper' },
      { status: 500 }
    )
  }
}
