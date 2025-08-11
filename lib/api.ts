import type { User, NotificationRequest, LoginRequest, RegisterRequest, AuthResponse } from "@/types"

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
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Authentication APIs
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<void> {
    return this.request<void>("/auth/logout", {
      method: "POST",
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/auth/me")
  }

  // User Management APIs
  async getAllUsers(): Promise<{ data: User[] }> {
    return this.request<{ data: User[] }>("/user/getAllUsers")
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
      body: JSON.stringify(notification),
    })
  }

  async getNotifications(userId?: number): Promise<{ data: any[] }> {
    const endpoint = userId ? `/notifications/user/${userId}` : "/notifications"
    return this.request<{ data: any[] }>(endpoint)
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.request<void>(`/notifications/${notificationId}/read`, {
      method: "PUT",
    })
  }

  // Firebase Token Management
  async setFirebaseToken(token: string, userId: number): Promise<void> {
    const params = new URLSearchParams({
      token,
      userId: userId.toString(),
    })

    return this.request<void>(`/notification/setFirebaseToken?${params}`, {
      method: "POST",
    })
  }

  // Auction APIs (if needed)
  async getAuctions(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>("/auctions")
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

  async placeBid(auctionId: number, bidData: any): Promise<any> {
    return this.request<any>(`/auctions/${auctionId}/bid`, {
      method: "POST",
      body: JSON.stringify(bidData),
    })
  }
}

export const apiService = new ApiService()
