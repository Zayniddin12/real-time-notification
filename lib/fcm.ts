// lib/fcm.ts

import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage, type MessagePayload } from "firebase/messaging"

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBRfSRHUszwxuoQuDNfWgpakrMS6IWOmMA",
  authDomain: "auction-e9696.firebaseapp.com",
  projectId: "auction-e9696",
  storageBucket: "auction-e9696.firebasestorage.app",
  messagingSenderId: "714963113012",
  appId: "1:714963113012:web:4abf85c9bebbefdf8f2661",
  measurementId: "G-F45ME0EVE6",
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

/**
 * Permission so‘raydi va FCM token qaytaradi
 */
export async function requestFcmToken(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") return null

    const token = await getToken(messaging, {
      vapidKey: 'BND5ym5-wvp3EIYvvOpdiDxDle9Wbp3mZhlqZvEwjSSxIPzWZ-MIFN61skPhmUVTRHkBjfBj7AkahbYDDNP9arU' as string,
    })

    return token ?? null
  } catch (err) {
    console.error("Error getting FCM token:", err)
    return null
  }
}

/**
 * Xabar kelganda callback ishlaydi
 */
export function onFcmMessage(cb: (p: MessagePayload) => void) {
  return onMessage(messaging, cb)
}

/**
 * Tokenni localStorage’ga saqlash va olish funksiyasi
 */
export function saveFcmToken(token: string) {
  localStorage.setItem("fcm_token", token)
}

export function getSavedFcmToken(): string | null {
  return localStorage.getItem("fcm_token")
}
