"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Wifi, TestTube, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { requestFcmToken, onFcmMessage, saveFcmToken, getSavedFcmToken } from "@/lib/fcm"
import { connectNotifications } from "@/lib/websocket"
import { apiService } from "@/lib/api"

export default function TestPage() {
  const [fcmStatus, setFcmStatus] = useState<string>("Not tested")
  const [wsStatus, setWsStatus] = useState<string>("Not tested")
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const { toast } = useToast()

  const testFCM = async () => {
    try {
      setFcmStatus("Testing...")
      
      // Check if notifications are supported
      if (!("Notification" in window)) {
        setFcmStatus("Not supported")
        toast({
          title: "FCM Test",
          description: "Notifications not supported in this browser",
          variant: "destructive",
        })
        return
      }

      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setFcmStatus("Permission denied")
        toast({
          title: "FCM Test",
          description: "Notification permission denied",
          variant: "destructive",
        })
        return
      }

      // Get token
      const token = await requestFcmToken()
      if (token) {
        setFcmToken(token)
        saveFcmToken(token)
        setFcmStatus("Success")
        toast({
          title: "FCM Test",
          description: "FCM token obtained successfully!",
        })
      } else {
        setFcmStatus("Failed")
        toast({
          title: "FCM Test",
          description: "Failed to get FCM token",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("FCM test error:", error)
      setFcmStatus("Error")
      toast({
        title: "FCM Test",
        description: "FCM test failed with error",
        variant: "destructive",
      })
    }
  }

  const testWebSocket = async () => {
    try {
      setWsStatus("Testing...")
      
      // Test with a sample user ID
      const testUserId = "41"
      const disconnect = connectNotifications(testUserId, (notification: any) => {
        setNotifications(prev => [notification, ...prev])
        toast({
          title: "WebSocket Test",
          description: "Received notification via WebSocket!",
        })
      })

      // Store disconnect function
      setTimeout(() => {
        disconnect()
        setWsStatus("Test completed")
      }, 5000)

      setWsConnected(true)
      setWsStatus("Connected")
      toast({
        title: "WebSocket Test",
        description: "WebSocket connection successful!",
      })
    } catch (error) {
      console.error("WebSocket test error:", error)
      setWsStatus("Failed")
      toast({
        title: "WebSocket Test",
        description: "WebSocket test failed",
        variant: "destructive",
      })
    }
  }

  const testAPI = async () => {
    try {
      const response = await apiService.getAllUsers()
      console.log("API test response:", response)
      toast({
        title: "API Test",
        description: "API call successful! Check console for response.",
      })
    } catch (error) {
      console.error("API test error:", error)
      toast({
        title: "API Test",
        description: "API test failed",
        variant: "destructive",
      })
    }
  }

  const goBack = () => {
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TestTube className="h-6 w-6" />
                <div>
                  <CardTitle>Connection Test Page</CardTitle>
                  <CardDescription>
                    Test WebSocket, FCM, and API connections
                  </CardDescription>
                </div>
              </div>
              <Button onClick={goBack} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* FCM Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                FCM Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={testFCM} className="w-full">
                Test FCM
              </Button>
              <div className="text-sm">
                <p><strong>Status:</strong> <Badge variant="outline">{fcmStatus}</Badge></p>
                {fcmToken && (
                  <p className="mt-2 text-xs break-all">
                    <strong>Token:</strong> {fcmToken.substring(0, 50)}...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* WebSocket Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                WebSocket Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={testWebSocket} className="w-full">
                Test WebSocket
              </Button>
              <div className="text-sm">
                <p><strong>Status:</strong> <Badge variant="outline">{wsStatus}</Badge></p>
                <p><strong>Connected:</strong> <Badge variant={wsConnected ? "default" : "secondary"}>{wsConnected ? "Yes" : "No"}</Badge></p>
              </div>
            </CardContent>
          </Card>

          {/* API Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                API Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={testAPI} className="w-full">
                Test API
              </Button>
              <div className="text-sm">
                <p><strong>Status:</strong> <Badge variant="outline">Click to test</Badge></p>
                <p className="text-gray-500">Tests getAllUsers endpoint</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Received */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications Received</CardTitle>
            <CardDescription>Notifications received during testing</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications received yet
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{notification.title || "No title"}</p>
                        <p className="text-sm text-gray-600">{notification.body || "No body"}</p>
                      </div>
                      <Badge variant="secondary">Test</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>User Agent:</strong> {navigator.userAgent}</p>
            <p><strong>Notifications Supported:</strong> {"Notification" in window ? "Yes" : "No"}</p>
            <p><strong>Service Worker:</strong> {"serviceWorker" in navigator ? "Yes" : "No"}</p>
            <p><strong>WebSocket Supported:</strong> {"WebSocket" in window ? "Yes" : "No"}</p>
            <p><strong>Current URL:</strong> {window.location.href}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

