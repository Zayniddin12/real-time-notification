export interface User {
  id: number
  name?: string
  email?: string
  role?: string
  firebaseToken?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  createdAt: string
}

export interface NotificationRequest {
  title: string
  body: string
  userId: string
}
