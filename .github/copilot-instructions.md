# EduScope - Academic Platform for NSBM Green University - Copilot Instructions

## Project Overview
EduScope is a comprehensive academic platform designed specifically for NSBM Green University students to foster research collaboration and academic guidance. The platform serves three main purposes: research paper and project sharing, an idea bank for academic inspiration, and degree guidance for incoming students. It provides a centralized hub where students can upload, browse, and share academic content while helping new students choose suitable degree paths.

## Technology Stack
- **Frontend**: Next.js 14 with TypeScript
- **Backend**: RESTful API with Next.js API Routes
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose
- **Authentication**: NextAuth.js
- **File Storage**: GridFS (MongoDB) or cloud storage integration
- **UI Components**: shadcn/ui with Tailwind CSS
- **Form Handling**: React Hook Form with validation
- **API Client**: Axios or native fetch
- **Type Safety**: TypeScript with strict mode

## Project colors
```
122023
2ecc40
000000
ffffff
```

- Font of the logo: Urbanist

## Architecture Principles

### Code Organization
- Use feature-based folder structure organized by academic domains
- Implement clean architecture patterns with separation of concerns
- Follow Next.js 14 app router conventions
- Use strict TypeScript for type safety and documentation
- Implement modular components for academic content display
- Use shadcn/ui components as the foundation for all UI elements

### File Structure Convention
```
src/
├── app/                   # Next.js 14 app router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Main dashboard routes
│   ├── research/          # Research paper management
│   ├── projects/          # Project sharing features
│   ├── ideas/             # Idea bank functionality
│   ├── guidance/          # Degree recommendation system
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui base components
│   ├── research/          # Research-specific components
│   ├── projects/          # Project-specific components
│   ├── ideas/             # Idea bank components
│   ├── guidance/          # Degree guidance components
│   └── layout/            # Layout components
├── lib/                   # Utility libraries and configurations
│   ├── auth/              # Authentication utilities
│   ├── db/                # Database configuration and models
│   ├── validation/        # Form and data validation schemas
│   ├── file-upload/       # File handling utilities
│   ├── recommendation/    # Degree recommendation algorithm
│   └── utils/             # Helper functions
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts for state management
└── middleware.ts          # Next.js middleware
```

## UI/UX Guidelines

### Component Library
- Use shadcn/ui as the primary component library
- Customize components with Tailwind CSS for NSBM branding
- Implement consistent design tokens across the platform
- Use shadcn/ui's theming system for dark/light mode support
- Follow accessibility standards built into shadcn/ui components

### Academic-Specific Components
- **Research Paper Cards**: Use shadcn/ui Card with custom academic metadata
- **File Upload Areas**: Implement drag-and-drop with shadcn/ui styling
- **Data Tables**: Use shadcn/ui Table for research listings and analytics
- **Search Interfaces**: Combine Command + Popover for advanced search
- **Form Components**: Use Form + Input components for all user inputs
- **Navigation**: Use shadcn/ui NavigationMenu for main navigation
- **Dialogs**: Use Dialog components for paper previews and modals

### TypeScript Integration
- Define strict types for all shadcn/ui component props
- Create academic domain-specific type definitions
- Use TypeScript interfaces for all data models
- Implement proper type safety for form handling
- Use generic types for reusable components

## Academic Domain Guidelines

### Research Paper Management
- Support multiple file formats (PDF, DOC, DOCX)
- Implement proper academic categorization (Engineering, Business, Computing, etc.)
- Use metadata extraction for paper information
- Implement search and filter functionality by field, year, author
- Support academic citation formats

### Project Sharing
- Allow multimedia project uploads (documents, presentations, videos)
- Implement project categorization by academic year and field
- Support collaborative features like comments and feedback
- Track project versions and updates
- Implement proper academic integrity measures

### Idea Bank
- Categorize ideas by academic disciplines
- Support idea voting and popularity tracking
- Implement idea tagging and search functionality
- Allow idea collaboration and expansion
- Track idea implementation and success stories

