import type {
  User,
  NotificationRequest,
  LoginRequest,
  RegisterByEmailRequest,
  RegisterByPhoneRequest,
  AuthResponse,
} from "@/types"

const BASE_URL = "https://api-auction.tenzorsoft.uz"

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("authToken")
        localStorage.removeItem("userRole")
        localStorage.removeItem("userId")
        window.location.href = "/auth/login"
        throw new Error("Authentication required")
      }

      // Try to get error message from response
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // If can't parse JSON, use default message
      }

      throw new Error(errorMessage)
    }

    return response.json()
  }

  // Generate a unique device ID
  private generateDeviceId(): string {
    return `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Authentication APIs based on actual endpoints
  async registerByEmail(userData: RegisterByEmailRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/registerByEmail", {
      method: "POST",
      body: JSON.stringify({
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
        deviceId: userData.deviceId || this.generateDeviceId(),
      }),
    })
  }

  async registerByPhone(userData: RegisterByPhoneRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/registerByPhone", {
      method: "POST",
      body: JSON.stringify({
        phone: userData.phone,
        password: userData.password,
        deviceId: userData.deviceId || this.generateDeviceId(),
      }),
    })
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Try different login endpoints based on what's provided
    const endpoint = "/auth/login"
    const body: any = {
      password: credentials.password,
    }

    if (credentials.email) {
      body.email = credentials.email
    } else if (credentials.phone) {
      body.phone = credentials.phone
    } else if (credentials.username) {
      body.username = credentials.username
    }

    return this.request<AuthResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    const refreshToken = localStorage.getItem("refreshToken")
    return this.request<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>("/auth/logout", {
        method: "POST",
      })
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem("authToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userId")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userName")
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/auth/me")
  }

  // User Management APIs
  async getAllUsers(): Promise<User[]> {
    const response = await this.request<{ content: User[] }>("/user/getAllUsers")
    return response.content || []
  }

  async getUserById(id: number): Promise<User> {
    return this.request<User>(`/user/${id}`)
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/user/${id}`, {
      method: "DELETE",
    })
  }

  // Notification APIs
  async sendNotification(notification: NotificationRequest): Promise<void> {
    return this.request<void>("/notifications/create", {
      method: "POST",
      body: JSON.stringify({
        title: notification.title,
        body: notification.body,
        userId: Number.parseInt(notification.userId),
        type: notification.type || "GENERAL",
      }),
    })
  }

  async getNotifications(userId?: number): Promise<any[]> {
    const endpoint = userId ? `/notifications/user/${userId}` : "/notifications"
    const response = await this.request<{ content: any[] }>(endpoint)
    return response.content || []
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.request<void>(`/notifications/${notificationId}/read`, {
      method: "PUT",
    })
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return this.request<void>(`/notifications/${notificationId}`, {
      method: "DELETE",
    })
  }

  // Firebase Token Management
  async setFirebaseToken(token: string, userId: number): Promise<void> {
    return this.request<void>("/notification/setFirebaseToken", {
      method: "POST",
      body: JSON.stringify({
        token,
        userId,
      }),
    })
  }

  // Auction APIs (based on Swagger)
  async getAuctions(page = 0, size = 10): Promise<any> {
    return this.request<any>(`/auctions?page=${page}&size=${size}`)
  }

  async getAuctionById(id: number): Promise<any> {
    return this.request<any>(`/auctions/${id}`)
  }

  async createAuction(auctionData: any): Promise<any> {
    return this.request<any>("/auctions", {
      method: "POST",
      body: JSON.stringify(auctionData),
    })
  }

  async updateAuction(id: number, auctionData: any): Promise<any> {
    return this.request<any>(`/auctions/${id}`, {
      method: "PUT",
      body: JSON.stringify(auctionData),
    })
  }

  async deleteAuction(id: number): Promise<void> {
    return this.request<void>(`/auctions/${id}`, {
      method: "DELETE",
    })
  }

  async placeBid(auctionId: number, bidAmount: number): Promise<any> {
    return this.request<any>(`/auctions/${auctionId}/bid`, {
      method: "POST",
      body: JSON.stringify({
        amount: bidAmount,
      }),
    })
  }

  async getBidHistory(auctionId: number): Promise<any[]> {
    const response = await this.request<{ content: any[] }>(`/auctions/${auctionId}/bids`)
    return response.content || []
  }
}

export const apiService = new ApiService()
