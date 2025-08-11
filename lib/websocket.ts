import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import type { Notification } from "@/types"

interface WebSocketCallbacks {
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (notification: Notification) => void
  onError?: (error: any) => void
}

class WebSocketService {
  private client: Client | null = null

  connect(userId: string, callbacks: WebSocketCallbacks) {
    if (this.client) {
      this.client.deactivate()
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS("https://api-auction.tenzorsoft.uz/ws"),
      connectHeaders: {},
      debug: (str) => {
        console.log("STOMP Debug:", str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    this.client.onConnect = () => {
      console.log("WebSocket connected")
      callbacks.onConnect?.()

      // Subscribe to user-specific notifications
      this.client?.subscribe(`/topic/notification/getAllNotifications/${userId}`, (message) => {
        try {
          const notification: Notification = JSON.parse(message.body)
          callbacks.onMessage?.(notification)
        } catch (error) {
          console.error("Error parsing notification:", error)
        }
      })

      // Also subscribe to app-specific notifications
      this.client?.subscribe(`/app/notification/getAllNotifications/${userId}`, (message) => {
        try {
          const notification: Notification = JSON.parse(message.body)
          callbacks.onMessage?.(notification)
        } catch (error) {
          console.error("Error parsing notification:", error)
        }
      })
    }

    this.client.onDisconnect = () => {
      console.log("WebSocket disconnected")
      callbacks.onDisconnect?.()
    }

    this.client.onStompError = (frame) => {
      console.error("STOMP error:", frame)
      callbacks.onError?.(frame)
    }

    this.client.onWebSocketError = (error) => {
      console.error("WebSocket error:", error)
      callbacks.onError?.(error)
    }

    this.client.activate()

    return {
      disconnect: () => {
        this.client?.deactivate()
        this.client = null
      },
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate()
      this.client = null
    }
  }
}

export const websocketService = new WebSocketService()
