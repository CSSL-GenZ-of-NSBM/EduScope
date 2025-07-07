import mongoose, { Schema, Document } from 'mongoose'
import { type UserSchema, UserRole, Faculty } from '@/types'

interface UserDocument extends UserSchema, Document {}

const UserSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email: string) {
        // In development, allow any email. In production, validate NSBM domain
        if (process.env.NODE_ENV === 'development') {
          return true
        }
        return email.endsWith('@students.nsbm.ac.lk') || email.endsWith('@staff.nsbm.ac.lk')
      },
      message: 'Email must be from NSBM domain (@students.nsbm.ac.lk or @staff.nsbm.ac.lk)'
    }
  },
  password: {
    type: String,
    required: true,
    select: false // Don't include password in query results by default
  },
  image: {
    type: String,
    default: null
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  faculty: {
    type: String,
    enum: Object.values(Faculty),
    default: null
  },
  year: {
    type: Number,
    min: 1,
    max: 4,
    default: null
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.STUDENT
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  bio: {
    type: String,
    maxlength: 500,
    default: null
  }
}, {
  timestamps: true
})

// Only create indexes not already defined as unique in schema
UserSchema.index({ faculty: 1, year: 1 })

export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema)
