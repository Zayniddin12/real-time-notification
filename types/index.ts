export interface User {
  id: number
  name?: string
  email?: string
  username?: string
  role?: string
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
  createdAt: string
  isRead?: boolean
  type?: string
}

export interface NotificationRequest {
  title: string
  body: string
  userId: string
  type?: string
}

export interface LoginRequest {
  email?: string
  username?: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  username: string
  password: string
  role?: string
}

export interface AuthResponse {
  token: string
  user: User
  expiresIn?: number
}

export interface Auction {
  id: number
  title: string
  description: string
  startingPrice: number
  currentPrice: number
  endTime: string
  status: string
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface Bid {
  id: number
  auctionId: number
  userId: number
  amount: number
  createdAt: string
}
