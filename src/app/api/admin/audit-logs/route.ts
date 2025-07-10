import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { auditLogger } from '@/lib/audit/audit-logger'
import { AuditAction, AuditResource } from '@/types'
import { withRateLimit, rateLimiters } from '@/lib/rate-limit/rate-limiter'

// GET /api/admin/audit-logs - Retrieve audit logs (Admin and Super Admin only)
async function getAuditLogs(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admins and super admins can view audit logs
    if (!['admin', 'superadmin'].includes(session.user.role)) {
      await auditLogger.logUserAction(
        session.user.id,
        session.user.email || 'unknown@email.com',
        session.user.role,
        'READ' as AuditAction,
        'AUDIT_LOG' as AuditResource,
        undefined,
        { 
          error: 'Unauthorized access attempt to audit logs',
          userRole: session.user.role
        },
        request
      )

      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Only admins can view audit logs.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const userId = searchParams.get('userId') || undefined
    const action = searchParams.get('action') as AuditAction || undefined
    const resource = searchParams.get('resource') as AuditResource || undefined
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate limit and offset
    const validatedLimit = Math.min(Math.max(limit, 1), 1000) // Between 1 and 1000
    const validatedOffset = Math.max(offset, 0)

    // Get audit logs
    const auditLogs = await auditLogger.getAuditLogs({
      userId,
      action,
      resource,
      startDate,
      endDate,
      limit: validatedLimit,
      offset: validatedOffset
    })

    // Log this access to audit logs
    await auditLogger.logAdminAction(
      session.user.id,
      session.user.email || 'unknown@email.com',
      session.user.role,
      'READ' as AuditAction,
      'AUDIT_LOG' as AuditResource,
      undefined,
      undefined,
      {
        filters: {
          userId,
          action,
          resource,
          startDate,
          endDate,
          limit: validatedLimit,
          offset: validatedOffset
        },
        resultsCount: auditLogs.length
      },
      request
    )

    return NextResponse.json({
      success: true,
      data: auditLogs,
      pagination: {
        limit: validatedLimit,
        offset: validatedOffset,
        total: auditLogs.length
      }
    })

  } catch (error) {
    console.error('Failed to retrieve audit logs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve audit logs' },
      { status: 500 }
    )
  }
}

// Apply rate limiting to the audit logs endpoint
export const GET = withRateLimit(rateLimiters.admin, getAuditLogs)
