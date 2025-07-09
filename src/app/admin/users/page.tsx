"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Calendar, Shield, Trash2, Edit, Eye } from "lucide-react"

interface AdminUser {
  _id: string
  name: string
  email: string
  studentId: string
  faculty: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [facultyFilter, setFacultyFilter] = useState("all")
  const [deletingUsers, setDeletingUsers] = useState<Set<string>>(new Set())

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
      fetchUsers()
    }
  }, [status, session, router])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (facultyFilter && facultyFilter !== 'all') params.append('faculty', facultyFilter)

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmed = confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)
    if (!confirmed) return

    setDeletingUsers(prev => new Set([...prev, userId]))
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        // Remove user from the list
        setUsers(prev => prev.filter(user => user._id !== userId))
      } else {
        console.error('Failed to delete user:', data.error)
        alert('Failed to delete user: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
    } finally {
      setDeletingUsers(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Users Management</h2>
        <p className="text-gray-600">View and manage platform users</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users by name, email, student ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                <SelectItem value="Faculty of Computing">Faculty of Computing</SelectItem>
                <SelectItem value="Faculty of Engineering">Faculty of Engineering</SelectItem>
                <SelectItem value="Faculty of Business">Faculty of Business</SelectItem>
                <SelectItem value="Faculty of Applied Sciences">Faculty of Sciences</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchUsers} variant="outline">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user._id} className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight truncate" title={user.name}>
                    {user.name}
                  </CardTitle>
                  <Badge 
                    variant={
                      user.role === 'admin' ? 'destructive' : 
                      user.role === 'moderator' ? 'secondary' : 
                      'default'
                    }
                    className={
                      user.role === 'student' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                      ''
                    }
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* User Details */}
              <div className="space-y-3 text-sm text-gray-600 mb-4 flex-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate" title={user.email}>
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    ID: {user.studentId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate" title={user.faculty}>
                    {user.faculty}
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                <div>Last active: {new Date(user.updatedAt).toLocaleDateString()}</div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/admin/users/${user._id}`)}
                    title="View Profile"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/admin/users/${user._id}/edit`)}
                    title="Edit User"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    disabled={deletingUsers.has(user._id)}
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
