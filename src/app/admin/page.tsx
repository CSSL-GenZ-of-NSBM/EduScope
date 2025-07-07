"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Lightbulb, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Download
} from "lucide-react"

interface AdminStats {
  research: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  ideas: {
    total: number
    approved: number
    pending: number
  }
  users: {
    total: number
    active: number
  }
  downloads: {
    total: number
    thisMonth: number
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      // Check if user is admin or moderator
      const userRole = session?.user?.role
      if (!userRole || (userRole !== 'admin' && userRole !== 'moderator')) {
        router.push("/dashboard")
        return
      }
      fetchAdminStats()
    }
  }, [status, session, router])

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load admin statistics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600">Overview of platform activity and content</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Research Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.research.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                {stats.research.approved} Approved
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {stats.research.pending} Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ideas.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                {stats.ideas.approved} Active
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {stats.ideas.pending} Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.active} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.downloads.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.downloads.thisMonth} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Items waiting for review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Research Papers</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{stats.research.pending}</Badge>
                <a href="/admin/research?status=pending" className="text-blue-600 hover:text-blue-800 text-sm">
                  Review →
                </a>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Ideas</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{stats.ideas.pending}</Badge>
                <a href="/admin/ideas?status=pending" className="text-blue-600 hover:text-blue-800 text-sm">
                  Review →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Platform usage overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Total Content</span>
              <Badge variant="outline">{stats.research.total + stats.ideas.total}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Approval Rate</span>
              <Badge variant="default">
                {Math.round((stats.research.approved / (stats.research.total || 1)) * 100)}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Active Users</span>
              <Badge variant="outline">{stats.users.active}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
