import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { auditLogger } from './audit-logger'
import { AuditAction, AuditResource } from '@/types'

interface AuditMiddlewareConfig {
  action: AuditAction
  resource: AuditResource
  extractResourceId?: (request: NextRequest) => string | undefined
  extractDetails?: (request: NextRequest, response?: NextResponse) => Record<string, any>
  skipLogging?: (request: NextRequest) => boolean
}

export function createAuditMiddleware(config: AuditMiddlewareConfig) {
  return async function auditMiddleware(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now()
    
    // Check if logging should be skipped
    if (config.skipLogging && config.skipLogging(request)) {
      return handler(request)
    }

    // Get user session
    const session = await getServerSession(authOptions)
    
    // Execute the main handler
    const response = await handler(request)
    
    // Log the action (only if user is authenticated for most actions)
    if (session?.user) {
      try {
        const resourceId = config.extractResourceId ? config.extractResourceId(request) : undefined
        const details = config.extractDetails ? config.extractDetails(request, response) : {}
        
        // Add timing and status information
        const auditDetails = {
          ...details,
          duration: Date.now() - startTime,
          statusCode: response.status,
          method: request.method,
          path: request.nextUrl.pathname,
          query: Object.fromEntries(request.nextUrl.searchParams.entries())
        }

        await auditLogger.logUserAction(
          session.user.id,
          session.user.email || '',
          session.user.role || '',
          config.action,
          config.resource,
          resourceId,
          auditDetails,
          request
        )
      } catch (error) {
        console.error('Audit logging failed:', error)
        // Don't throw error to avoid disrupting the main flow
      }
    }

    return response
  }
}

export function createAdminAuditMiddleware(config: AuditMiddlewareConfig) {
  return async function adminAuditMiddleware(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now()
    
    // Get user session
    const session = await getServerSession(authOptions)
    
    // Execute the main handler
    const response = await handler(request)
    
    // Log admin actions
    if (session?.user && ['admin', 'superadmin', 'moderator'].includes(session.user.role)) {
      try {
        const resourceId = config.extractResourceId ? config.extractResourceId(request) : undefined
        const details = config.extractDetails ? config.extractDetails(request, response) : {}
        
        // Extract target user ID for admin actions on users
        const targetUserId = request.nextUrl.pathname.includes('/users/') 
          ? request.nextUrl.pathname.split('/users/')[1]?.split('/')[0]
          : undefined

        const auditDetails = {
          ...details,
          duration: Date.now() - startTime,
          statusCode: response.status,
          method: request.method,
          path: request.nextUrl.pathname,
          query: Object.fromEntries(request.nextUrl.searchParams.entries()),
          adminAction: true
        }

        await auditLogger.logAdminAction(
          session.user.id,
          session.user.email || '',
          session.user.role || '',
          config.action,
          config.resource,
          targetUserId,
          resourceId,
          auditDetails,
          request
        )
      } catch (error) {
        console.error('Admin audit logging failed:', error)
      }
    }

    return response
  }
}

// Utility function to extract request body for logging
export async function extractRequestBody(request: NextRequest): Promise<Record<string, any>> {
  try {
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const body = await request.json()
      // Remove sensitive fields
      const { password, ...safeBody } = body
      return safeBody
    }
  } catch (error) {
    // Ignore parsing errors
  }
  return {}
}

// Common audit configurations
export const commonAuditConfigs = {
  userView: {
    action: AuditAction.USER_VIEW,
    resource: AuditResource.USER,
    extractResourceId: (req: NextRequest) => req.nextUrl.pathname.split('/').pop()
  },
  paperView: {
    action: AuditAction.PAPER_VIEW,
    resource: AuditResource.RESEARCH_PAPER,
    extractResourceId: (req: NextRequest) => req.nextUrl.pathname.split('/').pop()
  },
  paperDownload: {
    action: AuditAction.PAPER_DOWNLOAD,
    resource: AuditResource.RESEARCH_PAPER,
    extractResourceId: (req: NextRequest) => req.nextUrl.pathname.split('/').pop()
  },
  adminUserManagement: {
    action: AuditAction.ADMIN_USER_MANAGEMENT,
    resource: AuditResource.USER,
    extractResourceId: (req: NextRequest) => {
      const pathParts = req.nextUrl.pathname.split('/')
      const userIndex = pathParts.indexOf('users')
      return userIndex !== -1 && pathParts[userIndex + 1] ? pathParts[userIndex + 1] : undefined
    },
    extractDetails: async (req: NextRequest) => await extractRequestBody(req)
  }
}
