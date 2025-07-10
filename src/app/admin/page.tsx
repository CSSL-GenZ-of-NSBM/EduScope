"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Lightbulb, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Download,
  AlertTriangle,
  GraduationCap,
  Activity,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  UserCheck,
  FileSearch,
  Star,
  ArrowUpRight,
  Zap
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
  requests: {
    degreeChanges: number
    yearChanges: number
    accountDeletions: number
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
      // Check if user is admin, superadmin, or moderator
      const userRole = session?.user?.role
      if (!userRole || !['admin', 'superadmin', 'moderator'].includes(userRole)) {
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

  const calculateApprovalRate = (approved: number, total: number) => {
    return total > 0 ? Math.round((approved / total) * 100) : 0
  }

  const getPendingItemsCount = () => {
    if (!stats) return 0
    return stats.research.pending + stats.ideas.pending + (stats.requests?.degreeChanges || 0) + (stats.requests?.yearChanges || 0) + (stats.requests?.accountDeletions || 0)
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Monitor platform activity and manage content</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/pending-requests">
            <Button variant="outline" className="relative">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Pending Actions
              {getPendingItemsCount() > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {getPendingItemsCount()}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.users.total}</div>
            <div className="flex items-center mt-2">
              <Activity className="h-3 w-3 mr-1 text-green-600" />
              <p className="text-xs text-green-600 font-medium">
                {stats.users.active} active this month
              </p>
            </div>
            <Progress 
              value={(stats.users.active / stats.users.total) * 100} 
              className="mt-2 h-1"
            />
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Research Papers</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.research.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default" className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                <CheckCircle className="w-3 h-3 mr-1" />
                {stats.research.approved} Approved
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {stats.research.pending} Pending
              </Badge>
            </div>
            <Progress 
              value={calculateApprovalRate(stats.research.approved, stats.research.total)} 
              className="mt-2 h-1"
            />
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.downloads.total}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 mr-1 text-purple-600" />
              <p className="text-xs text-purple-600 font-medium">
                +{stats.downloads.thisMonth} this month
              </p>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Avg: {Math.round(stats.downloads.total / (stats.research.approved || 1))} per paper
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <Shield className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {calculateApprovalRate(stats.research.approved, stats.research.total)}%
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-2">
              Content approval rate
            </p>
            <div className="mt-2 text-xs text-gray-500">
              {stats.research.rejected} papers rejected
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full -mr-10 -mt-10"></div>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <Link href="/admin/research">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-blue-600" />
                  Research Management
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </CardTitle>
              <CardDescription>Review and manage research papers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Review</span>
                <Badge variant={stats.research.pending > 0 ? "destructive" : "secondary"}>
                  {stats.research.pending}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Papers</span>
                <Badge variant="outline">{stats.research.total}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Approval Rate</span>
                <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                  {calculateApprovalRate(stats.research.approved, stats.research.total)}%
                </Badge>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <Link href="/admin/users">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  User Management
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
              </CardTitle>
              <CardDescription>Manage users and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Users</span>
                <Badge variant="outline">{stats.users.total}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users</span>
                <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                  {stats.users.active}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Activity Rate</span>
                <Badge variant="secondary">
                  {Math.round((stats.users.active / stats.users.total) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <Link href="/admin/pending-requests">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Pending Requests
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
              </CardTitle>
              <CardDescription>Review user requests and changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Degree Changes</span>
                <Badge variant={stats.requests?.degreeChanges > 0 ? "destructive" : "secondary"}>
                  {stats.requests?.degreeChanges || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Year Changes</span>
                <Badge variant={stats.requests?.yearChanges > 0 ? "destructive" : "secondary"}>
                  {stats.requests?.yearChanges || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Account Deletions</span>
                <Badge variant={stats.requests?.accountDeletions > 0 ? "destructive" : "secondary"}>
                  {stats.requests?.accountDeletions || 0}
                </Badge>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Content Overview
            </CardTitle>
            <CardDescription>Distribution of platform content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Research Papers</span>
                  <span className="text-sm text-gray-500">{stats.research.total}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Approved: {stats.research.approved}</span>
                    <span>Pending: {stats.research.pending}</span>
                    <span>Rejected: {stats.research.rejected}</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                    <div 
                      className="bg-green-500"
                      style={{ width: `${(stats.research.approved / stats.research.total) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-yellow-500"
                      style={{ width: `${(stats.research.pending / stats.research.total) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-red-500"
                      style={{ width: `${(stats.research.rejected / stats.research.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Ideas Bank</span>
                  <span className="text-sm text-gray-500">{stats.ideas.total}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Active: {stats.ideas.approved}</span>
                    <span>Pending: {stats.ideas.pending}</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                    <div 
                      className="bg-blue-500"
                      style={{ width: stats.ideas.total > 0 ? `${(stats.ideas.approved / stats.ideas.total) * 100}%` : '0%' }}
                    ></div>
                    <div 
                      className="bg-yellow-500"
                      style={{ width: stats.ideas.total > 0 ? `${(stats.ideas.pending / stats.ideas.total) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/users/create">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Add User</span>
                </Button>
              </Link>
              <Link href="/admin/degrees">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  <span className="text-sm">Manage Degrees</span>
                </Button>
              </Link>
              <Link href="/admin/research?status=pending">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                  <FileSearch className="h-5 w-5" />
                  <span className="text-sm">Review Papers</span>
                </Button>
              </Link>
              <Link href="/admin/pending-requests">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">Handle Requests</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Alert */}
      {getPendingItemsCount() > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
            <CardDescription className="text-orange-700">
              You have {getPendingItemsCount()} pending items that require attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/pending-requests">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Review Pending Items
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
