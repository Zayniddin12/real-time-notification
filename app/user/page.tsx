"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, User, ArrowLeft, Wifi, WifiOff, BellRing, LogOut, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { connectNotifications } from "@/lib/websocket"
import { requestFcmToken, onFcmMessage, saveFcmToken, getSavedFcmToken } from "@/lib/fcm"
import { apiService } from "@/lib/api"
import { AuthService } from "@/lib/auth"
import type { Notification } from "@/types"

export default function UserPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [connected, setConnected] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [pushEnabled, setPushEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const wsRef = useRef<any>(null)

  useEffect(() => {
    initializePage()

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [])

  // Fallback polling for notifications if WebSocket fails
  useEffect(() => {
    if (!connected && userId) {
      const interval = setInterval(async () => {
        try {
          await loadNotifications(Number(userId))
        } catch (error) {
          console.error("Polling error:", error)
        }
      }, 10000) // Poll every 10 seconds

      return () => clearInterval(interval)
    }
  }, [connected, userId])

  const initializePage = async () => {
    try {
      // Check authentication
      await AuthService.requireAuth()

      const storedUserId = AuthService.getUserId()
      const storedUserName = AuthService.getUserName()

      // if (!storedUserId) {
      //   window.location.href = "/auth/login"
      //   return
      // }

      if (storedUserId) {
        setUserId(storedUserId.toString())
        setUserName(storedUserName || "User")
        console.log(storedUserId);

        await loadNotifications(storedUserId)
        await enablePushNotifications()
        await initializeServices(storedUserId.toString())
      }

    } catch (error) {
      // Will redirect automatically if not authenticated
      return
    }
  }

  const loadNotifications = async (userId: number) => {
    try {
      const response = await apiService.getNotifications(userId)
      
      if (response && Array.isArray(response)) {
        setNotifications(response)
      } else if (response && typeof response === 'object' && (response as any).content && Array.isArray((response as any).content)) {
        setNotifications((response as any).content)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const initializeServices = async (userId: string) => {
    console.log('userId', userId);
    const numericUserId = Number.parseInt(userId)


    // Initialize WebSocket
    try {
      const disconnect = connectNotifications(userId, (notification: any) => {
        setNotifications((prev) => [notification, ...prev])
        toast({
          title: notification.title,
          description: notification.body,
        })
      })
      
      wsRef.current = { disconnect }
      setConnected(true)
      toast({
        title: "Connected",
        description: "Real-time notifications enabled",
      })
    } catch (error) {
      console.error("WebSocket connection failed:", error)
      setConnected(false)
      toast({
        title: "Connection Failed",
        description: "WebSocket connection failed. Notifications will not be real-time.",
        variant: "destructive",
      })
    }

    // Initialize FCM
    try {
      let token = getSavedFcmToken()
      if (!token) {
        token = await requestFcmToken()
        if (token) {
          saveFcmToken(token)
          try {
            await apiService.setFirebaseToken(token, numericUserId)
          } catch (apiError) {
            console.error("Failed to save FCM token to backend:", apiError)
          }
        }
      }
      
      if (token) {
        setPushEnabled(true)
        toast({
          title: "Push Notifications",
          description: "Push notifications enabled successfully",
        })
        
        // Listen for FCM messages
        onFcmMessage((payload) => {
          const notification: Notification = {
            id: `fcm-${Date.now()}`,
            userId: userId,
            title: payload.notification?.title || "Push Notification",
            body: payload.notification?.body || "",
            type: "GENERAL",
            createdAt: new Date().toISOString(),
            isRead: false,
          }
          setNotifications((prev) => [notification, ...prev])
        })
      } else {
        console.log("FCM token not available - push notifications disabled")
        setPushEnabled(false)
      }
    } catch (error) {
      console.error("FCM initialization error:", error)
      setPushEnabled(false)
    }
  }

  const enablePushNotifications = async () => {
    try {
      setLoading(true)
      const token = await requestFcmToken()
      
      if (token) {
        saveFcmToken(token)
        await apiService.setFirebaseToken(token, Number.parseInt(userId))
        setPushEnabled(true)
        toast({
          title: "Success",
          description: "Push notifications enabled!",
        })
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

  const markAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
    toast({
      title: "Cleared",
      description: "All notifications cleared",
    })
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      AuthService.logout()
      window.location.href = "/"
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
                  <CardDescription>
                    Welcome, {userName} (ID: {userId})
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={goBack} variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Home
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications ({notifications.length})
              </CardTitle>
              {notifications.length > 0 && (
                <Button onClick={clearNotifications} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
            <CardDescription>Your notifications will appear here</CardDescription>
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
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg shadow-sm cursor-pointer transition-colors ${
                      notification.isRead ? "bg-gray-50" : "bg-white border-blue-200"
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-gray-600 mt-1">{notification.body}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatTime(notification.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {notification.type && (
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                        )}
                        {!notification.isRead && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
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
