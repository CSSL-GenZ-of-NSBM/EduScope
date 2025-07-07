import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import { Faculty } from "@/types"
import { z } from "zod"

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
    Faculty.SCIENCE,
    Faculty.MANAGEMENT
  ]),
  year: z.number().min(1).max(4),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
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
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
