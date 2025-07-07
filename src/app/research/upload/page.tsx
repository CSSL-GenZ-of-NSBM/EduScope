"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, Plus, X, Loader2 } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"

interface FormData {
  title: string
  authors: string[]
  abstract: string
  field: string
  faculty: string
  year: number
  keywords: string[]
  tags: string[]
  isPublic: boolean
  fileId?: string
  filename?: string
}

export default function ResearchUploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: '',
    authors: [''],
    abstract: '',
    field: '',
    faculty: session?.user?.faculty || '',
    year: new Date().getFullYear(),
    keywords: [''],
    tags: [''],
    isPublic: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // File upload handlers
  const handleFileUploadSuccess = (fileId: string, filename: string) => {
    setFormData(prev => ({ ...prev, fileId, filename }))
    setError('') // Clear any previous errors
  }

  const handleFileUploadError = (error: string) => {
    setError(error)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: 'authors' | 'keywords' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: 'authors' | 'keywords' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'authors' | 'keywords' | 'tags', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Filter out empty strings
      const cleanedData = {
        ...formData,
        authors: formData.authors.filter(author => author.trim()),
        keywords: formData.keywords.filter(keyword => keyword.trim()),
        tags: formData.tags.filter(tag => tag.trim())
      }

      // Validation
      if (!cleanedData.title.trim()) {
        throw new Error('Title is required')
      }
      if (cleanedData.authors.length === 0) {
        throw new Error('At least one author is required')
      }
      if (!cleanedData.abstract.trim()) {
        throw new Error('Abstract is required')
      }
      if (!cleanedData.field) {
        throw new Error('Field is required')
      }
      if (!formData.fileId) {
        throw new Error('Please upload a research paper file')
      }

      // Add fileId to the data being sent
      const submitData = {
        ...cleanedData,
        fileId: formData.fileId
      }

      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Research paper uploaded successfully!')
        setTimeout(() => {
          router.push(`/research/${data.data._id}`)
        }, 2000)
      } else {
        throw new Error(data.error || 'Failed to upload research paper')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/research">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Research
              </Link>
            </Button>
            <span className="text-gray-400">|</span>
            <h1 className="text-xl font-semibold text-gray-800">Upload Research Paper</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Research Paper
            </CardTitle>
            <CardDescription>
              Share your research with the NSBM academic community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter research paper title"
                  required
                />
              </div>

              {/* Authors */}
              <div className="space-y-2">
                <Label>Authors *</Label>
                {formData.authors.map((author, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={author}
                      onChange={(e) => handleArrayChange('authors', index, e.target.value)}
                      placeholder={`Author ${index + 1}`}
                      required={index === 0}
                    />
                    {formData.authors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('authors', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('authors')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Author
                </Button>
              </div>

              {/* Abstract */}
              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract *</Label>
                <textarea
                  id="abstract"
                  value={formData.abstract}
                  onChange={(e) => handleInputChange('abstract', e.target.value)}
                  placeholder="Enter research abstract (max 2000 characters)"
                  className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  maxLength={2000}
                  required
                />
                <p className="text-sm text-gray-500">
                  {formData.abstract.length}/2000 characters
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Research Paper File *</Label>
                <FileUpload
                  paperType="research"
                  onUploadSuccess={handleFileUploadSuccess}
                  onUploadError={handleFileUploadError}
                  disabled={loading}
                />
                {formData.filename && (
                  <p className="text-sm text-green-600">
                    ✓ File uploaded: {formData.filename}
                  </p>
                )}
              </div>

              {/* Field and Faculty */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="field">Field *</Label>
                  <Select
                    value={formData.field}
                    onValueChange={(value) => handleInputChange('field', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="computing">Computing</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty</Label>
                  <Select
                    value={formData.faculty}
                    onValueChange={(value) => handleInputChange('faculty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Faculty of Engineering">Faculty of Engineering</SelectItem>
                      <SelectItem value="Faculty of Business">Faculty of Business</SelectItem>
                      <SelectItem value="Faculty of Computing">Faculty of Computing</SelectItem>
                      <SelectItem value="Faculty of Applied Sciences">Faculty of Applied Sciences</SelectItem>
                      <SelectItem value="Faculty of Management">Faculty of Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  min={2000}
                  max={new Date().getFullYear()}
                  required
                />
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label>Keywords</Label>
                {formData.keywords.map((keyword, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={keyword}
                      onChange={(e) => handleArrayChange('keywords', index, e.target.value)}
                      placeholder={`Keyword ${index + 1}`}
                    />
                    {formData.keywords.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('keywords', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('keywords')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Keyword
                </Button>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={tag}
                      onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                      placeholder={`Tag ${index + 1}`}
                    />
                    {formData.tags.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('tags', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('tags')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.isPublic ? 'public' : 'private'}
                  onValueChange={(value) => handleInputChange('isPublic', value === 'public')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Visible to all students</SelectItem>
                    <SelectItem value="private">Private - Only visible to you</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload Research Paper
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
