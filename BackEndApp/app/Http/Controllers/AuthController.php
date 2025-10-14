<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Firebase\JWT\JWT;
use App\Services\MFAService;
use Exception;

class AuthController extends Controller
{
    protected $mfaService;
    
    public function __construct(MFAService $mfaService)
    {
        $this->mfaService = $mfaService;
    }
    
    /**
     * Registrar un nuevo usuario
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'device_id' => 'nullable|string',
            'location' => 'nullable|string'
        ]);
        
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'firebase_uid' => uniqid('local_', true), // Generamos un UID local
                'last_login_ip' => $request->ip(),
                'risk_factors' => [
                    'known_devices' => $request->device_id ? [$request->device_id] : [],
                    'known_locations' => $request->location ? [$request->location] : [],
                    'failed_attempts' => 0
                ]
            ]);
            
            // Generar token
            $token = $this->generateCustomToken($user, false);
            
            return response()->json([
                'message' => 'Usuario registrado exitosamente',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'bearer'
            ], 201);
        } catch (Exception $e) {
            Log::error('Error al registrar usuario: ' . $e->getMessage());
            return response()->json(['error' => 'Error al registrar usuario'], 500);
        }
    }
    
    /**
     * Iniciar sesión con usuario y contraseña
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'device_id' => 'nullable|string',
            'location' => 'nullable|string'
        ]);
        
        try {
            // Buscar usuario
            $user = User::where('email', $request->email)->first();
            
            // Verificar credenciales
            if (!$user || !Hash::check($request->password, $user->password)) {
                // Incrementar contador de intentos fallidos
                if ($user) {
                    $riskFactors = $user->risk_factors ?? [];
                    $riskFactors['failed_attempts'] = ($riskFactors['failed_attempts'] ?? 0) + 1;
                    $user->risk_factors = $riskFactors;
                    $user->save();
                }
                
                return response()->json(['error' => 'Credenciales incorrectas'], 401);
            }
            
            // Contexto para evaluación de riesgo
            $contextData = [
                'ip' => $request->ip(),
                'device_id' => $request->device_id,
                'location' => $request->location
            ];
            
            // Evaluar nivel de riesgo
            $riskLevel = $user->evaluateRiskLevel($contextData);
            
            // Resetear intentos fallidos
            $riskFactors = $user->risk_factors ?? [];
            $riskFactors['failed_attempts'] = 0;
            
            // Agregar dispositivo/ubicación a conocidos si es nuevo
            if ($request->device_id && !in_array($request->device_id, $riskFactors['known_devices'] ?? [])) {
                $riskFactors['known_devices'][] = $request->device_id;
            }
            
            if ($request->location && !in_array($request->location, $riskFactors['known_locations'] ?? [])) {
                $riskFactors['known_locations'][] = $request->location;
            }
            
            // Actualizar datos de inicio de sesión
            $user->risk_factors = $riskFactors;
            $user->last_login_at = now();
            $user->last_login_ip = $request->ip();
            $user->save();
            
            // Si MFA está habilitado o si el nivel de riesgo es alto, requerimos verificación adicional
            if ($user->mfa_enabled || $riskLevel >= 5) {
                // Enviar OTP si el usuario tiene teléfono registrado
                if ($user->phone_number) {
                    $this->mfaService->sendOTP($user);
                    
                    return response()->json([
                        'message' => 'Se requiere verificación MFA',
                        'require_mfa' => true,
                        'user_id' => $user->id,
                        'risk_level' => $riskLevel
                    ]);
                }
            }
            
            // Si no se requiere MFA, generar token
            $token = $this->generateCustomToken($user, false);
            
            return response()->json([
                'message' => 'Inicio de sesión exitoso',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'bearer',
                'require_mfa' => false
            ]);
        } catch (Exception $e) {
            Log::error('Error al iniciar sesión: ' . $e->getMessage());
            return response()->json(['error' => 'Error al iniciar sesión'], 500);
        }
    }
    
    /**
     * Verificar código OTP para MFA
     */
    public function verifyOTP(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'otp' => 'required|string|size:6'
        ]);
        
        try {
            $user = User::findOrFail($request->user_id);
            
            // Verificar OTP
            $verified = $this->mfaService->verifyOTP($user, $request->otp, $request->ip());
            
            if (!$verified) {
                return response()->json(['error' => 'Código OTP inválido'], 401);
            }
            
            // Generar token con MFA verificado
            $token = $this->generateCustomToken($user, true);
            
            return response()->json([
                'message' => 'Verificación MFA exitosa',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'bearer'
            ]);
        } catch (Exception $e) {
            Log::error('Error al verificar OTP: ' . $e->getMessage());
            return response()->json(['error' => 'Error al verificar OTP'], 500);
        }
    }
    
    /**
     * Activar/desactivar MFA para un usuario
     */
    public function toggleMFA(Request $request)
    {
        try {
            $user = $request->user;
            
            // Si se está activando MFA, verificar que haya un número de teléfono
            if ($request->enable && !$user->phone_number) {
                return response()->json(['error' => 'Se requiere un número de teléfono para activar MFA'], 422);
            }
            
            $user->mfa_enabled = $request->enable ?? !$user->mfa_enabled;
            $user->save();
            
            return response()->json([
                'message' => $user->mfa_enabled ? 'MFA activado' : 'MFA desactivado',
                'mfa_enabled' => $user->mfa_enabled
            ]);
        } catch (Exception $e) {
            Log::error('Error al modificar MFA: ' . $e->getMessage());
            return response()->json(['error' => 'Error al modificar MFA'], 500);
        }
    }
    
    /**
     * Actualizar número de teléfono para MFA
     */
    public function updatePhone(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string'
        ]);
        
        try {
            $user = $request->user;
            $user->phone_number = $request->phone_number;
            $user->save();
            
            return response()->json([
                'message' => 'Número de teléfono actualizado',
                'phone_number' => $user->phone_number
            ]);
        } catch (Exception $e) {
            Log::error('Error al actualizar teléfono: ' . $e->getMessage());
            return response()->json(['error' => 'Error al actualizar teléfono'], 500);
        }
    }
    
    /**
     * Cerrar sesión (invalidar token)
     */
    public function logout(Request $request)
    {
        // En una implementación completa, se agregaría el token a una lista de denegación
        // Por ahora, solo devolvemos mensaje de éxito
        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }
    
    /**
     * Obtener información del usuario actual
     */
    public function me(Request $request)
    {
        return response()->json($request->user);
    }
    
    /**
     * Generar token JWT personalizado
     */
    protected function generateCustomToken(User $user, bool $mfaVerified): string
    {
        $payload = [
            'sub' => $user->firebase_uid,
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'mfa_verified' => $mfaVerified,
            'mfa_enabled' => $user->mfa_enabled,
            'iat' => time(),
            'exp' => time() + config('jwt.ttl', 3600)
        ];
        
        return JWT::encode($payload, config('jwt.secret'), config('jwt.algo', 'HS256'));
    }
}