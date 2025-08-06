<?php
// Rutas API para Laravel - routes/api.php

$apiRoutes = '<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ReviewController;

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
    Route::post("/", [ReviewController::class, "store"])->middleware
    Route::post("/", [ReviewController::class, "store"])->middleware("auth:api");
});

// Middleware para CORS
Route::middleware("cors")->group(function () {
    // Todas las rutas API ya están definidas arriba
});';

echo "Rutas API de Laravel creadas en routes/api.php\n";
echo "Endpoints disponibles:\n";
echo "- POST /api/auth/register\n";
echo "- POST /api/auth/login\n";
echo "- POST /api/auth/logout\n";
echo "- GET /api/auth/me\n";
echo "- GET /api/games\n";
echo "- GET /api/games/featured\n";
echo "- GET /api/games/free\n";
echo "- GET /api/games/on-sale\n";
echo "- GET /api/games/{id}\n";
echo "- GET /api/reviews\n";
echo "- GET /api/reviews/recent\n";
echo "- POST /api/reviews\n";
?>
