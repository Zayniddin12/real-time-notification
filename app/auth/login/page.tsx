"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
import { LogIn, Mail, Phone, Lock, Eye, EyeOff, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [emailFormData, setEmailFormData] = useState({
    email: "",
    password: "",
  })

  const [phoneFormData, setPhoneFormData] = useState({
    phone: "",
    password: "",
  })

  const [usernameFormData, setUsernameFormData] = useState({
    username: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("email")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent, type: "email" | "phone" | "username") => {
    e.preventDefault()

    let credentials: any = {}

    if (type === "email") {
      if (!emailFormData.email || !emailFormData.password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return
      }
      credentials = { email: emailFormData.email, password: emailFormData.password }
    } else if (type === "phone") {
      if (!phoneFormData.phone || !phoneFormData.password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return
      }
      credentials = { phone: phoneFormData.phone, password: phoneFormData.password }
    } else {
      if (!usernameFormData.username || !usernameFormData.password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return
      }
      credentials = { username: usernameFormData.username, password: usernameFormData.password }
    }

    try {
      setLoading(true)
      const response = await apiService.login(credentials)
     
      

      // Store authentication data
      const token = response.id|| response.token
      if (token) {
        console.log(token);
        
        localStorage.setItem("authToken", token)
      
        if (response) {
          localStorage.setItem("userId", response.id.toString())
          localStorage.setItem("userRole", response.roles[0].name || "USER")
          const userName =
            response.firstname && response.lastname
              ? `${response.firstname} ${response.lastname}`
              : response.email || response.phone || "User"
          localStorage.setItem("userName", userName)
        }
      }
      console.log('is response',response);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })

      // Redirect based on role
      const userRole = response.user?.role || "USER"
      const redirectPath = userRole === "ADMIN" ? "/admin" : "/user"
      
router.push(redirectPath)
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" />
            Welcome Back
          </CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="flex items-center gap-1 text-xs">
                <Mail className="h-3 w-3" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-1 text-xs">
                <Phone className="h-3 w-3" />
                Phone
              </TabsTrigger>
              <TabsTrigger value="username" className="flex items-center gap-1 text-xs">
                <User className="h-3 w-3" />
                Username
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-6">
              <form onSubmit={(e) => handleSubmit(e, "email")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={emailFormData.email}
                      onChange={(e) => setEmailFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="emailPassword"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={emailFormData.password}
                      onChange={(e) => setEmailFormData((prev) => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Signing in..." : "Sign In with Email"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4 mt-6">
              <form onSubmit={(e) => handleSubmit(e, "phone")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+998901234567"
                      value={phoneFormData.phone}
                      onChange={(e) => setPhoneFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phonePassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phonePassword"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={phoneFormData.password}
                      onChange={(e) => setPhoneFormData((prev) => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Signing in..." : "Sign In with Phone"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="username" className="space-y-4 mt-6">
              <form onSubmit={(e) => handleSubmit(e, "username")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      value={usernameFormData.username}
                      onChange={(e) => setUsernameFormData((prev) => ({ ...prev, username: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usernamePassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="usernamePassword"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={usernameFormData.password}
                      onChange={(e) => setUsernameFormData((prev) => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Signing in..." : "Sign In with Username"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
