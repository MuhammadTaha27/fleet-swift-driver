"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "../contexts/LanguageContext"
import { uploadLoadingImages, uploadInvoiceImages, type UploadResult } from "../services/upload-service"
import { useToast } from "../hooks/use-toast"
import { CheckCircle, XCircle, Upload, FileImage } from "lucide-react"

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: (uploadedFiles: UploadResult[]) => void
  uploadType: "loading" | "invoice"
  tripId?: string
  driverId?: number
}

const ImageUploadModal = ({
  isOpen,
  onClose,
  onUploadComplete,
  uploadType,
  tripId,
  driverId,
}: ImageUploadModalProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const { t } = useLanguage()
  const { toast } = useToast()

  if (!isOpen) return null

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    // Validate file types
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/")
      if (!isImage) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        })
      }
      return isImage
    })

    // Validate file sizes (max 10MB per file)
    const validSizedFiles = validFiles.filter((file) => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    // Add to existing selection instead of replacing
    setSelectedImages((prev) => [...prev, ...validSizedFiles])
    setUploadResults([])

    // Clear the input value so the same files can be selected again if needed
    event.target.value = ""
  }

  const handleUpload = async () => {
    if (selectedImages.length === 0) return

    if (!tripId || !driverId) {
      toast({
        title: "Error",
        description: "Trip ID and Driver ID are required for upload",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let results: UploadResult[]

      if (uploadType === "loading") {
        results = await uploadLoadingImages(selectedImages, tripId, driverId)
      } else {
        results = await uploadInvoiceImages(selectedImages, tripId, driverId)
      }

      setUploadResults(results)

      // Check if all uploads were successful
      const successfulUploads = results.filter((result) => result.success)
      const failedUploads = results.filter((result) => !result.success)

      if (successfulUploads.length > 0) {
        toast({
          title: "Upload successful",
          description: `${successfulUploads.length} image(s) uploaded successfully`,
        })
      }

      if (failedUploads.length > 0) {
        toast({
          title: "Some uploads failed",
          description: `${failedUploads.length} image(s) failed to upload`,
          variant: "destructive",
        })
      }

      // Simulate progress for better UX
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            onUploadComplete(results)
            handleClose()
          }, 500)
        }
      }, 100)
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading images",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedImages([])
    setUploadProgress(0)
    setUploadResults([])
    onClose()
  }

  const title = uploadType === "loading" ? t("uploadImages") : t("invoiceUpload")

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center flex items-center justify-center">
            <Upload className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!uploading && uploadResults.length === 0 && (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />

                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-gray-600 mb-2">
                    {uploadType === "loading" ? "Select Loading Images" : "Select Invoice Images"}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    {selectedImages.length > 0 ? "Add more images" : "You can select multiple images at once"}
                  </div>
                  <Button type="button" variant="outline" className="pointer-events-none">
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedImages.length > 0 ? "Add More Images" : "Choose Multiple Images"}
                  </Button>
                </label>

                <p className="text-xs text-gray-500 mt-3">
                  Supported formats: JPG, PNG, GIF (Max 10MB each)
                  <br />
                  <strong>Select multiple files at once in the file dialog</strong>
                </p>
              </div>

              {selectedImages.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Selected Images ({selectedImages.length})</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedImages([])}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <div className="flex items-center flex-1 min-w-0">
                          <FileImage className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newFiles = selectedImages.filter((_, i) => i !== index)
                              setSelectedImages(newFiles)
                            }}
                            className="text-red-500 hover:text-red-700 p-1 h-6 w-6"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-center text-gray-500">
                    Total size: {(selectedImages.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(1)}MB
                  </div>
                </div>
              )}
            </>
          )}

          {uploading && (
            <div className="space-y-4">
              <div className="text-center">
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-pulse" />
                <p className="text-sm font-medium">Uploading images...</p>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-center text-gray-500">{uploadProgress}% complete</p>
            </div>
          )}

          {uploadResults.length > 0 && !uploading && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Upload Results:</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {uploadResults.map((result, index) => (
                  <div key={index} className="text-sm p-2 rounded flex items-center">
                    {result.success ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-green-700">Upload successful</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2 text-red-600" />
                        <span className="text-red-700">Upload failed: {result.error}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button onClick={handleClose} variant="outline" className="flex-1" disabled={uploading}>
              {uploading ? "Uploading..." : "Cancel"}
            </Button>

            {uploadResults.length === 0 && (
              <Button
                onClick={handleUpload}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={selectedImages.length === 0 || uploading}
              >
                {uploading
                  ? "Uploading..."
                  : `Upload ${selectedImages.length} Image${selectedImages.length !== 1 ? "s" : ""}`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ImageUploadModal
