"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useLanguage } from "../contexts/LanguageContext"
import { useNotifications } from "../contexts/NotificationContext"
import { User, Package, MapPin, Clock, X, Check, Truck, Calendar, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import {
  fetchNotificationsFromBackend,
  acceptTrip,
  rejectTrip,
  type BackendNotification,
} from "../services/notification-service"
import { useToast } from "../hooks/use-toast"

interface NotificationsPageProps {
  driverId?: number | null
}

const NotificationsPage = ({ driverId }: NotificationsPageProps) => {
  const { t } = useLanguage()
  const { backendNotifications, setBackendNotifications } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [processingNotifications, setProcessingNotifications] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  // Fetch notifications from backend on component mount
  useEffect(() => {
    if (driverId) {
      fetchNotifications()
    }
  }, [driverId])

  const fetchNotifications = async () => {
    if (!driverId) return

    setLoading(true)
    try {
      const response = await fetchNotificationsFromBackend(driverId, 1, 50)
      setBackendNotifications(response.items)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchNotifications()
      toast({
        title: "Success",
        description: "Notifications refreshed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh notifications",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleAccept = async (notification: BackendNotification) => {
    const tripId = notification.payload?.tripId
    if (!tripId) {
      toast({
        title: "Error",
        description: "Trip ID not found in notification",
        variant: "destructive",
      })
      return
    }

    setProcessingNotifications((prev) => new Set(prev).add(notification.id))

    try {
      const result = await acceptTrip(Number.parseInt(tripId))

      if (result.success) {
        // Update local state to mark notification as read
        setBackendNotifications((prev: BackendNotification[]) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        )

        toast({
          title: "Success",
          description: result.message || "Trip accepted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to accept trip",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept trip",
        variant: "destructive",
      })
    } finally {
      setProcessingNotifications((prev) => {
        const newSet = new Set(prev)
        newSet.delete(notification.id)
        return newSet
      })
    }
  }

  const handleReject = async (notification: BackendNotification) => {
    const tripId = notification.payload?.tripId
    if (!tripId) {
      toast({
        title: "Error",
        description: "Trip ID not found in notification",
        variant: "destructive",
      })
      return
    }

    setProcessingNotifications((prev) => new Set(prev).add(notification.id))

    try {
      const result = await rejectTrip(Number.parseInt(tripId))

      if (result.success) {
        // Update local state to mark notification as read
        setBackendNotifications((prev: BackendNotification[]) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        )

        toast({
          title: "Success",
          description: result.message || "Trip rejected successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to reject trip",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject trip",
        variant: "destructive",
      })
    } finally {
      setProcessingNotifications((prev) => {
        const newSet = new Set(prev)
        newSet.delete(notification.id)
        return newSet
      })
    }
  }

  if (!driverId) {
    return (
      <div className="p-4 pb-24 space-y-4 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Driver information not available</h3>
            <p className="text-gray-500 text-sm">Please ensure you are logged in as a driver</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 pb-24 space-y-4 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (backendNotifications.length === 0) {
    return (
      <div className="p-4 pb-24 space-y-4 bg-gray-50 min-h-screen">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600 text-sm">Delivery notifications</p>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="text-xs">
            <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500 text-sm">You'll see new delivery requests here when they arrive</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 space-y-4 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600 text-sm">Delivery notifications ({backendNotifications.length})</p>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="text-xs">
          <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {backendNotifications.map((notification) => {
          const isProcessing = processingNotifications.has(notification.id)

          return (
            <Card
              key={notification.id}
              className={`${!notification.isRead ? "border-blue-200 bg-blue-50" : "bg-white"}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{notification.body}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(notification.createdAt), "MMM dd, HH:mm")}
                    </div>
                  </div>
                  {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </div>
              </CardHeader>

              {notification.payload && (
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    {notification.payload.tripId && (
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Trip ID:</span>
                        <span className="ml-1 font-medium">{notification.payload.tripId}</span>
                      </div>
                    )}

                    {notification.payload.productName && (
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Product:</span>
                        <span className="ml-1 font-medium">{notification.payload.productName}</span>
                      </div>
                    )}

                    {notification.payload.locationName && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Location:</span>
                        <span className="ml-1 font-medium">{notification.payload.locationName}</span>
                      </div>
                    )}

                    {notification.payload.truck && (
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Truck:</span>
                        <span className="ml-1 font-medium">{notification.payload.truck}</span>
                      </div>
                    )}

                    {notification.payload.customerName && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Customer:</span>
                        <span className="ml-1 font-medium">{notification.payload.customerName}</span>
                      </div>
                    )}

                    {notification.payload.startingDatetime && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Date:</span>
                        <span className="ml-1 font-medium">
                          {format(new Date(notification.payload.startingDatetime), "MMM dd, yyyy HH:mm")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Show Accept/Reject buttons only if notification is not read */}
                  {!notification.isRead && (
                    <div className="flex space-x-2 mt-4">
                      <Button
                        onClick={() => handleAccept(notification)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                        disabled={isProcessing}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {isProcessing ? "Processing..." : "Accept"}
                      </Button>
                      <Button
                        onClick={() => handleReject(notification)}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        size="sm"
                        disabled={isProcessing}
                      >
                        <X className="w-4 h-4 mr-1" />
                        {isProcessing ? "Processing..." : "Reject"}
                      </Button>
                    </div>
                  )}

                  {/* Show status if notification is read */}
                  {notification.isRead && (
                    <div className="mt-4 p-2 bg-gray-100 rounded-md">
                      <p className="text-sm text-gray-600 text-center">✓ Notification processed</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default NotificationsPage
