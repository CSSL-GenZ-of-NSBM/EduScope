"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { DiffView } from "@/components/ui/diff-view"
import { 
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  Eye
} from "lucide-react"
import { ResearchPaper } from "@/types"

export default function AdminPendingRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingUpdates, setPendingUpdates] = useState<ResearchPaper[]>([])
  const [pendingDeletions, setPendingDeletions] = useState<ResearchPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [diffViewOpen, setDiffViewOpen] = useState(false)
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null)
  const { addToast } = useToast()

  const showDiffView = (paper: ResearchPaper) => {
    setSelectedPaper(paper)
    setDiffViewOpen(true)
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      if (session?.user?.role !== "admin" && session?.user?.role !== "moderator") {
        router.push("/dashboard")
      } else {
        fetchPendingRequests()
      }
    }
  }, [status, session, router])

  const fetchPendingRequests = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/pending-requests')
      const data = await response.json()

      if (data.success) {
        setPendingUpdates(data.data.pendingUpdates || [])
        setPendingDeletions(data.data.pendingDeletions || [])
      }
    } catch (error) {
      console.error('Failed to fetch pending requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRequest = async (paperId: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(paperId)
    try {
      const response = await fetch(`/api/admin/pending-requests/${paperId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, reason })
      })

      if (response.ok) {
        addToast({
          title: `Update Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          description: `The update request has been ${action}d successfully.`,
          variant: action === 'approve' ? 'success' : 'info'
        })
        fetchPendingRequests() // Refresh the list
      } else {
        addToast({
          title: `Failed to ${action} request`,
          description: "Please try again later.",
          variant: "error"
        })
      }
    } catch (error) {
      console.error(`Error ${action}ing update request:`, error)
      addToast({
        title: "Network Error",
        description: `Failed to ${action} update request. Please check your connection.`,
        variant: "error"
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeleteRequest = async (paperId: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(paperId)
    try {
      const response = await fetch(`/api/admin/pending-requests/${paperId}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, reason })
      })

      if (response.ok) {
        addToast({
          title: `Delete Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          description: action === 'approve' 
            ? "The paper has been permanently deleted."
            : "The delete request has been rejected.",
          variant: action === 'approve' ? 'success' : 'info'
        })
        fetchPendingRequests() // Refresh the list
      } else {
        addToast({
          title: `Failed to ${action} request`,
          description: "Please try again later.",
          variant: "error"
        })
      }
    } catch (error) {
      console.error(`Error ${action}ing delete request:`, error)
      addToast({
        title: "Network Error",
        description: `Failed to ${action} delete request. Please check your connection.`,
        variant: "error"
      })
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString()
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Requests</h1>
        <p className="text-gray-600">
          Review and approve/reject user requests for paper updates and deletions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Edit className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{pendingUpdates.length}</p>
              <p className="text-sm text-gray-600">Pending Updates</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Trash2 className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{pendingDeletions.length}</p>
              <p className="text-sm text-gray-600">Pending Deletions</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{pendingUpdates.length + pendingDeletions.length}</p>
              <p className="text-sm text-gray-600">Total Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Updates */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Edit className="h-6 w-6 mr-2 text-blue-500" />
          Pending Updates ({pendingUpdates.length})
        </h2>
        
        {pendingUpdates.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Edit className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No pending update requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingUpdates.map((paper) => (
              <Card key={paper._id} className="border-blue-200 bg-blue-50 h-fit">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                      <Edit className="h-3 w-3 mr-1" />
                      Update Request
                    </Badge>
                  </div>
                  <CardTitle className="text-base line-clamp-2 mb-2">
                    {paper.title}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <User className="h-3 w-3 mr-1" />
                      {typeof paper.pendingChanges?.requestedBy === 'object' 
                        ? (paper.pendingChanges?.requestedBy as any)?.name || 'Unknown'
                        : paper.pendingChanges?.requestedBy || 'Unknown'
                      }
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {paper.pendingChanges?.requestedAt ? formatDate(paper.pendingChanges.requestedAt) : 'Unknown'}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {paper.pendingChanges && (
                    <div className="space-y-2 mb-4">
                      <div className="bg-white p-2 rounded border text-xs">
                        {paper.pendingChanges.title && (
                          <div className="mb-1">
                            <span className="font-medium">Title:</span>
                            <p className="text-gray-700 line-clamp-1">{paper.pendingChanges.title}</p>
                          </div>
                        )}
                        {paper.pendingChanges.field && (
                          <div className="mb-1">
                            <span className="font-medium">Field:</span>
                            <Badge variant="secondary" className="ml-1 text-xs">{paper.pendingChanges.field}</Badge>
                          </div>
                        )}
                        {paper.pendingChanges.abstract && (
                          <div>
                            <span className="font-medium">Abstract:</span>
                            <p className="text-gray-700 line-clamp-2">{paper.pendingChanges.abstract}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => showDiffView(paper)}
                      className="w-full text-blue-600 hover:text-blue-700 border-blue-200"
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      View Changes
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateRequest(paper._id, 'reject')}
                        disabled={processingId === paper._id}
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleUpdateRequest(paper._id, 'approve')}
                        disabled={processingId === paper._id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pending Deletions */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Trash2 className="h-6 w-6 mr-2 text-red-500" />
          Pending Deletions ({pendingDeletions.length})
        </h2>
        
        {pendingDeletions.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Trash2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No pending deletion requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingDeletions.map((paper) => (
              <Card key={paper._id} className="border-red-200 bg-red-50 h-fit">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete Request
                    </Badge>
                  </div>
                  <CardTitle className="text-base line-clamp-2 mb-2">
                    {paper.title}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <User className="h-3 w-3 mr-1" />
                      {typeof paper.pendingDeletion?.requestedBy === 'object' 
                        ? (paper.pendingDeletion?.requestedBy as any)?.name || 'Unknown'
                        : paper.pendingDeletion?.requestedBy || 'Unknown'
                      }
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {paper.pendingDeletion?.requestedAt ? formatDate(paper.pendingDeletion.requestedAt) : 'Unknown'}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-white p-2 rounded border mb-4 text-xs">
                    <p className="text-gray-700 line-clamp-3">{paper.abstract}</p>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">{paper.field}</Badge>
                      {paper.faculty && <Badge variant="outline" className="text-xs">{paper.faculty}</Badge>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteRequest(paper._id, 'reject')}
                      disabled={processingId === paper._id}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleDeleteRequest(paper._id, 'approve')}
                      disabled={processingId === paper._id}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Diff View Modal */}
      {selectedPaper && (
        <DiffView
          isOpen={diffViewOpen}
          onClose={() => {
            setDiffViewOpen(false)
            setSelectedPaper(null)
          }}
          originalData={selectedPaper}
          changedData={selectedPaper.pendingChanges}
          title={selectedPaper.title}
        />
      )}
    </div>
  )
}
