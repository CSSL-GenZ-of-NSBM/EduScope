'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Search, TrendingUp, Users, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import IdeaSubmissionForm from '@/components/ideas/IdeaSubmissionForm'

export default function IdeasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [ideas, setIdeas] = useState([])
  const [stats, setStats] = useState({
    totalIdeas: 0,
    totalVotes: 0,
    totalViews: 0,
    totalComments: 0,
    trendingThisWeek: 0,
    activeContributors: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch ideas from API
  const fetchIdeas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ideas?page=1&limit=20')
      const result = await response.json()
      
      if (result.success) {
        setIdeas(result.data.ideas)
        setStats({
          totalIdeas: result.data.stats.totalIdeas,
          totalVotes: result.data.stats.totalVotes,
          totalViews: result.data.stats.totalViews,
          totalComments: result.data.stats.totalComments,
          trendingThisWeek: result.data.stats.trendingThisWeek,
          activeContributors: 85 // Mock data for now
        })
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIdeas()
  }, [])

  const handleIdeaSubmitted = (newIdea: any) => {
    // Refresh the ideas list after submission
    fetchIdeas()
  }

  const filteredIdeas = ideas.filter((idea: any) =>
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Idea Bank</h1>
          <p className="text-gray-600">
            Share your innovative ideas and collaborate with fellow students
          </p>
        </div>
        <IdeaSubmissionForm onSubmit={handleIdeaSubmitted} />
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search ideas, tags, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center">
            <Lightbulb className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{loading ? '...' : stats.totalIdeas}</p>
              <p className="text-sm text-gray-600">Total Ideas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{loading ? '...' : stats.trendingThisWeek}</p>
              <p className="text-sm text-gray-600">Trending This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <Users className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{loading ? '...' : stats.activeContributors}</p>
              <p className="text-sm text-gray-600">Active Contributors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <MessageSquare className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{loading ? '...' : stats.totalComments}</p>
              <p className="text-sm text-gray-600">Total Comments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ideas...</p>
        </div>
      )}

      {/* Ideas Grid */}
      {!loading && (
        <div className="grid gap-6">
          {filteredIdeas.map((idea: any) => (
            <Card key={idea._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{idea.title}</CardTitle>
                      {idea.isTrending && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {idea.isPopular && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-gray-600 mb-3">
                      {idea.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {idea.tags?.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>By {idea.authorName || idea.author?.name}</span>
                    <Badge variant="outline">{idea.field}</Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      👍 {idea.votes || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      💬 {idea.comments || 0}
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredIdeas.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No ideas found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search query' : 'Be the first to share an innovative idea!'}
            </p>
            <Button variant="outline">
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
