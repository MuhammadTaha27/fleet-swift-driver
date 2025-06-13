"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"
import type { BackendNotification } from "../services/notification-service"

export interface NotificationData {
  id: string
  title: string
  body: string
  data?: {
    startingDatetime?: string
    truckPlate?: string
    tripStatus?: string
    tripId?: string
    productName?: string
    customerName?: string
    orderSerialNo?: string
    locationName?: string
  }
  timestamp: number
  isRead: boolean
}

interface NotificationContextType {
  notifications: NotificationData[]
  backendNotifications: BackendNotification[]
  addNotification: (notification: Omit<NotificationData, "id" | "timestamp" | "isRead">) => void
  setBackendNotifications: (notifications: BackendNotification[]) => void
  markAsRead: (id: string) => void
  clearNotifications: () => void
  refreshNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [backendNotifications, setBackendNotifications] = useState<BackendNotification[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const addNotification = (notification: Omit<NotificationData, "id" | "timestamp" | "isRead">) => {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      isRead: false,
    }

    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const refreshNotifications = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        backendNotifications,
        addNotification,
        setBackendNotifications,
        markAsRead,
        clearNotifications,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
