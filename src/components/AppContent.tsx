"use client"

import { useEffect } from "react"
import LoginPage from "./LoginPage"
import Dashboard from "./Dashboard"
import PermissionDenied from "./PermissionDenied"
import { getDriverByUser } from "../services/trips-service"
import { useFCM } from "../hooks/useFCM"
import { removeAuthTokenFromIndexedDB } from "@/utilis/auth-storage"

interface AppContentProps {
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
  userRole: string
  setUserRole: (value: string) => void
  isDriver: boolean
  setIsDriver: (value: boolean) => void
  isLoading: boolean
  setIsLoading: (value: boolean) => void
  driverId: number | null
  setDriverId: (value: number | null) => void
}

const AppContent = ({
  isAuthenticated,
  setIsAuthenticated,
  userRole,
  setUserRole,
  isDriver,
  setIsDriver,
  isLoading,
  setIsLoading,
  driverId,
  setDriverId,
}: AppContentProps) => {
  // Initialize FCM when user is authenticated and is a driver
  const { fcmToken, isInitialized } = useFCM({
    driverId,
    isAuthenticated: isAuthenticated && isDriver,
  })

  const fetchDriverData = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await getDriverByUser(userId)
      if (response.driver) {
        setIsDriver(true)
        setDriverId(response.driver.id)
      } else {
        setIsDriver(false)
        console.log("Driver not found for user")
      }
    } catch (error) {
      console.error("Error fetching driver data:", error)
      setIsDriver(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch driver data on mount if user is authenticated and is a driver role
  useEffect(() => {
    if (isAuthenticated && userRole === "driver" && !driverId) {
      const userData = localStorage.getItem("user")
      if (userData) {
        try {
          const user = JSON.parse(userData)
          fetchDriverData(user.id)
        } catch (error) {
          console.error("Error parsing user data:", error)
          setIsLoading(false)
        }
      }
    }
  }, [isAuthenticated, userRole, driverId])

  const handleLogin = () => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setUserRole(user.userRole)
        setIsAuthenticated(true)

        if (user.userRole === "driver") {
          fetchDriverData(user.id)
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")

    // Also remove from IndexedDB
    try {
      await removeAuthTokenFromIndexedDB()
    } catch (error) {
      console.warn("Failed to remove token from IndexedDB:", error)
    }

    setIsAuthenticated(false)
    setUserRole("")
    setIsDriver(false)
    setDriverId(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : userRole !== "driver" || !isDriver ? (
        <PermissionDenied onLogout={handleLogout} userRole={userRole} />
      ) : (
        <Dashboard onLogout={handleLogout} driverId={driverId} />
      )}
    </div>
  )
}

export default AppContent
