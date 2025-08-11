"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, User, ArrowLeft, Wifi, WifiOff, BellRing } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { websocketService } from "@/lib/websocket"
import { fcmService } from "@/lib/fcm"
import { apiService } from "@/lib/api"
import type { Notification } from "@/types"

export default function UserPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [connected, setConnected] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [pushEnabled, setPushEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const wsRef = useRef<any>(null)

  useEffect(() => {
    // Check if user is logged in as user
    const role = localStorage.getItem("userRole")
    const storedUserId = localStorage.getItem("userId")

    if (role !== "user" || !storedUserId) {
      window.location.href = "/"
      return
    }

    setUserId(storedUserId)
    initializeServices(storedUserId)

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [])

  const initializeServices = async (userId: string) => {
    // Initialize WebSocket
    wsRef.current = websocketService.connect(userId, {
      onConnect: () => {
        setConnected(true)
        toast({
          title: "Connected",
          description: "Real-time notifications enabled",
        })
      },
      onDisconnect: () => {
        setConnected(false)
        toast({
          title: "Disconnected",
          description: "Connection lost. Trying to reconnect...",
          variant: "destructive",
        })
      },
      onMessage: (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev])
        toast({
          title: notification.title,
          description: notification.body,
        })
      },
      onError: (error) => {
        console.error("WebSocket error:", error)
        toast({
          title: "Connection Error",
          description: "Failed to connect to notification service",
          variant: "destructive",
        })
      },
    })

    // Initialize FCM
    try {
      await fcmService.initialize()
      const permission = await fcmService.requestPermission()
      setPushEnabled(permission === "granted")

      if (permission === "granted") {
        const token = await fcmService.getToken()
        if (token) {
          await apiService.setFirebaseToken(token, Number.parseInt(userId.replace("user_", "")))
        }
      }
    } catch (error) {
      console.error("FCM initialization error:", error)
    }
  }

  const enablePushNotifications = async () => {
    try {
      setLoading(true)
      const permission = await fcmService.requestPermission()

      if (permission === "granted") {
        const token = await fcmService.getToken()
        if (token) {
          await apiService.setFirebaseToken(token, Number.parseInt(userId.replace("user_", "")))
          setPushEnabled(true)
          toast({
            title: "Success",
            description: "Push notifications enabled!",
          })
        }
      } else {
        toast({
          title: "Permission Denied",
          description: "Push notifications require permission",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable push notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    window.location.href = "/"
  }

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return "Just now"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-6 w-6" />
                <div>
                  <CardTitle>User Dashboard</CardTitle>
                  <CardDescription>User ID: {userId}</CardDescription>
                </div>
              </div>
              <Button onClick={goBack} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {connected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
                <div>
                  <p className="font-medium">WebSocket Status</p>
                  <p className="text-sm text-gray-500">{connected ? "Connected" : "Disconnected"}</p>
                </div>
                <Badge variant={connected ? "default" : "destructive"} className="ml-auto">
                  {connected ? "Online" : "Offline"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BellRing className={`h-5 w-5 ${pushEnabled ? "text-green-500" : "text-gray-400"}`} />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500">{pushEnabled ? "Enabled" : "Disabled"}</p>
                </div>
                {!pushEnabled && (
                  <Button onClick={enablePushNotifications} disabled={loading} size="sm" className="ml-auto">
                    Enable
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications ({notifications.length})
            </CardTitle>
            <CardDescription>Real-time notifications will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-2">Notifications will appear here in real-time</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-gray-600 mt-1">{notification.body}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatTime(notification.createdAt)}</p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        New
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
