"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Download, Eye } from "lucide-react"
import { ResearchPaper } from "@/types"

export default function EditResearchPaper() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const paperId = params.id as string

  const [paper, setPaper] = useState<ResearchPaper | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    authors: [''],
    abstract: '',
    field: '',
    faculty: '',
    year: new Date().getFullYear(),
    tags: [''],
    keywords: [''],
    status: 'pending'
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      const userRole = session?.user?.role
      if (!userRole || !['admin', 'superadmin', 'moderator'].includes(userRole)) {
        router.push("/dashboard")
        return
      }
      fetchPaper()
    }
  }, [status, session, router, paperId])

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
          authors: paperData.authors || [''],
          abstract: paperData.abstract || '',
          field: paperData.field || '',
          faculty: paperData.faculty || '',
          year: paperData.year || new Date().getFullYear(),
          tags: paperData.tags || [''],
          keywords: paperData.keywords || [''],
          status: paperData.status || 'pending'
        })
      }
    } catch (error) {
      console.error('Failed to fetch paper:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/research/${paperId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/research')
      } else {
        alert('Failed to update paper')
      }
    } catch (error) {
      console.error('Failed to save paper:', error)
      alert('Failed to update paper')
    } finally {
      setSaving(false)
    }
  }

  const handleArrayChange = (field: 'authors' | 'tags' | 'keywords', index: number, value: string) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData({ ...formData, [field]: newArray })
  }

  const addArrayItem = (field: 'authors' | 'tags' | 'keywords') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] })
  }

  const removeArrayItem = (field: 'authors' | 'tags' | 'keywords', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index)
    setFormData({ ...formData, [field]: newArray })
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Research paper not found</p>
        <Button onClick={() => router.push('/admin/research')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Research Papers
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/research')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Edit Research Paper</h2>
            <p className="text-gray-600">Modify paper details and metadata</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`/research/${paperId}`, '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paper Information</CardTitle>
          <CardDescription>Edit the research paper details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Abstract */}
          <div>
            <Label htmlFor="abstract">Abstract</Label>
            <Textarea
              id="abstract"
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Authors */}
          <div>
            <Label>Authors</Label>
            {formData.authors.map((author, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={author}
                  onChange={(e) => handleArrayChange('authors', index, e.target.value)}
                  placeholder="Author name"
                />
                {formData.authors.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('authors', index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('authors')}
              className="mt-2"
            >
              Add Author
            </Button>
          </div>

          {/* Field and Faculty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="field">Field</Label>
              <Select value={formData.field} onValueChange={(value) => setFormData({ ...formData, field: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="computing">Computing</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="faculty">Faculty</Label>
              <Select value={formData.faculty} onValueChange={(value) => setFormData({ ...formData, faculty: value })}>
                <SelectTrigger className="mt-1">
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
          </div>

          {/* Year and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                min="2000"
                max="2030"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={tag}
                  onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                  placeholder="Tag"
                />
                {formData.tags.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('tags', index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('tags')}
              className="mt-2"
            >
              Add Tag
            </Button>
          </div>

          {/* Keywords */}
          <div>
            <Label>Keywords</Label>
            {formData.keywords.map((keyword, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={keyword}
                  onChange={(e) => handleArrayChange('keywords', index, e.target.value)}
                  placeholder="Keyword"
                />
                {formData.keywords.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('keywords', index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('keywords')}
              className="mt-2"
            >
              Add Keyword
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Information */}
      <Card>
        <CardHeader>
          <CardTitle>File Information</CardTitle>
          <CardDescription>Original file details (read-only)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Filename:</strong> {paper.fileName}
            </div>
            <div>
              <strong>Size:</strong> {(paper.fileSize / 1024).toFixed(1)} KB
            </div>
            <div>
              <strong>Type:</strong> {paper.mimeType}
            </div>
          </div>
          <div className="mt-4">
            <strong>Uploaded by:</strong> {typeof paper.uploadedBy === 'string' 
              ? paper.uploadedBy 
              : (paper.uploadedBy && typeof paper.uploadedBy === 'object' && 'name' in paper.uploadedBy 
                ? paper.uploadedBy.name 
                : 'Unknown')}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
