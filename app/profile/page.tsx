"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Lock, Star, MessageSquare, ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface UserProfile {
  id: number
  name: string
  email: string
  role: string
  created_at: string
  reviews_count: number
  average_rating: number
}

interface UserReview {
  id: number
  rating: number
  comment: string
  created_at: string
  game: {
    id: number
    title: string
    image_url: string
  }
}

export default function ProfilePage() {
  const { user, token, logout, updateUser } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    current_password: "",
    password: "",
    password_confirmation: "",
  })

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }
    fetchProfile()
    fetchUserReviews()
  }, [user, token])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setFormData((prev) => ({
          ...prev,
          name: data.user.name,
          email: data.user.email,
        }))
      }
    } catch (error) {
      setError("Error al cargar el perfil")
    }
  }

  const fetchUserReviews = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
      }

      // Only include password fields if user wants to change password
      if (formData.password) {
        if (formData.password !== formData.password_confirmation) {
          setError("Las contraseñas no coinciden")
          setUpdating(false)
          return
        }
        updateData.current_password = formData.current_password
        updateData.password = formData.password
        updateData.password_confirmation = formData.password_confirmation
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const responseData = await response.json()

      if (response.ok) {
        setSuccess("Perfil actualizado exitosamente")
        setFormData((prev) => ({
          ...prev,
          current_password: "",
          password: "",
          password_confirmation: "",
        }))
        // Actualizar el contexto de usuario
        updateUser(responseData.user)
        fetchProfile()
      } else {
        setError(responseData.message || "Error al actualizar el perfil")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reseña?")) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setSuccess("Reseña eliminada exitosamente")
        fetchUserReviews()
      } else {
        setError("Error al eliminar la reseña")
      }
    } catch (error) {
      setError("Error de conexión")
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando perfil...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          className="mb-6 border-slate-600 text-white hover:bg-slate-800 bg-transparent"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 bg-red-900/50 border-red-700">
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 bg-green-900/50 border-green-700">
            <AlertDescription className="text-green-200">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-white">{profile?.name}</CardTitle>
                <CardDescription className="text-slate-300">{profile?.email}</CardDescription>
                <Badge className={`mt-2 ${profile?.role === "admin" ? "bg-yellow-600" : "bg-blue-600"}`}>
                  {profile?.role === "admin" ? "Administrador" : "Usuario"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Reseñas escritas</span>
                  <span className="text-white font-medium">{profile?.reviews_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Calificación promedio</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-medium">
                      {profile?.average_rating ? profile.average_rating.toFixed(1) : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Miembro desde</span>
                  <span className="text-white font-medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
                <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600">
                  Editar Perfil
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-600">
                  Mis Reseñas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Información Personal</CardTitle>
                    <CardDescription className="text-slate-300">
                      Actualiza tu información personal y contraseña
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-white flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Nombre
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            className="bg-slate-700 border-slate-600 text-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                            className="bg-slate-700 border-slate-600 text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-700 pt-6">
                        <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Cambiar Contraseña (Opcional)
                        </h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="current_password" className="text-white">
                              Contraseña Actual
                            </Label>
                            <Input
                              id="current_password"
                              type="password"
                              value={formData.current_password}
                              onChange={(e) => setFormData((prev) => ({ ...prev, current_password: e.target.value }))}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Solo si quieres cambiar la contraseña"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="password" className="text-white">
                                Nueva Contraseña
                              </Label>
                              <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="Mínimo 8 caracteres"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="password_confirmation" className="text-white">
                                Confirmar Nueva Contraseña
                              </Label>
                              <Input
                                id="password_confirmation"
                                type="password"
                                value={formData.password_confirmation}
                                onChange={(e) =>
                                  setFormData((prev) => ({ ...prev, password_confirmation: e.target.value }))
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="Repite la nueva contraseña"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button type="submit" disabled={updating} className="bg-purple-600 hover:bg-purple-700">
                        {updating ? "Actualizando..." : "Actualizar Perfil"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Mis Reseñas ({reviews.length})
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Gestiona todas tus reseñas de videojuegos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                            <div className="flex items-start gap-4">
                              <img
                                src={review.game.image_url || "/placeholder.svg?height=80&width=120"}
                                alt={review.game.title}
                                className="w-20 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <Link
                                    href={`/games/${review.game.id}`}
                                    className="text-white font-medium hover:text-purple-400 transition-colors"
                                  >
                                    {review.game.title}
                                  </Link>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-slate-400 text-sm">
                                      {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-slate-300 mb-3">{review.comment}</p>
                                <div className="flex gap-2">
                                  <Link href={`/games/${review.game.id}`}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                                    >
                                      <Edit className="w-3 h-3 mr-1" />
                                      Editar
                                    </Button>
                                  </Link>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Eliminar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 mb-4">No has escrito ninguna reseña aún</p>
                        <Link href="/games">
                          <Button className="bg-purple-600 hover:bg-purple-700">Explorar Juegos</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
