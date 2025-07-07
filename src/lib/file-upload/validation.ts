import { z } from 'zod'

// Allowed file types for academic content
export const ALLOWED_FILE_TYPES = {
  research: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  project: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain'
  ],
  thesis: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  research: 50 * 1024 * 1024, // 50MB
  project: 100 * 1024 * 1024, // 100MB
  thesis: 100 * 1024 * 1024, // 100MB
} as const;

export const FileUploadSchema = z.object({
  file: z.any().refine((file) => file instanceof File, 'File is required'),
  paperType: z.enum(['research', 'project', 'thesis']),
});

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
}

export function validateFile(
  file: File,
  paperType: 'research' | 'project' | 'thesis'
): FileValidationResult {
  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided'
    };
  }

  // Check file size
  const maxSize = FILE_SIZE_LIMITS[paperType];
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  // Check file type
  const allowedTypes = ALLOWED_FILE_TYPES[paperType];
  if (!allowedTypes.includes(file.type as any)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed for ${paperType} uploads`
    };
  }

  // Check file name
  if (file.name.length > 255) {
    return {
      isValid: false,
      error: 'File name is too long (max 255 characters)'
    };
  }

  // Basic security check for file extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const dangerousExtensions = ['exe', 'bat', 'cmd', 'scr', 'com', 'pif', 'vbs', 'js', 'jar'];
  
  if (fileExtension && dangerousExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'File type not allowed for security reasons'
    };
  }

  return {
    isValid: true,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }
  };
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function getContentTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'zip': 'application/zip'
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
