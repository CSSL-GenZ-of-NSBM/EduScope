import mongoose, { Schema, Document } from 'mongoose'
import { type DegreeSchema, type DegreeModule, Faculty, AffiliatedUniversity } from '@/types'

interface DegreeDocument extends DegreeSchema, Document {}

const DegreeModuleSchema = new Schema<DegreeModule>({
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  moduleName: {
    type: String,
    required: true,
    trim: true
  },
  moduleCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  description: {
    type: String,
    trim: true
  }
})

const DegreeSchema = new Schema<DegreeDocument>({
  degreeName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  faculty: {
    type: String,
    required: true,
    enum: Object.values(Faculty)
  },
  affiliatedUniversity: {
    type: String,
    required: true,
    enum: Object.values(AffiliatedUniversity)
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  modules: [DegreeModuleSchema],
  description: {
    type: String,
    trim: true
  },
  admissionRequirements: [{
    type: String,
    trim: true
  }],
  careerPaths: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes for better query performance
DegreeSchema.index({ faculty: 1 })
DegreeSchema.index({ affiliatedUniversity: 1 })
DegreeSchema.index({ isActive: 1 })
DegreeSchema.index({ degreeName: 'text' })

const Degree = mongoose.models.Degree || mongoose.model<DegreeDocument>('Degree', DegreeSchema)

export default Degree
