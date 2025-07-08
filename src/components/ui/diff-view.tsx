"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Minus, Plus } from "lucide-react"

interface DiffViewProps {
  isOpen: boolean
  onClose: () => void
  originalData: any
  changedData: any
  title: string
}

interface DiffLineProps {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  label?: string
}

const DiffLine = ({ type, content, label }: DiffLineProps) => {
  const bgColor = {
    added: 'bg-green-50 border-l-4 border-l-green-500',
    removed: 'bg-red-50 border-l-4 border-l-red-500',
    unchanged: 'bg-gray-50 border-l-4 border-l-gray-300'
  }

  const textColor = {
    added: 'text-green-800',
    removed: 'text-red-800',
    unchanged: 'text-gray-800'
  }

  const icon = {
    added: <Plus className="h-3 w-3 text-green-600" />,
    removed: <Minus className="h-3 w-3 text-red-600" />,
    unchanged: null
  }

  return (
    <div className={`p-2 ${bgColor[type]} mb-1 font-mono text-sm`}>
      <div className="flex items-center gap-2">
        {icon[type]}
        {label && <span className="font-semibold">{label}:</span>}
        <span className={textColor[type]}>{content}</span>
      </div>
    </div>
  )
}

export function DiffView({ isOpen, onClose, originalData, changedData, title }: DiffViewProps) {
  const renderFieldDiff = (fieldName: string, originalValue: any, newValue: any) => {
    if (!originalValue && !newValue) return null
    
    // Convert arrays to strings for comparison
    const formatValue = (value: any) => {
      if (Array.isArray(value)) {
        return value.join(', ')
      }
      return value?.toString() || ''
    }

    const originalStr = formatValue(originalValue)
    const newStr = formatValue(newValue)

    if (originalStr === newStr) {
      return (
        <DiffLine 
          type="unchanged" 
          content={originalStr} 
          label={fieldName}
        />
      )
    }

    return (
      <div className="mb-2">
        {originalStr && (
          <DiffLine 
            type="removed" 
            content={originalStr} 
            label={`${fieldName} (original)`}
          />
        )}
        {newStr && (
          <DiffLine 
            type="added" 
            content={newStr} 
            label={`${fieldName} (new)`}
          />
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Changes for: {title}</span>
            <Badge variant="outline">Diff View</Badge>
          </DialogTitle>
          <DialogDescription>
            Review the proposed changes. Green indicates additions/changes, red indicates removals.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] w-full">
          <div className="space-y-4">
            {renderFieldDiff('Title', originalData?.title, changedData?.title)}
            {renderFieldDiff('Abstract', originalData?.abstract, changedData?.abstract)}
            {renderFieldDiff('Field', originalData?.field, changedData?.field)}
            {renderFieldDiff('Faculty', originalData?.faculty, changedData?.faculty)}
            {renderFieldDiff('Authors', originalData?.authors, changedData?.authors)}
            {renderFieldDiff('Keywords', originalData?.keywords, changedData?.keywords)}
            {renderFieldDiff('Tags', originalData?.tags, changedData?.tags)}
            {renderFieldDiff('Year', originalData?.year, changedData?.year)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
