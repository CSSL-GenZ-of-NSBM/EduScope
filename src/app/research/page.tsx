"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Upload, 
  Download, 
  Eye, 
  Calendar,
  User,
  BookOpen,
  Filter,
  ArrowUpDown,
  Plus,
  FileText
} from "lucide-react"
import { ResearchPaper } from "@/types"

interface SearchParams {
  search: string
  field: string
  faculty: string
  year: string
  sortBy: string
  sortOrder: string
}

interface ResearchStats {
  totalPapers: number
  papersThisWeek: number
  uniqueContributors: number
  totalDownloads: number
  papersByField: Array<{ _id: string; count: number }>
  papersByYear: Array<{ _id: number; count: number }>
}

export default function ResearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [papers, setPapers] = useState<ResearchPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState<ResearchStats | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchParams, setSearchParams] = useState<SearchParams>({
    search: '',
    field: 'all',
    faculty: 'all',
    year: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchPapers()
      fetchStats()
    }
  }, [status, searchParams, pagination.page])

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const response = await fetch('/api/research/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch research stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchPapers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Only add non-default parameters
      if (pagination.page > 1) params.append('page', pagination.page.toString())
      if (pagination.limit !== 12) params.append('limit', pagination.limit.toString())
      if (searchParams.sortBy !== 'createdAt') params.append('sortBy', searchParams.sortBy)
      if (searchParams.sortOrder !== 'desc') params.append('sortOrder', searchParams.sortOrder)
      
      // Add search/filter parameters
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'all' && key !== 'sortBy' && key !== 'sortOrder') {
          params.append(key, value)
        }
      })

      const queryString = params.toString()
      const url = queryString ? `/api/research?${queryString}` : '/api/research'
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setPapers(data.data)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error('Failed to fetch papers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, search: searchInput }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleFilterChange = (key: keyof SearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString()
  }

  const handleDownload = async (paperId: string, filename: string) => {
    try {
      // Get the paper details to get the file ID (without tracking view)
      const response = await fetch(`/api/research/${paperId}?download=true`)
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
      // Also refresh stats to show updated download counts
      fetchStats()
      
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file. Please try again.')
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Papers</h1>
            <p className="text-gray-600">
              Discover and share academic research from NSBM Green University
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <Link href="/research/my-papers">
                <FileText className="w-4 h-4 mr-2" />
                My Research
              </Link>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" asChild>
              <Link href="/research/upload">
                <Plus className="w-4 h-4 mr-2" />
                Upload Paper
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center">
              <FileText className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.totalPapers || 0}
                </p>
                <p className="text-sm text-gray-600">Total Papers</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <Upload className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.papersThisWeek || 0}
                </p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <User className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.uniqueContributors || 0}
                </p>
                <p className="text-sm text-gray-600">Contributors</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <Download className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.totalDownloads || 0}
                </p>
                <p className="text-sm text-gray-600">Downloads</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Search className="h-4 w-4 mr-2" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search Input */}
              <div className="lg:col-span-2 flex gap-2">
                <Input
                  placeholder="Search papers, authors, keywords..."
                  value={searchInput}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Field Filter */}
              <Select
                value={searchParams.field}
                onValueChange={(value) => handleFilterChange('field', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Fields" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="computing">Computing</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={`${searchParams.sortBy}-${searchParams.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-')
                  setSearchParams(prev => ({ ...prev, sortBy, sortOrder }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="downloadCount-desc">Most Downloaded</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="year-desc">Year (Recent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count and Actions */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found {pagination.total} research papers
          </p>
        </div>

        {/* Research Papers Grid */}
        {papers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No papers found</h3>
              <p className="text-gray-600 mb-4">
                {searchParams.search || (searchParams.field !== 'all') || (searchParams.faculty !== 'all')
                  ? "Try adjusting your search criteria."
                  : "Be the first to upload a research paper!"}
              </p>
              <Button asChild>
                <Link href="/research/upload">
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
                  <CardTitle className="line-clamp-2 text-lg">
                    {paper.title}
                  </CardTitle>
                  <CardDescription className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      {paper.authors.join(", ")}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {paper.year} • {formatDate(paper.createdAt)}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                    {paper.abstract}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{paper.field}</Badge>
                    {paper.faculty && (
                      <Badge variant="outline">{paper.faculty}</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Download className="h-4 w-4 mr-1" />
                      {paper.downloadCount} downloads
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/research/${paper._id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleDownload(paper._id, paper.fileName || `${paper.title}.pdf`)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            
            <span className="flex items-center px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
