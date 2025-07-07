import mongoose, { Schema, Document, Types } from 'mongoose'
import { type ResearchPaperSchema, AcademicField, Faculty, ContentStatus } from '@/types'

interface ResearchPaperDocument extends Omit<ResearchPaperSchema, 'uploadedBy'>, Document {
  uploadedBy: Types.ObjectId;
}

const ResearchPaperSchema = new Schema<ResearchPaperDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  authors: [{
    type: String,
    required: true,
    trim: true
  }],
  abstract: {
    type: String,
    required: true,
    maxlength: 2000
  },
  field: {
    type: String,
    enum: Object.values(AcademicField),
    required: true
  },
  faculty: {
    type: String,
    enum: Object.values(Faculty),
    default: null
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: new Date().getFullYear() + 1
  },
  fileId: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  downloadCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: Object.values(ContentStatus),
    default: ContentStatus.PENDING
  },
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  supervisor: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Indexes for better query performance
ResearchPaperSchema.index({ field: 1, year: -1 })
ResearchPaperSchema.index({ uploadedBy: 1 })
ResearchPaperSchema.index({ status: 1 })
ResearchPaperSchema.index({ tags: 1 })
ResearchPaperSchema.index({ title: 'text', abstract: 'text', keywords: 'text' })
ResearchPaperSchema.index({ downloadCount: -1 })
ResearchPaperSchema.index({ createdAt: -1 })

export default mongoose.models.ResearchPaper || mongoose.model<ResearchPaperDocument>('ResearchPaper', ResearchPaperSchema)
