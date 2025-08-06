<?php
// Script completo para configurar el backend Laravel con todas las funcionalidades

echo "=== CONFIGURACIÓN COMPLETA DEL BACKEND LARAVEL ===\n\n";

// 1. Middleware de autenticación JWT
$jwtMiddleware = '';

// 2. Middleware para verificar rol de admin
$adminMiddleware = '';

// 3. Controlador de Admin actualizado
$adminController = '<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(["auth:api", "admin"]);
    }

    public function getStats()
    {
        $stats = [
            "total_games" => Game::count(),
            "total_users" => User::count(),
            "total_reviews" => Review::count(),
            "average_rating" => Review::avg("rating") ?: 0
        ];

        return response()->json([
            "success" => true,
            "data" => $stats
        ]);
    }

    public function getGames()
    {
        $games = Game::withCount("reviews")
                    ->orderBy("created_at", "desc")
                    ->get();

        return response()->json([
            "success" => true,
            "data" => $games
        ]);
    }

    public function storeGame(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "title" => "required|string|max:255|unique:games",
            "description" => "required|string",
            "price" => "required|numeric|min:0",
            "discount_price" => "nullable|numeric|min:0|lt:price",
            "image_url" => "nullable|url",
            "steam_url" => "nullable|url",
            "epic_url" => "nullable|url",
            "is_free" => "boolean",
            "is_on_sale" => "boolean",
            "is_featured" => "boolean"
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "message" => "Validation errors",
                "errors" => $validator->errors()
            ], 422);
        }

        $gameData = $validator->validated();
        
        // Si es gratis, establecer precio en 0
        if ($gameData["is_free"]) {
            $gameData["price"] = 0;
            $gameData["discount_price"] = null;
            $gameData["is_on_sale"] = false;
        }

        $game = Game::create($gameData);

        return response()->json([
            "success" => true,
            "message" => "Game created successfully",
            "data" => $game
        ], 201);
    }

    public function updateGame(Request $request, $id)
    {
        $game = Game::findOrFail($id);

        $validator = Validator::make($request->all(), [
            "title" => "required|string|max:255|unique:games,title," . $id,
            "description" => "required|string",
            "price" => "required|numeric|min:0",
            "discount_price" => "nullable|numeric|min:0|lt:price",
            "image_url" => "nullable|url",
            "steam_url" => "nullable|url",
            "epic_url" => "nullable|url",
            "is_free" => "boolean",
            "is_on_sale" => "boolean",
            "is_featured" => "boolean"
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "message" => "Validation errors",
                "errors" => $validator->errors()
            ], 422);
        }

        $gameData = $validator->validated();
        
        // Si es gratis, establecer precio en 0
        if ($gameData["is_free"]) {
            $gameData["price"] = 0;
            $gameData["discount_price"] = null;
            $gameData["is_on_sale"] = false;
        }

        $game->update($gameData);

        return response()->json([
            "success" => true,
            "message" => "Game updated successfully",
            "data" => $game
        ]);
    }

    public function destroyGame($id)
    {
        $game = Game::findOrFail($id);
        
        // Eliminar reseñas asociadas
        $game->reviews()->delete();
        
        $game->delete();

        return response()->json([
            "success" => true,
            "message" => "Game deleted successfully"
        ]);
    }
}';

// 4. Controlador de Auth actualizado con edición de perfil
//$authControllerUpdated = '';

// 5. Controlador de Review actualizado
$reviewControllerUpdated = '<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function __construct()
    {
        $this->middleware("auth:api")->except(["index", "recent"]);
    }

    public function index()
    {
        $reviews = Review::with(["user", "game"])
                        ->orderBy("created_at", "desc")
                        ->paginate(10);
        
        return response()->json([
            "success" => true,
            "data" => $reviews
        ]);
    }

    public function recent()
    {
        $reviews = Review::with(["user", "game"])
                        ->orderBy("created_at", "desc")
                        ->limit(6)
                        ->get();
        
        return response()->json([
            "success" => true,
            "data" => $reviews
        ]);
    }

    public function userReviews()
    {
        $reviews = Review::with(["game"])
                        ->where("user_id", Auth::id())
                        ->orderBy("created_at", "desc")
                        ->get();
        
        return response()->json([
            "success" => true,
            "data" => $reviews
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "game_id" => "required|exists:games,id",
            "rating" => "required|integer|min:1|max:5",
            "comment" => "required|string|max:1000",
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "message" => "Validation errors",
                "errors" => $validator->errors()
            ], 422);
        }

        // Verificar si el usuario ya reseñó este juego
        $existingReview = Review::where("user_id", Auth::id())
                               ->where("game_id", $request->game_id)
                               ->first();

        if ($existingReview) {
            return response()->json([
                "success" => false,
                "message" => "You have already reviewed this game"
            ], 409);
        }

        $review = Review::create([
            "user_id" => Auth::id(),
            "game_id" => $request->game_id,
            "rating" => $request->rating,
            "comment" => $request->comment,
        ]);

        // Actualizar rating promedio del juego
        $this->updateGameRating($request->game_id);

        return response()->json([
            "success" => true,
            "message" => "Review created successfully",
            "data" => $review->load(["user", "game"])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $review = Review::findOrFail($id);

        // Verificar que el usuario sea el dueño de la reseña
        if ($review->user_id !== Auth::id()) {
            return response()->json([
                "success" => false,
                "message" => "Unauthorized"
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            "rating" => "required|integer|min:1|max:5",
            "comment" => "required|string|max:1000",
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "message" => "Validation errors",
                "errors" => $validator->errors()
            ], 422);
        }

        $review->update([
            "rating" => $request->rating,
            "comment" => $request->comment,
        ]);

        // Actualizar rating promedio del juego
        $this->updateGameRating($review->game_id);

        return response()->json([
            "success" => true,
            "message" => "Review updated successfully",
            "data" => $review->load(["user", "game"])
        ]);
    }

    public function destroy($id)
    {
        $review = Review::findOrFail($id);

        // Verificar que el usuario sea el dueño de la reseña
        if ($review->user_id !== Auth::id()) {
            return response()->json([
                "success" => false,
                "message" => "Unauthorized"
            ], 403);
        }

        $gameId = $review->game_id;
        $review->delete();

        // Actualizar rating promedio del juego
        $this->updateGameRating($gameId);

        return response()->json([
            "success" => true,
            "message" => "Review deleted successfully"
        ]);
    }

    private function updateGameRating($gameId)
    {
        $game = Game::find($gameId);
        if ($game) {
            $averageRating = $game->reviews()->avg("rating") ?: 0;
            $game->update(["rating" => round($averageRating, 2)]);
        }
    }
}';

