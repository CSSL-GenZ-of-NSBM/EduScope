import mongoose, { Schema, Document, Types } from 'mongoose'

export enum ActivityType {
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  VIEW = 'view',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject'
}

interface UserActivityDocument extends Document {
  userId: Types.ObjectId;
  activityType: ActivityType;
  targetId: Types.ObjectId; // ID of the paper/content involved
  targetTitle: string; // Title of the paper for easy reference
  metadata?: {
    paperField?: string;
    paperYear?: number;
    fileName?: string;
  };
  createdAt: Date;
}

const UserActivitySchema = new Schema<UserActivityDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: Object.values(ActivityType),
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  targetTitle: {
    type: String,
    required: true,
    trim: true
  },
  metadata: {
    paperField: String,
    paperYear: Number,
    fileName: String
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
UserActivitySchema.index({ userId: 1, createdAt: -1 })
UserActivitySchema.index({ userId: 1, activityType: 1 })
UserActivitySchema.index({ targetId: 1 })
UserActivitySchema.index({ createdAt: -1 })

export default mongoose.models.UserActivity || mongoose.model<UserActivityDocument>('UserActivity', UserActivitySchema)
