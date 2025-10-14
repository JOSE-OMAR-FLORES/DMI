<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\MFAService;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class MFAController extends Controller
{
    protected $mfaService;

    public function __construct(MFAService $mfaService)
    {
        $this->mfaService = $mfaService;
    }

    public function enroll(Request $request)
    {
        try {
            $validated = $request->validate([
                'uid' => 'required|string',
                'email' => 'required|email'
            ]);

            // En una implementación real verificaríamos el token con Firebase
            // Por ahora usamos directamente el uid y email recibidos
            
            // Registrar o actualizar usuario en nuestra BD
            $user = User::updateOrCreate(
                ['firebase_uid' => $validated['uid']],
                [
                    'email' => $validated['email'],
                    'name' => $validated['name'] ?? 'Usuario',
                    'mfa_enabled' => true,
                    'mfa_method' => 'email'
                ]
            );

            // Log para auditoría
            Log::info('MFA Enrollment', [
                'user_id' => $user->id,
                'firebase_uid' => $user->firebase_uid,
                'action' => 'enroll',
                'ip' => $request->ip()
            ]);

            return response()->json([
                'message' => 'MFA enrollment iniciado',
                'user_id' => $user->id
            ]);

        } catch (\Exception $e) {
            Log::error('Error en MFA enrollment', [
                'error' => $e->getMessage(),
                'uid' => $request->uid ?? null
            ]);

            return response()->json([
                'error' => 'Error procesando enrollment MFA'
            ], 500);
        }
    }

    public function check(Request $request)
    {
        try {
            $validated = $request->validate([
                'uid' => 'required|string'
            ]);

            $user = User::where('firebase_uid', $validated['uid'])->first();

            if (!$user) {
                return response()->json([
                    'mfaRequired' => false,
                    'message' => 'Usuario no encontrado'
                ]);
            }

            // Análisis de riesgo básico
            $riskLevel = $this->mfaService->assessRisk($request, $user);

            return response()->json([
                'mfaRequired' => $user->mfa_enabled || $riskLevel === 'high',
                'methods' => ['email', 'sms'],
                'preferredMethod' => $user->mfa_method,
                'riskLevel' => $riskLevel
            ]);

        } catch (\Exception $e) {
            Log::error('Error en MFA check', [
                'error' => $e->getMessage(),
                'uid' => $request->uid ?? null
            ]);

            return response()->json(['error' => 'Error verificando estado MFA'], 500);
        }
    }

    public function sendOTP(Request $request)
    {
        try {
            $validated = $request->validate([
                'uid' => 'required|string',
                'method' => 'required|in:email,sms'
            ]);

            $user = User::where('firebase_uid', $validated['uid'])->firstOrFail();

            // Generar y enviar OTP
            $otpData = $this->mfaService->generateAndSendOTP(
                $user,
                $validated['method'],
                $request->ip()
            );

            // Log para auditoría
            Log::info('OTP enviado', [
                'user_id' => $user->id,
                'method' => $validated['method'],
                'ip' => $request->ip()
            ]);

            return response()->json([
                'message' => 'OTP enviado correctamente',
                'expiresIn' => config('auth.mfa.otp_expiry', 300), // 5 minutos default
                'retryAfter' => config('auth.mfa.retry_after', 60) // 1 minuto default
            ]);

        } catch (\Exception $e) {
            Log::error('Error enviando OTP', [
                'error' => $e->getMessage(),
                'uid' => $request->uid ?? null
            ]);

            return response()->json(['error' => 'Error enviando OTP'], 500);
        }
    }

    public function verifyOTP(Request $request)
    {
        try {
            $validated = $request->validate([
                'uid' => 'required|string',
                'code' => 'required|string|size:6'
            ]);

            $user = User::where('firebase_uid', $validated['uid'])->firstOrFail();

            // Verificar OTP
            $verificationResult = $this->mfaService->verifyOTP(
                $user,
                $validated['code'],
                $request->ip()
            );

            if (!$verificationResult['valid']) {
                return response()->json([
                    'error' => 'Código inválido o expirado',
                    'remainingAttempts' => $verificationResult['remainingAttempts']
                ], 401);
            }

            // Generar token de sesión (simulado)
            $customToken = $this->generateCustomToken($user->firebase_uid, [
                'mfa_verified' => true,
                'verified_at' => time()
            ]);

            // Log para auditoría
            Log::info('OTP verificado exitosamente', [
                'user_id' => $user->id,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'message' => 'Verificación exitosa',
                'token' => $customToken
            ]);

        } catch (\Exception $e) {
            Log::error('Error verificando OTP', [
                'error' => $e->getMessage(),
                'uid' => $request->uid ?? null
            ]);

            return response()->json(['error' => 'Error verificando OTP'], 500);
        }
    }
    
    /**
     * Generar un token personalizado (simulación de Firebase Custom Token)
     * En una implementación real, usaríamos Firebase Admin SDK
     */
    protected function generateCustomToken(string $uid, array $claims = []): string
    {
        $secret = config('jwt.secret');
        $now = time();
        
        $payload = [
            'iss' => 'firebase-admin-sdk',
            'sub' => $uid,
            'aud' => 'firebase-adminsdk-' . config('jwt.firebase.project_id', 'app'),
            'iat' => $now,
            'exp' => $now + (60 * 60), // 1 hora
            'uid' => $uid,
            'claims' => $claims
        ];
        
        return $this->encodeJWT($payload, $secret);
    }
    
    /**
     * Encode a JWT token using HS256 algorithm
     */
    protected function encodeJWT(array $payload, string $secret): string
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
}