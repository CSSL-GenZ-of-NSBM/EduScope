"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wrench, Home, Clock, Mail } from "lucide-react"

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
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

            {/* Maintenance Icon & Title */}
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <Wrench className="w-10 h-10 text-yellow-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Under Maintenance</h1>
                <h2 className="text-xl font-semibold text-gray-700">We'll be back soon!</h2>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-gray-600">
                EduScope is currently undergoing scheduled maintenance to improve your experience. 
                We're working hard to get everything back online as quickly as possible.
              </p>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <h3 className="font-medium text-yellow-800">Estimated Downtime</h3>
                </div>
                <p className="text-sm text-yellow-700">
                  We expect to be back online within the next few hours. Please check back later.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">What's being improved:</h3>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Database performance optimizations</li>
                  <li>• Enhanced security features</li>
                  <li>• New research paper tools</li>
                  <li>• Improved user interface</li>
                  <li>• Bug fixes and stability improvements</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.reload()} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                <Clock className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Try Homepage
                </Button>
              </Link>
            </div>

            {/* Status & Contact */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">For urgent matters, contact us:</p>
                <div className="flex justify-center">
                  <a 
                    href="mailto:support@nsbm.ac.lk" 
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    support@nsbm.ac.lk
                  </a>
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>Maintenance started: {new Date().toLocaleString()}</p>
                <p>Status: Updates in progress</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
