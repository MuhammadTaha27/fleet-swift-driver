// public/firebase-messaging-sw.js

// 1. Load Firebase compat libraries (v10.4.0)
importScripts("https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.4.0/firebase-messaging-compat.js")

// 2. Initialize Firebase (inline config)
self.firebase.initializeApp({
  apiKey: "AIzaSyAPk4pFsBXRHZQj2_VVSCQ6yf_Oxl1b5aI",
  authDomain: "fleet-management-74197.firebaseapp.com",
  projectId: "fleet-management-74197",
  storageBucket: "fleet-management-74197.firebasestorage.app",
  messagingSenderId: "935876210828",
  appId: "1:935876210828:web:eb324dd6e0a16b43fc4ba9",
})

const messaging = self.firebase.messaging()

// 3. Handle background push messages
messaging.onBackgroundMessage(async (payload) => {
  console.log("[firebase-messaging-sw.js] Received background message", payload)

  // 3a. Persist to backend (with driver ID from payload or token)
  await saveNotificationToBackend(payload)

  // 3b. Build and show system notification
  const title = payload.notification?.title || "New Notification"
  const options = {
    body: payload.notification?.body || "",
    icon: "/firebase-logo.png",
    badge: "/firebase-logo.png",
    data: payload.data || {},
    requireInteraction: true,
    actions: [
      { action: "view", title: "View" },
      { action: "dismiss", title: "Dismiss" },
    ],
  }

  self.registration.showNotification(title, options)
})

// 4. Save notification to your backend
async function saveNotificationToBackend(payload) {
  try {
    const API_BASE = self.API_BASE_URL || "https://fleet-management-system-5.onrender.com" // fallback

    // Try to get driver ID from multiple sources
    let driverId = payload.data?.driverId || payload.data?.entityId || self.DRIVER_ID

    // If no driver ID in payload, try to get it from the JWT token
    if (!driverId) {
      const authToken = await getAuthToken()
      if (authToken) {
        const userId = getUserIdFromJWT(authToken)
        if (userId) {
          driverId = await getDriverIdFromUserId(userId, authToken, API_BASE)
        }
      }
    }

    if (!driverId) {
      console.warn("No driver ID found for notification - skipping save")
      return
    }

    const body = {
      entityId: Number(driverId), // Use driver ID as entity ID
      fcmFrom: payload.from || "firebase",
      notification: {
        title: payload.notification?.title || "New Notification",
        body: payload.notification?.body || "You have a new notification",
      },
      data: payload.data || {},
    }

    const authToken = await getAuthToken()
    const headers = {
      "Content-Type": "application/json",
    }

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`
    }

    const res = await fetch(`${API_BASE}/notifications/create`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    console.log("Notification saved successfully")
  } catch (err) {
    console.error("Failed to save notification:", err)
  }
}

// 5. Auth token helper via IndexedDB
async function getAuthToken() {
  return new Promise((resolve) => {
    const req = indexedDB.open("authStorage", 2)

    req.onupgradeneeded = (evt) => {
      const db = evt.target.result
      if (!db.objectStoreNames.contains("tokens")) {
        db.createObjectStore("tokens")
      }
    }

    req.onsuccess = (evt) => {
      const db = evt.target.result
      if (!db.objectStoreNames.contains("tokens")) return resolve(null)

      const tx = db.transaction("tokens", "readonly")
      const store = tx.objectStore("tokens")
      const getReq = store.get("authToken")

      getReq.onsuccess = () => resolve(getReq.result?.value || null)
      getReq.onerror = () => resolve(null)
    }

    req.onerror = () => resolve(null)
  })
}

// 6. JWT utility functions
function getUserIdFromJWT(token) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    const parsed = JSON.parse(decoded)
    return parsed.sub || null
  } catch (error) {
    console.error("Error decoding JWT in service worker:", error)
    return null
  }
}

// 7. Get driver ID from user ID
async function getDriverIdFromUserId(userId, authToken, apiBase) {
  try {
    const response = await fetch(`${apiBase}/drivers/by-user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch driver for user ${userId}:`, response.status)
      return null
    }

    const data = await response.json()
    return data.driver?.id || null
  } catch (error) {
    console.error("Error fetching driver ID from user ID:", error)
    return null
  }
}

// 8. Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click:", event)

  event.notification.close()
  if (event.action === "view" || !event.action) {
    event.waitUntil(clients.openWindow("/?page=notifications"))
  }
})

// 9. Receive API base-URL and driver ID from main thread
self.addEventListener("message", (event) => {
  if (event.data?.type === "API_CONFIG") {
    self.API_BASE_URL = event.data.apiBaseUrl
    console.log("Service worker API_BASE_URL set to", self.API_BASE_URL)
  }

  if (event.data?.type === "DRIVER_ID") {
    self.DRIVER_ID = event.data.driverId
    console.log("Service worker DRIVER_ID set to", self.DRIVER_ID)
  }
})
