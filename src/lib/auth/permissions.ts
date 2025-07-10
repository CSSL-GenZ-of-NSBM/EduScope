import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

// Granular permission system for EduScope
export enum Permission {
  // User Management
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_IMPERSONATE = 'user:impersonate',
  
  // Research Paper Management
  PAPER_VIEW_ALL = 'paper:view_all',
  PAPER_MODERATE = 'paper:moderate',
  PAPER_APPROVE = 'paper:approve',
  PAPER_REJECT = 'paper:reject',
  PAPER_DELETE_ANY = 'paper:delete_any',
  PAPER_ANALYTICS = 'paper:analytics',
  
  // Ideas Management
  IDEA_VIEW_ALL = 'idea:view_all',
  IDEA_MODERATE = 'idea:moderate',
  IDEA_DELETE_ANY = 'idea:delete_any',
  IDEA_FEATURE = 'idea:feature',
  
  // Degree Programs
  DEGREE_VIEW = 'degree:view',
  DEGREE_CREATE = 'degree:create',
  DEGREE_UPDATE = 'degree:update',
  DEGREE_DELETE = 'degree:delete',
  DEGREE_MANAGE_REQUESTS = 'degree:manage_requests',
  
  // System Administration
  ADMIN_PANEL_ACCESS = 'admin:panel_access',
  ADMIN_AUDIT_LOGS = 'admin:audit_logs',
  ADMIN_SETTINGS = 'admin:settings',
  ADMIN_SYSTEM_HEALTH = 'admin:system_health',
  ADMIN_BACKUP_RESTORE = 'admin:backup_restore',
  ADMIN_USER_SESSIONS = 'admin:user_sessions',
  
  // Content Moderation
  MODERATE_CONTENT = 'moderate:content',
  MODERATE_COMMENTS = 'moderate:comments',
  MODERATE_REPORTS = 'moderate:reports',
  
  // File Management
  FILE_UPLOAD = 'file:upload',
  FILE_DOWNLOAD_ANY = 'file:download_any',
  FILE_DELETE_ANY = 'file:delete_any',
  FILE_VIRUS_SCAN = 'file:virus_scan',
  
  // Analytics and Reporting
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
  REPORTS_GENERATE = 'reports:generate',
  
  // Faculty-specific permissions
  FACULTY_MANAGE_STUDENTS = 'faculty:manage_students',
  FACULTY_VIEW_ANALYTICS = 'faculty:view_analytics',
  
  // Super Admin only
  SUPER_ADMIN_ALL = 'super_admin:all'
}

