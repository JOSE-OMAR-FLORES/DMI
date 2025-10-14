<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SimpleAuthController;
use App\Http\Controllers\Api\JWTAuthController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Firebase\JWT\JWT;

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
use App\Http\Controllers\MFAController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas de autenticación
use App\Http\Controllers\AuthController as FirebaseAuthController;

Route::prefix('auth')->group(function () {
    Route::post('register', [FirebaseAuthController::class, 'register']);
    Route::post('login', [FirebaseAuthController::class, 'login']);
    Route::post('verify-otp', [FirebaseAuthController::class, 'verifyOTP']);
    
    // Rutas protegidas con middleware
    Route::middleware('firebase.auth')->group(function () {
        Route::get('me', [FirebaseAuthController::class, 'me']);
        Route::post('logout', [FirebaseAuthController::class, 'logout']);
        Route::post('toggle-mfa', [FirebaseAuthController::class, 'toggleMFA']);
        Route::post('update-phone', [FirebaseAuthController::class, 'updatePhone']);
    });
});

// Rutas MFA (Anteriores, mantener para compatibilidad)
Route::prefix('auth/mfa')->group(function () {
    Route::post('enroll', [MFAController::class, 'enroll']);
    Route::post('check', [MFAController::class, 'check']);
    Route::post('send-otp', [MFAController::class, 'sendOTP']);
    Route::post('verify-otp', [MFAController::class, 'verifyOTP']);
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
                $payload = [
                    'sub' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'iat' => time(),
                    'exp' => time() + 3600 // 1 hora
                ];
                
                $token = JWT::encode($payload, config('jwt.secret'), config('jwt.algo', 'HS256'));
                
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