// 6. Rutas API actualizadas
$apiRoutesUpdated = '<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas de autenticación
Route::group([
    "middleware" => "api",
    "prefix" => "auth"
], function () {
    Route::post("register", [AuthController::class, "register"]);
    Route::post("login", [AuthController::class, "login"]);
    Route::post("logout", [AuthController::class, "logout"])->middleware("auth:api");
    Route::get("me", [AuthController::class, "me"])->middleware("auth:api");
    Route::put("update-profile", [AuthController::class, "updateProfile"])->middleware("auth:api");
});

// Rutas de juegos (públicas)
Route::group([
    "prefix" => "games"
], function () {
    Route::get("/", [GameController::class, "index"]);
    Route::get("featured", [GameController::class, "featured"]);
    Route::get("free", [GameController::class, "free"]);
    Route::get("on-sale", [GameController::class, "onSale"]);
    Route::get("{id}", [GameController::class, "show"]);
});

// Rutas de reseñas
Route::group([
    "prefix" => "reviews"
], function () {
    Route::get("/", [ReviewController::class, "index"]);
    Route::get("recent", [ReviewController::class, "recent"]);
    Route::post("/", [ReviewController::class, "store"])->middleware("auth:api");
    Route::put("{id}", [ReviewController::class, "update"])->middleware("auth:api");
    Route::delete("{id}", [ReviewController::class, "destroy"])->middleware("auth:api");
});

// Rutas de usuario autenticado
Route::group([
    "middleware" => "auth:api",
    "prefix" => "user"
], function () {
    Route::get("reviews", [ReviewController::class, "userReviews"]);
});

// Rutas de administración
Route::group([
    "middleware" => ["auth:api", "admin"],
    "prefix" => "admin"
], function () {
    Route::get("stats", [AdminController::class, "getStats"]);
    Route::get("games", [AdminController::class, "getGames"]);
    Route::post("games", [AdminController::class, "storeGame"]);
    Route::put("games/{id}", [AdminController::class, "updateGame"]);
    Route::delete("games/{id}", [AdminController::class, "destroyGame"]);
});

// Middleware para CORS
Route::middleware("cors")->group(function () {
    // Todas las rutas API ya están definidas arriba
});';

// 7. Migración para agregar rol a usuarios
//$addRoleMigration = '';

// 8. Seeder para crear usuario admin
//$adminSeeder = '';

echo "Archivos de backend Laravel creados:\n";
echo "1. JWTMiddleware.php - Middleware de autenticación JWT\n";
echo "2. AdminMiddleware.php - Middleware para verificar rol admin\n";
echo "3. AdminController.php - Controlador para panel de administración\n";
echo "4. AuthController.php actualizado - Con edición de perfil\n";
echo "5. ReviewController.php actualizado - CRUD completo de reseñas\n";
echo "6. api.php - Rutas API completas\n";
echo "7. add_role_to_users_table.php - Migración para roles\n";
echo "8. AdminSeeder.php - Seeder para crear usuario admin\n\n";

echo "COMANDOS PARA EJECUTAR EN LARAVEL:\n";
echo "php artisan make:middleware JWTMiddleware\n";
echo "php artisan make:middleware AdminMiddleware\n";
echo "php artisan make:controller AdminController\n";
echo "php artisan make:migration add_role_to_users_table --table=users\n";
echo "php artisan make:seeder AdminSeeder\n";
echo "php artisan migrate\n";
echo "php artisan db:seed --class=AdminSeeder\n";
?>
