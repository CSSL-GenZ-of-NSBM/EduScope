"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Lightbulb, 
  GraduationCap, 
  Users, 
  Upload, 
  Search,
  LogOut,
  User,
  TrendingUp,
  FileText,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  Bookmark,
  BookmarkX
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    uploads: 0,
    downloads: 0,
    ideas: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.id) {
      fetchStats()
      fetchRecentActivity()
    }
  }, [status, session, router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/stats')
      const data = await response.json()
      
      console.log('Dashboard stats response:', data) // Debug log
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true)
      const response = await fetch('/api/user/activity')
      const data = await response.json()
      
      if (data.success) {
        setRecentActivity(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
    } finally {
      setActivityLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="academic-container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">
            Faculty of {session.user?.faculty} • Student ID: {session.user?.studentId}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Upload Research</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                Share your latest research paper or project
              </CardDescription>
              <Button size="sm" asChild>
                <Link href="/research/upload">
                  <Plus className="h-4 w-4 mr-1" />
                  Upload
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Browse Research</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                Discover papers from your faculty and beyond
              </CardDescription>
              <Button size="sm" variant="outline" asChild>
                <Link href="/research">
                  <Search className="h-4 w-4 mr-1" />
                  Browse
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Idea Bank</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                Share ideas and get inspired by others
              </CardDescription>
              <Button size="sm" variant="outline" asChild>
                <Link href="/ideas">
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Explore
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Degree Guidance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                Get recommendations for your academic path
              </CardDescription>
              <Button size="sm" variant="outline" asChild>
                <Link href="/guidance">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Get Guidance
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Uploads</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.uploads}</div>
              <p className="text-xs text-muted-foreground">
                Research papers uploaded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Downloads</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={fetchStats}
                  disabled={loading}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.downloads}</div>
              <p className="text-xs text-muted-foreground">
                Papers downloaded by others
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ideas Shared</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.ideas}</div>
              <p className="text-xs text-muted-foreground">
                Ideas contributed to the bank
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest interactions on EduScope
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchRecentActivity}
                disabled={activityLoading}
              >
                <RefreshCw className={`h-4 w-4 ${activityLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin text-gray-400" />
                <p className="text-gray-500">Loading activity...</p>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity._id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'upload' ? 'bg-green-100' :
                      activity.type === 'download' ? 'bg-blue-100' :
                      activity.type === 'view' ? 'bg-purple-100' :
                      activity.type === 'delete' ? 'bg-red-100' :
                      activity.type === 'save' ? 'bg-orange-100' :
                      activity.type === 'unsave' ? 'bg-gray-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'upload' ? (
                        <Upload className="h-4 w-4 text-green-600" />
                      ) : activity.type === 'download' ? (
                        <Download className="h-4 w-4 text-blue-600" />
                      ) : activity.type === 'view' ? (
                        <Eye className="h-4 w-4 text-purple-600" />
                      ) : activity.type === 'delete' ? (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      ) : activity.type === 'save' ? (
                        <Bookmark className="h-4 w-4 text-orange-600" />
                      ) : activity.type === 'unsave' ? (
                        <BookmarkX className="h-4 w-4 text-gray-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {activity.type === 'upload' ? 
                          `You uploaded: ${activity.title}` :
                         activity.type === 'download' ? 
                          `You downloaded: ${activity.title}` :
                         activity.type === 'view' ?
                          `You viewed: ${activity.title}` :
                         activity.type === 'delete' ?
                          `You deleted: ${activity.title}` :
                         activity.type === 'save' ?
                          `You saved: ${activity.title}` :
                         activity.type === 'unsave' ?
                          `You unsaved: ${activity.title}` :
                          activity.title
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                        {activity.metadata?.paperField && (
                          <span className="ml-2 px-1 py-0.5 bg-gray-200 rounded text-xs">
                            {activity.metadata.paperField}
                          </span>
                        )}
                      </p>
                    </div>
                    {activity.paperId && activity.type !== 'delete' && (
                      <Link href={`/research/${activity.paperId}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity yet.</p>
                <p className="text-sm">Start by uploading your first research paper or exploring the idea bank!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
