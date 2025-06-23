"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "../contexts/LanguageContext"
import ImageUploadModal from "./ImageUploadModal"
import {
  listTripsByDriver,
  markTripAsLoaded,
  markTripAsReachedDestination,
  completeTripStatus,
  uploadMultipleLoadedImageUrls,
  uploadMultipleInvoiceImageUrls,
  type Trip,
} from "../services/trips-service"
import type { UploadResult } from "../services/upload-service"
import { MapPin, Calendar, Package, User, Truck, Hash, DollarSign, ExternalLink, Navigation } from "lucide-react"
import { useToast } from "../hooks/use-toast"

interface JobDetailsPageProps {
  jobId: string
  driverId?: number | null
}

const JobDetailsPage = ({ jobId, driverId }: JobDetailsPageProps) => {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [jobStatus, setJobStatus] = useState("assigned")
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [uploadType, setUploadType] = useState<"loading" | "invoice">("loading")
  const [showWaitingMessage, setShowWaitingMessage] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([])
  const [processingStatus, setProcessingStatus] = useState(false)
  const { t } = useLanguage()
  const { toast } = useToast()

  useEffect(() => {
    if (driverId && jobId) {
      fetchTripDetails()
    }
  }, [driverId, jobId])

  const fetchTripDetails = async () => {
    if (!driverId) return

    try {
      setLoading(true)
      // Fetch trips and find the specific trip by ID
      const response = await listTripsByDriver(driverId, 1, 100)
      const foundTrip = response.items.find((trip) => trip.id.toString() === jobId)

      if (foundTrip) {
        setTrip(foundTrip)
        // Set initial status based on trip status
        setJobStatus(foundTrip.tripStatus.toLowerCase())
      } else {
        console.error("Trip not found")
      }
    } catch (error) {
      console.error("Error fetching trip details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadButton = () => {
    setUploadType("loading")
    setShowImageUpload(true)
  }

  const handleReachedDestination = async () => {
    if (!trip) return

    setProcessingStatus(true)
    try {
      await markTripAsReachedDestination(trip.id)
      setJobStatus("reached-destination")
      toast({
        title: "Success",
        description: "Trip marked as reached destination",
      })
    } catch (error) {
      console.error("Error updating trip status:", error)
      toast({
        title: "Error",
        description: "Failed to update trip status",
        variant: "destructive",
      })
    } finally {
      setProcessingStatus(false)
    }
  }

  const handleUnloadButton = () => {
    setUploadType("invoice")
    setShowImageUpload(true)
  }

  const handleImageUploadComplete = async (results: UploadResult[]) => {
    if (!trip) return

    setShowImageUpload(false)
    setUploadedFiles([...uploadedFiles, ...results])

    const successfulUploads = results.filter((result) => result.success)

    if (successfulUploads.length > 0) {
      try {
        if (uploadType === "loading") {
          // 1. Mark trip as loaded
          setProcessingStatus(true)
          await markTripAsLoaded(trip.id)

          // 2. Upload image URLs to database
          const imageUrls = successfulUploads.map((result) => result.url!).filter(Boolean)
          if (imageUrls.length > 0) {
            await uploadMultipleLoadedImageUrls(trip.id, imageUrls)
          }

          setJobStatus("loaded")
          toast({
            title: "Loading Complete",
            description: `Trip marked as loaded and ${successfulUploads.length} image(s) saved`,
          })
        } else if (uploadType === "invoice") {
          // 1. Complete the trip
          setProcessingStatus(true)
          await completeTripStatus(trip.id)

          // 2. Upload invoice image URLs to database
          // Note: Using trip.id as orderId - you might need to adjust this based on your data structure
          const imageUrls = successfulUploads.map((result) => result.url!).filter(Boolean)
          if (imageUrls.length > 0) {
            await uploadMultipleInvoiceImageUrls(trip.id, imageUrls)
          }

          setShowWaitingMessage(true)
          toast({
            title: "Delivery Complete",
            description: `Trip completed and ${successfulUploads.length} invoice image(s) saved`,
          })
        }
      } catch (error) {
        console.error("Error processing upload completion:", error)
        toast({
          title: "Error",
          description: "Images uploaded but failed to update trip status",
          variant: "destructive",
        })
      } finally {
        setProcessingStatus(false)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "assigned":
        return "text-orange-600 bg-orange-100"
      case "loaded":
        return "text-blue-600 bg-blue-100"
      case "reached-destination":
        return "text-purple-600 bg-purple-100"
      case "completed":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const handleMapLinkClick = (mapLink: string) => {
    window.open(mapLink, "_blank", "noopener,noreferrer")
  }

  const renderActionButton = () => {
    if (showWaitingMessage) {
      return (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-yellow-600 font-medium">{t("waitingCustomer")}</div>
            <div className="mt-2 text-sm text-yellow-500">{t("deliveryComplete")}</div>
          </CardContent>
        </Card>
      )
    }

    switch (jobStatus) {
      case "assigned":
        return (
          <Button
            onClick={handleLoadButton}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            disabled={processingStatus}
          >
            {processingStatus ? "Processing..." : t("loadButton")}
          </Button>
        )
      case "loaded":
        return (
          <Button
            onClick={handleReachedDestination}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
            disabled={processingStatus}
          >
            {processingStatus ? "Processing..." : t("reachedDestination")}
          </Button>
        )
      case "reached-destination":
        return (
          <Button
            onClick={handleUnloadButton}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            disabled={processingStatus}
          >
            {processingStatus ? "Processing..." : t("unload")}
          </Button>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading trip details...</p>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600">
          <Package className="w-12 h-12 mx-auto mb-2" />
          <p>Trip not found</p>
        </div>
      </div>
    )
  }

  if (showWaitingMessage) {
    return (
      <div className="p-4 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center text-green-600">{t("deliveryComplete")}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-800">{t("waitingCustomer")}</p>
            <p className="text-gray-600">Invoice uploaded successfully. Customer will review and confirm delivery.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Trip Info Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Trip #{trip.orderSerialNo}</CardTitle>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(jobStatus)}`}>
              {jobStatus === "assigned" && t("assigned")}
              {jobStatus === "loaded" && t("loaded")}
              {jobStatus === "reached-destination" && t("reachedDestination")}
              {jobStatus === "completed" && "Completed"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center">
              <Hash className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium text-gray-700">Trip ID:</span>
              <span className="ml-2 text-gray-600">{trip.id}</span>
            </div>

            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium text-gray-700">{t("customer")}:</span>
              <span className="ml-2 text-gray-600">{trip.customer.customerName}</span>
            </div>

            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium text-gray-700">{t("product")}:</span>
              <span className="ml-2 text-gray-600">{trip.product.productName}</span>
            </div>

            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium text-gray-700">{t("deliveryLocation")}:</span>
              <span className="ml-2 text-gray-600">{trip.deliveryLocation.locationName}</span>
            </div>

            {/* Customer Location with Map Link */}
            {trip.customerLocation && (
              <div className="flex items-center">
                <Navigation className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium text-gray-700">Customer Location:</span>
                <button
                  onClick={() => handleMapLinkClick(trip.customerLocation!.mapLink)}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline flex items-center transition-colors"
                >
                  <span className="text-sm">View on Map</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>
            )}

            <div className="flex items-center">
              <Truck className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium text-gray-700">Truck:</span>
              <span className="ml-2 text-gray-600">{trip.assignedTruck.numberPlate}</span>
            </div>

            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium text-gray-700">Scheduled:</span>
              <span className="ml-2 text-gray-600">{formatDate(trip.startingDatetime)}</span>
            </div>

            {trip.rate && (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium text-gray-700">Rate:</span>
                <span className="ml-2 text-gray-600">{trip.rate}</span>
              </div>
            )}

            {/* Customer Location Coordinates (optional, for reference) 
            {trip.customerLocation && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Coordinates:</div>
                <div className="text-sm text-gray-600">
                  Lat: {trip.customerLocation.latitude}, Lng: {trip.customerLocation.longitude}
                </div>
              </div>
            )}*/}
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="space-y-4">{renderActionButton()}</div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onUploadComplete={handleImageUploadComplete}
        uploadType={uploadType}
        tripId={trip.id.toString()}
        driverId={driverId || undefined}
      />
    </div>
  )
}

export default JobDetailsPage
