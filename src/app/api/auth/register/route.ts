import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import { Faculty, AuditAction, AuditResource } from "@/types"
import { z } from "zod"
import { auditLogger } from "@/lib/audit/audit-logger"
import { withRateLimit, rateLimiters } from "@/lib/rate-limit/rate-limiter"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").refine((email) => {
    // Only students can register, and they must use @students.nsbm.ac.lk
    return email.endsWith("@students.nsbm.ac.lk")
  }, "Students must use their NSBM email address (@students.nsbm.ac.lk)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  studentId: z.string().min(1, "Student ID is required"),
  faculty: z.enum([
    Faculty.ENGINEERING,
    Faculty.BUSINESS,
    Faculty.COMPUTING,
    Faculty.SCIENCE
  ]),
  year: z.number().min(1).max(4),
})

type RegisterData = z.infer<typeof registerSchema>

async function registerUser(request: NextRequest) {
  let body: any = {}
  
  try {
    body = await request.json()
    
    // Validate input
    const validatedData: RegisterData = registerSchema.parse(body)
    
    // Additional validation: Only students can register through this endpoint
    // Staff accounts (moderators, admins) should be created by admins
    if (!validatedData.email.endsWith("@students.nsbm.ac.lk")) {
      return NextResponse.json(
        { error: "Only students can register through this endpoint. Staff accounts must be created by administrators." },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: validatedData.email },
        { studentId: validatedData.studentId }
      ]
    })
    
    if (existingUser) {
      // Log failed registration attempt
      await auditLogger.log({
        userId: "anonymous",
        userEmail: validatedData.email,
        userRole: "guest",
        action: AuditAction.REGISTER,
        resource: AuditResource.USER,
        details: {
          error: "User already exists",
          attemptedEmail: validatedData.email,
          attemptedStudentId: validatedData.studentId,
          faculty: validatedData.faculty
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined
      })
      
      return NextResponse.json(
        { error: "User with this email or student ID already exists" },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Create user
    const user = await User.create({
      ...validatedData,
      password: hashedPassword,
      role: "student",
    })
    
    // Log successful user registration
    await auditLogger.logUserAction(
      user._id.toString(),
      user.email,
      "student",
      AuditAction.USER_CREATE,
      AuditResource.USER,
      user._id.toString(),
      {
        faculty: user.faculty,
        studentId: user.studentId,
        registrationMethod: "self-registration"
      },
      request
    )
    
    return NextResponse.json(
      { 
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          faculty: user.faculty,
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Log validation failure
      await auditLogger.log({
        userId: "anonymous",
        userEmail: body.email || "unknown",
        userRole: "guest",
        action: AuditAction.REGISTER,
        resource: AuditResource.USER,
        details: {
          error: "Validation failed",
          validationErrors: error.errors,
          attemptedData: { ...body, password: "[REDACTED]" }
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined
      })
      
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Registration error:", error)
    
    // Log general registration error
    await auditLogger.log({
      userId: "anonymous",
      userEmail: "unknown",
      userRole: "guest",
      action: AuditAction.REGISTER,
      resource: AuditResource.USER,
      details: {
        error: "Internal server error during registration",
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined
    })
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Apply rate limiting to the registration endpoint
export const POST = withRateLimit(rateLimiters.auth, registerUser)
