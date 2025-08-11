import type { User, NotificationRequest } from "@/types"

const BASE_URL = "https://api-auction.tenzorsoft.uz"

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getAllUsers(): Promise<{ data: User[] }> {
    return this.request<{ data: User[] }>("/user/getAllUsers")
  }

  async sendNotification(notification: NotificationRequest): Promise<void> {
    return this.request<void>("/notifications/create", {
      method: "POST",
      body: JSON.stringify(notification),
    })
  }

  async setFirebaseToken(token: string, userId: number): Promise<void> {
    const params = new URLSearchParams({
      token,
      userId: userId.toString(),
    })

    return this.request<void>(`/notification/setFirebaseToken?${params}`, {
      method: "POST",
    })
  }
}

export const apiService = new ApiService()
