'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Flag, 
  TrendingUp,
  Edit,
  Trash2,
  Send,
  Users,
  Target,
  DollarSign,
  Lightbulb,
  CheckCircle,
  Calendar,
  User,
  Building
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface IdeaComment {
  _id: string
  ideaId: string
  userId: string
  content: string
  author: {
    name: string
    email: string
    studentId?: string
    faculty?: string
  }
  isEdited: boolean
  createdAt: string
  updatedAt: string
}

interface IdeaDetailsPageProps {
  params: {
    slug: string
  }
}

export default function IdeaDetailsPage({ params }: IdeaDetailsPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [idea, setIdea] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [isVoting, setIsVoting] = useState(false)
  const [comments, setComments] = useState<IdeaComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  const fetchIdea = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try slug-based lookup first, then fallback to ID
      let response = await fetch(`/api/ideas/slug/${params.slug}`)
      if (!response.ok && response.status === 404) {
        // Fallback to ID-based lookup
        response = await fetch(`/api/ideas/${params.slug}?trackView=true`)
      }
      
      const result = await response.json()

      if (result.success) {
        setIdea(result.data)
        setVoteCount(result.data.votes)
        if (session?.user?.id && result.data.votedBy) {
          setHasVoted(result.data.votedBy.includes(session.user.id))
        }
      } else {
        setError(result.error || 'Failed to fetch idea')
      }
    } catch (error) {
      console.error('Error fetching idea:', error)
      setError('Failed to fetch idea')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    if (!idea || !idea._id) {
      return
    }
    
    setCommentsLoading(true)
    try {
      const response = await fetch(`/api/ideas/${idea._id}/comments`)
      const result = await response.json()

      if (result.success) {
        setComments(result.data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  useEffect(() => {
    fetchIdea()
  }, [params.slug, session?.user?.id])

  useEffect(() => {
    if (idea?._id) {
      fetchComments()
    }
  }, [idea?._id])

  const handleVote = async () => {
    if (!session?.user) {
      alert('Please sign in to vote')
      return
    }

    setIsVoting(true)
    try {
      const response = await fetch(`/api/ideas/${idea._id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        setVoteCount(result.data.votes)
        setHasVoted(result.data.userHasVoted)
      } else {
        alert(result.error || 'Failed to vote')
      }
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote')
    } finally {
      setIsVoting(false)
    }
  }

  const handleAddComment = async () => {
    if (!session?.user) {
      alert('Please sign in to comment')
      return
    }

    if (!newComment.trim()) {
      alert('Please enter a comment')
      return
    }

    if (!idea || !idea._id) {
      alert('Error: Idea not found')
      return
    }

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/ideas/${idea._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        setComments([result.data, ...comments])
        setNewComment('')
        // Update idea comment count
        setIdea((prev: any) => ({ ...prev, comments: prev.comments + 1 }))
      } else {
        alert(result.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editCommentContent.trim()) {
      alert('Please enter comment content')
      return
    }

    try {
      const response = await fetch(`/api/ideas/${idea._id}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editCommentContent.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        setComments(comments.map(c => c._id === commentId ? result.data : c))
        setEditingComment(null)
        setEditCommentContent('')
      } else {
        alert(result.error || 'Failed to edit comment')
      }
    } catch (error) {
      console.error('Error editing comment:', error)
      alert('Failed to edit comment')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`/api/ideas/${idea._id}/comments/${commentId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setComments(comments.filter(c => c._id !== commentId))
        setIdea((prev: any) => ({ ...prev, comments: prev.comments - 1 }))
      } else {
        alert(result.error || 'Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 text-red-800 bg-red-50'
      case 'medium': return 'border-yellow-200 text-yellow-800 bg-yellow-50'
      case 'low': return 'border-green-200 text-green-800 bg-green-50'
      default: return 'border-gray-200 text-gray-800 bg-gray-50'
    }
  }

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case 'high': return 'border-green-200 text-green-800 bg-green-50'
      case 'medium': return 'border-yellow-200 text-yellow-800 bg-yellow-50'
      case 'low': return 'border-red-200 text-red-800 bg-red-50'
      default: return 'border-gray-200 text-gray-800 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading idea...</p>
        </div>
      </div>
    )
  }

  if (error || !idea) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Idea not found'}
          </h1>
          <Button onClick={() => router.push('/ideas')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Ideas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/ideas')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Ideas
        </Button>
      </div>

      {/* Main Idea Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <CardTitle className="text-2xl lg:text-3xl">{idea.title}</CardTitle>
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
                {idea.isImplemented && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Implemented
                  </Badge>
                )}
              </div>

              {/* Author and Meta Info */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{idea.authorName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  <span>{idea.authorFaculty}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}</span>
                </div>
              </div>

              {/* Tags and Metadata */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{idea.field}</Badge>
                <Badge variant="outline" className={getPriorityColor(idea.priority)}>
                  {idea.priority} priority
                </Badge>
                <Badge variant="outline" className={getFeasibilityColor(idea.feasibility)}>
                  {idea.feasibility} feasibility
                </Badge>
                {idea.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{idea.description}</p>
          </div>

          {/* Expected Outcome */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Expected Outcome
            </h3>
            <p className="text-gray-700 leading-relaxed">{idea.expectedOutcome}</p>
          </div>

          {/* Target Audience */}
          {idea.targetAudience && idea.targetAudience.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Target Audience
              </h3>
              <div className="flex flex-wrap gap-2">
                {idea.targetAudience.map((audience: string) => (
                  <Badge key={audience} variant="outline" className="text-sm">
                    {audience}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Resources Needed */}
          {idea.resourcesNeeded && idea.resourcesNeeded.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Resources Needed
              </h3>
              <div className="grid gap-2">
                {idea.resourcesNeeded.map((resource: string) => (
                  <div key={resource} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700">{resource}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Cost */}
          {idea.estimatedCost && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Estimated Cost
              </h3>
              <p className="text-gray-700">{idea.estimatedCost}</p>
            </div>
          )}

          {/* Implementation Details */}
          {idea.isImplemented && idea.implementationDetails && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                Implementation Details
              </h3>
              <p className="text-green-700 leading-relaxed">{idea.implementationDetails}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button 
                variant={hasVoted ? "default" : "ghost"} 
                size="sm" 
                onClick={handleVote}
                disabled={isVoting}
                className={hasVoted ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <ThumbsUp className={`w-4 h-4 mr-1 ${hasVoted ? 'fill-white' : ''}`} />
                {voteCount}
              </Button>
              
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <MessageSquare className="w-4 h-4" />
                {idea.comments} comments
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="w-4 h-4 mr-1" />
                Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments ({idea.comments})
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Add Comment */}
          {session?.user && (
            <div className="mb-6">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                maxLength={1000}
                className="mb-2"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {newComment.length}/1000 characters
                </span>
                <Button 
                  onClick={handleAddComment}
                  disabled={isSubmittingComment || !newComment.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Post Comment
                </Button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {commentsLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading comments...</p>
              </div>
            )}
            
            {!commentsLoading && comments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
            
            {!commentsLoading && comments.length > 0 && (
              comments.map((comment) => (
                <div key={comment._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.author.name}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {comment.isEdited && (
                        <span className="text-xs text-gray-400">(edited)</span>
                      )}
                    </div>
                    
                    {session?.user?.id === comment.userId && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingComment(comment._id)
                            setEditCommentContent(comment.content)
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {editingComment === comment._id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        rows={3}
                        maxLength={1000}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingComment(null)
                            setEditCommentContent('')
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditComment(comment._id)}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
