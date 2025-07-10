import winston from 'winston'
import { getMongoDBClient } from '@/lib/db/mongodb'
import { AuditLog, AuditAction, AuditResource } from '@/types'

interface AuditLogData {
  userId: string
  userEmail: string
  userRole: string
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

class AuditLogger {
  private static instance: AuditLogger
  private logger: winston.Logger
  
  private constructor() {
    // Configure Winston logger for audit logging
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'eduscope-audit' },
      transports: [
        // Write all audit logs to audit.log file
        new winston.transports.File({ 
          filename: 'logs/audit.log',
          maxsize: 10485760, // 10MB
          maxFiles: 10,
          tailable: true
        }),
        // Write only errors to error.log
        new winston.transports.File({ 
          filename: 'logs/audit-error.log', 
          level: 'error',
          maxsize: 10485760,
          maxFiles: 5
        })
      ]
    })

    // Add console logging in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }))
    }
  }
  
  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  async log(data: AuditLogData): Promise<void> {
    try {
      // Log to Winston first
      this.logger.info('Audit Log Entry', {
        userId: data.userId,
        userEmail: data.userEmail,
        userRole: data.userRole,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata || {},
        timestamp: new Date().toISOString()
      })

      // Also store in MongoDB for admin panel access
      const client = await getMongoDBClient()
      const db = client.db()
      
      const auditEntry: Omit<AuditLog, '_id'> = {
        userId: data.userId,
        userEmail: data.userEmail,
        userRole: data.userRole,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata || {},
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('audit_logs').insertOne(auditEntry)
    } catch (error) {
      // Log error to Winston error transport
      this.logger.error('Failed to log audit entry', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        originalData: data
      })
      // Don't throw error to avoid disrupting main application flow
    }
  }

  async logUserAction(
    userId: string,
    userEmail: string,
    userRole: string,
    action: AuditAction,
    resource: AuditResource,
    resourceId?: string,
    details?: Record<string, any>,
    request?: Request
  ): Promise<void> {
    const ipAddress = this.getClientIP(request)
    const userAgent = request?.headers.get('user-agent') || undefined

    await this.log({
      userId,
      userEmail,
      userRole,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent
    })
  }

  async logAdminAction(
    adminId: string,
    adminEmail: string,
    adminRole: string,
    action: AuditAction,
    resource: AuditResource,
    targetUserId?: string,
    resourceId?: string,
    details?: Record<string, any>,
    request?: Request
  ): Promise<void> {
    const ipAddress = this.getClientIP(request)
    const userAgent = request?.headers.get('user-agent') || undefined

    await this.log({
      userId: adminId,
      userEmail: adminEmail,
      userRole: adminRole,
      action,
      resource,
      resourceId,
      details: {
        ...details,
        targetUserId,
        isAdminAction: true
      },
      ipAddress,
      userAgent
    })
  }

  private getClientIP(request?: Request): string | undefined {
    if (!request) return undefined
    
    return (
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      undefined
    )
  }

  async getAuditLogs(
    filters: {
      userId?: string
      action?: AuditAction
      resource?: AuditResource
      startDate?: Date
      endDate?: Date
      limit?: number
      offset?: number
    } = {}
  ): Promise<AuditLog[]> {
    try {
      const client = await getMongoDBClient()
      const db = client.db()
      
      const query: Record<string, any> = {}
      
      if (filters.userId) query.userId = filters.userId
      if (filters.action) query.action = filters.action
      if (filters.resource) query.resource = filters.resource
      
      if (filters.startDate || filters.endDate) {
        query.timestamp = {}
        if (filters.startDate) query.timestamp.$gte = filters.startDate
        if (filters.endDate) query.timestamp.$lte = filters.endDate
      }

      const cursor = db.collection('audit_logs')
        .find(query)
        .sort({ timestamp: -1 })
        .limit(filters.limit || 100)
        .skip(filters.offset || 0)

      return await cursor.toArray() as unknown as AuditLog[]
    } catch (error) {
      this.logger.error('Failed to retrieve audit logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        filters
      })
      return []
    }
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.getAuditLogs({ userId, limit })
  }

  async getRecentActivity(limit: number = 100): Promise<AuditLog[]> {
    return this.getAuditLogs({ limit })
  }
}

export const auditLogger = AuditLogger.getInstance()
