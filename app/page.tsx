"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Bell, Wifi, ArrowRight, TestTube } from "lucide-react"

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<"admin" | "user" | null>(null)

  const handleRoleSelect = (role: "admin" | "user") => {
    setSelectedRole(role)
    // Simulate authentication by storing role in localStorage
    localStorage.setItem("userRole", role)
    localStorage.setItem("userId", role === "admin" ? "1" : "41") // Test user IDs
    localStorage.setItem("userName", role === "admin" ? "Admin User" : "Test User")
    
    // Redirect to appropriate page
    if (role === "admin") {
      window.location.href = "/admin"
    } else {
      window.location.href = "/user"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Real-Time Notification App</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to the intern task! This app demonstrates real-time notifications using WebSockets and Firebase Cloud Messaging.
          </p>
        </div>

        {/* Role Selection */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Choose Your Role</CardTitle>
            <CardDescription>
              Select a role to access the appropriate dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Admin Role */}
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => handleRoleSelect("admin")}
            >
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-semibold">Admin Dashboard</div>
                <div className="text-sm text-gray-500">Manage users & send notifications</div>
              </div>
            </Button>

            {/* User Role */}
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-300"
              onClick={() => handleRoleSelect("user")}
            >
              <User className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-semibold">User Dashboard</div>
                <div className="text-sm text-gray-500">Receive real-time notifications</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Test Connections */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="text-center">
            <CardTitle className="text-yellow-900">Having Connection Issues?</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              If you're experiencing WebSocket or FCM connection problems, use our test page to diagnose issues.
            </p>
            <Button 
              onClick={() => window.location.href = "/test"} 
              variant="outline" 
              className="bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Connections
            </Button>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Wifi className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>WebSocket Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Real-time notifications delivered instantly via WebSocket connections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Bell className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Push Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Firebase Cloud Messaging for browser push notifications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <User className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Separate dashboards for admins and users with appropriate permissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Task Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Intern Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">Backend</Badge>
              <div>
                <p className="font-medium">API Endpoint</p>
                <p className="text-sm text-gray-600">https://api-auction.tenzorsoft.uz/</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">WebSocket</Badge>
              <div>
                <p className="font-medium">Real-time Connection</p>
                <p className="text-sm text-gray-600">STOMP over WebSocket for live updates</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">Firebase</Badge>
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-600">FCM integration for browser notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
              <div>
                <p className="font-medium">Select Admin Role</p>
                <p className="text-sm text-gray-600">View all users and send notifications</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
              <div>
                <p className="font-medium">Select User Role</p>
                <p className="text-sm text-gray-600">Receive real-time notifications via WebSocket</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
              <div>
                <p className="font-medium">Test Notifications</p>
                <p className="text-sm text-gray-600">Send from admin, receive as user in real-time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
