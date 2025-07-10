"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
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

            {/* 404 Error */}
            <div className="space-y-2">
              <h1 className="text-8xl font-bold text-gray-900">404</h1>
              <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
            </div>

            {/* Description */}
            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-gray-600">
                Oops! The page you're looking for doesn't exist. It might have been moved, deleted, 
                or you may have typed the URL incorrectly.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">What you can do:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check the URL for any typos</li>
                  <li>• Go back to the previous page</li>
                  <li>• Visit our homepage</li>
                  <li>• Use the search feature to find what you need</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.history.back()} variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Link href="/">
                <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              
              <Link href="/research">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Research
                </Button>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Quick Links</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Dashboard
                </Link>
                <Link href="/research" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Research Papers
                </Link>
                <Link href="/ideas" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Idea Bank
                </Link>
                <Link href="/guidance" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Degree Guidance
                </Link>
                <Link href="/calculator" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Class Calculator
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
