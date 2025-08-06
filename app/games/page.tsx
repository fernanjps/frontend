"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ExternalLink, Search, Filter, Gift, TrendingUp } from "lucide-react"
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
  reviews_count: number
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const { user, token } = useAuth()

  useEffect(() => {
    fetchGames()
  }, [])

  useEffect(() => {
    filterAndSortGames()
  }, [games, searchTerm, filterType, sortBy])

  const fetchGames = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        console.log("respuesta:", result)
        setGames(result.data || [])
      } else {
        console.error("Respuesta inválida:", response.status)
      }
    } catch (error) {
      console.error("Error fetching games:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortGames = () => {
    let filtered = games.filter(
      (game) =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    switch (filterType) {
      case "free":
        filtered = filtered.filter((game) => game.is_free)
        break
      case "sale":
        filtered = filtered.filter((game) => game.is_on_sale)
        break
      case "featured":
        filtered = filtered.filter((game) => game.is_featured)
        break
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "price_low":
          return (a.discount_price || a.price) - (b.discount_price || b.price)
        case "price_high":
          return (b.discount_price || b.price) - (a.discount_price || a.price)
        case "name":
          return a.title.localeCompare(b.title)
        case "reviews":
          return b.reviews_count - a.reviews_count
        default:
          return 0
      }
    })

    setFilteredGames(filtered)
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
        <div className="text-white text-xl">Cargando juegos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">GameReviews</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/games" className="text-purple-400 font-medium">Juegos</Link>
              <Link href="/reviews" className="text-slate-300 hover:text-white transition-colors">Reseñas</Link>
              {user?.role === "admin" && (
                <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition-colors">Admin Panel</Link>
              )}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Hola, {user.name}</span>
                  <Button variant="outline" size="sm"><Link href="/profile">Perfil</Link></Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Link href="/login">Iniciar Sesión</Link></Button>
                  <Button size="sm"><Link href="/register">Registrarse</Link></Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* filtros */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar juegos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-600 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">Todos los juegos</SelectItem>
                <SelectItem value="free">Juegos gratis</SelectItem>
                <SelectItem value="sale">En oferta</SelectItem>
                <SelectItem value="featured">Destacados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-600 text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="rating">Mejor valorados</SelectItem>
                <SelectItem value="price_low">Precio: menor a mayor</SelectItem>
                <SelectItem value="price_high">Precio: mayor a menor</SelectItem>
                <SelectItem value="name">Nombre A-Z</SelectItem>
                <SelectItem value="reviews">Más reseñas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* grilla de juegos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <Card key={game.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all group">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={game.image_url || "/placeholder.svg?height=200&width=300"}
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
                  {game.is_featured && <Badge className="absolute top-2 right-2 bg-purple-600">DESTACADO</Badge>}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-white mb-2 line-clamp-1">{game.title}</CardTitle>
                <CardDescription className="text-slate-300 mb-3 line-clamp-2">{game.description}</CardDescription>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-medium">{game.rating.toFixed(1)}</span>
                    <span className="text-slate-400 text-sm">({game.reviews_count})</span>
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
                <div className="space-y-2">
                  <Link href={`/games/${game.id}`}>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">Ver Detalles</Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                    onClick={() => handleGameRedirect(game)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver en {game.steam_url ? "Steam" : "Epic Games"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-4">No se encontraron juegos</div>
            <p className="text-slate-500">Intenta cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
