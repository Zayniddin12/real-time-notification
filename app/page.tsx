"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Shield } from "lucide-react"

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<"admin" | "user" | null>(null)
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    // Check if role is already selected
    const savedRole = localStorage.getItem("userRole")
    const savedUserId = localStorage.getItem("userId")

    if (savedRole && savedUserId) {
      setSelectedRole(savedRole as "admin" | "user")
      setUserId(savedUserId)
    }
  }, [])

  const handleRoleSelect = (role: "admin" | "user") => {
    const testUserId = role === "admin" ? "admin_1" : `user_${Math.floor(Math.random() * 100)}`

    setSelectedRole(role)
    setUserId(testUserId)

    localStorage.setItem("userRole", role)
    localStorage.setItem("userId", testUserId)

    // Redirect based on role
    window.location.href = `/${role}`
  }

  const clearSelection = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    setSelectedRole(null)
    setUserId("")
  }

  if (selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {selectedRole === "admin" ? <Shield className="h-6 w-6" /> : <User className="h-6 w-6" />}
              Welcome Back!
            </CardTitle>
            <CardDescription>
              You are logged in as <Badge variant="secondary">{selectedRole}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">User ID: {userId}</p>
              <div className="space-y-2">
                <Button onClick={() => (window.location.href = `/${selectedRole}`)} className="w-full">
                  Go to {selectedRole === "admin" ? "Admin" : "User"} Dashboard
                </Button>
                <Button onClick={clearSelection} variant="outline" className="w-full bg-transparent">
                  Switch Role
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Real-Time Notification System</CardTitle>
          <CardDescription>Select your role to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => handleRoleSelect("admin")} className="w-full h-16 text-lg" variant="default">
            <Shield className="mr-2 h-6 w-6" />
            Login as Admin
          </Button>
          <Button onClick={() => handleRoleSelect("user")} className="w-full h-16 text-lg" variant="outline">
            <User className="mr-2 h-6 w-6" />
            Login as User
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
