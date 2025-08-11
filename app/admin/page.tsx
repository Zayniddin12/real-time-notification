"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Users, Send, ArrowLeft, Loader2, LogOut, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
import { AuthService } from "@/lib/auth"
import type { User, NotificationRequest } from "@/types"

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [notificationType, setNotificationType] = useState<"GENERAL" | "AUCTION" | "BID" | "SYSTEM">("GENERAL")
  const [adminName, setAdminName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    initializePage()
  }, [])

  const initializePage = async () => {
    try {
      // Check authentication and admin role
      await AuthService.requireRole("ADMIN")

      const userName = AuthService.getUserName()
      setAdminName(userName || "Admin")

      await fetchUsers()
    } catch (error) {
      // Will redirect automatically if not authenticated or not admin
      return
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const users = await apiService.getAllUsers()
      setUsers(users)

      if (users.length === 0) {
        toast({
          title: "No Users Found",
          description: "No users are registered in the system yet.",
        })
      }
    } catch (error: any) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users from server.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async () => {
    if (!selectedUserId || !title || !body) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSending(true)
      const notification: NotificationRequest = {
        title,
        body,
        userId: selectedUserId,
        type: notificationType,
      }

      await apiService.sendNotification(notification)

      toast({
        title: "Success",
        description: "Notification sent successfully!",
      })

      // Reset form
      setTitle("")
      setBody("")
      setSelectedUserId("")
      setNotificationType("GENERAL")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      await apiService.deleteUser(userId)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      await fetchUsers() // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      })
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                <div>
                  <CardTitle>Admin Dashboard</CardTitle>
                  <CardDescription>Welcome, {adminName}</CardDescription>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users ({users.length})
                </CardTitle>
                <Button onClick={fetchUsers} variant="outline" size="sm" disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
              <CardDescription>All registered users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                  <p className="text-sm text-gray-400 mt-2">Users will appear here after registration</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div className="flex-1">
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.createdAt && (
                          <p className="text-xs text-gray-400">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {user.firebaseToken && (
                          <Badge variant="secondary" className="text-xs">
                            FCM
                          </Badge>
                        )}
                        <Badge variant={user.role === "ADMIN" ? "default" : "outline"} className="text-xs">
                          {user.role}
                        </Badge>
                        {user.role !== "ADMIN" && (
                          <Button
                            onClick={() => deleteUser(user.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Send Notification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Notification
              </CardTitle>
              <CardDescription>Send real-time notifications to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((user) => user.role !== "ADMIN")
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.firstName} {user.lastName} (@{user.username})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Notification Type</Label>
                <Select
                  value={notificationType}
                  onValueChange={(value: "GENERAL" | "AUCTION" | "BID" | "SYSTEM") => setNotificationType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="AUCTION">Auction</SelectItem>
                    <SelectItem value="BID">Bid</SelectItem>
                    <SelectItem value="SYSTEM">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Message</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter notification message..."
                  rows={4}
                />
              </div>

              <Button
                onClick={sendNotification}
                disabled={sending || !selectedUserId || !title || !body}
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
