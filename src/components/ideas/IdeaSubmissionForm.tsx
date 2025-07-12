'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, X, Lightbulb, AlertCircle, CheckCircle2 } from 'lucide-react'
import { AcademicField } from '@/types'

interface IdeaSubmissionFormProps {
  onSubmit?: (data: any) => void
  onClose?: () => void
  trigger?: React.ReactNode
}

export default function IdeaSubmissionForm({ onSubmit, onClose, trigger }: IdeaSubmissionFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    field: '',
    expectedOutcome: '',
    priority: 'medium',
    feasibility: 'medium',
    estimatedCost: '',
    tags: [] as string[],
    targetAudience: [] as string[],
    resourcesNeeded: [] as string[]
  })

  // Tag/audience/resource input states
  const [tagInput, setTagInput] = useState('')
  const [audienceInput, setAudienceInput] = useState('')
  const [resourceInput, setResourceInput] = useState('')

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      field: '',
      expectedOutcome: '',
      priority: 'medium',
      feasibility: 'medium',
      estimatedCost: '',
      tags: [],
      targetAudience: [],
      resourcesNeeded: []
    })
    setTagInput('')
    setAudienceInput('')
    setResourceInput('')
    setSubmitStatus('idle')
    setErrorMessage('')
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addAudience = () => {
    if (audienceInput.trim() && !formData.targetAudience.includes(audienceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        targetAudience: [...prev.targetAudience, audienceInput.trim()]
      }))
      setAudienceInput('')
    }
  }

  const removeAudience = (audienceToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.filter(audience => audience !== audienceToRemove)
    }))
  }

  const addResource = () => {
    if (resourceInput.trim() && !formData.resourcesNeeded.includes(resourceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        resourcesNeeded: [...prev.resourcesNeeded, resourceInput.trim()]
      }))
      setResourceInput('')
    }
  }

  const removeResource = (resourceToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      resourcesNeeded: prev.resourcesNeeded.filter(resource => resource !== resourceToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim() || !formData.field || !formData.expectedOutcome.trim()) {
      setErrorMessage('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        if (onSubmit) {
          onSubmit(result.data)
        }
        
        // Auto close after success
        setTimeout(() => {
          setOpen(false)
          if (onClose) onClose()
          resetForm()
        }, 2000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to submit idea')
      }
    } catch (error) {
      console.error('Error submitting idea:', error)
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      action()
    }
  }

  const defaultTrigger = (
    <Button className="bg-green-600 hover:bg-green-700">
      <Plus className="w-4 h-4 mr-2" />
      Submit Idea
    </Button>
  )

  const formContent = (
    <div className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
          Submit New Idea
        </DialogTitle>
        <DialogDescription>
          Share your innovative idea with the community. All ideas are reviewed before being published.
        </DialogDescription>
      </DialogHeader>

      {submitStatus === 'success' && (
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
          <p className="text-green-700">Idea submitted successfully! It will be reviewed and published soon.</p>
        </div>
      )}

      {submitStatus === 'error' && errorMessage && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a clear, descriptive title for your idea"
              maxLength={200}
              required
            />
            <p className="text-sm text-gray-500 mt-1">{formData.title.length}/200 characters</p>
          </div>

          <div>
            <Label htmlFor="field">Academic Field *</Label>
            <Select value={formData.field} onValueChange={(value) => handleInputChange('field', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select the relevant academic field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AcademicField.COMPUTING}>Computing</SelectItem>
                <SelectItem value={AcademicField.ENGINEERING}>Engineering</SelectItem>
                <SelectItem value={AcademicField.BUSINESS}>Business</SelectItem>
                <SelectItem value={AcademicField.SCIENCE}>Science</SelectItem>
                <SelectItem value={AcademicField.MANAGEMENT}>Management</SelectItem>
                <SelectItem value={AcademicField.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide a detailed description of your idea, including the problem it solves and how it works"
              maxLength={2000}
              rows={6}
              required
            />
            <p className="text-sm text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
          </div>

          <div>
            <Label htmlFor="expectedOutcome">Expected Outcome *</Label>
            <Textarea
              id="expectedOutcome"
              value={formData.expectedOutcome}
              onChange={(e) => handleInputChange('expectedOutcome', e.target.value)}
              placeholder="Describe what you expect to achieve with this idea"
              maxLength={500}
              rows={3}
              required
            />
            <p className="text-sm text-gray-500 mt-1">{formData.expectedOutcome.length}/500 characters</p>
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Project Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="feasibility">Feasibility</Label>
              <Select value={formData.feasibility} onValueChange={(value) => handleInputChange('feasibility', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estimatedCost">Estimated Cost</Label>
              <Input
                id="estimatedCost"
                value={formData.estimatedCost}
                onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                placeholder="e.g., $1000-5000, Low, Medium"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label>Tags (Optional)</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add relevant tags (press Enter)"
                onKeyPress={(e) => handleKeyPress(e, addTag)}
                maxLength={50}
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={formData.tags.length >= 10}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500">{formData.tags.length}/10 tags</p>
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <Label>Target Audience (Optional)</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={audienceInput}
                onChange={(e) => setAudienceInput(e.target.value)}
                placeholder="Who will benefit from this idea?"
                onKeyPress={(e) => handleKeyPress(e, addAudience)}
              />
              <Button type="button" variant="outline" onClick={addAudience}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.targetAudience.map((audience) => (
                <Badge key={audience} variant="outline" className="flex items-center gap-1">
                  {audience}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeAudience(audience)} />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Needed */}
        <div>
          <Label>Resources Needed (Optional)</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={resourceInput}
                onChange={(e) => setResourceInput(e.target.value)}
                placeholder="What resources are needed to implement this?"
                onKeyPress={(e) => handleKeyPress(e, addResource)}
              />
              <Button type="button" variant="outline" onClick={addResource}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.resourcesNeeded.map((resource) => (
                <Badge key={resource} variant="outline" className="flex items-center gap-1">
                  {resource}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeResource(resource)} />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setOpen(false)
              if (onClose) onClose()
              resetForm()
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || submitStatus === 'success'}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Idea'}
          </Button>
        </DialogFooter>
      </form>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        {formContent}
      </DialogContent>
    </Dialog>
  )
}
