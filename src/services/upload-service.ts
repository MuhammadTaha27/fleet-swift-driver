import { supabase, BUCKET_NAME } from "../lib/supabase"

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * Upload a single file to Supabase storage
 */
export async function uploadFile(
  file: File,
  folder = "uploads",
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    }
  } catch (error) {
    console.error("Upload service error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    }
  }
}

/**
 * Upload multiple files to Supabase storage
 */
export async function uploadMultipleFiles(
  files: File[],
  folder = "uploads",
  onProgress?: (fileIndex: number, progress: UploadProgress) => void,
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const result = await uploadFile(file, folder, onProgress ? (progress) => onProgress(i, progress) : undefined)
    results.push(result)
  }

  return results
}

/**
 * Upload loading images for a specific trip
 */
export async function uploadLoadingImages(files: File[], tripId: string, driverId: number): Promise<UploadResult[]> {
  const folder = `trips/${tripId}/loading/${driverId}`
  return uploadMultipleFiles(files, folder)
}

/**
 * Upload invoice images for a specific trip
 */
export async function uploadInvoiceImages(files: File[], tripId: string, driverId: number): Promise<UploadResult[]> {
  const folder = `trips/${tripId}/invoice/${driverId}`
  return uploadMultipleFiles(files, folder)
}

/**
 * Delete a file from Supabase storage
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

    if (error) {
      console.error("Delete error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Delete service error:", error)
    return false
  }
}

/**
 * Get file URL from Supabase storage
 */
export function getFileUrl(filePath: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Check if file exists in storage
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(filePath.split("/").slice(0, -1).join("/"))

    if (error) return false

    const fileName = filePath.split("/").pop()
    return data.some((file) => file.name === fileName)
  } catch {
    return false
  }
}
