import mongoose, { Schema, Document } from 'mongoose'
import { AcademicField, ContentStatus } from '@/types'

export interface IdeaDocument extends Document {
  _id: string
  title: string
  slug: string
  description: string
  field: AcademicField
  tags: string[]
  author: mongoose.Types.ObjectId
  authorName: string
  authorFaculty: string
  status: ContentStatus
  votes: number
  votedBy: mongoose.Types.ObjectId[]
  comments: number
  isImplemented: boolean
  implementationDetails?: string
  collaborators: mongoose.Types.ObjectId[]
  priority: 'low' | 'medium' | 'high'
  feasibility: 'low' | 'medium' | 'high'
  estimatedCost?: string
  targetAudience: string[]
  expectedOutcome: string
  resourcesNeeded: string[]
  relatedProjects: mongoose.Types.ObjectId[]
  attachments: {
    name: string
    url: string
    type: string
    size: number
  }[]
  viewCount: number
  lastActivity: Date
  createdAt: Date
  updatedAt: Date
}

const IdeaSchema = new Schema<IdeaDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/,
    default: function() {
      // Fallback slug generation in case pre-validate doesn't run
      return generateSlug(this.title || 'untitled-idea')
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  field: {
    type: String,
    enum: Object.values(AcademicField),
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorFaculty: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(ContentStatus),
    default: ContentStatus.PENDING
  },
  votes: {
    type: Number,
    default: 0,
    min: 0
  },
  votedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: {
    type: Number,
    default: 0,
    min: 0
  },
  isImplemented: {
    type: Boolean,
    default: false
  },
  implementationDetails: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  feasibility: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  estimatedCost: {
    type: String,
    trim: true,
    maxlength: 100
  },
  targetAudience: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  expectedOutcome: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  resourcesNeeded: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  relatedProjects: [{
    type: Schema.Types.ObjectId,
    ref: 'ResearchPaper'
  }],
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  }],
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret: any) {
      delete ret.__v
      return ret
    }
  }
})

// Indexes for better query performance
IdeaSchema.index({ title: 'text', description: 'text', tags: 'text' })
IdeaSchema.index({ slug: 1 }, { unique: true })
IdeaSchema.index({ field: 1 })
IdeaSchema.index({ status: 1 })
IdeaSchema.index({ author: 1 })
IdeaSchema.index({ votes: -1 })
IdeaSchema.index({ createdAt: -1 })
IdeaSchema.index({ lastActivity: -1 })
IdeaSchema.index({ isImplemented: 1 })

// Virtual for trending status
IdeaSchema.virtual('isTrending').get(function() {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return this.votes >= 5 && this.createdAt >= weekAgo
})

// Virtual for popularity status
IdeaSchema.virtual('isPopular').get(function() {
  return this.votes >= 10 || this.viewCount >= 50
})

// Function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 100) // Limit length
}

// Pre-validate middleware to generate slug before validation
IdeaSchema.pre('validate', async function(next) {
  // Always ensure slug exists for new documents or when title changes
  if (!this.slug || this.isModified('title')) {
    let baseSlug = generateSlug(this.title)
    let slug = baseSlug
    let counter = 1
    
    // Ensure slug is unique
    const Model = this.constructor as any
    while (await Model.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    this.slug = slug
  }
  next()
})

// Pre-save middleware to update lastActivity
IdeaSchema.pre('save', async function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastActivity = new Date()
  }
  next()
})

// Static methods for common queries
IdeaSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug, status: ContentStatus.APPROVED })
}

IdeaSchema.statics.findTrending = function() {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  return this.find({
    status: ContentStatus.APPROVED,
    createdAt: { $gte: weekAgo },
    votes: { $gte: 5 }
  }).sort({ votes: -1, createdAt: -1 })
}

IdeaSchema.statics.findPopular = function() {
  return this.find({
    status: ContentStatus.APPROVED,
    $or: [
      { votes: { $gte: 10 } },
      { viewCount: { $gte: 50 } }
    ]
  }).sort({ votes: -1, viewCount: -1 })
}

IdeaSchema.statics.findByField = function(field: AcademicField) {
  return this.find({
    field,
    status: ContentStatus.APPROVED
  }).sort({ createdAt: -1 })
}

export const Idea = mongoose.models.Idea || mongoose.model<IdeaDocument>('Idea', IdeaSchema)
