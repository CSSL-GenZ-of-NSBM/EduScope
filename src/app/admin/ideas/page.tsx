"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminIdeasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      // Check if user is admin, superadmin, or moderator
      const userRole = session?.user?.role
      if (!userRole || !['admin', 'superadmin', 'moderator'].includes(userRole)) {
        router.push("/dashboard")
        return
      }
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Ideas Management</h2>
        <p className="text-gray-600">Manage and review idea submissions</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Ideas management feature coming soon!</p>
            <p className="text-sm text-gray-400">
              This section will allow administrators to review, approve, and manage student idea submissions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
