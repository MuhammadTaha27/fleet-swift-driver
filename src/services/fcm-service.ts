import { messaging, getToken, onMessage, VAPID_KEY } from "./firebase"
import { saveNotificationToBackend, type NotificationPayload } from "./notification-service"
import { getCurrentUserDriverId } from "./driver-service"

const API_BASE = import.meta.env.VITE_API_BASE_URL

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      console.log("Notification permission granted.")

      // Send Firebase config to service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready
        registration.active?.postMessage({
          type: "FIREBASE_CONFIG",
          config: {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
            measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
          },
        })

        // Send API config to service worker
        registration.active?.postMessage({
          type: "API_CONFIG",
          apiBaseUrl: API_BASE,
        })
      }

      return true
    } else {
      console.log("Notification permission denied.")
      return false
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    return false
  }
}

export const getFCMToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    })
    if (token) {
      console.log("FCM Token:", token)
      return token
    } else {
      console.log("No registration token available.")
      return null
    }
  } catch (error) {
    console.error("An error occurred while retrieving token:", error)
    return null
  }
}

export const sendFCMToken = async (token: string, driverId: number) => {
  try {
    const authToken = localStorage.getItem("authToken")

    const response = await fetch(`${API_BASE}/notifications/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token,
        driverId: driverId,
      }),
    })

    if (response.ok) {
      console.log(`Successfully sent FCM token`)

      // Also send driver ID to service worker for background notifications
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready
        registration.active?.postMessage({
          type: "DRIVER_ID",
          driverId: driverId,
        })
      }

      return true
    } else {
      console.error("Failed to send FCM token")
      return false
    }
  } catch (error) {
    console.error("Error sending FCM token:", error)
    return false
  }
}

export const setupMessageListener = (onMessageReceived: (payload: any) => void, driverId?: number) => {
  onMessage(messaging, async (payload) => {
    console.log("Message received in foreground: ", payload)

    // Save notification to backend with driver ID
    let entityId = driverId

    // If driverId is not provided, try to get it from the current user
    if (!entityId) {
      entityId = await getCurrentUserDriverId()
    }

    if (entityId) {
      const notificationPayload: NotificationPayload = {
        entityId: entityId, // Use driver ID as entity ID
        fcmFrom: payload.from || "firebase",
        notification: {
          title: payload.notification?.title || "New Notification",
          body: payload.notification?.body || "You have a new notification",
        },
        data: payload.data || {},
      }

      await saveNotificationToBackend(notificationPayload)
    } else {
      console.warn("Could not determine driver ID for notification saving")
    }

    // Call the original callback
    onMessageReceived(payload)
  })
}
