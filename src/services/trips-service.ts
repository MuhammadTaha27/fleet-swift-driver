const API_BASE = import.meta.env.VITE_API_BASE_URL

export interface Product {
  id: number
  productName: string
}

export interface Customer {
  id: number
  customerName: string
}

export interface Location {
  id: number
  locationName: string
}

export interface Truck {
  id: number
  numberPlate: string
}

export interface Driver {
  id: number
  assignedUserId: number
  // Add other driver fields as needed
}

export interface CustomerLocation {
  latitude: string
  longitude: string
  mapLink: string
}

export interface DriverResponse {
  message?: string
  driver?: Driver
}

export interface Trip {
  id: number
  orderSerialNo: string
  startingDatetime: string
  product: Product
  customer: Customer
  deliveryLocation: Location
  rate: string
  assignedTruck: Truck
  assignedDriverId: number
  tripStatus: string
  customerLocation?: CustomerLocation
}

export interface TripsByDriverResponse {
  driverId: number
  items: Trip[]
  totalCount: number
  totalPages: number
  pageNo: number
  rowsPerPage: number
}

export interface TripStatusUpdateResponse {
  message: string
  trip: Trip
}

export interface AttachmentUploadResponse {
  message: string
  attachment: {
    id: number
    parentType: string
    parentId: number
    attachmentType: string
    url: string
    createdAt: string
  }
}

export async function getDriverByUser(userId: number): Promise<DriverResponse> {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Authentication required")
    }

    const res = await fetch(`${API_BASE}/drivers/by-user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      const errorMessage = errorData?.message || "Failed to fetch driver"
      throw new Error(errorMessage)
    }

    return await res.json()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    throw error
  }
}

export async function listTripsByDriver(
  driverId: number,
  pageNo: number,
  rowsPerPage: number,
): Promise<TripsByDriverResponse> {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Authentication required")
    }

    const res = await fetch(`${API_BASE}/trips/by-driver`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ driverId, pageNo, rowsPerPage }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      const errorMessage = errorData?.message || "Failed to fetch trips"
      throw new Error(errorMessage)
    }

    return await res.json()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    throw error
  }
}

/**
 * Mark trip as loaded
 */
export async function markTripAsLoaded(tripId: number): Promise<TripStatusUpdateResponse> {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Authentication required")
    }

    const res = await fetch(`${API_BASE}/trips/loaded`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tripId }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      const errorMessage = errorData?.message || "Failed to mark trip as loaded"
      throw new Error(errorMessage)
    }

    return await res.json()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    throw error
  }
}

/**
 * Mark trip as reached destination
 */
export async function markTripAsReachedDestination(tripId: number): Promise<TripStatusUpdateResponse> {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Authentication required")
    }

    const res = await fetch(`${API_BASE}/trips/reached`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tripId }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      const errorMessage = errorData?.message || "Failed to mark trip as reached destination"
      throw new Error(errorMessage)
    }

    return await res.json()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    throw error
  }
}

/**
 * Complete trip
 */
export async function completeTripStatus(tripId: number): Promise<TripStatusUpdateResponse> {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Authentication required")
    }

    const res = await fetch(`${API_BASE}/trips/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tripId }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      const errorMessage = errorData?.message || "Failed to complete trip"
      throw new Error(errorMessage)
    }

    return await res.json()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    throw error
  }
}

/**
 * Upload loaded image URL to database
 */
export async function uploadLoadedImageUrl(tripId: number, url: string): Promise<AttachmentUploadResponse> {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Authentication required")
    }

    const res = await fetch(`${API_BASE}/attachments/loaded`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tripId, url }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      const errorMessage = errorData?.message || "Failed to upload loaded image URL"
      throw new Error(errorMessage)
    }

    return await res.json()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    throw error
  }
}

/**
 * Upload invoice image URL to database
 */
export async function uploadInvoiceImageUrl(orderId: number, url: string): Promise<AttachmentUploadResponse> {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Authentication required")
    }

    const res = await fetch(`${API_BASE}/attachments/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId, url }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      const errorMessage = errorData?.message || "Failed to upload invoice image URL"
      throw new Error(errorMessage)
    }

    return await res.json()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    throw error
  }
}

/**
 * Upload multiple loaded image URLs to database
 */
export async function uploadMultipleLoadedImageUrls(
  tripId: number,
  urls: string[],
): Promise<AttachmentUploadResponse[]> {
  const results: AttachmentUploadResponse[] = []

  for (const url of urls) {
    try {
      const result = await uploadLoadedImageUrl(tripId, url)
      results.push(result)
    } catch (error) {
      console.error(`Failed to upload loaded image URL: ${url}`, error)
      // Continue with other URLs even if one fails
    }
  }

  return results
}

/**
 * Upload multiple invoice image URLs to database
 */
export async function uploadMultipleInvoiceImageUrls(
  orderId: number,
  urls: string[],
): Promise<AttachmentUploadResponse[]> {
  const results: AttachmentUploadResponse[] = []

  for (const url of urls) {
    try {
      const result = await uploadInvoiceImageUrl(orderId, url)
      results.push(result)
    } catch (error) {
      console.error(`Failed to upload invoice image URL: ${url}`, error)
      // Continue with other URLs even if one fails
    }
  }

  return results
}
