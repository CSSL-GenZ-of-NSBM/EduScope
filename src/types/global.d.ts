import { MongooseCache } from 'mongoose'
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare global {
  var mongoose: MongooseCache | undefined
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      studentId: string
      faculty: string
      role: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    studentId: string
    faculty: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    studentId: string
    faculty: string
    role: string
  }
}

export {}
