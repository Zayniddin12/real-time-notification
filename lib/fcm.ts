import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: "AIzaSyBRfSRHUszwxuoQuDNfWgpakrMS6IWOmMA",
  authDomain: "auction-e9696.firebaseapp.com",
  projectId: "auction-e9696",
  storageBucket: "auction-e9696.firebasestorage.app",
  messagingSenderId: "714963113012",
  appId: "1:714963113012:web:4abf85c9bebbefdf8f2661",
  measurementId: "G-F45ME0EVE6",
}

const VAPID_KEY = "BND5ym5-wvp3EIYvvOpdiDxDle9Wbp3mZhlqZvEwjSSxIPzWZ-MIFN61skPhmUVTRHkBjfBj7AkahbYDDNP9arU"

class FCMService {
  private app: any = null
  private messaging: any = null
  private initialized = false

  async initialize() {
    if (this.initialized) return

    try {
      // Check if Firebase messaging is supported
      const supported = await isSupported()
      if (!supported) {
        console.warn("Firebase messaging is not supported in this browser")
        return
      }

      this.app = initializeApp(firebaseConfig)
      this.messaging = getMessaging(this.app)
      this.initialized = true

      // Listen for foreground messages
      onMessage(this.messaging, (payload) => {
        console.log("Foreground message received:", payload)

        // Show notification if permission is granted
        if (Notification.permission === "granted") {
          new Notification(payload.notification?.title || "New Notification", {
            body: payload.notification?.body || "",
            icon: "/favicon.ico",
          })
        }
      })
    } catch (error) {
      console.error("FCM initialization error:", error)
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return "denied"
    }

    if (Notification.permission === "granted") {
      return "granted"
    }

    if (Notification.permission === "denied") {
      return "denied"
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  async getToken(): Promise<string | null> {
    if (!this.messaging) {
      await this.initialize()
    }

    if (!this.messaging) {
      return null
    }

    try {
      const token = await getToken(this.messaging, {
        vapidKey: VAPID_KEY,
      })
      return token
    } catch (error) {
      console.error("Error getting FCM token:", error)
      return null
    }
  }
}

export const fcmService = new FCMService()
