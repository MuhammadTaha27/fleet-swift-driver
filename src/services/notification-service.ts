const API_BASE = import.meta.env.VITE_API_BASE_URL

export interface NotificationPayload {
  entityId: number // Add entityId (driver ID)
  fcmFrom: string
  notification: {
    title: string
    body: string
  }
  data: Record<string, any>
}

export interface BackendNotification {
  id: number
  entityId: number // Add entityId field
  fcmFrom: string
  title: string
  body: string
  payload: Record<string, any>
  isRead: boolean
  createdAt: string
}

export interface NotificationListResponse {
  items: BackendNotification[]
  totalCount: number
  totalPages: number
  pageNo: number
  rowsPerPage: number
}

// Save notification to backend when received via FCM
export async function saveNotificationToBackend(payload: NotificationPayload): Promise<boolean> {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      console.error("No auth token available")
      return false
    }

    const response = await fetch(`${API_BASE}/notifications/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      console.log("Notification saved to backend successfully")
      return true
    } else {
      console.error("Failed to save notification to backend")
      return false
    }
  } catch (error) {
    console.error("Error saving notification to backend:", error)
    return false
  }
}

// Fetch notifications from backend for a specific driver
export async function fetchNotificationsFromBackend(
  entityId: number,
  pageNo = 1,
  rowsPerPage = 20,
): Promise<NotificationListResponse> {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${API_BASE}/notifications/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ entityId, pageNo, rowsPerPage }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.message || "Failed to fetch notifications"
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    throw new Error(errorMessage)
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      console.error("No auth token available")
      return false
    }

    // Note: You'll need to add this endpoint to your backend
    const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      console.log("Notification marked as read successfully")
      return true
    } else {
      console.error("Failed to mark notification as read")
      return false
    }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}

// Accept trip
export async function acceptTrip(tripId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${API_BASE}/trips/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tripId }),
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, message: data.message }
    } else {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.message || "Failed to accept trip"
      return { success: false, message: errorMessage }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return { success: false, message: errorMessage }
  }
}

// Reject trip
export async function rejectTrip(tripId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${API_BASE}/trips/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tripId }),
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, message: data.message }
    } else {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.message || "Failed to reject trip"
      return { success: false, message: errorMessage }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return { success: false, message: errorMessage }
  }
}
