"use client";

// Importa el componente ReviewsManagement que ya hemos corregido
import { ReviewsManagement } from "@/components/reviews-management";

// Importa los componentes de la interfaz de usuario que ya existen
import { Button } from "@/components/ui/button";

// TODO: Debes crear tu propio componente para la gestión de juegos
// Por ahora, usamos un componente de placeholder para ilustrar
function GamesManagement() {
  return (
    <div className="bg-slate-800 p-6 rounded-lg text-white">
      <h2 className="text-xl font-semibold mb-4">Gestión de Juegos (TODO)</h2>
      <p className="text-slate-400 mb-4">Aquí podrás crear, editar y eliminar juegos.</p>
      {/* TODO: Aquí iría tu lógica y UI para el CRUD de juegos */}
      <Button>Crear Nuevo Juego</Button>
    </div>
  );
}

// Este componente representa la página /admin
export default function AdminPage() {
  const token = "tu_token_de_acceso_aqui";

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
        <p className="text-slate-400">
          Gestiona las reseñas y los juegos de tu plataforma.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Gestión de Reseñas</h2>
        <ReviewsManagement token={token} />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Gestión de Juegos</h2>
        <GamesManagement />
      </section>
    </div>
  );
}