"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Users, Send, ArrowLeft, Loader2, LogOut, Trash2 } from "lucide-react"
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
  const [adminName, setAdminName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    initializePage()
  }, [])

  const initializePage = async () => {
    try {
      // Check authentication and admin role
      await AuthService.requireRole("admin")

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
      const response = await apiService.getAllUsers()
      const users = response.data || []
      setUsers(users)

      if (users.length === 0) {
        toast({
          title: "No Users Found",
          description: "No users are registered in the system yet.",
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users from server.",
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
        type: "admin_message",
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
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
                <Button onClick={fetchUsers} variant="outline" size="sm">
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
                <p className="text-center text-gray-500 py-8">No users found</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{user.name || user.username || `User ${user.id}`}</p>
                        <p className="text-sm text-gray-500">
                          ID: {user.id} • {user.email}
                        </p>
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
                        <Badge variant="outline" className="text-xs">
                          {user.role || "user"}
                        </Badge>
                        {user.role !== "admin" && (
                          <Button
                            onClick={() => deleteUser(user.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
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
                <label className="text-sm font-medium mb-2 block">Select User</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((user) => user.role !== "admin")
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name || user.username || `User ${user.id}`} ({user.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
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
