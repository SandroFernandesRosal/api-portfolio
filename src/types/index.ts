export interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: number
  title: string
  description: string
  img: string
  video: string | null
  repo: string
  page: string
  slug: string
  featured: boolean
  createdAt: Date
  updatedAt: Date
  technologies: string[]
  images: string[]
}

export interface Technology {
  id: number
  name: string
}

export interface ProjectImage {
  id: number
  url: string
  projectId: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: Omit<User, 'password'>
  token: string
}

export interface JWTPayload {
  userId: string
  email: string
}
