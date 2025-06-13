"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Package, User, Truck, DollarSign, RefreshCw } from "lucide-react"
import { listTripsByDriver, type Trip } from "../services/trips-service"
import { useToast } from "../hooks/use-toast"

interface JobsPageProps {
  onJobSelect: (jobId: string) => void
  driverId: number | null
}

type TripStatus =
  | "assignment_pending"
  | "assigned"
  | "loaded"
  | "reached_destination"
  | "completed"
  | "cancelled"
  | "rejected"

interface StatusFilter {
  value: string
  label: string
  statuses: string[]
}

const statusFilters: StatusFilter[] = [
  {
    value: "all",
    label: "All Trips",
    statuses: [],
  },
  {
    value: "assignment_pending",
    label: "Assignment Pending",
    statuses: ["assignment_pending"],
  },
  {
    value: "assigned",
    label: "Assigned",
    statuses: ["assigned"],
  },
  {
    value: "loaded",
    label: "Loaded",
    statuses: ["loaded"],
  },
  {
    value: "reached_destination",
    label: "Reached Destination",
    statuses: ["reached_destination", "reached-destination"],
  },
  {
    value: "completed",
    label: "Completed",
    statuses: ["completed"],
  },
  {
    value: "cancelled",
    label: "Cancelled",
    statuses: ["cancelled", "rejected"],
  },
]

const JobsPage = ({ onJobSelect, driverId }: JobsPageProps) => {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    if (driverId) {
      fetchTrips()
    }
  }, [driverId])

  const fetchTrips = async () => {
    if (!driverId) return

    setLoading(true)
    setError(null)
    try {
      const response = await listTripsByDriver(driverId, 1, 100) // Get more trips to show all statuses
      setTrips(response.items)
    } catch (error) {
      console.error("Error fetching trips:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch trips"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchTrips()
      toast({
        title: "Success",
        description: "Trips refreshed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh trips",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const getFilteredTrips = () => {
    if (selectedFilter === "all") {
      return trips
    }

    const filter = statusFilters.find((f) => f.value === selectedFilter)
    if (!filter) return trips

    return trips.filter((trip) => {
      const tripStatus = trip.tripStatus.toLowerCase().replace(/[_-]/g, "_")
      return filter.statuses.some((status) => status.toLowerCase().replace(/[_-]/g, "_") === tripStatus)
    })
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/[_-]/g, "_")

    switch (normalizedStatus) {
      case "assignment_pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "assigned":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "loaded":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "reached_destination":
        return "text-purple-600 bg-purple-50 border-purple-200"
      case "completed":
        return "text-green-600 bg-green-50 border-green-200"
      case "cancelled":
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/[_-]/g, "_")

    switch (normalizedStatus) {
      case "assignment_pending":
        return "Assignment Pending"
      case "assigned":
        return "Assigned"
      case "loaded":
        return "Loaded"
      case "reached_destination":
        return "Reached Destination"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      case "rejected":
        return "Rejected"
      default:
        return status.replace(/[_-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const getStatusCount = (filterValue: string) => {
    if (filterValue === "all") return trips.length

    const filter = statusFilters.find((f) => f.value === filterValue)
    if (!filter) return 0

    return trips.filter((trip) => {
      const tripStatus = trip.tripStatus.toLowerCase().replace(/[_-]/g, "_")
      return filter.statuses.some((status) => status.toLowerCase().replace(/[_-]/g, "_") === tripStatus)
    }).length
  }

  const TripCard = ({ trip }: { trip: Trip }) => (
    <Card
      className="mb-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
      onClick={() => onJobSelect(trip.id.toString())}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-lg">#{trip.orderSerialNo}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.tripStatus)}`}>
            {getStatusLabel(trip.tripStatus)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <User className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-sm">{trip.customer.customerName}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Package className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-sm">{trip.product.productName}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-red-500" />
            <span className="text-sm">{trip.deliveryLocation.locationName}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Truck className="w-4 h-4 mr-2 text-orange-500" />
            <span className="text-sm">{trip.assignedTruck.numberPlate}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-purple-500" />
            <span className="text-sm">{formatDate(trip.startingDatetime)}</span>
          </div>

          {trip.rate && (
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-sm">{trip.rate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading trips...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 mb-4">
          <Package className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Failed to load trips</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchTrips}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!driverId) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2" />
          <p>Driver information not available</p>
        </div>
      </div>
    )
  }

  const filteredTrips = getFilteredTrips()

  return (
    <div className="p-4 pb-24">
      {/* Header with Filter and Refresh */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Trips</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="text-xs">
            <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label} ({getStatusCount(filter.value)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          Showing {filteredTrips.length} of {trips.length} trips
          {selectedFilter !== "all" && (
            <span className="ml-2 text-blue-600 font-medium">
              • {statusFilters.find((f) => f.value === selectedFilter)?.label}
            </span>
          )}
        </div>
      </div>

      {/* Trip Cards */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}

        {filteredTrips.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No trips found</p>
            <p className="text-sm">
              {selectedFilter === "all"
                ? "You don't have any trips yet"
                : `No trips with status "${statusFilters.find((f) => f.value === selectedFilter)?.label}"`}
            </p>
            {selectedFilter !== "all" && (
              <Button variant="outline" size="sm" onClick={() => setSelectedFilter("all")} className="mt-3">
                Show All Trips
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobsPage
