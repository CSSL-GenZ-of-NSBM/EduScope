/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '../route'
import { Faculty } from '@/types'

// Mock dependencies
jest.mock('@/lib/db/mongodb')
jest.mock('@/lib/db/models/User')
jest.mock('@/lib/audit/audit-logger')

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}))

import { connectDB } from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import { auditLogger } from '@/lib/audit/audit-logger'
import bcrypt from 'bcryptjs'

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>
const mockUser = {
  findOne: jest.fn(),
  create: jest.fn(),
} as any
const mockAuditLogger = auditLogger as jest.Mocked<typeof auditLogger>
const mockHash = jest.mocked(bcrypt.hash)

// Override the default export
Object.defineProperty(User, 'findOne', { value: mockUser.findOne })
Object.defineProperty(User, 'create', { value: mockUser.create })

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConnectDB.mockResolvedValue(undefined)
    // Reset bcrypt mock directly
    ;(bcrypt.hash as any).mockResolvedValue('hashedPassword')
  })

  describe('POST', () => {
    it('should register a new student successfully', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john.doe@students.nsbm.ac.lk',
        password: 'password123',
        studentId: 'STU001',
        faculty: Faculty.COMPUTING,
        year: 2,
      }

      mockUser.findOne.mockResolvedValue(null) // User doesn't exist
      mockUser.create.mockResolvedValue({
        _id: 'user123',
        ...validData,
        role: 'student',
      })
      mockAuditLogger.logUserAction.mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('User created successfully')
      expect(data.user).toMatchObject({
        id: 'user123',
        name: 'John Doe',
        email: 'john.doe@students.nsbm.ac.lk',
        studentId: 'STU001',
        faculty: Faculty.COMPUTING,
      })
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
      expect(mockAuditLogger.logUserAction).toHaveBeenCalled()
    })

    it('should reject non-NSBM email addresses', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john.doe@gmail.com', // Invalid email domain
        password: 'password123',
        studentId: 'STU001',
        faculty: Faculty.COMPUTING,
        year: 2,
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(mockUser.create).not.toHaveBeenCalled()
    })

    it('should reject duplicate email addresses', async () => {
      const duplicateData = {
        name: 'John Doe',
        email: 'existing@students.nsbm.ac.lk',
        password: 'password123',
        studentId: 'STU001',
        faculty: Faculty.COMPUTING,
        year: 2,
      }

      mockUser.findOne.mockResolvedValue({ email: 'existing@students.nsbm.ac.lk' }) // User exists
      mockAuditLogger.log.mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(duplicateData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User with this email or student ID already exists')
      expect(mockUser.create).not.toHaveBeenCalled()
      expect(mockAuditLogger.log).toHaveBeenCalled() // Should log failed attempt
    })

    it('should handle validation errors properly', async () => {
      const invalidData = {
        name: '', // Empty name
        email: 'john.doe@students.nsbm.ac.lk',
        password: '123', // Too short password
        studentId: 'STU001',
        faculty: Faculty.COMPUTING,
        year: 2,
      }

      mockAuditLogger.log.mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details).toBeDefined()
      expect(mockUser.create).not.toHaveBeenCalled()
      expect(mockAuditLogger.log).toHaveBeenCalled() // Should log validation failure
    })

    it('should handle database errors gracefully', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john.doe@students.nsbm.ac.lk',
        password: 'password123',
        studentId: 'STU001',
        faculty: Faculty.COMPUTING,
        year: 2,
      }

      mockConnectDB.mockRejectedValue(new Error('Database connection failed'))
      mockAuditLogger.log.mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
      expect(mockAuditLogger.log).toHaveBeenCalled() // Should log error
    })
  })
})