### Degree Guidance System
- Implement recommendation algorithms based on student preferences
- Support questionnaire-based assessment
- Provide detailed degree program information
- Include career path projections
- Support comparison features between degrees

## Security Guidelines

### Authentication & Authorization
- Use NextAuth.js with secure session management
- Implement role-based access (Student, Admin, Moderator)
- Students have the lowest access level (able to upload research and ideas and view them as well), Admins have full access
- Moderators can manage content but not user accounts
- Ensure NSBM domain email validation (@students.nsbm.ac.lk)
- Implement proper JWT token handling with refresh tokens
- Follow principle of least privilege
- Validate user permissions on both client and server side
- Use middleware for route protection

### Content Security
- Validate all uploaded academic content
- Implement virus scanning for file uploads
- Use content moderation for inappropriate material
- Ensure academic integrity and plagiarism prevention
- Implement proper content ownership tracking

### Input validation
- Sanitize all user inputs to prevent XSS attacks
- Implement server-side validation for all API endpoints
- Use parameterized queries to prevent SQL injection
- Validate file uploads with proper type checking and size limits

### Data Protection
- Encrypt sensitive data at rest and in transit
- Use environment variables for all secrets
- Implement proper password hashing with bcrypt
- Follow GDPR/privacy compliance requirements
- Use HTTPS only in production
- Implement proper CORS policies
- Use secure file storage with access controls

### API Security
- Implement rate limiting on all endpoints
- Use CSRF protection for state-changing operations
- Implement proper error handling without information leakage
- Use API versioning for backward compatibility
- Implement request/response logging for audit trails

## Database Guidelines

### MongoDB Best Practices
- Design schemas for academic content relationships
- Implement proper indexing for search functionality
- Use GridFS for large file storage
- Implement data validation at schema level
- Use transactions for data consistency

### Academic Data Models
```typescript
// Example TypeScript interfaces
interface ResearchPaper {
  _id: string;
  title: string;
  authors: string[];
  abstract: string;
  field: AcademicField;
  year: number;
  fileId: string; // GridFS reference
  uploadedBy: string;
  tags: string[];
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DegreeProgram {
  _id: string;
  name: string;
  faculty: Faculty;
  duration: number;
  requirements: string[];
  careerPaths: string[];
  subjects: string[];
  description: string;
}

enum AcademicField {
  ENGINEERING = 'engineering',
  BUSINESS = 'business',
  COMPUTING = 'computing',
  SCIENCE = 'science'
}

enum Faculty {
  ENGINEERING = 'Faculty of Engineering',
  BUSINESS = 'Faculty of Business',
  COMPUTING = 'Faculty of Computing',
  SCIENCE = 'Faculty of Science'
}
```

## File Management

### Upload Handling
- Implement secure file upload with size limits
- Support academic file formats (PDF, DOC, PPT, etc.)
- Use virus scanning before storage
- Implement file compression for optimization
- Generate thumbnails and previews where possible
- Use shadcn/ui components for upload interface

### Storage Strategy
- Use GridFS for MongoDB file storage
- Implement CDN for faster file delivery
- Use proper file naming conventions
- Implement backup strategies for academic content
- Support version control for updated papers

## Search and Discovery

### Academic Search Features
- Implement full-text search across papers and projects
- Support field-specific filtering
- Implement author and keyword search
- Use relevance scoring for search results
- Support advanced search with multiple criteria
- Use shadcn/ui Command component for search interface
- Implement Select components for filtering

### Recommendation Engine
- Implement content-based recommendations
- Use collaborative filtering for popular content
- Recommend related papers and projects
- Suggest relevant ideas based on browsing history
- Implement trending content detection

## User Experience Guidelines

### Academic Content Display
- Use clean, academic-focused UI design with shadcn/ui
- Implement proper content preview functionality
- Support multiple view modes (grid, list, detailed)
- Use academic color schemes and typography
- Implement accessibility features for all users
- Use consistent spacing and layout with Tailwind CSS