// Role-based permission mapping
export const RolePermissions: Record<string, Permission[]> = {
  student: [
    Permission.FILE_UPLOAD,
    // Students can only manage their own content
  ],
  
  moderator: [
    Permission.FILE_UPLOAD,
    Permission.PAPER_VIEW_ALL,
    Permission.PAPER_MODERATE,
    Permission.IDEA_VIEW_ALL,
    Permission.IDEA_MODERATE,
    Permission.MODERATE_CONTENT,
    Permission.MODERATE_COMMENTS,
    Permission.MODERATE_REPORTS,
    Permission.DEGREE_VIEW,
  ],
  
  admin: [
    // Moderator permissions
    Permission.FILE_UPLOAD,
    Permission.PAPER_VIEW_ALL,
    Permission.PAPER_MODERATE,
    Permission.IDEA_VIEW_ALL,
    Permission.IDEA_MODERATE,
    Permission.MODERATE_CONTENT,
    Permission.MODERATE_COMMENTS,
    Permission.MODERATE_REPORTS,
    Permission.DEGREE_VIEW,
    
    // Additional admin permissions
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.PAPER_APPROVE,
    Permission.PAPER_REJECT,
    Permission.PAPER_DELETE_ANY,
    Permission.PAPER_ANALYTICS,
    Permission.IDEA_DELETE_ANY,
    Permission.IDEA_FEATURE,
    Permission.ADMIN_PANEL_ACCESS,
    Permission.ADMIN_AUDIT_LOGS,
    Permission.ADMIN_SETTINGS,
    Permission.ADMIN_SYSTEM_HEALTH,
    Permission.ADMIN_USER_SESSIONS,
    Permission.DEGREE_CREATE,
    Permission.DEGREE_UPDATE,
    Permission.DEGREE_DELETE,
    Permission.DEGREE_MANAGE_REQUESTS,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.REPORTS_GENERATE,
    Permission.FACULTY_MANAGE_STUDENTS,
    Permission.FACULTY_VIEW_ANALYTICS,
    Permission.FILE_DOWNLOAD_ANY,
    Permission.FILE_DELETE_ANY,
    Permission.FILE_VIRUS_SCAN,
  ],
  
  superadmin: [
    // All admin permissions
    Permission.FILE_UPLOAD,
    Permission.PAPER_VIEW_ALL,
    Permission.PAPER_MODERATE,
    Permission.IDEA_VIEW_ALL,
    Permission.IDEA_MODERATE,
    Permission.MODERATE_CONTENT,
    Permission.MODERATE_COMMENTS,
    Permission.MODERATE_REPORTS,
    Permission.DEGREE_VIEW,
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.PAPER_APPROVE,
    Permission.PAPER_REJECT,
    Permission.PAPER_DELETE_ANY,
    Permission.PAPER_ANALYTICS,
    Permission.IDEA_DELETE_ANY,
    Permission.IDEA_FEATURE,
    Permission.ADMIN_PANEL_ACCESS,
    Permission.ADMIN_AUDIT_LOGS,
    Permission.ADMIN_SETTINGS,
    Permission.ADMIN_SYSTEM_HEALTH,
    Permission.ADMIN_USER_SESSIONS,
    Permission.DEGREE_CREATE,
    Permission.DEGREE_UPDATE,
    Permission.DEGREE_DELETE,
    Permission.DEGREE_MANAGE_REQUESTS,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.REPORTS_GENERATE,
    Permission.FACULTY_MANAGE_STUDENTS,
    Permission.FACULTY_VIEW_ANALYTICS,
    Permission.FILE_DOWNLOAD_ANY,
    Permission.FILE_DELETE_ANY,
    Permission.FILE_VIRUS_SCAN,
    
    // Super admin only permissions
    Permission.USER_IMPERSONATE,
    Permission.ADMIN_BACKUP_RESTORE,
    Permission.SUPER_ADMIN_ALL,
  ]
}

// Faculty-based additional permissions
export const FacultyPermissions: Record<string, Permission[]> = {
  'Faculty of Computing': [
    Permission.FACULTY_VIEW_ANALYTICS,
  ],
  'Faculty of Engineering': [
    Permission.FACULTY_VIEW_ANALYTICS,
  ],
  'Faculty of Business': [
    Permission.FACULTY_VIEW_ANALYTICS,
  ],
  'Faculty of Science': [
    Permission.FACULTY_VIEW_ANALYTICS,
  ],
}

// Resource-based permissions (for fine-grained access control)
export interface ResourcePermission {
  resource: string
  resourceId?: string
  permission: Permission
  conditions?: {
    ownership?: boolean // User owns the resource
    faculty?: string[] // User belongs to specific faculty
    role?: string[] // User has specific role
    timeRestriction?: {
      startTime?: string
      endTime?: string
    }
  }
}

export class PermissionChecker {
  private user: any

  constructor(user: any) {
    this.user = user
  }

  // Check if user has a specific permission
  hasPermission(permission: Permission): boolean {
    if (!this.user || !this.user.role) {
      return false
    }

    // Super admin has all permissions
    if (this.user.role === 'superadmin') {
      return true
    }

    const rolePermissions = RolePermissions[this.user.role] || []
    return rolePermissions.includes(permission)
  }

