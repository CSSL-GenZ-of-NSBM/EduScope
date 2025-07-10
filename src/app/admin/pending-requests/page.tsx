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
  Eye,
  GraduationCap
} from "lucide-react"
import { ResearchPaper } from "@/types"

export default function AdminPendingRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingUpdates, setPendingUpdates] = useState<ResearchPaper[]>([])
  const [pendingDeletions, setPendingDeletions] = useState<ResearchPaper[]>([])
  const [yearChangeRequests, setYearChangeRequests] = useState<any[]>([])
  const [degreeChangeRequests, setDegreeChangeRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [yearChangeLoading, setYearChangeLoading] = useState(true)
  const [degreeChangeLoading, setDegreeChangeLoading] = useState(true)
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
      if (!['admin', 'superadmin', 'moderator'].includes(session?.user?.role)) {
        router.push("/dashboard")
      } else {
        fetchPendingRequests()
        fetchYearChangeRequests()
        fetchDegreeChangeRequests()
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

  const fetchYearChangeRequests = async () => {
    setYearChangeLoading(true)
    try {
      const response = await fetch('/api/admin/year-change-requests?status=pending')
      const data = await response.json()

      if (data.success) {
        setYearChangeRequests(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch year change requests:', error)
    } finally {
      setYearChangeLoading(false)
    }
  }

  const fetchDegreeChangeRequests = async () => {
    setDegreeChangeLoading(true)
    try {
      const response = await fetch('/api/admin/degree-change-requests')
      const data = await response.json()

      if (data.success) {
        setDegreeChangeRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Failed to fetch degree change requests:', error)
    } finally {
      setDegreeChangeLoading(false)
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

  const handleYearChangeRequest = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(requestId)
    console.log('Frontend: Processing request with ID:', requestId)
    console.log('Frontend: Current year change requests:', yearChangeRequests.map(r => r._id))
    
    try {
      console.log(`Processing year change request ${requestId} with action ${action}`)
      const response = await fetch(`/api/admin/year-change-requests/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, reason })
      })

      const responseData = await response.json()
      console.log('Frontend: API response:', responseData)
      
      if (response.ok && responseData.success) {
        addToast({
          title: `Year Change Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          description: `The year change request has been ${action}d successfully.`,
          variant: action === 'approve' ? 'success' : 'info'
        })
        
        // Add a small delay to ensure the database update is complete
        setTimeout(() => {
          fetchYearChangeRequests()
        }, 100)
      } else {
        console.error('API Error:', responseData)
        addToast({
          title: `Failed to ${action} request`,
          description: responseData.error || "Please try again later.",
          variant: "error"
        })
      }
    } catch (error) {
      console.error(`Error ${action}ing year change request:`, error)
      addToast({
        title: "Network Error",
        description: `Failed to ${action} year change request. Please check your connection.`,
        variant: "error"
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleDegreeChangeRequest = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(requestId)
    
    try {
      const response = await fetch('/api/admin/degree-change-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: requestId, action, reason })
      })

      const responseData = await response.json()
      
      if (response.ok && responseData.success) {
        addToast({
          title: `Degree Change Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          description: `The degree change request has been ${action}d successfully.`,
          variant: action === 'approve' ? 'success' : 'info'
        })
        
        // Refresh the degree change requests
        setTimeout(() => {
          fetchDegreeChangeRequests()
        }, 100)
      } else {
        addToast({
          title: `Failed to ${action} request`,
          description: responseData.error || "Please try again later.",
          variant: "error"
        })
      }
    } catch (error) {
      console.error(`Error ${action}ing degree change request:`, error)
      addToast({
        title: "Network Error",
        description: `Failed to ${action} degree change request. Please check your connection.`,
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Calendar className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{yearChangeRequests.length}</p>
              <p className="text-sm text-gray-600">Year Changes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <GraduationCap className="h-6 w-6 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{degreeChangeRequests.length}</p>
              <p className="text-sm text-gray-600">Degree Changes</p>
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

      {/* Year Change Requests */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-yellow-500" />
          Year Change Requests ({yearChangeRequests.length})
        </h2>
        
        {yearChangeLoading ? (
          <Card className="text-center py-8">
            <CardContent>
              <div className="flex justify-center mb-4">
                <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600">Loading year change requests...</p>
            </CardContent>
          </Card>
        ) : yearChangeRequests.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No pending year change requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {yearChangeRequests.map((request) => (
              <Card key={request._id} className="border-yellow-200 bg-yellow-50 h-fit">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Year Change Request
                    </Badge>
                  </div>
                  <CardTitle className="text-base line-clamp-2 mb-2">
                    {request.user?.name || 'Unknown User'}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <User className="h-3 w-3 mr-1" />
                      {request.user?.email || 'No email'}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-white p-3 rounded border mb-4 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Current Year</p>
                        <p className="font-medium">{request.details?.currentYear ? `Year ${request.details.currentYear}` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Requested Year</p>
                        <p className="font-medium">{request.details?.requestedYear ? `Year ${request.details.requestedYear}` : 'N/A'}</p>
                      </div>
                      <div className="col-span-2 mt-2">
                        <p className="text-gray-500 text-xs mb-1">Faculty</p>
                        <p className="font-medium">{request.user?.faculty || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleYearChangeRequest(request._id, 'reject')}
                      disabled={processingId === request._id}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleYearChangeRequest(request._id, 'approve')}
                      disabled={processingId === request._id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Degree Change Requests */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <GraduationCap className="h-6 w-6 mr-2 text-purple-500" />
          Degree Change Requests ({degreeChangeRequests.length})
        </h2>
        
        {degreeChangeLoading ? (
          <Card className="text-center py-8">
            <CardContent>
              <div className="flex justify-center mb-4">
                <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600">Loading degree change requests...</p>
            </CardContent>
          </Card>
        ) : degreeChangeRequests.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No pending degree change requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {degreeChangeRequests.map((request) => (
              <Card key={request.id} className="border-purple-200 bg-purple-50 h-fit">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Degree Change Request
                    </Badge>
                  </div>
                  <CardTitle className="text-base line-clamp-2 mb-2">
                    {request.userName || 'Unknown User'}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <User className="h-3 w-3 mr-1" />
                      {request.userEmail || 'No email'}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-white p-3 rounded border mb-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Current Degree</p>
                        <p className="font-medium">{request.currentDegree?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-600">{request.currentDegree?.faculty || ''}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Requested Degree</p>
                        <p className="font-medium">{request.requestedDegree?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-600">{request.requestedDegree?.faculty || ''}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Current Year</p>
                        <p className="font-medium">{request.currentYear ? `Year ${request.currentYear}` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDegreeChangeRequest(request.id, 'reject')}
                      disabled={processingId === request.id}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleDegreeChangeRequest(request.id, 'approve')}
                      disabled={processingId === request.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
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
          changedData={selectedPaper.pendingChanges || {}}
          title={selectedPaper.title}
        />
      )}
    </div>
  )
}