### Navigation and Discovery
- Implement intuitive category navigation with NavigationMenu
- Use breadcrumb navigation for complex hierarchies
- Support bookmarking and favorites
- Implement recently viewed content
- Use progressive disclosure for detailed information

## Performance Guidelines

### Content Delivery
- Implement lazy loading for large content lists
- Use pagination for search results
- Optimize image and document loading
- Implement caching strategies for frequently accessed content
- Use CDN for static academic resources

### Database Optimization
- Index frequently searched fields
- Implement aggregation pipelines for analytics
- Use proper query optimization
- Implement connection pooling
- Monitor database performance metrics

## Docker Configuration

### Container Strategy
- Separate containers for Next.js app and MongoDB
- Use multi-stage builds for optimization
- Implement proper environment variable handling
- Use volume mounting for persistent data
- Implement health checks for all services

### Development Environment
- Ensure consistent development setup with Docker
- Use docker-compose for local development
- Implement hot reloading in development
- Support database seeding for development
- Use environment-specific configurations

## TypeScript Best Practices

### Type Definitions
- Define strict interfaces for all data models
- Use union types for academic categories and enums
- Implement generic types for reusable components
- Create type guards for runtime type checking
- Use utility types for form handling and API responses

### Component Types
```typescript
// Example component type definitions
interface ResearchPaperCardProps {
  paper: ResearchPaper;
  onDownload: (paperId: string) => void;
  onView: (paperId: string) => void;
  className?: string;
}

interface SearchFiltersProps {
  fields: AcademicField[];
  years: number[];
  onFiltersChange: (filters: SearchFilters) => void;
}

interface SearchFilters {
  field?: AcademicField;
  year?: number;
  author?: string;
  tags?: string[];
}
```

## Academic Integrity

### Content Validation
- Implement plagiarism detection for uploaded content
- Verify student ownership of uploaded work
- Support proper attribution and citation
- Implement content reporting mechanisms
- Maintain academic standards compliance

### Moderation Features
- Implement content review workflows
- Support admin moderation tools
- Track content quality metrics
- Implement user reputation systems
- Support content flagging and removal

## Analytics and Insights

### Usage Analytics
- Track popular research areas and trends
- Monitor content download and view statistics
- Analyze degree guidance usage patterns
- Generate academic insights and reports
- Support institutional analytics

### Student Insights
- Track student engagement with academic content
- Analyze search and discovery patterns
- Monitor degree guidance effectiveness
- Generate personalized academic recommendations
- Support academic progress tracking

## API Design Standards

### Academic Content APIs
- Implement RESTful endpoints for all content types
- Use consistent response formats with TypeScript interfaces
- Support filtering, sorting, and pagination
- Implement proper error handling
- Use academic-specific status codes and messages

### TypeScript API Types
```typescript
// API response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

## Testing Strategy

### Academic Content Testing
- Test file upload and download functionality
- Validate search and filter accuracy
- Test recommendation algorithm effectiveness
- Ensure proper content categorization
- Test degree guidance recommendation accuracy
- Use TypeScript for type-safe test implementations

### User Journey Testing
- Test complete student onboarding flows
- Validate research paper upload and sharing
- Test idea bank functionality
- Ensure degree guidance questionnaire accuracy
- Test cross-platform compatibility

## Compliance and Standards

### Academic Standards
- Follow academic publication standards
- Implement proper citation requirements
- Ensure content quality standards
- Support academic freedom principles
- Maintain educational institution compliance

### Data Governance
- Implement proper data retention for academic content
- Support student data privacy rights
- Ensure institutional data security requirements
- Maintain audit trails for academic content
- Support compliance reporting requirements

## NSBM-Specific Requirements

### University Integration
- Implement NSBM-specific degree programs
- Support NSBM academic calendar integration
- Use university-specific terminology
- Implement proper faculty and department structures

### Student Lifecycle Support
- Support new student onboarding
- Implement graduation project tracking
- Support alumni content contributions
- Enable faculty supervision features
- Support academic advisor integration