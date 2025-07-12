'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  TrendingUp, 
  ThumbsUp, 
  MessageSquare, 
  Edit, 
  Trash2, 
  Send,
  Flag,
  Share2,
  ExternalLink
} from 'lucide-react'
import { useSession } from 'next-auth/react'
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

interface IdeaDisplayProps {
  idea: {
    _id: string
    title: string
    slug: string
    description: string
    field: string
    tags: string[]
    author?: {
      name: string
      email: string
      studentId?: string
      faculty?: string
    }
    authorName: string
    authorFaculty: string
    votes: number
    votedBy: string[]
    comments: number
    isTrending?: boolean
    isPopular?: boolean
    viewCount: number
    priority: 'low' | 'medium' | 'high'
    feasibility: 'low' | 'medium' | 'high'
    estimatedCost?: string
    targetAudience: string[]
    expectedOutcome: string
    resourcesNeeded: string[]
    isImplemented: boolean
    implementationDetails?: string
    createdAt: string
    updatedAt: string
  }
  showFullDetails?: boolean
  onVote?: (ideaId: string) => void
  onDelete?: (ideaId: string) => void
}

export default function IdeaDisplay({ idea, showFullDetails = false, onVote, onDelete }: IdeaDisplayProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [hasVoted, setHasVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(idea.votes)
  const [isVoting, setIsVoting] = useState(false)
  const [comments, setComments] = useState<IdeaComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  // Check if current user has voted
  useEffect(() => {
    if (session?.user?.id && idea.votedBy) {
      setHasVoted(idea.votedBy.includes(session.user.id))
    }
  }, [session?.user?.id, idea.votedBy])

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
        setHasVoted(result.data.hasVoted)
        setVoteCount(result.data.votes)
        if (onVote) {
          onVote(idea._id)
        }
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

  const fetchComments = async () => {
    if (commentsLoading) return

    setCommentsLoading(true)
    try {
      const response = await fetch(`/api/ideas/${idea._id}/comments?page=1&limit=50`)
      const result = await response.json()

      if (result.success) {
        setComments(result.data.comments)
      } else {
        console.error('Failed to fetch comments:', result.error)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleShowComments = () => {
    if (!showComments) {
      fetchComments()
    }
    setShowComments(!showComments)
  }

  const handleSubmitComment = async () => {
    if (!session?.user) {
      alert('Please sign in to comment')
      return
    }

    if (!newComment.trim()) {
      alert('Please enter a comment')
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
        idea.comments = idea.comments + 1
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
        setComments(comments.map(comment => 
          comment._id === commentId ? result.data : comment
        ))
        setEditingComment(null)
        setEditCommentContent('')
      } else {
        alert(result.error || 'Failed to update comment')
      }
    } catch (error) {
      console.error('Error updating comment:', error)
      alert('Failed to update comment')
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
        setComments(comments.filter(comment => comment._id !== commentId))
        // Update idea comment count
        idea.comments = idea.comments - 1
      } else {
        alert(result.error || 'Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment')
    }
  }

  const canEditComment = (comment: IdeaComment) => {
    return session?.user?.id === comment.userId || 
           ['admin', 'moderator', 'superadmin'].includes(session?.user?.role || '')
  }

  const canDeleteIdea = () => {
    return session?.user?.id === idea.author?.name || 
           ['admin', 'moderator', 'superadmin'].includes(session?.user?.role || '')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
              {idea.isImplemented && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✅ Implemented
                </Badge>
              )}
              <Badge variant="outline" className={getPriorityColor(idea.priority)}>
                {idea.priority} priority
              </Badge>
            </div>
            <CardDescription className="text-gray-600 mb-3">
              {idea.description}
            </CardDescription>
            
            {showFullDetails && (
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Expected Outcome</h4>
                  <p className="text-sm text-gray-600">{idea.expectedOutcome}</p>
                </div>
                
                {idea.targetAudience.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Target Audience</h4>
                    <div className="flex flex-wrap gap-1">
                      {idea.targetAudience.map((audience) => (
                        <Badge key={audience} variant="outline" className="text-xs">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {idea.resourcesNeeded.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Resources Needed</h4>
                    <div className="flex flex-wrap gap-1">
                      {idea.resourcesNeeded.map((resource) => (
                        <Badge key={resource} variant="outline" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {idea.estimatedCost && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Estimated Cost</h4>
                    <p className="text-sm text-gray-600">{idea.estimatedCost}</p>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <div>
                    <span className="font-medium text-sm text-gray-700">Feasibility: </span>
                    <Badge variant="outline" className={getPriorityColor(idea.feasibility)}>
                      {idea.feasibility}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-gray-700">Views: </span>
                    <span className="text-sm text-gray-600">{idea.viewCount}</span>
                  </div>
                </div>
                
                {idea.implementationDetails && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Implementation Details</h4>
                    <p className="text-sm text-gray-600">{idea.implementationDetails}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mb-3">
              {idea.tags?.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {canDeleteIdea() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete && onDelete(idea._id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>By {idea.authorName}</span>
            <Badge variant="outline">{idea.field}</Badge>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => {}}>
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Flag className="w-4 h-4 mr-1" />
              Report
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
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
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShowComments}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              {idea.comments}
            </Button>
          </div>

          {!showFullDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push(`/ideas/${idea.slug}`)}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View More
            </Button>
          )}
        </div>
        
        {/* Comments Section */}
        {showComments && (
          <div className="mt-6 space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-3">
                Comments ({idea.comments})
              </h4>
              
              {/* Add Comment */}
              {session?.user && (
                <div className="mb-4">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/1000 characters
                    </span>
                    <Button 
                      size="sm" 
                      onClick={handleSubmitComment}
                      disabled={isSubmittingComment || !newComment.trim()}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Comment
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Comments List */}
              <div className="space-y-3">
                {commentsLoading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                  </div>
                )}
                
                {comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        {comment.author.faculty && (
                          <Badge variant="outline" className="text-xs">
                            {comment.author.faculty}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        {comment.isEdited && (
                          <span className="text-xs text-gray-400">(edited)</span>
                        )}
                      </div>
                      
                      {canEditComment(comment) && (
                        <div className="flex gap-1">
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
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {editingComment === comment._id ? (
                      <div>
                        <Textarea
                          value={editCommentContent}
                          onChange={(e) => setEditCommentContent(e.target.value)}
                          rows={3}
                          maxLength={1000}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleEditComment(comment._id)}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingComment(null)
                              setEditCommentContent('')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    )}
                  </div>
                ))}
                
                {!commentsLoading && comments.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
