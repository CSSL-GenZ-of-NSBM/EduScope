"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteDialog } from "@/components/ui/delete-dialog"
import { useToast } from "@/components/ui/toast"
import { User, Mail, Calendar, Shield, FileText, Lightbulb, ArrowLeft, Edit, Trash2, GraduationCap } from "lucide-react"
import { Degree } from "@/types"

interface UserProfile {
  _id: string
  name: string
  email: string
  studentId: string
  faculty: string
  role: string
  year?: number | null
  degree?: string | null
  createdAt: string
  updatedAt: string
  researchPapers?: number
  ideas?: number
}

export default function AdminUserProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const userId = params.id as string
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [degrees, setDegrees] = useState<Degree[]>([])
  const [userDegree, setUserDegree] = useState<Degree | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    userName: string
  }>({
    open: false,
    userName: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      // Check if user is admin or superadmin (only admins and superadmins can manage users)
      const userRole = session?.user?.role
      if (!userRole || !['admin', 'superadmin'].includes(userRole)) {
        router.push("/admin")
        return
      }
      fetchUserProfile()
      fetchDegrees()
    }
  }, [status, session, router, userId])

  // Find user's degree when both user and degrees are loaded
  useEffect(() => {
    if (user && user.degree && degrees.length > 0) {
      const degree = degrees.find(d => d._id === user.degree)
      setUserDegree(degree || null)
    }
  }, [user, degrees])

  const fetchDegrees = async () => {
    try {
      const response = await fetch("/api/admin/degrees")
      const data = await response.json()
      if (data.success) {
        setDegrees(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch degrees:", error)
    }
  }

  const fetchUserProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      const data = await response.json()

      if (data.success) {
        setUser(data.data)
      } else {
        console.error('Failed to fetch user profile:', data.error)
        router.push("/admin/users")
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      router.push("/admin/users")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!user) return
    
    // Permission check: Normal admins cannot delete other admins or super admins
    if (session?.user?.role === 'admin' && 
        (user.role === 'admin' || user.role === 'superadmin') &&
        user._id !== session?.user?.id) {
      addToast({
        title: "Permission denied",
        description: "You do not have permission to delete other admin users. Only Super Admin can perform this action.",
        variant: "error"
      })
      return
    }
    
    setDeleteDialog({
      open: true,
      userName: user.name
    })
  }

  const confirmDeleteUser = async () => {
    if (!user) return
    
    setDeleting(true)
    setDeleteDialog({ open: false, userName: "" })
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        addToast({
          title: "User deleted successfully",
          description: `User "${user.name}" has been permanently deleted.`,
          variant: "success"
        })
        router.push("/admin/users")
      } else {
        console.error('Failed to delete user:', data.error)
        addToast({
          title: "Failed to delete user",
          description: data.error,
          variant: "error"
        })
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      addToast({
        title: "Failed to delete user",
        description: "An unexpected error occurred while deleting the user.",
        variant: "error"
      })
    } finally {
      setDeleting(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">User not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">User Profile</h2>
            <p className="text-gray-600">View user details and activity</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push(`/admin/users/${userId}/edit`)}
            disabled={
              // Normal admins cannot edit other admins or super admins
              session?.user?.role === 'admin' && 
              (user.role === 'admin' || user.role === 'superadmin') &&
              user._id !== session?.user?.id
            }
            title={
              session?.user?.role === 'admin' && 
              (user.role === 'admin' || user.role === 'superadmin') &&
              user._id !== session?.user?.id
                ? "Only Super Admin can edit other admins"
                : "Edit User"
            }
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit User
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteUser}
            disabled={
              deleting ||
              // Normal admins cannot delete other admins or super admins
              (session?.user?.role === 'admin' && 
              (user.role === 'admin' || user.role === 'superadmin') &&
              user._id !== session?.user?.id)
            }
            title={
              session?.user?.role === 'admin' && 
              (user.role === 'admin' || user.role === 'superadmin') &&
              user._id !== session?.user?.id
                ? "Only Super Admin can delete other admins"
                : deleting ? 'Deleting...' : 'Delete User'
            }
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </div>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <Badge 
                  variant={
                    user.role === 'superadmin' ? 'destructive' :
                    user.role === 'admin' ? 'destructive' : 
                    user.role === 'moderator' ? 'secondary' : 
                    'default'
                  }
                  className={
                    user.role === 'superadmin' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                    user.role === 'student' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                    ''
                  }
                >
                  {user.role === 'superadmin' ? 'Super Admin' : user.role}
                </Badge>
              </div>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="font-medium">{user.studentId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Faculty</p>
                  <p className="font-medium">{user.faculty}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="font-medium">{user.year ? `Year ${user.year}` : 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <GraduationCap className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Degree Programme</p>
                  <p className="font-medium">{userDegree ? userDegree.degreeName : (user.degree ? 'Loading...' : 'Not assigned')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Activity Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Research Papers</p>
                  <p className="text-2xl font-bold text-blue-600">{user.researchPapers || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Lightbulb className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Ideas Shared</p>
                  <p className="text-2xl font-bold text-green-600">{user.ideas || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Days Active</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.ceil((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{new Date(user.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        title={deleteDialog.userName}
        description="This will permanently delete the user and all their associated data. This action cannot be undone."
        onConfirm={confirmDeleteUser}
        loading={deleting}
      />
    </div>
  )
}
