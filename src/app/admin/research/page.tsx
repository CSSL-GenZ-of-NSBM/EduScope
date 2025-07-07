"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react"
import { ResearchPaper } from "@/types"

interface AdminResearchPaper extends Omit<ResearchPaper, 'uploadedBy'> {
  uploadedBy: {
    _id: string
    name: string
    studentId: string
    email: string
  }
}

export default function AdminResearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [papers, setPapers] = useState<AdminResearchPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [selectedPapers, setSelectedPapers] = useState<string[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      // Check if user is admin or moderator
      const userRole = session?.user?.role
      if (!userRole || (userRole !== 'admin' && userRole !== 'moderator')) {
        router.push("/dashboard")
        return
      }
      fetchPapers()
    }
  }, [status, session, router, statusFilter])

  const fetchPapers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (search) {
        params.append('search', search)
      }
      params.append('adminView', 'true') // Get all papers including pending/rejected

      const response = await fetch(`/api/admin/research?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setPapers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch papers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (paperId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/research/${paperId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchPapers() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch('/api/admin/research/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paperIds: selectedPapers,
          status: newStatus 
        })
      })

      if (response.ok) {
        setSelectedPapers([])
        fetchPapers()
      }
    } catch (error) {
      console.error('Failed to bulk update:', error)
    }
  }

  const handleDelete = async (paperId: string) => {
    if (!confirm('Are you sure you want to delete this research paper?')) return

    try {
      const response = await fetch(`/api/admin/research/${paperId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchPapers()
      }
    } catch (error) {
      console.error('Failed to delete paper:', error)
    }
  }

  const handleDownload = async (paperId: string, filename: string) => {
    try {
      // Get the paper details to get the file ID
      const response = await fetch(`/api/research/${paperId}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get paper details')
      }
      
      const fileId = data.data.fileId
      
      // Download the file
      const downloadResponse = await fetch(`/api/files/${fileId}`)
      
      if (!downloadResponse.ok) {
        throw new Error('Failed to download file')
      }
      
      // Create blob and download
      const blob = await downloadResponse.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      // Update download count
      await fetch(`/api/research/${paperId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'download' }),
      })
      
      // Refresh the papers list to show updated download count
      fetchPapers()
      
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Research Papers</h2>
          <p className="text-gray-600">Manage and review research paper submissions</p>
        </div>
        {selectedPapers.length > 0 && (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleBulkStatusChange('approved')}
              variant="default"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Selected ({selectedPapers.length})
            </Button>
            <Button 
              onClick={() => handleBulkStatusChange('rejected')}
              variant="destructive"
              size="sm"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Selected
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search papers, authors, keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchPapers} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Papers List */}
      <div className="space-y-4">
        {papers.map((paper) => (
          <Card key={paper._id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedPapers.includes(paper._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPapers([...selectedPapers, paper._id])
                      } else {
                        setSelectedPapers(selectedPapers.filter(id => id !== paper._id))
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{paper.title}</h3>
                      {getStatusBadge(paper.status)}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{paper.abstract}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>👥 {paper.authors.join(", ")}</span>
                      <span>🎓 {paper.faculty}</span>
                      <span>📅 {paper.year}</span>
                      <span>📁 {paper.field}</span>
                      <span>👤 {paper.uploadedBy.name} ({paper.uploadedBy.studentId})</span>
                      <span>📧 {paper.uploadedBy.email}</span>
                      <span>📥 {paper.downloadCount} downloads</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/research/${paper._id}`, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(paper._id, paper.fileName || `${paper.title}.pdf`)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/admin/research/${paper._id}/edit`)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Select onValueChange={(value) => handleStatusChange(paper._id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Approve
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <MoreHorizontal className="w-4 h-4 text-yellow-600" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="rejected">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Reject
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(paper._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {papers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No research papers found</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
