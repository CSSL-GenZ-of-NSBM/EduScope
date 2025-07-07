import { MongoClient, GridFSBucket, ObjectId } from 'mongodb'
import { connectDB } from '@/lib/db/mongodb'

export interface FileUploadResult {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface FileMetadata {
  originalName: string;
  uploadedBy: string;
  uploadDate: Date;
  paperType: 'research' | 'project' | 'thesis';
  contentType: string;
}

class GridFSService {
  private bucket: GridFSBucket | null = null;
  private client: MongoClient | null = null;

  async initialize() {
    if (!this.bucket) {
      this.client = await connectDB();
      if (!this.client) {
        throw new Error('Failed to connect to database');
      }
      const db = this.client.db(process.env.MONGODB_DB_NAME || 'eduscope');
      this.bucket = new GridFSBucket(db, { bucketName: 'academic_files' });
    }
    return this.bucket;
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    metadata: FileMetadata
  ): Promise<FileUploadResult> {
    const bucket = await this.initialize();
    
    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          ...metadata,
          uploadDate: new Date()
        }
      });

      uploadStream.on('error', reject);
      uploadStream.on('finish', () => {
        resolve({
          fileId: uploadStream.id.toString(),
          filename: uploadStream.filename,
          contentType: metadata.contentType,
          size: buffer.length
        });
      });

      uploadStream.end(buffer);
    });
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    const bucket = await this.initialize();
    
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on('error', reject);
      downloadStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }

  async getFileInfo(fileId: string) {
    const bucket = await this.initialize();
    
    try {
      const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
      return files[0] || null;
    } catch (error) {
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const bucket = await this.initialize();
    
    try {
      await bucket.delete(new ObjectId(fileId));
      return true;
    } catch (error) {
      return false;
    }
  }

  async listFiles(filter: any = {}) {
    const bucket = await this.initialize();
    return bucket.find(filter).toArray();
  }
}

export const gridfsService = new GridFSService();
