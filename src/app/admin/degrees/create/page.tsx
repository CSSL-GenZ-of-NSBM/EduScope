"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Plus, Trash2, GraduationCap, Loader2 } from "lucide-react"
import { Faculty, AffiliatedUniversity, DegreeModule } from "@/types"

export default function AdminCreateDegreePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    degreeName: "",
    faculty: "",
    affiliatedUniversity: "",
    duration: "",
    price: "",
    description: "",
    admissionRequirements: [""],
    careerPaths: [""]
  })
  const [modules, setModules] = useState<DegreeModule[]>([])

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
    }
  }, [status, session, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError("")
  }

  const handleArrayFieldChange = (field: 'admissionRequirements' | 'careerPaths', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayField = (field: 'admissionRequirements' | 'careerPaths') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }))
  }

  const removeArrayField = (field: 'admissionRequirements' | 'careerPaths', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    }
  }

  const addModule = () => {
    const newModule: DegreeModule = {
      year: 1,
      semester: 1,
      moduleName: "",
      moduleCode: "",
      credits: 3,
      description: ""
    }
    setModules(prev => [...prev, newModule])
  }

  const updateModule = (index: number, field: keyof DegreeModule, value: string | number) => {
    setModules(prev => prev.map((module, i) => 
      i === index ? { ...module, [field]: value } : module
    ))
  }

  const removeModule = (index: number) => {
    setModules(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validate required fields
    if (!formData.degreeName || !formData.faculty || !formData.affiliatedUniversity || !formData.duration || !formData.price) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    // Validate duration
    const duration = parseInt(formData.duration)
    if (isNaN(duration) || duration < 1 || duration > 6) {
      setError("Duration must be between 1 and 6 years")
      setLoading(false)
      return
    }

    // Validate price
    const price = parseFloat(formData.price)
    if (isNaN(price) || price < 0) {
      setError("Price must be a valid positive number")
      setLoading(false)
      return
    }

    // Filter out empty requirements and career paths
    const admissionRequirements = formData.admissionRequirements.filter(req => req.trim())
    const careerPaths = formData.careerPaths.filter(path => path.trim())

    try {
      const degreeData = {
        degreeName: formData.degreeName,
        faculty: formData.faculty,
        affiliatedUniversity: formData.affiliatedUniversity,
        duration,
        price,
        description: formData.description,
        admissionRequirements,
        careerPaths,
        modules
      }

      const response = await fetch("/api/admin/degrees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(degreeData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Degree created successfully!")
        setTimeout(() => {
          router.push("/admin/degrees")
        }, 2000)
      } else {
        setError(data.error || "Failed to create degree")
      }
    } catch (error) {
      console.error("Failed to create degree:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/admin/degrees")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Degrees
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Create New Degree</h2>
          <p className="text-gray-600">Add a new degree programme to the university</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Basic Information</CardTitle>
                <CardDescription>Enter the basic details of the degree programme</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Degree Name */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="degreeName">Degree Name *</Label>
                <Input
                  id="degreeName"
                  value={formData.degreeName}
                  onChange={(e) => handleInputChange('degreeName', e.target.value)}
                  placeholder="e.g., BSc (Hons) in Computer Science"
                  required
                />
              </div>

              {/* Faculty */}
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty *</Label>
                <Select value={formData.faculty} onValueChange={(value) => handleInputChange('faculty', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Faculty).map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Affiliated University */}
              <div className="space-y-2">
                <Label htmlFor="affiliatedUniversity">Affiliated University *</Label>
                <Select value={formData.affiliatedUniversity} onValueChange={(value) => handleInputChange('affiliatedUniversity', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(AffiliatedUniversity).map((university) => (
                      <SelectItem key={university} value={university}>
                        {university}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Years) *</Label>
                <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="4">4 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price (LKR) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Enter price in LKR"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter degree description..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admission Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Admission Requirements</CardTitle>
            <CardDescription>List the admission requirements for this degree</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.admissionRequirements.map((requirement, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={requirement}
                  onChange={(e) => handleArrayFieldChange('admissionRequirements', index, e.target.value)}
                  placeholder="Enter admission requirement..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayField('admissionRequirements', index)}
                  disabled={formData.admissionRequirements.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayField('admissionRequirements')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Requirement
            </Button>
          </CardContent>
        </Card>

        {/* Career Paths */}
        <Card>
          <CardHeader>
            <CardTitle>Career Paths</CardTitle>
            <CardDescription>List potential career paths for graduates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.careerPaths.map((path, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={path}
                  onChange={(e) => handleArrayFieldChange('careerPaths', index, e.target.value)}
                  placeholder="Enter career path..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayField('careerPaths', index)}
                  disabled={formData.careerPaths.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayField('careerPaths')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Career Path
            </Button>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Degree Modules</CardTitle>
                <CardDescription>Add modules/courses for each year and semester</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addModule}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {modules.map((module, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Module {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeModule(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select
                      value={module.year.toString()}
                      onValueChange={(value) => updateModule(index, 'year', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            Year {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select
                      value={module.semester.toString()}
                      onValueChange={(value) => updateModule(index, 'semester', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Module Code</Label>
                    <Input
                      value={module.moduleCode}
                      onChange={(e) => updateModule(index, 'moduleCode', e.target.value)}
                      placeholder="e.g., CS101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Credits</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={module.credits}
                      onChange={(e) => updateModule(index, 'credits', parseInt(e.target.value) || 3)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Module Name</Label>
                    <Input
                      value={module.moduleName}
                      onChange={(e) => updateModule(index, 'moduleName', e.target.value)}
                      placeholder="Enter module name..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={module.description || ""}
                      onChange={(e) => updateModule(index, 'description', e.target.value)}
                      placeholder="Enter module description..."
                    />
                  </div>
                </div>
              </div>
            ))}
            {modules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No modules added yet. Click "Add Module" to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/degrees")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Degree...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Degree
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
