import { getUserIdFromToken } from "@/utilis/jwt-utilis"

const API_BASE = import.meta.env.VITE_API_BASE_URL

export interface Driver {
  id: number
  driverCode: string
  driverName: string
  isThirdParty: boolean
  driverReferenceCode: string
  assignedUserId: number
  category: string
  isActive: boolean
  status: string
  fcmToken?: string
}

export interface DriverResponse {
  message?: string
  driver?: Driver
}

/**
 * Get driver by user ID
 */
export async function getDriverByUserId(userId: number): Promise<DriverResponse> {
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
    throw new Error(errorMessage)
  }
}

/**
 * Get driver ID for the currently logged-in user
 */
export async function getCurrentUserDriverId(): Promise<number | null> {
  try {
    const userId = getUserIdFromToken()
    if (!userId) {
      console.error("No user ID found in token")
      return null
    }

    const response = await getDriverByUserId(userId)
    return response.driver?.id || null
  } catch (error) {
    console.error("Error getting current user driver ID:", error)
    return null
  }
}

/**
 * Get driver for the currently logged-in user
 */
export async function getCurrentUserDriver(): Promise<Driver | null> {
  try {
    const userId = getUserIdFromToken()
    if (!userId) {
      console.error("No user ID found in token")
      return null
    }

    const response = await getDriverByUserId(userId)
    return response.driver || null
  } catch (error) {
    console.error("Error getting current user driver:", error)
    return null
  }
}
