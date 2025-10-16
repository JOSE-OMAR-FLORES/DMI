<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SimpleAuthController;
use App\Http\Controllers\Api\JWTAuthController;
use App\Http\Controllers\FirebaseAuthController;
use App\Http\Controllers\FirebaseMFAController;
use App\Http\Controllers\AuthMFAController;
use App\Http\Controllers\TodoController;
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
        // Rutas públicas (sin autenticación)
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'register']);
        
        // Rutas protegidas (requieren autenticación)
        Route::middleware('auth:api')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/refresh', [AuthController::class, 'refresh']);
            Route::get('/user-profile', [AuthController::class, 'userProfile']);
        });
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

    // Rutas de Firebase Authentication
    Route::group(['prefix' => 'firebase'], function () {
        // Verificar token de Firebase
        Route::post('/verify-token', [FirebaseAuthController::class, 'verifyToken']);
        
        // Obtener información de usuario
        Route::post('/get-user', [FirebaseAuthController::class, 'getUser']);
        
        // Crear token personalizado
        Route::post('/create-custom-token', [FirebaseAuthController::class, 'createCustomToken']);
        
        // Enviar notificación push
        Route::post('/send-notification', [FirebaseAuthController::class, 'sendNotification']);

        // Rutas de MFA (Multi-Factor Authentication)
        Route::group(['prefix' => 'mfa'], function () {
            // Habilitar MFA para un usuario
            Route::post('/enable', [FirebaseMFAController::class, 'enableMFA']);
            
            // Verificar estado de MFA
            Route::post('/check-status', [FirebaseMFAController::class, 'checkMFAStatus']);
            
            // Establecer claim de MFA
            Route::post('/set-claim', [FirebaseMFAController::class, 'setMFAClaim']);
            
            // Enviar código de verificación
            Route::post('/send-code', [FirebaseMFAController::class, 'sendVerificationCode']);
            
            // Verificar código MFA
            Route::post('/verify-code', [FirebaseMFAController::class, 'verifyCode']);
            
            // Generar códigos de respaldo
            Route::post('/generate-backup-codes', [FirebaseMFAController::class, 'generateBackupCodes']);
            
            // Verificar código de respaldo
            Route::post('/verify-backup-code', [FirebaseMFAController::class, 'verifyBackupCode']);
            
            // Deshabilitar MFA
            Route::post('/disable', [FirebaseMFAController::class, 'disableMFA']);
            
            // Validar sesión MFA
            Route::post('/validate-session', [FirebaseMFAController::class, 'validateSession']);
        });
    });

    // Rutas de Autenticación con MFA (Laravel + JWT)
    Route::group(['prefix' => 'auth-mfa'], function () {
        // Login con soporte MFA
        Route::post('/login', [AuthMFAController::class, 'login']);
        
        // Verificar código MFA
        Route::post('/verify-mfa', [AuthMFAController::class, 'verifyMFA']);
        
        // Verificar código de respaldo
        Route::post('/verify-backup-code', [AuthMFAController::class, 'verifyBackupCode']);
        
        // Reenviar código
        Route::post('/resend-code', [AuthMFAController::class, 'resendCode']);
        
        // Rutas protegidas (requieren autenticación JWT)
        Route::middleware('auth:api')->group(function () {
            // Habilitar MFA
            Route::post('/enable-mfa', [AuthMFAController::class, 'enableMFA']);
            
            // Deshabilitar MFA
            Route::post('/disable-mfa', [AuthMFAController::class, 'disableMFA']);
            
            // Regenerar códigos de respaldo
            Route::post('/regenerate-backup-codes', [AuthMFAController::class, 'regenerateBackupCodes']);
            
            // Verificar estado de MFA
            Route::get('/mfa-status', [AuthMFAController::class, 'checkMFAStatus']);
        });
    });
});

// ========================================================
// TODO List con RBAC y Zero-Trust
// ========================================================
Route::middleware('auth:api')->group(function () {
    // Rutas de TODO List - Requieren autenticación JWT
    // RBAC: admin, user, guest pueden acceder
    Route::apiResource('todos', TodoController::class)->middleware('role:admin,user,guest');
});

// ========================================================
// Privacy & Compliance (GDPR, CCPA/CPRA)
// ========================================================
Route::middleware('auth:api')->group(function () {
    Route::prefix('privacy')->group(function () {
        // Gestión de Consentimientos
        Route::post('/consent', [App\Http\Controllers\PrivacyController::class, 'storeConsent']);
        Route::get('/consent', [App\Http\Controllers\PrivacyController::class, 'getConsents']);
        Route::get('/consent/history', [App\Http\Controllers\PrivacyController::class, 'getConsentHistory']);
        
        // Derechos GDPR
        Route::get('/data', [App\Http\Controllers\PrivacyController::class, 'getUserData']); // Art. 15 - Acceso
        Route::get('/export', [App\Http\Controllers\PrivacyController::class, 'exportUserData']); // Art. 20 - Portabilidad
        Route::delete('/data', [App\Http\Controllers\PrivacyController::class, 'deleteUserData']); // Art. 17 - Supresión
        
        // CCPA/CPRA
        Route::post('/do-not-sell', [App\Http\Controllers\PrivacyController::class, 'doNotSell']); // CCPA §1798.120
    });
});
