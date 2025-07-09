import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import bcrypt from "bcryptjs"

// POST /api/admin/users/create - Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied. Admin role required." 
      }, { status: 403 })
    }

    await connectDB()

    const body = await request.json()
    const { name, email, password, studentId, faculty, role, year } = body

    // Validate required fields
    if (!name || !email || !password || !studentId || !faculty || !role) {
      return NextResponse.json({ 
        success: false, 
        error: "All fields except academic year are required" 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid email format" 
      }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: "Password must be at least 6 characters long" 
      }, { status: 400 })
    }

    // Validate role
    const validRoles = ['student', 'moderator', 'admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid role" 
      }, { status: 400 })
    }

    // Validate year if provided
    if (year !== null && year !== undefined) {
      const yearNum = parseInt(year)
      if (isNaN(yearNum) || yearNum < 1 || yearNum > 4) {
        return NextResponse.json({ 
          success: false, 
          error: "Academic year must be between 1 and 4" 
        }, { status: 400 })
      }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: "Email is already registered" 
      }, { status: 400 })
    }

    // Check if student ID already exists
    const existingStudentId = await User.findOne({ studentId })
    if (existingStudentId) {
      return NextResponse.json({ 
        success: false, 
        error: "Student ID is already taken" 
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      studentId,
      faculty,
      role,
      year: year !== null && year !== undefined ? parseInt(year) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await newUser.save()

    // Return user data without password
    const userData = newUser.toObject()
    delete userData.password

    return NextResponse.json({ 
      success: true, 
      data: userData,
      message: "User created successfully" 
    })

  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
