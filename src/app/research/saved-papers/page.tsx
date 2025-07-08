"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { 
  ArrowLeft,
  Heart,
  HeartOff,
  Eye,
  Download,
  Calendar,
  User,
  FileText,
  Bookmark,
  BookmarkCheck,
  Share2
} from "lucide-react"
import { ResearchPaper } from "@/types"

export default function SavedPapersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [papers, setPapers] = useState<ResearchPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [unsavingPaper, setUnsavingPaper] = useState<string | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchSavedPapers()
    }
  }, [session])

  const fetchSavedPapers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/research/saved')
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved papers')
      }
      
      const data = await response.json()
      setPapers(data.data || [])
    } catch (error) {
      console.error('Error fetching saved papers:', error)
      addToast({
        title: "Error",
        description: "Failed to load saved papers. Please try again.",
        variant: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (paperId: string, title: string) => {
    try {
      setUnsavingPaper(paperId)
      
      const response = await fetch(`/api/research/${paperId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'unsave' }),
      })

      if (!response.ok) {
        throw new Error('Failed to unsave paper')
      }

      // Remove paper from local state
      setPapers(prev => prev.filter(paper => paper._id !== paperId))
      
      addToast({
        title: "Paper Unsaved",
        description: `"${title}" has been removed from your saved papers.`,
        variant: "success"
      })
    } catch (error) {
      console.error('Error unsaving paper:', error)
      addToast({
        title: "Error",
        description: "Failed to unsave paper. Please try again.",
        variant: "error"
      })
    } finally {
      setUnsavingPaper(null)
    }
  }

  const handleShare = async (paperId: string, title: string) => {
    try {
      const url = `${window.location.origin}/research/${paperId}`
      await navigator.clipboard.writeText(url)
      
      addToast({
        title: "Link Copied",
        description: `Link to "${title}" has been copied to clipboard.`,
        variant: "success"
      })
    } catch (error) {
      console.error('Share error:', error)
      addToast({
        title: "Share Failed",
        description: "Failed to copy link. Please try again.",
        variant: "error"
      })
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="academic-container">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="academic-container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/research">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Research
                </Link>
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Saved Papers</h1>
                <p className="text-gray-600 mt-1">
                  Your collection of saved research papers
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                <Bookmark className="h-4 w-4 mr-1" />
                {papers.length} Saved
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        {papers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bookmark className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Saved Papers Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start saving papers you find interesting to build your personal collection.
                  </p>
                  <Button asChild>
                    <Link href="/research">
                      <FileText className="h-4 w-4 mr-2" />
                      Browse Research Papers
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {papers.map((paper) => (
              <Card key={paper._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 hover:text-blue-600 transition-colors">
                        <Link href={`/research/${paper._id}`}>
                          {paper.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 line-clamp-2">
                        {paper.abstract}
                      </CardDescription>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary">{paper.field}</Badge>
                        {paper.faculty && <Badge variant="outline">{paper.faculty}</Badge>}
                        <Badge variant="outline">{paper.year}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{paper.authors.join(", ")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{paper.viewCount || 0} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{paper.downloadCount} downloads</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(paper._id, paper.title)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/research/${paper._id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnsave(paper._id, paper.title)}
                        disabled={unsavingPaper === paper._id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {unsavingPaper === paper._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <>
                            <BookmarkCheck className="h-4 w-4 mr-1" />
                            Unsave
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
