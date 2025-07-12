import mongoose, { Schema, Document } from 'mongoose'

export interface IdeaCommentDocument extends Document {
  _id: string
  ideaId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  content: string
  author: {
    name: string
    email: string
    studentId?: string
    faculty?: string
  }
  isEdited: boolean
  createdAt: Date
  updatedAt: Date
}

const IdeaCommentSchema = new Schema<IdeaCommentDocument>({
  ideaId: {
    type: Schema.Types.ObjectId,
    ref: 'Idea',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
    minlength: 1
  },
  author: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    studentId: {
      type: String
    },
    faculty: {
      type: String
    }
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
IdeaCommentSchema.index({ ideaId: 1, createdAt: -1 })
IdeaCommentSchema.index({ userId: 1 })
IdeaCommentSchema.index({ createdAt: -1 })

export default mongoose.models.IdeaComment || mongoose.model<IdeaCommentDocument>('IdeaComment', IdeaCommentSchema)
