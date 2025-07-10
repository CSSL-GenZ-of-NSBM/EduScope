"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Home, LogIn, UserPlus } from "lucide-react"

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/images/logo.png"
                alt="EduScope Logo"
                width={120}
                height={120}
                className="h-24 w-auto object-contain"
                priority
              />
            </div>

            {/* Unauthorized Icon & Title */}
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900">401</h1>
                <h2 className="text-2xl font-semibold text-gray-700">Unauthorized Access</h2>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-gray-600">
                You don't have permission to access this page. This could be because:
              </p>
              
              <div className="bg-red-50 rounded-lg p-4">
                <ul className="text-sm text-red-700 space-y-1 text-left">
                  <li>• You're not signed in to your account</li>
                  <li>• Your session has expired</li>
                  <li>• You don't have the required permissions</li>
                  <li>• This page is restricted to certain user roles</li>
                </ul>
              </div>
              
              <p className="text-gray-600 text-sm">
                If you believe this is an error, please contact an administrator or try signing in again.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin">
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full sm:w-auto">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Need Help?</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Sign In Issues
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Create New Account
                </Link>
                <span className="text-gray-300">•</span>
                <a href="mailto:support@nsbm.ac.lk" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
