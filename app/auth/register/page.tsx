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
import { UserPlus, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [emailFormData, setEmailFormData] = useState({
    email: "",
    phone: "",
    firstname: "",
    lastname: "",
    password: "",
    confirmPassword: "",
  })
  const [verifyData, setVerifyData] = useState({
    email: "",
    code:"",
    role:""
  })
  const [isRegistered, setIsRegistered] = useState(false)

  const [phoneFormData, setPhoneFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("email")
  const { toast } = useToast()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    // Basic phone validation - adjust regex based on your requirements
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !emailFormData.email ||
      !emailFormData.phone ||
      !emailFormData.firstname ||
      !emailFormData.lastname ||
      !emailFormData.password
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!validateEmail(emailFormData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    if (!validatePhone(emailFormData.phone)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number (e.g., +998901234567)",
        variant: "destructive",
      })
      return
    }

    if (emailFormData.password !== emailFormData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (emailFormData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await apiService.registerByEmail({
        email: emailFormData.email,
        phone: emailFormData.phone,
        firstname: emailFormData.firstname,
        lastname: emailFormData.lastname,
        password: emailFormData.password,
        deviceId: `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })

      // Store authentication data
      const token = response.accessToken || response.token
      setIsRegistered(true)
      if (token) {
        localStorage.setItem("authToken", token)
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken)
        }
        if (response.user) {
          localStorage.setItem("userId", response.user.id.toString())
          localStorage.setItem("userRole", response.user.role || "USER")
          localStorage.setItem("userName", `${response.user.firstname} ${response.user.lastname}`)
        }
      }

      toast({
        title: "Registration Successful",
        description: `Welcome, ${emailFormData.firstname}!`,
      })

      // Redirect to user dashboard (most registrations will be users)
      // window.location.href = "/admin"
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  const handleVerifySubmit = async (e: React.FormEvent) => {
  

    // Validation
    if (
      !verifyData.email ||
      !verifyData.code 
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!validateEmail(verifyData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }


    try {
      setLoading(true)
      const response = await apiService.verifyByEmail({
        email: verifyData.email,
        code: verifyData.code,
        deviceId: `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })

      // Store authentication data
      const token = response.accessToken || response.token
      setIsRegistered(true)
      if (token) {
        localStorage.setItem("authToken", token)
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken)
        }
        if (response.user) {
          localStorage.setItem("userId", response.user.id.toString())
          localStorage.setItem("userRole", response.user.role || "USER")
          localStorage.setItem("userName", `${response.user.firstname} ${response.user.lastname}`)
        }
      }

      toast({
        title: "Registration Successful",
        description: `Welcome, ${emailFormData.firstname}!`,
      })

      // Redirect to user dashboard (most registrations will be users)
      // window.location.href = "/admin"
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!phoneFormData.phone || !phoneFormData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!validatePhone(phoneFormData.phone)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number (e.g., +998901234567)",
        variant: "destructive",
      })
      return
    }

    if (phoneFormData.password !== phoneFormData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (phoneFormData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await apiService.registerByPhone({
        phone: phoneFormData.phone,
        password: phoneFormData.password,
        deviceId: `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })

      // Store authentication data
      const token = response.accessToken || response.token
      if (token) {
        localStorage.setItem("authToken", token)
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken)
        }
        if (response.user) {
          localStorage.setItem("userId", response.user.id.toString())
          localStorage.setItem("userRole", response.user.role || "USER")
          localStorage.setItem("userName", response.user.phone || "User")
        }
      }

      toast({
        title: "Registration Successful",
        description: "Account created successfully!",
      })

      // Redirect to user dashboard
      window.location.href = "/user"
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerifyData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }
  
  const handleVerifyEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerifyData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {
        !isRegistered ? (  <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <UserPlus className="h-6 w-6" />
              Create Account
            </CardTitle>
            <CardDescription>Choose your registration method</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </TabsTrigger>
              </TabsList>
  
              <TabsContent value="email" className="space-y-4 mt-6">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstname">First Name *</Label>
                      <Input
                        id="firstname"
                        name="firstname"
                        type="text"
                        placeholder="John"
                        value={emailFormData.firstname}
                        onChange={handleEmailChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Last Name *</Label>
                      <Input
                        id="lastname"
                        name="lastname"
                        type="text"
                        placeholder="Doe"
                        value={emailFormData.lastname}
                        onChange={handleEmailChange}
                        required
                      />
                    </div>
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={emailFormData.email}
                        onChange={handleEmailChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+998901234567"
                        value={emailFormData.phone}
                        onChange={handleEmailChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={emailFormData.password}
                        onChange={handleEmailChange}
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
  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={emailFormData.confirmPassword}
                        onChange={handleEmailChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
  
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating Account..." : "Create Account with Email"}
                  </Button>
                </form>
              </TabsContent>
  
              <TabsContent value="phone" className="space-y-4 mt-6">
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneOnly">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phoneOnly"
                        name="phone"
                        type="tel"
                        placeholder="+998901234567"
                        value={phoneFormData.phone}
                        onChange={handlePhoneChange}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter your phone number with country code (e.g., +998901234567)
                    </p>
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="phonePassword">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phonePassword"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={phoneFormData.password}
                        onChange={handlePhoneChange}
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
  
                  <div className="space-y-2">
                    <Label htmlFor="phoneConfirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phoneConfirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={phoneFormData.confirmPassword}
                        onChange={handlePhoneChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
  
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating Account..." : "Create Account with Phone"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
  
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                {/* <Link href="/auth/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link> */}
              </p>
            </div>
          </CardContent>
        </Card>) : (<Card>
          <CardContent>

          <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={verifyData.email}
                        onChange={handleVerifyEmailChange}
                        className="pl-10"
                        required
                      />
                    </div>
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="email">code *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="code"
                        name="code"
                        type="text"
                        placeholder="verify code"
                        value={verifyData.code}
                        onChange={handleCodeChange}
                        className="pl-10"
                        required
                      />
                    </div>
                    </div>
                    <Button onClick={handleVerifySubmit} disabled={loading} className="w-full">
                    {loading ? "Verifiying Account..." : "Verify Account"}
                  </Button>
          </CardContent>
        
        </Card>)
      }
    
    </div>
  )
}
