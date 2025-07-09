import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Validate email domain based on user type
        // Students must use @students.nsbm.ac.lk
        // Staff (moderators, admins) must use @nsbm.ac.lk
        const isStudentEmail = credentials.email.endsWith("@students.nsbm.ac.lk")
        const isStaffEmail = credentials.email.endsWith("@nsbm.ac.lk")
        
        if (!isStudentEmail && !isStaffEmail) {
          throw new Error("Please use a valid NSBM email address (@students.nsbm.ac.lk for students or @nsbm.ac.lk for staff)")
        }

        console.log('Connecting to database...')
        await connectDB()
        console.log('Connected to database, looking for user...')
        
        const user = await User.findOne({ email: credentials.email }).select('+password')
        
        if (!user) {
          throw new Error("No user found with this email")
        }

        console.log("User found:", user.email)
        console.log("Password from DB:", user.password ? "exists" : "missing")
        console.log("Input password:", credentials.password ? "exists" : "missing")

        if (!user.password) {
          throw new Error("User password not found in database")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          studentId: user.studentId,
          faculty: user.faculty,
          role: user.role,
        }
        } catch (error: any) {
          console.error('Auth error:', error);
          throw new Error(error.message || "Authentication failed");
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.studentId = user.studentId
        token.faculty = user.faculty
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.studentId = token.studentId as string
        session.user.faculty = token.faculty as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}
