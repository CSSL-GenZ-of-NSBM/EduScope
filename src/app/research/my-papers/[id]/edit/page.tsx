"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { 
  ArrowLeft,
  Save,
  AlertTriangle,
  FileText,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"
import { ResearchPaper, AcademicField, Faculty } from "@/types"

export default function EditResearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const paperId = params.id as string
  const { addToast } = useToast()

  const [paper, setPaper] = useState<ResearchPaper | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    authors: '',
    field: '',
    faculty: '',
    year: new Date().getFullYear(),
    keywords: '',
    tags: '',
    supervisor: '',
    department: ''
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated" && paperId) {
      fetchPaper()
    }
  }, [status, paperId])

  const fetchPaper = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/research/${paperId}`)
      const data = await response.json()

      if (data.success) {
        const paperData = data.data
        setPaper(paperData)
        setFormData({
          title: paperData.title || '',
          abstract: paperData.abstract || '',
          authors: paperData.authors?.join(', ') || '',
          field: paperData.field || '',
          faculty: paperData.faculty || '',
          year: paperData.year || new Date().getFullYear(),
          keywords: paperData.keywords?.join(', ') || '',
          tags: paperData.tags?.join(', ') || '',
          supervisor: paperData.supervisor || '',
          department: paperData.department || ''
        })
      } else {
        addToast({
          title: "Paper Not Found",
          description: "The paper you're trying to edit was not found or you don't have access to it.",
          variant: "error"
        })
        router.push('/research/my-papers')
      }
    } catch (error) {
      console.error('Failed to fetch paper:', error)
      addToast({
        title: "Network Error",
        description: "Failed to load paper details. Please check your connection.",
        variant: "error"
      })
      router.push('/research/my-papers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData = {
        ...formData,
        authors: formData.authors.split(',').map(author => author.trim()).filter(Boolean),
        keywords: formData.keywords.split(',').map(keyword => keyword.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      const response = await fetch(`/api/research/${paperId}/request-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        addToast({
          title: "Update Request Submitted",
          description: "Moderators will review your changes and approve them shortly.",
          variant: "success"
        })
        router.push('/research/my-papers')
      } else {
        const errorData = await response.json()
        addToast({
          title: "Failed to Submit Request",
          description: errorData.error || 'Please try again later.',
          variant: "error"
        })
      }
    } catch (error) {
      console.error('Update request error:', error)
      addToast({
        title: "Network Error",
        description: "Failed to submit update request. Please check your connection.",
        variant: "error"
      })
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'flagged':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Review</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case 'flagged':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Flagged</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session || !paper) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="outline" asChild className="mr-4">
            <Link href="/research/my-papers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Research
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(paper.status)}
              <h1 className="text-3xl font-bold text-gray-900">Edit Research Paper</h1>
              {getStatusBadge(paper.status)}
            </div>
            <p className="text-gray-600">
              Submit changes for moderator review before they go live
            </p>
          </div>
        </div>

        {/* Warning Notice */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <p className="font-semibold text-orange-800">Moderation Required</p>
                <p className="text-sm text-orange-700">
                  Any changes you make will be sent to moderators for approval before being published.
                  Your paper will remain in its current state until changes are approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Paper Information
            </CardTitle>
            <CardDescription>
              Update your research paper details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter research paper title"
                  required
                />
              </div>

              {/* Authors */}
              <div>
                <Label htmlFor="authors">Authors *</Label>
                <Input
                  id="authors"
                  value={formData.authors}
                  onChange={(e) => setFormData(prev => ({ ...prev, authors: e.target.value }))}
                  placeholder="Enter authors separated by commas"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">Separate multiple authors with commas</p>
              </div>

              {/* Abstract */}
              <div>
                <Label htmlFor="abstract">Abstract *</Label>
                <Textarea
                  id="abstract"
                  value={formData.abstract}
                  onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                  placeholder="Enter research abstract"
                  rows={6}
                  required
                />
              </div>

              {/* Field and Faculty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field">Academic Field *</Label>
                  <Select value={formData.field} onValueChange={(value) => setFormData(prev => ({ ...prev, field: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AcademicField.ENGINEERING}>Engineering</SelectItem>
                      <SelectItem value={AcademicField.COMPUTING}>Computing</SelectItem>
                      <SelectItem value={AcademicField.BUSINESS}>Business</SelectItem>
                      <SelectItem value={AcademicField.SCIENCE}>Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="faculty">Faculty</Label>
                  <Select value={formData.faculty} onValueChange={(value) => setFormData(prev => ({ ...prev, faculty: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Faculty.ENGINEERING}>Faculty of Engineering</SelectItem>
                      <SelectItem value={Faculty.COMPUTING}>Faculty of Computing</SelectItem>
                      <SelectItem value={Faculty.BUSINESS}>Faculty of Business</SelectItem>
                      <SelectItem value={Faculty.SCIENCE}>Faculty of Applied Sciences</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Year */}
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              {/* Keywords */}
              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="Enter keywords separated by commas"
                />
                <p className="text-sm text-gray-600 mt-1">Separate multiple keywords with commas</p>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-sm text-gray-600 mt-1">Separate multiple tags with commas</p>
              </div>

              {/* Supervisor and Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Input
                    id="supervisor"
                    value={formData.supervisor}
                    onChange={(e) => setFormData(prev => ({ ...prev, supervisor: e.target.value }))}
                    placeholder="Enter supervisor name"
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
