import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (request: NextRequest) => string
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

export class RateLimiter {
  private store: RateLimitStore = {}
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (request: NextRequest) => this.defaultKeyGenerator(request),
      ...config
    }

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  private defaultKeyGenerator(request: NextRequest): string {
    const ip = this.getClientIP(request)
    return `rate_limit:${ip}`
  }

  private getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    )
  }

  private cleanup(): void {
    const now = Date.now()
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    })
  }

  async checkLimit(request: NextRequest): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    const key = this.config.keyGenerator!(request)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get or create rate limit entry
    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.config.windowMs
      }
    }

    const entry = this.store[key]
    const allowed = entry.count < this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - entry.count - 1)

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime
    }
  }

  async recordRequest(request: NextRequest, response?: NextResponse): Promise<void> {
    if (this.config.skipSuccessfulRequests && response?.ok) {
      return
    }

    if (this.config.skipFailedRequests && response && !response.ok) {
      return
    }

    const key = this.config.keyGenerator!(request)
    if (this.store[key]) {
      this.store[key].count++
    }
  }

  middleware() {
    return async (request: NextRequest, next: () => Promise<NextResponse>): Promise<NextResponse> => {
      const { allowed, remaining, resetTime } = await this.checkLimit(request)

      if (!allowed) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: this.config.message,
            retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': this.config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
              'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
            }
          }
        )
      }

      const response = await next()

      // Record the request
      await this.recordRequest(request, response)

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', this.config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())

      return response
    }
  }
}

// Pre-configured rate limiters for different endpoint types
export const rateLimiters = {
  // General API endpoints - 100 requests per minute
  general: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests. Please try again in a minute.'
  }),

  // Authentication endpoints - 5 attempts per 15 minutes
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    keyGenerator: (request: NextRequest) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') || 'unknown'
      return `auth_limit:${ip}`
    }
  }),

  // File upload endpoints - 10 uploads per hour
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Upload limit exceeded. Please try again in an hour.'
  }),

  // Admin endpoints - 200 requests per hour
  admin: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 200,
    message: 'Admin API rate limit exceeded. Please try again later.'
  }),

  // Search endpoints - 50 searches per 10 minutes
  search: new RateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 50,
    message: 'Too many search requests. Please try again in 10 minutes.'
  }),

  // Download endpoints - 20 downloads per hour
  download: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    message: 'Download limit exceeded. Please try again in an hour.'
  })
}

// Utility function to apply rate limiting to API routes
export function withRateLimit(
  rateLimiter: RateLimiter,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async function rateLimitedHandler(request: NextRequest): Promise<NextResponse> {
    const middleware = rateLimiter.middleware()
    return middleware(request, () => handler(request))
  }
}

// Advanced rate limiter with Redis support (for production)
export class RedisRateLimiter {
  // Implementation would use Redis for distributed rate limiting
  // This is a placeholder for production scaling
  constructor(config: RateLimitConfig & { redisClient?: any }) {
    // TODO: Implement Redis-based rate limiting for production
  }
}
