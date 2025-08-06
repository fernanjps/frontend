<?php
// Controladores Laravel para la API

// app/Http/Controllers/AuthController.php
$authController = '<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "name" => "required|string|max:255",
            "email" => "required|string|email|max:255|unique:users",
            "password" => "required|string|min:8|confirmed",
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "message" => "Validation errors",
                "errors" => $validator->errors()
            ], 422);
        }

        $user = User::create([
            "name" => $request->name,
            "email" => $request->email,
            "password" => Hash::make($request->password),
        ]);

        return response()->json([
            "success" => true,
            "message" => "User registered successfully",
            "user" => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "email" => "required|email",
            "password" => "required|string|min:6",
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "message" => "Validation errors",
                "errors" => $validator->errors()
            ], 422);
        }

        if (!$token = JWTAuth::attempt($validator->validated())) {
            return response()->json([
                "success" => false,
                "message" => "Invalid credentials"
            ], 401);
        }

        return response()->json([
            "success" => true,
            "token" => $token,
            "user" => Auth::user()
        ]);
    }

    public function logout()
    {
        JWTAuth::logout();
        return response()->json([
            "success" => true,
            "message" => "Successfully logged out"
        ]);
    }

    public function me()
    {
        return response()->json([
            "success" => true,
            "user" => Auth::user()
        ]);
    }
}';

// app/Http/Controllers/GameController.php
$gameController = '<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function index()
    {
        $games = Game::with("reviews")->orderBy("rating", "desc")->get();
        
        return response()->json([
            "success" => true,
            "data" => $games
        ]);
    }

    public function featured()
    {
        $games = Game::where("is_featured", true)
                    ->with("reviews")
                    ->orderBy("rating", "desc")
                    ->get();
        
        return response()->json([
            "success" => true,
            "data" => $games
        ]);
    }

    public function free()
    {
        $games = Game::where("is_free", true)
                    ->with("reviews")
                    ->orderBy("rating", "desc")
                    ->get();
        
        return response()->json([
            "success" => true,
            "data" => $games
        ]);
    }

    public function onSale()
    {
        $games = Game::where("is_on_sale", true)
                    ->with("reviews")
                    ->orderBy("rating", "desc")
                    ->get();
        
        return response()->json([
            "success" => true,
            "data" => $games
        ]);
    }

    public function show($id)
    {
        $game = Game::with("reviews.user")->findOrFail($id);
        
        return response()->json([
            "success" => true,
            "data" => $game
        ]);
    }
}';

// app/Http/Controllers/ReviewController.php
$reviewController = '<?php

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
        $game = Game::find($request->game_id);
        $averageRating = $game->reviews()->avg("rating");
        $game->update(["rating" => round($averageRating, 2)]);

        return response()->json([
            "success" => true,
            "message" => "Review created successfully",
            "data" => $review->load(["user", "game"])
        ], 201);
    }
}';

echo "Controladores Laravel creados:\n";
echo "- AuthController.php\n";
echo "- GameController.php\n";
echo "- ReviewController.php\n";
?>
