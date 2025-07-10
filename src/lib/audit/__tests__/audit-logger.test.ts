/**
 * @jest-environment node
 */
import { auditLogger } from '../audit-logger'
import { AuditAction, AuditResource } from '@/types'
import { getMongoDBClient } from '@/lib/db/mongodb'

// Mock the database connection
jest.mock('@/lib/db/mongodb')
const mockGetMongoDBClient = getMongoDBClient as jest.MockedFunction<typeof getMongoDBClient>

// Mock Winston
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    add: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    File: jest.fn(),
    Console: jest.fn(),
  },
}))

describe('AuditLogger', () => {
  let mockDb: any
  let mockCollection: any
  let mockClient: any

  beforeEach(() => {
    mockCollection = {
      insertOne: jest.fn(),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    }

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    }

    mockClient = {
      db: jest.fn().mockReturnValue(mockDb),
    }

    mockGetMongoDBClient.mockResolvedValue(mockClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('log', () => {
    it('should log audit entry successfully', async () => {
      const auditData = {
        userId: 'user123',
        userEmail: 'test@example.com',
        userRole: 'student',
        action: AuditAction.USER_VIEW,
        resource: AuditResource.USER,
        resourceId: 'resource123',
        details: { test: 'data' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      }

      mockCollection.insertOne.mockResolvedValue({ insertedId: 'audit123' })

      await auditLogger.log(auditData)

      expect(mockGetMongoDBClient).toHaveBeenCalled()
      expect(mockDb.collection).toHaveBeenCalledWith('audit_logs')
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          userEmail: 'test@example.com',
          userRole: 'student',
          action: AuditAction.USER_VIEW,
          resource: AuditResource.USER,
          resourceId: 'resource123',
          details: { test: 'data' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          timestamp: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      )
    })

    it('should handle logging errors gracefully', async () => {
      const auditData = {
        userId: 'user123',
        userEmail: 'test@example.com',
        userRole: 'student',
        action: AuditAction.USER_VIEW,
        resource: AuditResource.USER,
      }

      mockGetMongoDBClient.mockRejectedValue(new Error('Database error'))
      
      // Should not throw error
      await expect(auditLogger.log(auditData)).resolves.toBeUndefined()
    })
  })

  describe('logUserAction', () => {
    it('should log user action with request details', async () => {
      const mockRequest = {
        headers: new Map([
          ['x-forwarded-for', '192.168.1.1'],
          ['user-agent', 'Mozilla/5.0'],
        ]),
      } as any

      mockRequest.headers.get = jest.fn((key: string) => {
        const map: Record<string, string> = {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0',
        }
        return map[key]
      })

      await auditLogger.logUserAction(
        'user123',
        'test@example.com',
        'student',
        AuditAction.PAPER_VIEW,
        AuditResource.RESEARCH_PAPER,
        'paper123',
        { title: 'Test Paper' },
        mockRequest
      )

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          action: AuditAction.PAPER_VIEW,
          resource: AuditResource.RESEARCH_PAPER,
          resourceId: 'paper123',
          details: { title: 'Test Paper' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        })
      )
    })
  })

  describe('getAuditLogs', () => {
    it('should retrieve audit logs with filters', async () => {
      const mockLogs = [
        { _id: '1', action: AuditAction.USER_VIEW, timestamp: new Date() },
        { _id: '2', action: AuditAction.PAPER_VIEW, timestamp: new Date() },
      ]

      mockCollection.toArray.mockResolvedValue(mockLogs)

      const filters = {
        userId: 'user123',
        action: AuditAction.USER_VIEW,
        limit: 10,
      }

      const result = await auditLogger.getAuditLogs(filters)

      expect(mockCollection.find).toHaveBeenCalledWith({
        userId: 'user123',
        action: AuditAction.USER_VIEW,
      })
      expect(mockCollection.sort).toHaveBeenCalledWith({ timestamp: -1 })
      expect(mockCollection.limit).toHaveBeenCalledWith(10)
      expect(result).toEqual(mockLogs)
    })

    it('should handle date range filters', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      mockCollection.toArray.mockResolvedValue([])

      await auditLogger.getAuditLogs({ startDate, endDate })

      expect(mockCollection.find).toHaveBeenCalledWith({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
    })

    it('should handle database errors gracefully', async () => {
      mockGetMongoDBClient.mockRejectedValue(new Error('Database error'))

      const result = await auditLogger.getAuditLogs()

      expect(result).toEqual([])
    })
  })

  describe('getUserActivity', () => {
    it('should get user activity logs', async () => {
      const mockLogs = [{ _id: '1', userId: 'user123' }]
      mockCollection.toArray.mockResolvedValue(mockLogs)

      const result = await auditLogger.getUserActivity('user123', 25)

      expect(mockCollection.find).toHaveBeenCalledWith({
        userId: 'user123',
      })
      expect(mockCollection.limit).toHaveBeenCalledWith(25)
      expect(result).toEqual(mockLogs)
    })
  })
})
