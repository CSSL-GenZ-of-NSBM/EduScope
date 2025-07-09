import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { connectDB } from '@/lib/db/mongodb'
import { getMongoDBClient } from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import ResearchPaper from '@/lib/db/models/ResearchPaper'
import mongoose from 'mongoose'
import { GridFSBucket, ObjectId } from 'mongodb'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    // Start a mongoose session for transaction
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
      const userId = session.user.id

      // 1. Find and delete all research papers by the user
      const userPapers = await ResearchPaper.find({ uploadedBy: userId }).lean()
      
      // 2. Delete the associated files from GridFS
      if (userPapers.length > 0) {
        const fileIds = userPapers.map(paper => new ObjectId(paper.fileId))
        const mongoClient = await getMongoDBClient()
        const db = mongoClient.db(process.env.MONGODB_DB_NAME || 'eduscope')
        const bucket = new GridFSBucket(db)
        
        // Delete each file
        for (const fileId of fileIds) {
          await bucket.delete(fileId)
        }
      }

      // 3. Delete the research papers documents
      await ResearchPaper.deleteMany({ uploadedBy: userId }, { session: mongoSession })

      // 4. Remove user references from saved papers
      await ResearchPaper.updateMany(
        { savedBy: userId },
        { $pull: { savedBy: userId } },
        { session: mongoSession }
      )

      // 5. Update download and view counts
      await ResearchPaper.updateMany(
        { downloadedBy: userId },
        { $pull: { downloadedBy: userId }, $inc: { downloadCount: -1 } },
        { session: mongoSession }
      )

      await ResearchPaper.updateMany(
        { viewedBy: userId },
        { $pull: { viewedBy: userId }, $inc: { viewCount: -1 } },
        { session: mongoSession }
      )

      // 6. Delete the user
      await User.findByIdAndDelete(userId, { session: mongoSession })

      await mongoSession.commitTransaction()
      mongoSession.endSession()

      return NextResponse.json(
        { success: true, message: 'Account deleted successfully' },
        { status: 200 }
      )
    } catch (error) {
      await mongoSession.abortTransaction()
      mongoSession.endSession()
      throw error
    }
  } catch (error: any) {
    console.error('Error deleting account:', error.message)
    return NextResponse.json(
      { error: 'Failed to delete account', details: error.message },
      { status: 500 }
    )
  }
}
