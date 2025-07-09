import mongoose, { Schema, Document, Types } from 'mongoose'

export enum ActivityType {
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  VIEW = 'view',
  DELETE = 'delete',
  UPDATE = 'update',
  APPROVE = 'approve',
  REJECT = 'reject',
  SAVE = 'save',
  UNSAVE = 'unsave',
  YEAR_CHANGE_REQUEST = 'year_change_request'
}

interface UserActivityDocument extends Document {
  userId: Types.ObjectId;
  activityType: ActivityType;
  targetId?: Types.ObjectId; // ID of the paper/content involved (optional for some activity types)
  targetTitle?: string; // Title of the paper for easy reference (optional for some activity types)
  metadata?: {
    paperField?: string;
    paperYear?: number;
    fileName?: string;
  };
  details?: any; // For storing activity-specific details
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
    required: false // Made optional
  },
  targetTitle: {
    type: String,
    required: false, // Made optional
    trim: true
  },
  details: {
    type: Schema.Types.Mixed, // For storing additional activity details
    required: false
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
