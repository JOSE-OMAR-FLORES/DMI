<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiController;

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

    // Rutas de autenticación
    Route::prefix('auth')->group(function () {
        Route::post('/register', function (Request $request) {
            return response()->json([
                'message' => 'Endpoint de registro - Próximamente implementado',
                'data' => $request->only(['name', 'email'])
            ]);
        });

        Route::post('/login', function (Request $request) {
            return response()->json([
                'message' => 'Endpoint de login - Próximamente implementado', 
                'data' => $request->only(['email'])
            ]);
        });

        Route::post('/logout', function () {
            return response()->json([
                'message' => 'Sesión cerrada exitosamente'
            ]);
        })->middleware('auth:sanctum');
    });
});