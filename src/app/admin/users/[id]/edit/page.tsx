"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, User } from "lucide-react"

interface UserProfile {
  _id: string
  name: string
  email: string
  studentId: string
  faculty: string
  role: string
  year: number | null
  createdAt: string
  updatedAt: string
}

export default function AdminUserEditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    faculty: "",
    role: "",
    year: "",
    newPassword: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      // Check if user is admin (only admins can manage users)
      const userRole = session?.user?.role
      if (!userRole || userRole !== 'admin') {
        router.push("/admin")
        return
      }
      fetchUserProfile()
    }
  }, [status, session, router, userId])

  const fetchUserProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      const data = await response.json()

      if (data.success) {
        setUser(data.data)
        setFormData({
          name: data.data.name,
          email: data.data.email,
          studentId: data.data.studentId,
          faculty: data.data.faculty,
          role: data.data.role,
          year: data.data.year ? data.data.year.toString() : "not-set",
          newPassword: ""
        })
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

  const handleSave = async () => {
    setSaving(true)
    try {
      // Prepare the data for submission
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        studentId: formData.studentId,
        faculty: formData.faculty,
        role: formData.role,
        year: formData.year === "not-set" ? null : parseInt(formData.year)
      }

      // Only include password if it's been changed
      if (formData.newPassword.trim()) {
        updateData.password = formData.newPassword
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/admin/users/${userId}`)
      } else {
        console.error('Failed to update user:', data.error)
        alert('Failed to update user: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
          <Button variant="outline" onClick={() => router.push(`/admin/users/${userId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Edit User</h2>
            <p className="text-gray-600">Update user information and permissions</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Edit User Profile</CardTitle>
              <CardDescription>Update user information and role permissions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            {/* Student ID */}
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                placeholder="Enter student ID"
              />
            </div>

            {/* Faculty */}
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Select value={formData.faculty} onValueChange={(value) => handleInputChange('faculty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Faculty of Computing">Faculty of Computing</SelectItem>
                  <SelectItem value="Faculty of Engineering">Faculty of Engineering</SelectItem>
                  <SelectItem value="Faculty of Business">Faculty of Business</SelectItem>
                  <SelectItem value="Faculty of Applied Sciences">Faculty of Sciences</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-set">Not Set</SelectItem>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                  <SelectItem value="4">Year 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Password Management</h4>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="Leave empty to keep current password"
                />
                <p className="text-xs text-gray-500">
                  Only enter a new password if you want to change the user's current password. Leave empty to keep the existing password.
                </p>
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Role Permissions</h4>
            <div className="text-sm text-gray-600 space-y-1">
              {formData.role === 'admin' && (
                <div>
                  <p><strong>Admin:</strong> Full access to all features including user management, content moderation, and system administration.</p>
                </div>
              )}
              {formData.role === 'moderator' && (
                <div>
                  <p><strong>Moderator:</strong> Can moderate content, approve research papers and ideas, but cannot manage users.</p>
                </div>
              )}
              {formData.role === 'student' && (
                <div>
                  <p><strong>Student:</strong> Can upload research papers, share ideas, and access all student features.</p>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Account Created</p>
                <p>{new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p>{new Date(user.updatedAt).toLocaleDateString('en-US', {
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
    </div>
  )
}
