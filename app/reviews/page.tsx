"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Star, ArrowLeft, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"

interface Review {
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

export default function UserReviewsPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", gameId: "" })

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }
    fetchUserReviews()
  }, [user, token])

  const fetchUserReviews = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        const data = await res.json()
        setReviews(data.data || [])
      } else {
        setError("Error al obtener tus reseñas")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Deseas eliminar esta reseña?")) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        setSuccess("Reseña eliminada exitosamente")
        fetchUserReviews()
      } else {
        setError("Error al eliminar la reseña")
      }
    } catch {
      setError("Error de conexión")
    }
  }

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_id: newReview.gameId,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      })

      if (res.ok) {
        setSuccess("Reseña creada exitosamente")
        setNewReview({ rating: 5, comment: "", gameId: "" })
        fetchUserReviews()
      } else {
        const data = await res.json()
        setError(data.message || "Error al crear la reseña")
      }
    } catch {
      setError("Error de conexión")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">Cargando reseñas...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          className="mb-6 border-slate-600 text-white hover:bg-slate-800 bg-transparent"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

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

        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Crear Reseña</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">ID del Juego</label>
                <input
                  type="text"
                  value={newReview.gameId}
                  onChange={(e) => setNewReview({ ...newReview, gameId: e.target.value })}
                  required
                  className="w-full bg-slate-800 border border-slate-600 text-white px-3 py-2 rounded"
                  placeholder="Ingresa el ID del juego"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Comentario</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={3}
                  placeholder="Escribe tu opinión"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Calificación</label>
                <Select
                  value={newReview.rating.toString()}
                  onValueChange={(val) => setNewReview({ ...newReview, rating: parseInt(val) })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {[5, 4, 3, 2, 1].map((r) => (
                      <SelectItem key={r} value={r.toString()}>
                        {r} estrellas
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Publicar Reseña
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Mis Reseñas ({reviews.length})
            </CardTitle>
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
                        <p className="text-slate-300">{review.comment}</p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-600 hover:bg-slate-700"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(review.id)}
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
      </div>
    </div>
  )
}
