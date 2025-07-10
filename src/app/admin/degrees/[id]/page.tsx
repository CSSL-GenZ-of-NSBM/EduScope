"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Edit, 
  GraduationCap, 
  University, 
  Clock, 
  DollarSign,
  BookOpen,
  Users,
  Target,
  CheckCircle
} from "lucide-react"
import { Degree, DegreeModule } from "@/types"

export default function AdminDegreeViewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const degreeId = params.id as string
  const [degree, setDegree] = useState<Degree | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      // Check if user is admin or superadmin
      const userRole = session?.user?.role
      if (!userRole || !['admin', 'superadmin'].includes(userRole)) {
        router.push("/admin")
        return
      }
      fetchDegree()
    }
  }, [status, session, router, degreeId])

  const fetchDegree = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/degrees/${degreeId}`)
      const data = await response.json()

      if (data.success) {
        setDegree(data.data)
      } else {
        console.error('Failed to fetch degree:', data.error)
        router.push("/admin/degrees")
      }
    } catch (error) {
      console.error('Failed to fetch degree:', error)
      router.push("/admin/degrees")
    } finally {
      setLoading(false)
    }
  }

  const getUniversityBadgeColor = (university: string) => {
    switch (university) {
      case 'NSBM Green University':
        return "bg-green-100 text-green-800"
      case 'Plymouth University':
        return "bg-blue-100 text-blue-800"
      case 'Victoria University':
        return "bg-purple-100 text-purple-800"
      case 'American University':
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const groupModulesByYear = (modules: DegreeModule[]) => {
    const grouped: { [year: number]: { [semester: number]: DegreeModule[] } } = {}
    
    modules.forEach(module => {
      if (!grouped[module.year]) {
        grouped[module.year] = {}
      }
      if (!grouped[module.year][module.semester]) {
        grouped[module.year][module.semester] = []
      }
      grouped[module.year][module.semester].push(module)
    })
    
    return grouped
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!degree) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/admin/degrees")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Degrees
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Degree not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const groupedModules = groupModulesByYear(degree.modules)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/admin/degrees")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Degrees
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Degree Details</h2>
            <p className="text-gray-600">View degree programme information</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/degrees/${degreeId}/edit`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Degree
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{degree.degreeName}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{degree.faculty}</Badge>
                <Badge className={getUniversityBadgeColor(degree.affiliatedUniversity)}>
                  {degree.affiliatedUniversity}
                </Badge>
                <Badge variant={degree.isActive ? "default" : "secondary"}>
                  {degree.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{degree.duration} Year{degree.duration > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium">LKR {degree.price.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Modules</p>
                <p className="font-medium">{degree.modules.length} Modules</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <University className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Faculty</p>
                <p className="font-medium">{degree.faculty.replace('Faculty of ', '')}</p>
              </div>
            </div>
          </div>

          {degree.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-600">{degree.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admission Requirements */}
      {degree.admissionRequirements && degree.admissionRequirements.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <CardTitle>Admission Requirements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {degree.admissionRequirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Career Paths */}
      {degree.careerPaths && degree.careerPaths.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-600" />
              <CardTitle>Career Paths</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {degree.careerPaths.map((path, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{path}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Modules by Year */}
      {degree.modules.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <CardTitle>Degree Modules</CardTitle>
            </div>
            <CardDescription>
              Modules organized by year and semester
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.keys(groupedModules)
              .map(Number)
              .sort((a, b) => a - b)
              .map(year => (
                <div key={year} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Year {year}
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map(semester => (
                      groupedModules[year][semester] && (
                        <div key={semester} className="space-y-3">
                          <h4 className="font-medium text-gray-700">Semester {semester}</h4>
                          <div className="space-y-2">
                            {groupedModules[year][semester].map((module, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                  <h5 className="font-medium text-gray-900">{module.moduleName}</h5>
                                  <span className="text-sm text-gray-500">{module.credits} credits</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{module.moduleCode}</p>
                                {module.description && (
                                  <p className="text-sm text-gray-500">{module.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Created</p>
              <p>{new Date(degree.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            <div>
              <p className="text-gray-500">Last Updated</p>
              <p>{new Date(degree.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
