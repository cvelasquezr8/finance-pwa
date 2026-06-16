import axios from 'axios'
import { BaseApiService } from './BaseApiService'
import { API_ROUTES } from './api-routes'

export type AllowedMimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf'

export const ALLOWED_MIME_TYPES: AllowedMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

interface PresignResponse {
  presignedUrl: string
  fileKey: string
  publicUrl: string
}

class FileService extends BaseApiService {
  /**
   * Requests a presigned PUT URL from the backend, then uploads the file
   * directly to Cloudflare R2. Returns the public URL of the uploaded file.
   */
  async uploadReceipt(file: File): Promise<string> {
    if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
      throw new Error(`Unsupported file type: ${file.type}`)
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error('File exceeds 10 MB limit')
    }

    const { presignedUrl, publicUrl } = await this.post<
      PresignResponse,
      { mimeType: string; sizeBytes: number }
    >(API_ROUTES.files.presign, { mimeType: file.type, sizeBytes: file.size })

    // Upload directly to R2 — bypasses our NestJS server entirely.
    // Uses a plain axios instance (not the intercepted one) so no Auth header is attached.
    await axios.put(presignedUrl, file, { headers: { 'Content-Type': file.type } })

    return publicUrl
  }
}

export const fileService = new FileService()
