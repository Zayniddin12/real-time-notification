import { apiService } from "./api"

export class AuthService {
  static isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken")
  }

  static getToken(): string | null {
    return localStorage.getItem("authToken")
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken")
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
    // if (!this.isAuthenticated()) {
    //   window.location.href = "/auth/login"
    //   throw new Error("Authentication required")
    // }
    const userId = localStorage.getItem("userId")
    try {
      // Verify token is still valid
      await apiService.getCurrentUser(userId)
    } catch (error) {
      // Try to refresh token
      try {
        const refreshToken = this.getRefreshToken()
        if (refreshToken) {
          const response = await apiService.refreshToken()
          localStorage.setItem("authToken", response.accessToken)
          return
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
      }

      // Token is invalid and refresh failed, redirect to login
      this.logout()
      // window.location.href = "/auth/login"
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
    console.log('logout');
    
    // localStorage.removeItem("authToken")
    // localStorage.removeItem("refreshToken")
    // localStorage.removeItem("userId")
    // localStorage.removeItem("userRole")
    // localStorage.removeItem("userName")
  }
}