  // Check multiple permissions (user must have ALL)
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission))
  }

  // Check multiple permissions (user must have ANY)
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission))
  }

  // Check resource-specific permission
  hasResourcePermission(resourcePermission: ResourcePermission): boolean {
    // Check basic permission first
    if (!this.hasPermission(resourcePermission.permission)) {
      return false
    }

    // Check additional conditions
    if (resourcePermission.conditions) {
      const { ownership, faculty, role, timeRestriction } = resourcePermission.conditions

      // Check ownership
      if (ownership && resourcePermission.resourceId !== this.user.id) {
        return false
      }

      // Check faculty restriction
      if (faculty && !faculty.includes(this.user.faculty)) {
        return false
      }

      // Check role restriction
      if (role && !role.includes(this.user.role)) {
        return false
      }

      // Check time restriction
      if (timeRestriction) {
        const now = new Date()
        const currentTime = now.getHours() * 100 + now.getMinutes()
        
        if (timeRestriction.startTime) {
          const [hours, minutes] = timeRestriction.startTime.split(':').map(Number)
          const startTime = hours * 100 + minutes
          if (currentTime < startTime) return false
        }
        
        if (timeRestriction.endTime) {
          const [hours, minutes] = timeRestriction.endTime.split(':').map(Number)
          const endTime = hours * 100 + minutes
          if (currentTime > endTime) return false
        }
      }
    }

    return true
  }

  // Get all permissions for the user
  getAllPermissions(): Permission[] {
    if (!this.user || !this.user.role) {
      return []
    }

    const rolePermissions = RolePermissions[this.user.role] || []
    const facultyPermissions = this.user.faculty ? FacultyPermissions[this.user.faculty] || [] : []
    
    return [...new Set([...rolePermissions, ...facultyPermissions])]
  }

  // Check if user can access a specific route/endpoint
  canAccessEndpoint(endpoint: string, method: string = 'GET'): boolean {
    const endpointPermissions: Record<string, Permission[]> = {
      '/api/admin/users': [Permission.USER_VIEW],
      '/api/admin/audit-logs': [Permission.ADMIN_AUDIT_LOGS],
      '/api/admin/degrees': [Permission.DEGREE_VIEW, Permission.DEGREE_CREATE],
      '/api/admin/research': [Permission.PAPER_VIEW_ALL],
      // Add more endpoint mappings as needed
    }

    const requiredPermissions = endpointPermissions[endpoint]
    if (!requiredPermissions) {
      // If endpoint not mapped, fall back to role check
      return ['admin', 'superadmin'].includes(this.user.role)
    }

    return this.hasAnyPermission(requiredPermissions)
  }
}

// Middleware function to check permissions
export async function requirePermission(
  permission: Permission | Permission[]
) {
  return async (request: NextRequest): Promise<{ allowed: boolean; user?: any; error?: string }> => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user) {
        return { allowed: false, error: 'Authentication required' }
      }

      const checker = new PermissionChecker(session.user)
      const permissions = Array.isArray(permission) ? permission : [permission]
      
      if (!checker.hasAnyPermission(permissions)) {
        return { 
          allowed: false, 
          user: session.user,
          error: `Insufficient permissions. Required: ${permissions.join(' or ')}` 
        }
      }

      return { allowed: true, user: session.user }
    } catch (error) {
      return { allowed: false, error: 'Permission check failed' }
    }
  }
}

// Helper function to create permission-protected API handlers
export function withPermissions(
  requiredPermissions: Permission | Permission[],
  handler: (request: NextRequest, user: any) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const permissionCheck = await requirePermission(requiredPermissions)
    const result = await permissionCheck(request)
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error || 'Access denied' 
        }),
        { 
          status: result.error === 'Authentication required' ? 401 : 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(request, result.user)
  }
}

// Permission validation for React components (client-side)
export function usePermissions(user: any) {
  if (!user) return null
  return new PermissionChecker(user)
}

export default PermissionChecker
