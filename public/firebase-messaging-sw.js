// Firebase messaging service worker
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js")

// Note: Service workers can't access import.meta.env, so we'll need to pass these values
// We'll update this approach to get config from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG") {
    const firebaseConfig = event.data.config

    // Initialize the Firebase app in the service worker
    firebase.initializeApp(firebaseConfig)

    // Retrieve Firebase Messaging object
    const messaging = firebase.messaging()

    // Handle background messages
    messaging.onBackgroundMessage(async (payload) => {
      console.log("Received background message ", payload)

      // Save notification to backend
      await saveNotificationToBackend(payload)

      const notificationTitle = payload.notification?.title || "New Notification"
      const notificationOptions = {
        body: payload.notification?.body || "You have a new notification",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        data: payload.data || {},
        requireInteraction: true,
        actions: [
          {
            action: "view",
            title: "View",
          },
          {
            action: "dismiss",
            title: "Dismiss",
          },
        ],
      }

      self.registration.showNotification(notificationTitle, notificationOptions)
    })
  }
})

// Function to save notification to backend
async function saveNotificationToBackend(payload) {
  try {
    // Get API base URL from the config passed from main thread
    const API_BASE = self.API_BASE_URL || "https://fleet-management-system-5.onrender.com"

    const notificationPayload = {
      fcmFrom: payload.from || "firebase",
      notification: {
        title: payload.notification?.title || "New Notification",
        body: payload.notification?.body || "You have a new notification",
      },
      data: payload.data || {},
    }

    const response = await fetch(`${API_BASE}/notifications/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationPayload),
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

// Function to get auth token (you might need to adjust this based on your storage method)
async function getAuthToken() {
  return new Promise((resolve) => {
    // Try to get from IndexedDB first, then fallback to other methods
    const request = indexedDB.open("authStorage", 1)

    request.onsuccess = (event) => {
      const db = event.target.result
      if (db.objectStoreNames.contains("tokens")) {
        const transaction = db.transaction(["tokens"], "readonly")
        const store = transaction.objectStore("tokens")
        const getRequest = store.get("authToken")

        getRequest.onsuccess = () => {
          resolve(getRequest.result?.value || null)
        }

        getRequest.onerror = () => {
          resolve(null)
        }
      } else {
        resolve(null)
      }
    }

    request.onerror = () => {
      resolve(null)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains("tokens")) {
        db.createObjectStore("tokens")
      }
    }
  })
}

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received.")

  event.notification.close()

  if (event.action === "view" || !event.action) {
    // Open the app and navigate to notifications
    event.waitUntil(clients.openWindow("/?page=notifications"))
  }
})

// Listen for config from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "API_CONFIG") {
    self.API_BASE_URL = event.data.apiBaseUrl
  }
})
