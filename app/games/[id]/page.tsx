"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, ExternalLink, Gift, ArrowLeft, Edit, Trash2, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface Game {
  id: number
  title: string
  description: string
  price: number
  discount_price?: number
  image_url: string
  steam_url?: string
  epic_url?: string
  rating: number
  is_free: boolean
  is_on_sale: boolean
  is_featured: boolean
  reviews: Review[]
}

interface Review {
  id: number
  user_id: number
  game_id: number
  rating: number
  comment: string
  created_at: string
  user: {
    id: number
    name: string
  }
}

export default function GameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [editingReview, setEditingReview] = useState<number | null>(null)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchGame()
    }
  }, [params.id])

  const fetchGame = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/${params.id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGame(data.data)
      } else {
        setError("Juego no encontrado")
      }
    } catch (error) {
      setError("Error al cargar el juego")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !token) {
      router.push("/login")
      return
    }

    setReviewLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_id: params.id,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      })

      if (response.ok) {
        setSuccess("Reseña creada exitosamente")
        setNewReview({ rating: 5, comment: "" })
        fetchGame() // Refresh game data
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Error al crear la reseña")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setReviewLoading(false)
    }
  }

  const handleEditReview = async (reviewId: number, rating: number, comment: string) => {
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      })

      if (response.ok) {
        setSuccess("Reseña actualizada exitosamente")
        setEditingReview(null)
        fetchGame()
      } else {
        setError("Error al actualizar la reseña")
      }
    } catch (error) {
      setError("Error de conexión")
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!token || !confirm("¿Estás seguro de que quieres eliminar esta reseña?")) return

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
        fetchGame()
      } else {
        setError("Error al eliminar la reseña")
      }
    } catch (error) {
      setError("Error de conexión")
    }
  }

  const handleGameRedirect = () => {
    if (game?.steam_url) {
      window.open(game.steam_url, "_blank")
    } else if (game?.epic_url) {
      window.open(game.epic_url, "_blank")
    }
  }

  const userReview = game?.reviews.find((review) => review.user_id === user?.id)
  const otherReviews = game?.reviews.filter((review) => review.user_id !== user?.id) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando juego...</div>
      </div>
    )
  }

  if (error && !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">{error}</div>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </Card>
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

        {game && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game Info */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardHeader className="p-0">
                  <div className="relative">
                    <img
                      src={game.image_url || "/placeholder.svg?height=400&width=800"}
                      alt={game.title}
                      className="w-full h-64 md:h-80 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {game.is_free && (
                        <Badge className="bg-green-600">
                          <Gift className="w-3 h-3 mr-1" />
                          GRATIS
                        </Badge>
                      )}
                      {game.is_on_sale && !game.is_free && <Badge className="bg-red-600">OFERTA</Badge>}
                      {game.is_featured && <Badge className="bg-purple-600">DESTACADO</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <CardTitle className="text-white text-2xl mb-2">{game.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-white font-medium text-lg">{game.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-slate-400">({game.reviews.length} reseñas)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {game.is_free ? (
                        <span className="text-green-400 font-bold text-xl">GRATIS</span>
                      ) : (
                        <div className="flex flex-col items-end">
                          {game.discount_price && <span className="text-slate-400 line-through">${game.price}</span>}
                          <span className="text-white font-bold text-xl">${game.discount_price || game.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-slate-300 mb-6 text-base leading-relaxed">
                    {game.description}
                  </CardDescription>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleGameRedirect}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Comprar en {game.steam_url ? "Steam" : "Epic Games"}
                  </Button>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Reseñas ({game.reviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* User's Review or Review Form */}
                  {user ? (
                    userReview ? (
                      <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-400 font-medium">Tu reseña</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < userReview.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingReview(userReview.id)}
                              className="border-slate-600 text-white hover:bg-slate-700"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteReview(userReview.id)}
                              className="border-red-600 text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {editingReview === userReview.id ? (
                          <EditReviewForm
                            review={userReview}
                            onSave={handleEditReview}
                            onCancel={() => setEditingReview(null)}
                          />
                        ) : (
                          <p className="text-slate-300">{userReview.comment}</p>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReview} className="bg-slate-700/50 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-4">Escribe tu reseña</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-white text-sm mb-2 block">Calificación</label>
                            <Select
                              value={newReview.rating.toString()}
                              onValueChange={(value) =>
                                setNewReview((prev) => ({ ...prev, rating: Number.parseInt(value) }))
                              }
                            >
                              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                  <SelectItem key={rating} value={rating.toString()}>
                                    <div className="flex items-center gap-2">
                                      <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
                                          />
                                        ))}
                                      </div>
                                      <span>
                                        {rating} estrella{rating !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-white text-sm mb-2 block">Comentario</label>
                            <Textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                              placeholder="Comparte tu experiencia con este juego..."
                              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                              rows={4}
                              required
                            />
                          </div>
                          <Button type="submit" disabled={reviewLoading} className="bg-purple-600 hover:bg-purple-700">
                            {reviewLoading ? "Enviando..." : "Enviar Reseña"}
                          </Button>
                        </div>
                      </form>
                    )
                  ) : (
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <p className="text-slate-300 mb-4">Inicia sesión para escribir una reseña</p>
                      <Link href="/login">
                        <Button className="bg-purple-600 hover:bg-purple-700">Iniciar Sesión</Button>
                      </Link>
                    </div>
                  )}

                  {/* Other Reviews */}
                  {otherReviews.map((review) => (
                    <div key={review.id} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{review.user.name}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-slate-400 text-sm">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-300">{review.comment}</p>
                    </div>
                  ))}

                  {otherReviews.length === 0 && !userReview && (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No hay reseñas aún. ¡Sé el primero en reseñar este juego!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Información del Juego</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-slate-400 text-sm">Precio</span>
                    <div className="text-white font-medium">
                      {game.is_free ? "Gratis" : `$${game.discount_price || game.price}`}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Calificación</span>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-medium">{game.rating.toFixed(1)}/5.0</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Total de Reseñas</span>
                    <div className="text-white font-medium">{game.reviews.length}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Disponible en</span>
                    <div className="text-white font-medium">
                      {game.steam_url && game.epic_url
                        ? "Steam y Epic Games"
                        : game.steam_url
                          ? "Steam"
                          : game.epic_url
                            ? "Epic Games"
                            : "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Component for editing reviews
function EditReviewForm({
  review,
  onSave,
  onCancel,
}: {
  review: Review
  onSave: (id: number, rating: number, comment: string) => void
  onCancel: () => void
}) {
  const [rating, setRating] = useState(review.rating)
  const [comment, setComment] = useState(review.comment)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(review.id, rating, comment)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-white text-sm mb-2 block">Calificación</label>
        <Select value={rating.toString()} onValueChange={(value) => setRating(Number.parseInt(value))}>
          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {[5, 4, 3, 2, 1].map((r) => (
              <SelectItem key={r} value={r.toString()}>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < r ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
                      />
                    ))}
                  </div>
                  <span>
                    {r} estrella{r !== 1 ? "s" : ""}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-white text-sm mb-2 block">Comentario</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
          rows={3}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700">
          Guardar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
