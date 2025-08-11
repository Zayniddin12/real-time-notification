export interface User {
  id: number
  username?: string
  email?: string
  phone?: string
  firstname?: string
  lastname?: string
  role: "USER" | "ADMIN"
  firebaseToken?: string
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  type: "GENERAL" | "AUCTION" | "BID" | "SYSTEM"
  createdAt: string
  isRead?: boolean
}

export interface NotificationRequest {
  title: string
  body: string
  userId: string
  type?: "GENERAL" | "AUCTION" | "BID" | "SYSTEM"
}

export interface LoginRequest {
  username?: string
  email?: string
  phone?: string
  password: string
}

export interface RegisterByEmailRequest {
  email: string
  phone: string
  password: string
  firstname: string
  lastname: string
  deviceId: string
}

export interface RegisterByPhoneRequest {
  phone: string
  password: string
  deviceId: string
}

export interface AuthResponse {
  accessToken?: string
  token?: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
  user?: User
  message?: string
}

export interface Auction {
  id: number
  title: string
  description: string
  startingPrice: number
  currentPrice: number
  startTime: string
  endTime: string
  status: "PENDING" | "ACTIVE" | "ENDED" | "CANCELLED"
  createdBy: number
  createdAt: string
  updatedAt: string
  imageUrl?: string
  category?: string
}

export interface Bid {
  id: number
  auctionId: number
  userId: number
  amount: number
  createdAt: string
  user?: User
}
