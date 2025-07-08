"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { DeleteDialog } from "@/components/ui/delete-dialog"
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { ResearchPaper } from "@/types"

export default function MyResearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [papers, setPapers] = useState<ResearchPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    paperId: string
    title: string
    loading: boolean
  }>({
    open: false,
    paperId: '',
    title: '',
    loading: false
  })
  const { addToast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchMyPapers()
    }
  }, [status])

  const fetchMyPapers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/research?userOnly=true')
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

  const handleDelete = async (paperId: string, title: string) => {
    setDeleteDialog({
      open: true,
      paperId,
      title,
      loading: false
    })
  }

  const confirmDelete = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }))

    try {
      const response = await fetch(`/api/research/${deleteDialog.paperId}/request-delete`, {
        method: 'POST'
      })

      if (response.ok) {
        addToast({
          title: "Delete Request Submitted",
          description: "Moderators will review your deletion request shortly.",
          variant: "success"
        })
        fetchMyPapers() // Refresh the list
        setDeleteDialog({
          open: false,
          paperId: '',
          title: '',
          loading: false
        })
      } else {
        addToast({
          title: "Failed to Submit Request",
          description: "Please try again later.",
          variant: "error"
        })
      }
    } catch (error) {
      console.error('Delete request error:', error)
      addToast({
        title: "Network Error",
        description: "Failed to submit delete request. Please check your connection.",
        variant: "error"
      })
    } finally {
      setDeleteDialog(prev => ({ ...prev, loading: false }))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString()
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center">
            <Button variant="outline" asChild className="mr-4">
              <Link href="/research">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Research
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Research Papers</h1>
              <p className="text-gray-600">
                Manage your uploaded research papers and track their status
              </p>
            </div>
          </div>
          <Button className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700" asChild>
            <Link href="/research/upload">
              <Plus className="w-4 h-4 mr-2" />
              Upload New Paper
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{papers.length}</p>
                <p className="text-sm text-gray-600">Total Papers</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{papers.filter(p => p.status === 'approved').length}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{papers.filter(p => p.status === 'pending').length}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <Download className="h-6 w-6 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{papers.reduce((acc, p) => acc + p.downloadCount, 0)}</p>
                <p className="text-sm text-gray-600">Total Downloads</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Papers List */}
        {papers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No papers uploaded yet</h3>
              <p className="text-gray-600 mb-4">
                Upload your first research paper to get started!
              </p>
              <Button asChild>
                <Link href="/research/upload">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Your First Paper
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <Card key={paper._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(paper.status)}
                    <CardTitle className="text-lg line-clamp-2">{paper.title}</CardTitle>
                  </div>
                  <div className="flex justify-between items-start">
                    <CardDescription className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-3 w-3 mr-1" />
                        {paper.authors.slice(0, 2).join(", ")}
                        {paper.authors.length > 2 && " +"}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        {paper.year}
                      </div>
                    </CardDescription>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(paper.status)}
                      <div className="flex items-center text-xs text-gray-600">
                        <Download className="h-3 w-3 mr-1" />
                        {paper.downloadCount}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                    {paper.abstract}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    <Badge variant="secondary" className="text-xs">{paper.field}</Badge>
                    {paper.faculty && (
                      <Badge variant="outline" className="text-xs">{paper.faculty}</Badge>
                    )}
                  </div>

                  <div className="flex gap-1 justify-end">
                    {paper.status === 'approved' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/research/${paper._id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/research/my-papers/${paper._id}/edit`}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(paper._id, paper.title)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        title={deleteDialog.title}
        description="This will send a request to moderators for approval."
        onConfirm={confirmDelete}
        loading={deleteDialog.loading}
      />
    </div>
  )
}
