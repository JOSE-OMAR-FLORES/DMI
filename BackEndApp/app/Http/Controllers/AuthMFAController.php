<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Services\LaravelMFAService;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthMFAController extends Controller
{
    protected $mfaService;

    public function __construct(LaravelMFAService $mfaService)
    {
        $this->mfaService = $mfaService;
    }

    /**
     * Login con soporte para MFA
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        // 1. Buscar usuario
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        // 2. Verificar si tiene MFA habilitado
        if ($this->mfaService->hasMFAEnabled($user)) {
            // Verificar si está bloqueado
            if ($this->mfaService->isBlocked($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many failed attempts. Try again in 15 minutes.'
                ], 429);
            }

            // Enviar código de verificación
            $result = $this->mfaService->sendVerificationCode($user);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                    'error' => $result['error'] ?? 'Failed to send MFA code'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'mfa_required' => true,
                'message' => 'MFA code sent to your email',
                'user_id' => $user->id,
                'code' => $result['code'] ?? null // Solo en modo debug, puede ser null
            ]);
        }

        // 3. Login normal sin MFA
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'mfa_required' => false,
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'mfa_enabled' => false
            ]
        ]);
    }

    /**
     * Verificar código MFA y completar login
     */
    public function verifyMFA(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'code' => 'required|string|size:6'
        ]);

        $user = User::findOrFail($request->user_id);

        // Verificar si está bloqueado
        if ($this->mfaService->isBlocked($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Too many failed attempts. Try again in 15 minutes.'
            ], 429);
        }

        // Verificar el código
        $isValid = $this->mfaService->verifyCode($user, $request->code);

        if (!$isValid) {
            // Registrar intento fallido
            $this->mfaService->recordFailedAttempt($user);

            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification code'
            ], 401);
        }

        // Limpiar intentos fallidos
        $this->mfaService->clearFailedAttempts($user);

        // Generar token JWT
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'MFA verification successful',
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'mfa_enabled' => true
            ]
        ]);
    }

    /**
     * Verificar código de respaldo
     */
    public function verifyBackupCode(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'code' => 'required|string'
        ]);

        $user = User::findOrFail($request->user_id);

        $isValid = $this->mfaService->verifyBackupCode($user, $request->code);

        if (!$isValid) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid backup code'
            ], 401);
        }

        // Generar token JWT
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Backup code verified. This code has been consumed.',
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'mfa_enabled' => true
            ]
        ]);
    }

    /**
     * Habilitar MFA para el usuario autenticado
     */
    public function enableMFA(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $result = $this->mfaService->enableMFA($user);

        return response()->json([
            'success' => true,
            'message' => 'MFA enabled successfully',
            'backup_codes' => $result['backup_codes'],
            'warning' => 'Save these backup codes in a secure place. They will not be shown again.'
        ]);
    }

    /**
     * Deshabilitar MFA
     */
    public function disableMFA(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $this->mfaService->disableMFA($user);

        return response()->json([
            'success' => true,
            'message' => 'MFA disabled successfully'
        ]);
    }

    /**
     * Generar nuevos códigos de respaldo
     */
    public function regenerateBackupCodes(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();

        if (!$this->mfaService->hasMFAEnabled($user)) {
            return response()->json([
                'success' => false,
                'message' => 'MFA is not enabled'
            ], 400);
        }

        $codes = $this->mfaService->generateBackupCodes($user);

        return response()->json([
            'success' => true,
            'message' => 'Backup codes regenerated successfully',
            'backup_codes' => $codes,
            'warning' => 'Previous backup codes have been invalidated. Save these new codes in a secure place.'
        ]);
    }

    /**
     * Verificar estado de MFA
     */
    public function checkMFAStatus(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();

        return response()->json([
            'success' => true,
            'data' => [
                'mfa_enabled' => $this->mfaService->hasMFAEnabled($user),
                'mfa_enabled_at' => $user->mfa_enabled_at,
                'has_backup_codes' => !empty($user->mfa_backup_codes)
            ]
        ]);
    }

    /**
     * Reenviar código MFA
     */
    public function resendCode(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $user = User::findOrFail($request->user_id);

        if (!$this->mfaService->hasMFAEnabled($user)) {
            return response()->json([
                'success' => false,
                'message' => 'MFA is not enabled for this user'
            ], 400);
        }

        $result = $this->mfaService->sendVerificationCode($user);

        return response()->json([
            'success' => true,
            'message' => 'Verification code resent',
            'code' => $result['code'] // Solo en modo debug
        ]);
    }
}
