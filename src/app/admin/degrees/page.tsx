"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  GraduationCap, 
  University, 
  Clock, 
  DollarSign, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  Search,
  Filter
} from "lucide-react"
import { Degree, Faculty, AffiliatedUniversity } from "@/types"

export default function AdminDegreesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [degrees, setDegrees] = useState<Degree[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [facultyFilter, setFacultyFilter] = useState("all")
  const [universityFilter, setUniversityFilter] = useState("all")
  const [deletingDegrees, setDeletingDegrees] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      // Check if user is admin or superadmin (only admins and superadmins can manage degrees)
      const userRole = session?.user?.role
      if (!userRole || !['admin', 'superadmin'].includes(userRole)) {
        router.push("/admin")
        return
      }
      fetchDegrees()
    }
  }, [status, session, router])

  const fetchDegrees = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (facultyFilter !== 'all') params.append('faculty', facultyFilter)
      if (universityFilter !== 'all') params.append('university', universityFilter)

      const response = await fetch(`/api/admin/degrees?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setDegrees(data.data)
      } else {
        console.error('Failed to fetch degrees:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch degrees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDegree = async (degreeId: string) => {
    if (!confirm('Are you sure you want to delete this degree? This action cannot be undone.')) {
      return
    }

    setDeletingDegrees(prev => new Set(prev).add(degreeId))
    try {
      const response = await fetch(`/api/admin/degrees/${degreeId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        setDegrees(prev => prev.filter(degree => degree._id !== degreeId))
      } else {
        console.error('Failed to delete degree:', data.error)
        alert('Failed to delete degree: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to delete degree:', error)
      alert('Failed to delete degree')
    } finally {
      setDeletingDegrees(prev => {
        const newSet = new Set(prev)
        newSet.delete(degreeId)
        return newSet
      })
    }
  }

  const handleSearch = () => {
    fetchDegrees()
  }

  const getUniversityBadgeColor = (university: string) => {
    switch (university) {
      case AffiliatedUniversity.NSBM:
        return "bg-green-100 text-green-800"
      case AffiliatedUniversity.PLYMOUTH:
        return "bg-blue-100 text-blue-800"
      case AffiliatedUniversity.VICTORIA:
        return "bg-purple-100 text-purple-800"
      case AffiliatedUniversity.AMERICAN:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Degree Management</h2>
          <p className="text-gray-600">Manage university degree programmes</p>
        </div>
        <Button onClick={() => router.push("/admin/degrees/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Degree
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search degrees by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  {Object.values(Faculty).map((faculty) => (
                    <SelectItem key={faculty} value={faculty}>
                      {faculty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={universityFilter} onValueChange={setUniversityFilter}>
                <SelectTrigger className="w-48">
                  <University className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by university" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  {Object.values(AffiliatedUniversity).map((university) => (
                    <SelectItem key={university} value={university}>
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Degrees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {degrees.map((degree) => (
          <Card key={degree._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2 mb-2">{degree.degreeName}</CardTitle>
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {degree.faculty}
                    </Badge>
                    <Badge className={`text-xs ${getUniversityBadgeColor(degree.affiliatedUniversity)}`}>
                      {degree.affiliatedUniversity}
                    </Badge>
                  </div>
                </div>
                <GraduationCap className="w-8 h-8 text-blue-600 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{degree.duration} Year{degree.duration > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span>LKR {degree.price.toLocaleString()}</span>
                </div>
              </div>
              
              {degree.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {degree.description}
                </p>
              )}

              <div className="text-xs text-gray-500">
                <p>{degree.modules.length} modules</p>
                <p>Status: {degree.isActive ? 'Active' : 'Inactive'}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/degrees/${degree._id}`)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/degrees/${degree._id}/edit`)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteDegree(degree._id)}
                    disabled={deletingDegrees.has(degree._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {degrees.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No degrees found</p>
              <p className="text-gray-400 mb-4">Get started by creating your first degree programme</p>
              <Button onClick={() => router.push("/admin/degrees/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Degree
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
