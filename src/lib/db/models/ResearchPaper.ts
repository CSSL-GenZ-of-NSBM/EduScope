import mongoose, { Schema, Document, Types } from 'mongoose'
import { type ResearchPaperSchema, AcademicField, Faculty, ContentStatus } from '@/types'

interface ResearchPaperDocument extends Omit<ResearchPaperSchema, 'uploadedBy' | 'viewedBy' | 'downloadedBy' | 'savedBy' | 'pendingChanges' | 'pendingDeletion'>, Document {
  uploadedBy: Types.ObjectId;
  viewedBy: Types.ObjectId[];
  downloadedBy: Types.ObjectId[];
  savedBy: Types.ObjectId[];
  pendingChanges?: {
    title?: string;
    authors?: string[];
    abstract?: string;
    field?: string;
    faculty?: string;
    year?: number;
    keywords?: string[];
    tags?: string[];
    supervisor?: string;
    department?: string;
    requestedAt?: Date;
    requestedBy?: Types.ObjectId;
    status?: 'pending' | 'approved' | 'rejected';
  };
  pendingDeletion?: {
    requestedAt?: Date;
    requestedBy?: Types.ObjectId;
    status?: 'pending' | 'approved' | 'rejected';
  };
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
  viewCount: {
    type: Number,
    default: 0
  },
  saveCount: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  downloadedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  savedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
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
  },
  pendingChanges: {
    title: String,
    authors: [String],
    abstract: String,
    field: String,
    faculty: String,
    year: Number,
    keywords: [String],
    tags: [String],
    supervisor: String,
    department: String,
    requestedAt: Date,
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  pendingDeletion: {
    requestedAt: Date,
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
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
