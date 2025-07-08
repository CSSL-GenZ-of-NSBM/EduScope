"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, ExternalLink } from "lucide-react"

interface DocumentPreviewProps {
  fileId: string
  fileName: string
  mimeType: string
  fileSize: number
}

export function DocumentPreview({ fileId, fileName, mimeType, fileSize }: DocumentPreviewProps) {
  const [previewError, setPreviewError] = useState(false)
  
  // Check if the file type supports preview
  const isPDF = mimeType.includes('pdf')
  const isWord = mimeType.includes('word') || mimeType.includes('document')
  const isImage = mimeType.includes('image')
  
  const canPreview = isPDF || isImage
  
  const getFileIcon = () => {
    if (isPDF) return "📄"
    if (isWord) return "📝"
    if (isImage) return "🖼️"
    return "📄"
  }

  const getFileTypeName = () => {
    if (isPDF) return "PDF Document"
    if (isWord) return "Word Document" 
    if (isImage) return "Image File"
    return "Document"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleOpenInNewTab = () => {
    window.open(`/api/files/${fileId}`, '_blank')
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Document Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl">{getFileIcon()}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{fileName}</p>
              <p className="text-xs text-gray-500">{getFileTypeName()} • {formatFileSize(fileSize)}</p>
            </div>
          </div>

          {/* Preview or Message */}
          {canPreview && !previewError ? (
            <div className="space-y-3">
              {isPDF && (
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src={`/api/files/${fileId}#toolbar=0`}
                    className="w-full h-96"
                    title="PDF Preview"
                    onError={() => setPreviewError(true)}
                  />
                </div>
              )}
              
              {isImage && (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={`/api/files/${fileId}`}
                    alt="Document preview"
                    className="w-full h-auto max-h-96 object-contain"
                    onError={() => setPreviewError(true)}
                  />
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenInNewTab}
                className="w-full"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Open in New Tab
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-3">
                {previewError 
                  ? "Preview not available" 
                  : isWord 
                    ? "Word documents cannot be previewed in browser"
                    : "Preview not supported for this file type"
                }
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenInNewTab}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Open Document
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
