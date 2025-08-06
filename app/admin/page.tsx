"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Plus, Edit, Trash2, Eye, Users, Gamepad2, MessageSquare, TrendingUp } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import ReviewsManagement from "@/components/reviews-management"

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
  created_at: string
}

interface AdminStats {
  total_games: number
  total_users: number
  total_reviews: number
  average_rating: number
}

export default function AdminPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    discount_price: "",
    image_url: "",
    steam_url: "",
    epic_url: "",
    is_free: false,
    is_on_sale: false,
    is_featured: false,
  })

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/")
      return
    }
    fetchGames()
    fetchStats()
  }, [user])

  const fetchGames = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/games`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGames(data.data || [])
      }
    } catch (error) {
      setError("Error al cargar los juegos")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      discount_price: "",
      image_url: "",
      steam_url: "",
      epic_url: "",
      is_free: false,
      is_on_sale: false,
      is_featured: false,
    })
    setEditingGame(null)
  }

  const handleEdit = (game: Game) => {
    setEditingGame(game)
    setFormData({
      title: game.title,
      description: game.description,
      price: game.price.toString(),
      discount_price: game.discount_price?.toString() || "",
      image_url: game.image_url,
      steam_url: game.steam_url || "",
      epic_url: game.epic_url || "",
      is_free: game.is_free,
      is_on_sale: game.is_on_sale,
      is_featured: game.is_featured,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const gameData = {
      title: formData.title,
      description: formData.description,
      price: Number.parseFloat(formData.price) || 0,
      discount_price: formData.discount_price ? Number.parseFloat(formData.discount_price) : null,
      image_url: formData.image_url,
      steam_url: formData.steam_url || null,
      epic_url: formData.epic_url || null,
      is_free: formData.is_free,
      is_on_sale: formData.is_on_sale,
      is_featured: formData.is_featured,
    }

    try {
      const url = editingGame
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/games/${editingGame.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/games`

      const method = editingGame ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gameData),
      })

      if (response.ok) {
        setSuccess(editingGame ? "Juego actualizado exitosamente" : "Juego creado exitosamente")
        setIsDialogOpen(false)
        resetForm()
        fetchGames()
        fetchStats()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Error al guardar el juego")
      }
    } catch (error) {
      setError("Error de conexión")
    }
  }

  const handleDelete = async (gameId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este juego? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}//api/admin/games/${gameId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setSuccess("Juego eliminado exitosamente")
        fetchGames()
        fetchStats()
      } else {
        setError("Error al eliminar el juego")
      }
    } catch (error) {
      setError("Error de conexión")
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <div className="text-red-400 text-xl mb-4">Acceso Denegado</div>
            <p className="text-slate-300 mb-4">No tienes permisos para acceder a esta página</p>
            <Button onClick={() => router.push("/")}>Volver al Inicio</Button>
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando panel de administración...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
              <p className="text-slate-300">Gestiona juegos y contenido de la plataforma</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-800"
          >
            Volver al Inicio
          </Button>
        </div>

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

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <Gamepad2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Juegos</p>
                    <p className="text-2xl font-bold text-white">{stats.total_games}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-600/20 rounded-lg">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Usuarios</p>
                    <p className="text-2xl font-bold text-white">{stats.total_users}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-600/20 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Reseñas</p>
                    <p className="text-2xl font-bold text-white">{stats.total_reviews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-600/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Rating Promedio</p>
                    <p className="text-2xl font-bold text-white">{stats.average_rating.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Games Management */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Gestión de Juegos</CardTitle>
                <CardDescription className="text-slate-300">Administra el catálogo de videojuegos</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Juego
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      {editingGame ? "Editar Juego" : "Crear Nuevo Juego"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-300">
                      {editingGame ? "Modifica la información del juego" : "Agrega un nuevo juego al catálogo"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-white">
                          Título *
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image_url" className="text-white">
                          URL de Imagen
                        </Label>
                        <Input
                          id="image_url"
                          value={formData.image_url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white">
                        Descripción *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-white">
                          Precio ($)
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white"
                          disabled={formData.is_free}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount_price" className="text-white">
                          Precio con Descuento ($)
                        </Label>
                        <Input
                          id="discount_price"
                          type="number"
                          step="0.01"
                          value={formData.discount_price}
                          onChange={(e) => setFormData((prev) => ({ ...prev, discount_price: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white"
                          disabled={formData.is_free}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="steam_url" className="text-white">
                          URL de Steam
                        </Label>
                        <Input
                          id="steam_url"
                          value={formData.steam_url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, steam_url: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="https://store.steampowered.com/app/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="epic_url" className="text-white">
                          URL de Epic Games
                        </Label>
                        <Input
                          id="epic_url"
                          value={formData.epic_url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, epic_url: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="https://www.epicgames.com/store/..."
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="is_free" className="text-white">
                          Juego Gratuito
                        </Label>
                        <Switch
                          id="is_free"
                          checked={formData.is_free}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              is_free: checked,
                              price: checked ? "0" : prev.price,
                              discount_price: checked ? "" : prev.discount_price,
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="is_on_sale" className="text-white">
                          En Oferta
                        </Label>
                        <Switch
                          id="is_on_sale"
                          checked={formData.is_on_sale}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_on_sale: checked }))}
                          disabled={formData.is_free}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="is_featured" className="text-white">
                          Destacado
                        </Label>
                        <Switch
                          id="is_featured"
                          checked={formData.is_featured}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_featured: checked }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                        {editingGame ? "Actualizar" : "Crear"} Juego
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Juego</TableHead>
                    <TableHead className="text-slate-300">Precio</TableHead>
                    <TableHead className="text-slate-300">Rating</TableHead>
                    <TableHead className="text-slate-300">Estado</TableHead>
                    <TableHead className="text-slate-300">Reseñas</TableHead>
                    <TableHead className="text-slate-300">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.map((game) => (
                    <TableRow key={game.id} className="border-slate-700">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={game.image_url || "/placeholder.svg?height=40&width=60"}
                            alt={game.title}
                            className="w-12 h-8 object-cover rounded"
                          />
                          <div>
                            <div className="text-white font-medium">{game.title}</div>
                            <div className="text-slate-400 text-sm truncate max-w-xs">{game.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white">
                          {game.is_free ? (
                            <Badge className="bg-green-600">GRATIS</Badge>
                          ) : (
                            <div>
                              {game.discount_price && (
                                <div className="text-slate-400 line-through text-sm">${game.price}</div>
                              )}
                              <div>${game.discount_price || game.price}</div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-white">{game.rating.toFixed(1)}</span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {game.is_featured && <Badge className="bg-purple-600 text-xs">Destacado</Badge>}
                          {game.is_on_sale && <Badge className="bg-red-600 text-xs">Oferta</Badge>}
                          {!game.is_featured && !game.is_on_sale && (
                            <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                              Normal
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-white">{game.reviews_count}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/games/${game.id}`)}
                            className="border-slate-600 text-white hover:bg-slate-700"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(game)}
                            className="border-slate-600 text-white hover:bg-slate-700"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(game.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {games.length === 0 && (
              <div className="text-center py-8">
                <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No hay juegos registrados</p>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    resetForm()
                    setIsDialogOpen(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Juego
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Reviews Management */}
        <Card className="bg-slate-800/50 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Gestión de Reseñas</CardTitle>
            <CardDescription className="text-slate-300">Administra las reseñas de usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewsManagement token={token} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
