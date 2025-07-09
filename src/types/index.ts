// Academic Field Enumeration
export enum AcademicField {
  ENGINEERING = 'engineering',
  BUSINESS = 'business',
  COMPUTING = 'computing',
  SCIENCE = 'science',
  MANAGEMENT = 'management',
  OTHER = 'other'
}

// Faculty Enumeration
export enum Faculty {
  ENGINEERING = 'Faculty of Engineering',
  BUSINESS = 'Faculty of Business',
  COMPUTING = 'Faculty of Computing',
  SCIENCE = 'Faculty of Applied Sciences',
  MANAGEMENT = 'Faculty of Management'
}

// User Role Enumeration
export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  FACULTY = 'faculty'
}

// Content Status Enumeration
export enum ContentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

// Base interfaces for API responses (without MongoDB _id)
export interface BaseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Base interfaces for Mongoose schemas (without _id to avoid conflicts)
export interface BaseSchema {
  createdAt: Date;
  updatedAt: Date;
}

// User interface for API responses
export interface User extends BaseDocument {
  name: string;
  email: string;
  image?: string;
  studentId?: string;
  faculty?: Faculty;
  year?: number;
  role: UserRole;
  isVerified: boolean;
  bio?: string;
}

// User schema interface for Mongoose (without _id)
export interface UserSchema extends BaseSchema {
  name: string;
  email: string;
  password: string;
  image?: string;
  studentId?: string;
  faculty?: Faculty;
  year?: number;
  role: UserRole;
  isVerified: boolean;
  bio?: string;
}

// Research Paper interface for API responses
export interface ResearchPaper extends BaseDocument {
  title: string;
  authors: string[];
  abstract: string;
  field: AcademicField;
  faculty?: Faculty;
  year: number;
  fileId: string; // GridFS reference
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string | { _id: string; name: string; email: string }; // Can be User ID or populated User object
  tags: string[];
  downloadCount: number;
  viewCount: number;
  saveCount: number;
  viewedBy: string[]; // Array of User IDs who viewed this paper
  downloadedBy: string[]; // Array of User IDs who downloaded this paper
  savedBy: string[]; // Array of User IDs who saved this paper
  status: ContentStatus;
  keywords?: string[];
  supervisor?: string;
  department?: string;
  pendingChanges?: {
    title?: string;
    authors?: string[];
    abstract?: string;
    field?: AcademicField;
    faculty?: Faculty;
    year?: number;
    keywords?: string[];
    tags?: string[];
    supervisor?: string;
    department?: string;
    requestedAt?: Date;
    requestedBy?: string;
    status?: 'pending' | 'approved' | 'rejected';
  };
  pendingDeletion?: {
    requestedAt?: Date;
    requestedBy?: string;
    status?: 'pending' | 'approved' | 'rejected';
  };
}

// Research Paper schema interface for Mongoose (without _id)
export interface ResearchPaperSchema extends BaseSchema {
  title: string;
  authors: string[];
  abstract: string;
  field: AcademicField;
  faculty?: Faculty;
  year: number;
  fileId: string; // GridFS reference
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: any; // Will be ObjectId in schema, string in populated response
  tags: string[];
  downloadCount: number;
  viewCount: number;
  saveCount: number;
  viewedBy: any[]; // Array of ObjectIds in schema, strings in response
  downloadedBy: any[]; // Array of ObjectIds in schema, strings in response
  savedBy: any[]; // Array of ObjectIds in schema, strings in response
  status: ContentStatus;
  keywords?: string[];
  supervisor?: string;
  department?: string;
  pendingChanges?: {
    title?: string;
    authors?: string[];
    abstract?: string;
    field?: AcademicField;
    faculty?: Faculty;
    year?: number;
    keywords?: string[];
    tags?: string[];
    supervisor?: string;
    department?: string;
    requestedAt?: Date;
    requestedBy?: any;
    status?: 'pending' | 'approved' | 'rejected';
  };
  pendingDeletion?: {
    requestedAt?: Date;
    requestedBy?: any;
    status?: 'pending' | 'approved' | 'rejected';
  };
}

// Project interface
export interface Project extends BaseDocument {
  title: string;
  description: string;
  authors: string[];
  field: AcademicField;
  faculty?: Faculty;
  year: number;
  academicYear: string; // e.g., "2023/2024"
  files: ProjectFile[];
  uploadedBy: string; // User ID
  tags: string[];
  status: ContentStatus;
  collaborators?: string[];
  supervisor?: string;
  grade?: string;
}

// Project File interface
export interface ProjectFile {
  fileId: string; // GridFS reference
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileType: 'document' | 'presentation' | 'video' | 'image' | 'other';
}

// Idea interface
export interface Idea extends BaseDocument {
  title: string;
  description: string;
  field: AcademicField;
  tags: string[];
  submittedBy: string; // User ID
  votes: number;
  votedBy: string[]; // Array of User IDs
  comments: IdeaComment[];
  status: ContentStatus;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration?: string;
  requiredResources?: string[];
}

// Idea Comment interface
export interface IdeaComment {
  _id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

// Degree Program interface
export interface DegreeProgram extends BaseDocument {
  name: string;
  code: string;
  faculty: Faculty;
  duration: number; // in years
  requirements: string[];
  careerPaths: string[];
  subjects: string[];
  description: string;
  entryRequirements: string[];
  fees?: number;
  isActive: boolean;
}

// Degree Assessment interface
export interface DegreeAssessment extends BaseDocument {
  userId: string;
  answers: AssessmentAnswer[];
  recommendedPrograms: string[]; // Array of DegreeProgram IDs
  score: number;
  completedAt: Date;
}

// Assessment Answer interface
export interface AssessmentAnswer {
  questionId: string;
  answer: string | string[] | number;
}

// Assessment Question interface
export interface AssessmentQuestion {
  _id: string;
  question: string;
  type: 'multiple-choice' | 'rating' | 'text' | 'checkbox';
  options?: string[];
  required: boolean;
  weight: number;
  category: 'interests' | 'skills' | 'career-goals' | 'preferences';
}

// Search Filters interface
export interface SearchFilters {
  field?: AcademicField;
  faculty?: Faculty;
  year?: number;
  tags?: string[];
  author?: string;
  keyword?: string;
  status?: ContentStatus;
}

// API Response interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

// Pagination interface
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// File Upload interface
export interface FileUploadConfig {
  maxSize: number;
  allowedTypes: string[];
  allowedMimeTypes: string[];
}

// Statistics interface
export interface PlatformStats {
  totalPapers: number;
  totalProjects: number;
  totalIdeas: number;
  totalUsers: number;
  recentUploads: number;
  popularFields: { field: AcademicField; count: number }[];
}

// Notification interface
export interface Notification extends BaseDocument {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
}

// Activity Log interface
export interface ActivityLog extends BaseDocument {
  userId: string;
  action: string;
  resourceType: 'paper' | 'project' | 'idea' | 'user';
  resourceId: string;
  details?: string;
  ipAddress?: string;
}
