import { apiService } from "./api"

export class AuthService {
  static isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken")
  }

  static getToken(): string | null {
    return localStorage.getItem("authToken")
  }

  static getUserId(): number | null {
    const userId = localStorage.getItem("userId")
    return userId ? Number.parseInt(userId) : null
  }

  static getUserRole(): string | null {
    return localStorage.getItem("userRole")
  }

  static getUserName(): string | null {
    return localStorage.getItem("userName")
  }

  static async requireAuth(): Promise<void> {
    if (!this.isAuthenticated()) {
      window.location.href = "/auth/login"
      throw new Error("Authentication required")
    }

    try {
      // Verify token is still valid
      await apiService.getCurrentUser()
    } catch (error) {
      // Token is invalid, redirect to login
      this.logout()
      window.location.href = "/auth/login"
      throw new Error("Authentication expired")
    }
  }

  static async requireRole(requiredRole: string): Promise<void> {
    await this.requireAuth()

    const userRole = this.getUserRole()
    if (userRole !== requiredRole) {
      window.location.href = "/"
      throw new Error("Insufficient permissions")
    }
  }

  static logout(): void {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userId")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
  }
}
