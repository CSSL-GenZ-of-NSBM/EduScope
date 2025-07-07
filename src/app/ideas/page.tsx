'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Plus, Search, TrendingUp, Users, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function IdeasPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data for demonstration
  const mockIdeas = [
    {
      id: '1',
      title: 'Smart Campus Attendance System',
      description: 'An IoT-based system to automate attendance tracking using RFID cards and facial recognition technology.',
      author: 'Kasun Perera',
      field: 'Computing',
      votes: 15,
      comments: 8,
      tags: ['IoT', 'RFID', 'Facial Recognition', 'Automation'],
      status: 'popular'
    },
    {
      id: '2',
      title: 'Sustainable Energy Management for Campus',
      description: 'Implementation of solar panels and energy-efficient systems to reduce carbon footprint.',
      author: 'Nimal Silva',
      field: 'Engineering',
      votes: 12,
      comments: 5,
      tags: ['Solar Energy', 'Sustainability', 'Green Technology'],
      status: 'trending'
    },
    {
      id: '3',
      title: 'AI-Powered Student Mental Health Support',
      description: 'Chatbot system to provide 24/7 mental health support and counseling for students.',
      author: 'Priya Jayawardena',
      field: 'Computing',
      votes: 20,
      comments: 12,
      tags: ['AI', 'Mental Health', 'Chatbot', 'Support'],
      status: 'trending'
    }
  ]

  const filteredIdeas = mockIdeas.filter(idea =>
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
        <Button className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Submit Idea
        </Button>
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
              <p className="text-2xl font-bold">127</p>
              <p className="text-sm text-gray-600">Total Ideas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">23</p>
              <p className="text-sm text-gray-600">Trending This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <Users className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">85</p>
              <p className="text-sm text-gray-600">Active Contributors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <MessageSquare className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">342</p>
              <p className="text-sm text-gray-600">Total Comments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ideas Grid */}
      <div className="grid gap-6">
        {filteredIdeas.map((idea) => (
          <Card key={idea.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{idea.title}</CardTitle>
                    {idea.status === 'trending' && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    {idea.status === 'popular' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-600 mb-3">
                    {idea.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {idea.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
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
                  <span>By {idea.author}</span>
                  <Badge variant="outline">{idea.field}</Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    👍 {idea.votes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    💬 {idea.comments}
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
