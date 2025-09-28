<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SimpleAuthController;
use App\Http\Controllers\Api\JWTAuthController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aquí puedes registrar las rutas de la API para tu aplicación.
| Estas rutas son cargadas por el RouteServiceProvider dentro de un grupo
| que tiene el middleware "api" aplicado.
|
*/

// Ruta para obtener información del usuario autenticado
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rutas públicas de la API
Route::prefix('v1')->group(function () {
    
    // Health check - verifica que la API esté funcionando
    Route::get('/health', [ApiController::class, 'health']);

    // Estado de la API
    Route::get('/', [ApiController::class, 'index']);

    // Rutas de autenticación JWT
    Route::group(['prefix' => 'auth'], function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/user-profile', [AuthController::class, 'userProfile']);
    });
    
    // Ruta de prueba simple
    Route::post('/test-register', function(Request $request) {
        return response()->json([
            'message' => 'Endpoint de prueba funciona',
            'data' => $request->all()
        ]);
    });
    
    // Registro simple sin JWT primero
    Route::post('/simple-register', [SimpleAuthController::class, 'register']);
    
    // Login JWT
    Route::post('/jwt-login', [AuthController::class, 'login']);
    
    // Test JWT simple
    Route::post('/test-jwt', function(Request $request) {
        try {
            $user = User::where('email', $request->email)->first();
            if ($user && Hash::check($request->password, $user->password)) {
                $token = JWTAuth::fromUser($user);
                return response()->json([
                    'access_token' => $token,
                    'token_type' => 'bearer',
                    'user' => $user
                ]);
            } else {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'JWT Test failed',
                'message' => $e->getMessage()
            ], 500);
        }
    });
    
    // Rutas JWT funcionales
    Route::group(['prefix' => 'jwt'], function () {
        Route::post('/register', [JWTAuthController::class, 'register']);
        Route::post('/login', [JWTAuthController::class, 'login']);
        Route::post('/logout', [JWTAuthController::class, 'logout']);
        Route::get('/profile', [JWTAuthController::class, 'profile']);
    });
    
});