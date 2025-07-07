import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { gridfsService } from '@/lib/file-upload/gridfs'
import { validateFile } from '@/lib/file-upload/validation'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const paperType = formData.get('paperType') as 'research' | 'project' | 'thesis';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!paperType || !['research', 'project', 'thesis'].includes(paperType)) {
      return NextResponse.json(
        { error: 'Invalid paper type' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file, paperType);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to GridFS
    const uploadResult = await gridfsService.uploadFile(
      buffer,
      file.name,
      {
        originalName: file.name,
        uploadedBy: session.user.id,
        uploadDate: new Date(),
        paperType,
        contentType: file.type
      }
    );

    return NextResponse.json({
      success: true,
      data: uploadResult
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
