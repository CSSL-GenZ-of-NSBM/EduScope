"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, BookOpen, GraduationCap, Clock, CreditCard, ArrowRight } from "lucide-react"
import { Degree, DegreeModule } from "@/types"

export default function ClassCalculatorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [degrees, setDegrees] = useState<Degree[]>([])
  const [selectedDegree, setSelectedDegree] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [modules, setModules] = useState<DegreeModule[]>([])
  const [degreeInfo, setDegreeInfo] = useState<Degree | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchDegrees()
    }
  }, [status, router])

  const fetchDegrees = async () => {
    try {
      const response = await fetch("/api/admin/degrees")
      const data = await response.json()
      if (data.success) {
        setDegrees(data.degrees.filter((degree: Degree) => degree.isActive))
      }
    } catch (error) {
      console.error("Failed to fetch degrees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDegreeChange = (degreeId: string) => {
    setSelectedDegree(degreeId)
    setSelectedYear("")
    setSelectedSemester("")
    setModules([])
    
    const degree = degrees.find(d => d._id === degreeId)
    setDegreeInfo(degree || null)
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    setSelectedSemester("")
    setModules([])
  }

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester)
    
    if (degreeInfo && selectedYear && semester) {
      const yearNum = parseInt(selectedYear)
      const semesterNum = parseInt(semester)
      
      const filteredModules = degreeInfo.modules.filter(
        module => module.year === yearNum && module.semester === semesterNum
      )
      setModules(filteredModules)
    }
  }

  const getTotalCredits = () => {
    return modules.reduce((total, module) => total + module.credits, 0)
  }

  const getAvailableYears = () => {
    if (!degreeInfo) return []
    const years = [...new Set(degreeInfo.modules.map(m => m.year))].sort()
    return years
  }

  const getAvailableSemesters = () => {
    if (!degreeInfo || !selectedYear) return []
    const yearNum = parseInt(selectedYear)
    const semesters = [...new Set(
      degreeInfo.modules
        .filter(m => m.year === yearNum)
        .map(m => m.semester)
    )].sort()
    return semesters
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
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Calculator className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Class Calculator</h1>
            <p className="text-gray-600">Discover the modules and subjects for your degree programme</p>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Select Your Programme
          </CardTitle>
          <CardDescription>
            Choose your degree programme, academic year, and semester to view your modules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Degree Selection */}
            <div className="space-y-2">
              <Label htmlFor="degree">Degree Programme</Label>
              <Select value={selectedDegree} onValueChange={handleDegreeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select degree programme" />
                </SelectTrigger>
                <SelectContent>
                  {degrees.map((degree) => (
                    <SelectItem key={degree._id} value={degree._id}>
                      {degree.degreeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Selection */}
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Select 
                value={selectedYear} 
                onValueChange={handleYearChange}
                disabled={!selectedDegree}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableYears().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semester Selection */}
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select 
                value={selectedSemester} 
                onValueChange={handleSemesterChange}
                disabled={!selectedYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSemesters().map((semester) => (
                    <SelectItem key={semester} value={semester.toString()}>
                      Semester {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Degree Information */}
          {degreeInfo && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Faculty:</span>
                  <p className="text-gray-900">{degreeInfo.faculty}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Duration:</span>
                  <p className="text-gray-900">{degreeInfo.duration} years</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">University:</span>
                  <p className="text-gray-900">{degreeInfo.affiliatedUniversity}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Total Modules:</span>
                  <p className="text-gray-900">{degreeInfo.modules.length}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modules Display */}
      {modules.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Year {selectedYear} - Semester {selectedSemester} Modules
                </CardTitle>
                <CardDescription>
                  {modules.length} modules • {getTotalCredits()} total credits
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {getTotalCredits()} Credits
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{module.moduleName}</h3>
                      <p className="text-sm text-gray-500">{module.moduleCode}</p>
                    </div>
                    <Badge variant="outline">
                      {module.credits} Credits
                    </Badge>
                  </div>
                  
                  {module.description && (
                    <p className="text-sm text-gray-600">{module.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Year {module.year}
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      Sem {module.semester}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Modules Message */}
      {selectedDegree && selectedYear && selectedSemester && modules.length === 0 && (
        <Alert>
          <AlertDescription>
            No modules found for Year {selectedYear}, Semester {selectedSemester}. 
            Please check if the degree programme has modules defined for this period.
          </AlertDescription>
        </Alert>
      )}

      {/* Getting Started Message */}
      {!selectedDegree && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Calculator className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">Get Started</h3>
                <p className="text-gray-600">
                  Select your degree programme above to view the modules and subjects for each year and semester
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
