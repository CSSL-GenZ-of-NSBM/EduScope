"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { 
  Search, 
  Filter, 
  Calendar,
  User,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from "lucide-react"
import { AuditLog, AuditAction, AuditResource } from "@/types"

export default function AdminAuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addToast } = useToast()
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    userId: '',
    action: 'all' as AuditAction | 'all' | '',
    resource: 'all' as AuditResource | 'all' | '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0
  })

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
      fetchAuditLogs()
    }
  }, [status, session, router])

  const fetchAuditLogs = async () => {
    if (!loading) setRefreshing(true)
    
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.userId) queryParams.append('userId', filters.userId)
      if (filters.action && filters.action !== 'all') queryParams.append('action', filters.action)
      if (filters.resource && filters.resource !== 'all') queryParams.append('resource', filters.resource)
      if (filters.startDate) queryParams.append('startDate', filters.startDate)
      if (filters.endDate) queryParams.append('endDate', filters.endDate)
      queryParams.append('limit', filters.limit.toString())
      queryParams.append('offset', filters.offset.toString())

      const response = await fetch(`/api/admin/audit-logs?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        setAuditLogs(data.data)
      } else {
        addToast({
          title: "Failed to fetch audit logs",
          description: data.error,
          variant: "error"
        })
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      addToast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "error"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }))
  }

  const clearFilters = () => {
    setFilters({
      userId: '',
      action: 'all' as AuditAction | 'all' | '',
      resource: 'all' as AuditResource | 'all' | '',
      startDate: '',
      endDate: '',
      limit: 50,
      offset: 0
    })
  }

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case AuditAction.USER_CREATE:
      case AuditAction.PAPER_CREATE:
      case AuditAction.IDEA_CREATE:
      case AuditAction.DEGREE_CREATE:
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case AuditAction.USER_VIEW:
      case AuditAction.PAPER_VIEW:
      case AuditAction.IDEA_VIEW:
      case AuditAction.DEGREE_VIEW:
        return <Eye className="w-4 h-4 text-blue-600" />
      case AuditAction.USER_UPDATE:
      case AuditAction.PAPER_UPDATE:
      case AuditAction.IDEA_UPDATE:
      case AuditAction.DEGREE_UPDATE:
        return <Edit className="w-4 h-4 text-yellow-600" />
      case AuditAction.USER_DELETE:
      case AuditAction.PAPER_DELETE:
      case AuditAction.IDEA_DELETE:
      case AuditAction.DEGREE_DELETE:
        return <Trash2 className="w-4 h-4 text-red-600" />
      case AuditAction.LOGIN:
      case AuditAction.ADMIN_LOGIN:
        return <User className="w-4 h-4 text-purple-600" />
      case AuditAction.LOGOUT:
        return <XCircle className="w-4 h-4 text-gray-600" />
      case AuditAction.PAPER_DOWNLOAD:
        return <Download className="w-4 h-4 text-indigo-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getActionBadge = (action: AuditAction) => {
    const colors: Record<string, string> = {
      [AuditAction.USER_CREATE]: 'bg-green-100 text-green-800',
      [AuditAction.PAPER_CREATE]: 'bg-green-100 text-green-800',
      [AuditAction.IDEA_CREATE]: 'bg-green-100 text-green-800',
      [AuditAction.DEGREE_CREATE]: 'bg-green-100 text-green-800',
      [AuditAction.USER_VIEW]: 'bg-blue-100 text-blue-800',
      [AuditAction.PAPER_VIEW]: 'bg-blue-100 text-blue-800',
      [AuditAction.IDEA_VIEW]: 'bg-blue-100 text-blue-800',
      [AuditAction.DEGREE_VIEW]: 'bg-blue-100 text-blue-800',
      [AuditAction.USER_UPDATE]: 'bg-yellow-100 text-yellow-800',
      [AuditAction.PAPER_UPDATE]: 'bg-yellow-100 text-yellow-800',
      [AuditAction.IDEA_UPDATE]: 'bg-yellow-100 text-yellow-800',
      [AuditAction.DEGREE_UPDATE]: 'bg-yellow-100 text-yellow-800',
      [AuditAction.USER_DELETE]: 'bg-red-100 text-red-800',
      [AuditAction.PAPER_DELETE]: 'bg-red-100 text-red-800',
      [AuditAction.IDEA_DELETE]: 'bg-red-100 text-red-800',
      [AuditAction.DEGREE_DELETE]: 'bg-red-100 text-red-800',
      [AuditAction.LOGIN]: 'bg-purple-100 text-purple-800',
      [AuditAction.ADMIN_LOGIN]: 'bg-purple-100 text-purple-800',
      [AuditAction.LOGOUT]: 'bg-gray-100 text-gray-800',
      [AuditAction.PAPER_DOWNLOAD]: 'bg-indigo-100 text-indigo-800',
      [AuditAction.REGISTER]: 'bg-green-100 text-green-800',
    }
    
    return (
      <Badge className={colors[action] || 'bg-gray-100 text-gray-800'}>
        {action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    )
  }

  const getResourceBadge = (resource: AuditResource) => {
    const colors: Record<string, string> = {
      [AuditResource.USER]: 'bg-blue-100 text-blue-800',
      [AuditResource.RESEARCH_PAPER]: 'bg-green-100 text-green-800',
      [AuditResource.IDEA]: 'bg-purple-100 text-purple-800',
      [AuditResource.DEGREE]: 'bg-orange-100 text-orange-800',
      [AuditResource.ADMIN]: 'bg-red-100 text-red-800',
      [AuditResource.SYSTEM]: 'bg-gray-100 text-gray-800',
      [AuditResource.AUTH]: 'bg-indigo-100 text-indigo-800',
      [AuditResource.FILE]: 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <Badge variant="outline" className={colors[resource] || 'bg-gray-100 text-gray-800'}>
        {resource.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-gray-600">Monitor system activity and user actions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchAuditLogs}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Filter by user..."
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={filters.action || 'all'} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="DOWNLOAD">Download</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resource">Resource</Label>
              <Select value={filters.resource || 'all'} onValueChange={(value) => handleFilterChange('resource', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All resources</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="RESEARCH">Research</SelectItem>
                  <SelectItem value="IDEA">Idea</SelectItem>
                  <SelectItem value="DEGREE">Degree</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="AUDIT_LOG">Audit Log</SelectItem>
                  <SelectItem value="FILE">File</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={fetchAuditLogs} className="flex-1">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button onClick={clearFilters} variant="outline">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Audit Trail ({auditLogs.length} entries)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No audit logs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getActionIcon(log.action)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getActionBadge(log.action)}
                          {getResourceBadge(log.resource)}
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm font-medium text-gray-900">{log.userEmail}</span>
                          <Badge variant="secondary">{log.userRole}</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {log.action} action on {log.resource}
                          {log.resourceId && ` (ID: ${log.resourceId})`}
                        </p>

                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="text-xs text-gray-500 bg-gray-100 rounded p-2 mt-2">
                            <strong>Details:</strong>
                            <pre className="mt-1 whitespace-pre-wrap">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatTimestamp(log.timestamp)}
                          </span>
                          {log.ipAddress && (
                            <span>IP: {log.ipAddress}</span>
                          )}
                          {log.userAgent && (
                            <span className="truncate max-w-xs">
                              UA: {log.userAgent}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
