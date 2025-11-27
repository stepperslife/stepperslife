/**
 * File Upload Utilities
 * Handles saving uploaded images to the server
 */

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'events')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

/**
 * Save an uploaded file to the server
 * @returns The public path to the uploaded file (e.g., /uploads/events/filename.jpg)
 */
export async function saveUploadedFile(file: File): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB')
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File must be an image (JPEG, PNG, WebP, or GIF)')
  }

  // Ensure upload directory exists
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }

  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 9)
  const extension = file.name.split('.').pop()
  const filename = `event-${timestamp}-${randomString}.${extension}`

  // Convert file to buffer and save
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filepath = join(UPLOAD_DIR, filename)
  await writeFile(filepath, buffer)

  // Return public path (relative to /public)
  return `/uploads/events/${filename}`
}

/**
 * Validate that a file is an acceptable image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File must be an image (JPEG, PNG, WebP, or GIF)' }
  }

  return { valid: true }
}
