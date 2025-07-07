'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { X, Upload, File, CheckCircle } from 'lucide-react'
import { validateFile, formatFileSize } from '@/lib/file-upload/validation'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  paperType: 'research' | 'project' | 'thesis'
  onUploadSuccess: (fileId: string, filename: string) => void
  onUploadError: (error: string) => void
  disabled?: boolean
  className?: string
}

interface UploadedFile {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  fileId?: string
  error?: string
}

export function FileUpload({
  paperType,
  onUploadSuccess,
  onUploadError,
  disabled = false,
  className
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    setIsUploading(true)

    // Process each file
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      const fileIndex = uploadedFiles.length + i

      // Validate file
      const validation = validateFile(file, paperType)
      if (!validation.isValid) {
        setUploadedFiles(prev => 
          prev.map((item, index) => 
            index === fileIndex 
              ? { ...item, status: 'error', error: validation.error }
              : item
          )
        )
        onUploadError(validation.error || 'File validation failed')
        continue
      }

      try {
        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        formData.append('paperType', paperType)

        // Upload file with progress tracking
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total)
            setUploadedFiles(prev => 
              prev.map((item, index) => 
                index === fileIndex 
                  ? { ...item, progress }
                  : item
              )
            )
          }
        })

        const uploadPromise = new Promise<any>((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          })

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'))
          })

          xhr.open('POST', '/api/upload')
          xhr.send(formData)
        })

        const response = await uploadPromise

        if (response.success) {
          setUploadedFiles(prev => 
            prev.map((item, index) => 
              index === fileIndex 
                ? { ...item, status: 'success', fileId: response.data.fileId, progress: 100 }
                : item
            )
          )
          onUploadSuccess(response.data.fileId, response.data.filename)
        } else {
          throw new Error(response.error || 'Upload failed')
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        setUploadedFiles(prev => 
          prev.map((item, index) => 
            index === fileIndex 
              ? { ...item, status: 'error', error: errorMessage }
              : item
          )
        )
        onUploadError(errorMessage)
      }
    }

    setIsUploading(false)
  }, [paperType, onUploadSuccess, onUploadError, disabled, uploadedFiles.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || isUploading,
    multiple: false, // For now, allow only one file at a time
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      ...(paperType === 'project' ? {
        'application/vnd.ms-powerpoint': ['.ppt'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        'application/zip': ['.zip'],
        'text/plain': ['.txt']
      } : {})
    }
  })

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400',
              (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  Drag & drop your {paperType} file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: PDF, DOC, DOCX
                  {paperType === 'project' && ', PPT, PPTX, ZIP, TXT'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          {uploadedFiles.map((uploadedFile, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <File className="h-8 w-8 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {uploadedFile.status === 'uploading' && (
                      <div className="w-24">
                        <Progress value={uploadedFile.progress} className="h-2" />
                      </div>
                    )}
                    
                    {uploadedFile.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    
                    {uploadedFile.status === 'error' && (
                      <X className="h-5 w-5 text-red-500" />
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploadedFile.status === 'uploading'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {uploadedFile.status === 'error' && uploadedFile.error && (
                  <Alert className="mt-3">
                    <AlertDescription className="text-red-600">
                      {uploadedFile.error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
