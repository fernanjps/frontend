"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ExternalLink, Gamepad2, Gift } from "lucide-react"
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
}

interface Review {
  id: number
  game_id: number
  user_name: string
  rating: number
  comment: string
  created_at: string
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([])
  const [featuredGames, setFeaturedGames] = useState<Game[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchGames()
    fetchFeaturedGames()
    fetchRecentReviews()
  }, [])

  const fetchGames = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games`)
      if (!response.ok) throw new Error("Backend no disponible")
      const data = await response.json()
      setGames(data.data || [])
    } catch (err) {
      setError("Error conectando con el backend - Funcionalidad de juegos no disponible")
      setGames([
        {
          id: 1,
          title: "Cyberpunk 2077",
          description: "Un RPG de mundo abierto ambientado en Night City",
          price: 59.99,
          discount_price: 29.99,
          image_url: "/placeholder.svg?height=300&width=400",
          steam_url: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/",
          rating: 4.2,
          is_free: false,
          is_on_sale: true,
        },
        {
          id: 2,
          title: "Fortnite",
          description: "Battle Royale gratuito con construcción",
          price: 0,
          image_url: "/placeholder.svg?height=300&width=400",
          epic_url: "https://www.epicgames.com/fortnite/",
          rating: 4.5,
          is_free: true,
          is_on_sale: false,
        },
      ])
    }
  }

  const fetchFeaturedGames = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/featured`)
      if (!response.ok) throw new Error("Backend no disponible")
      const data = await response.json()
      setFeaturedGames(data.data || [])
    } catch (err) {
      setFeaturedGames(games.slice(0, 3))
    }
  }

  const fetchRecentReviews = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/recent`)
      if (!response.ok) throw new Error("Backend no disponible")
      const data = await response.json()
      setReviews(data.data || [])
    } catch (err) {
      setReviews([
        {
          id: 1,
          game_id: 1,
          user_name: "GamerPro",
          rating: 4,
          comment: "Excelente juego después de las actualizaciones",
          created_at: "2024-01-15",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleGameRedirect = (game: Game) => {
    if (game.steam_url) {
      window.open(game.steam_url, "_blank")
    } else if (game.epic_url) {
      window.open(game.epic_url, "_blank")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando plataforma...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">GameReviews</h1>
            </div>
            <nav className="flex items-center gap-6">
              {/* El enlace a Juegos ha sido eliminado */}
              <Link href="/reviews" className="text-slate-300 hover:text-white transition-colors">
                Reseñas
              </Link>
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Hola, {user.name}</span>
                  <Button variant="outline" size="sm">
                    <Link href="/profile">Perfil</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                  <Button size="sm">
                    <Link href="/register">Registrarse</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/50 border-b border-red-700 px-4 py-2">
          <div className="container mx-auto text-red-200 text-sm">⚠️ {error}</div>
        </div>
      )}

      {/* Hero Section (sin botones) */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Descubre los Mejores Juegos</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Encuentra reseñas honestas, ofertas increíbles y los juegos más populares del momento
          </p>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-white mb-8">Juegos Destacados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.slice(0, 6).map((game) => (
              <Card
                key={game.id}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer group"
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={game.image_url || "/placeholder.svg"}
                      alt={game.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {game.is_free && (
                      <Badge className="absolute top-2 left-2 bg-green-600">
                        <Gift className="w-3 h-3 mr-1" />
                        GRATIS
                      </Badge>
                    )}
                    {game.is_on_sale && !game.is_free && (
                      <Badge className="absolute top-2 left-2 bg-red-600">OFERTA</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-white mb-2">{game.title}</CardTitle>
                  <CardDescription className="text-slate-300 mb-3">{game.description}</CardDescription>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-medium">{game.rating}</span>
                    </div>
                    <div className="text-right">
                      {game.is_free ? (
                        <span className="text-green-400 font-bold">GRATIS</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {game.discount_price && (
                            <span className="text-slate-400 line-through text-sm">${game.price}</span>
                          )}
                          <span className="text-white font-bold">${game.discount_price || game.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleGameRedirect(game)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver en {game.steam_url ? "Steam" : "Epic Games"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="py-16 px-4 bg-slate-900/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-white mb-8">Reseñas Recientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-purple-400 font-medium">{review.user_name}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-300 mb-2">{review.comment}</p>
                  <span className="text-slate-500 text-sm">{review.created_at}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 className="h-6 w-6 text-purple-400" />
            <span className="text-white font-bold">GameReviews</span>
          </div>
          <p className="text-slate-400">
            Plataforma de reseñas de videojuegos - Arquitectura en capas con Next.js, Laravel y PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  )
}
