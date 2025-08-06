"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "user"
  created_at: string
  reviews_count?: number
  average_rating?: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  loading: boolean
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay datos de autenticación guardados
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(userData)

        // Verificar si el token sigue siendo válido
        verifyToken(savedToken)
      } catch (error) {
        // Si hay error al parsear, limpiar datos
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setLoading(false)
  }, [])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        // Token inválido, limpiar datos
        logout()
      } else {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
          localStorage.setItem("user", JSON.stringify(data.user))
        }
      }
    } catch (error) {
      console.error("Error verifying token:", error)
    }
  }

  const login = (userData: User, userToken: string) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem("token", userToken)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      }
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
