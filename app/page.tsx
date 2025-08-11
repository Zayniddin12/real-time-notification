"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Shield, LogIn, UserPlus } from "lucide-react"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        setLoading(false)
        return
      }

      // Verify token with backend
      const user = await apiService.getCurrentUser()
      setIsAuthenticated(true)
      setUserRole(user.role || "user")
      setUserName(user.name || user.username || "")

      // Update localStorage with fresh data
      localStorage.setItem("userId", user.id.toString())
      localStorage.setItem("userRole", user.role || "user")
      localStorage.setItem("userName", user.name || user.username || "")
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem("authToken")
      localStorage.removeItem("userId")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userName")
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      // Logout anyway even if API call fails
    } finally {
      localStorage.removeItem("authToken")
      localStorage.removeItem("userId")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userName")
      setIsAuthenticated(false)
      setUserRole(null)
      setUserName("")

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      })
    }
  }

  const goToDashboard = () => {
    const path = userRole === "admin" ? "/admin" : "/user"
    window.location.href = path
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {userRole === "admin" ? <Shield className="h-6 w-6" /> : <User className="h-6 w-6" />}
              Welcome Back!
            </CardTitle>
            <CardDescription>
              Hello, {userName}! You are logged in as <Badge variant="secondary">{userRole}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button onClick={goToDashboard} className="w-full">
                Go to {userRole === "admin" ? "Admin" : "User"} Dashboard
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full bg-transparent">
                Logout
              </Button>
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
          <CardDescription>Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => (window.location.href = "/auth/login")} className="w-full h-16 text-lg">
            <LogIn className="mr-2 h-6 w-6" />
            Sign In
          </Button>
          <Button
            onClick={() => (window.location.href = "/auth/register")}
            variant="outline"
            className="w-full h-16 text-lg"
          >
            <UserPlus className="mr-2 h-6 w-6" />
            Create Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
