<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FirebaseMFAService;
use App\Services\FirebaseService;

class FirebaseMFAController extends Controller
{
    protected $mfaService;
    protected $firebaseService;

    public function __construct(FirebaseMFAService $mfaService, FirebaseService $firebaseService)
    {
        $this->mfaService = $mfaService;
        $this->firebaseService = $firebaseService;
    }

    /**
     * Habilitar MFA para un usuario
     */
    public function enableMFA(Request $request)
    {
        $request->validate([
            'uid' => 'required|string'
        ]);

        try {
            $result = $this->mfaService->enableMFA($request->uid);
            
            return response()->json([
                'success' => true,
                'message' => 'MFA enabled successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to enable MFA',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verificar si un usuario tiene MFA habilitado
     */
    public function checkMFAStatus(Request $request)
    {
        $request->validate([
            'uid' => 'required|string'
        ]);

        try {
            $hasEnabled = $this->mfaService->hasMFAEnabled($request->uid);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'mfa_enabled' => $hasEnabled
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check MFA status',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Establecer claim de MFA
     */
    public function setMFAClaim(Request $request)
    {
        $request->validate([
            'uid' => 'required|string',
            'enabled' => 'required|boolean'
        ]);

        try {
            $result = $this->mfaService->setMFAClaim($request->uid, $request->enabled);
            
            return response()->json([
                'success' => true,
                'message' => 'MFA claim updated',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to set MFA claim',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Enviar código de verificación por email
     */
    public function sendVerificationCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        try {
            $result = $this->mfaService->sendVerificationCode($request->email);
            
            return response()->json([
                'success' => true,
                'message' => 'Verification code sent to email',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification code',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verificar código MFA
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'uid' => 'required|string'
        ]);

        try {
            $isValid = $this->mfaService->verifyMFACode($request->email, $request->code);
            
            if (!$isValid) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired verification code'
                ], 401);
            }

            // Crear sesión MFA
            $sessionId = $this->mfaService->createMFASession($request->uid);
            
            // Generar custom token
            $customToken = $this->firebaseService->createCustomToken($request->uid, [
                'mfa_verified' => true,
                'mfa_session' => $sessionId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Code verified successfully',
                'data' => [
                    'custom_token' => $customToken->toString(),
                    'mfa_session_id' => $sessionId
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify code',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Generar códigos de respaldo
     */
    public function generateBackupCodes(Request $request)
    {
        $request->validate([
            'uid' => 'required|string'
        ]);

        try {
            $codes = $this->mfaService->generateBackupCodes($request->uid);
            
            return response()->json([
                'success' => true,
                'message' => 'Backup codes generated successfully',
                'data' => [
                    'backup_codes' => $codes,
                    'warning' => 'Save these codes in a secure place. They will not be shown again.'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate backup codes',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verificar código de respaldo
     */
    public function verifyBackupCode(Request $request)
    {
        $request->validate([
            'uid' => 'required|string',
            'code' => 'required|string'
        ]);

        try {
            $isValid = $this->mfaService->verifyBackupCode($request->uid, $request->code);
            
            if (!$isValid) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid backup code'
                ], 401);
            }

            // Crear sesión MFA
            $sessionId = $this->mfaService->createMFASession($request->uid);
            
            // Generar custom token
            $customToken = $this->firebaseService->createCustomToken($request->uid, [
                'mfa_verified' => true,
                'mfa_session' => $sessionId,
                'backup_code_used' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Backup code verified successfully',
                'data' => [
                    'custom_token' => $customToken->toString(),
                    'mfa_session_id' => $sessionId,
                    'warning' => 'This backup code has been consumed and cannot be used again.'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify backup code',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Deshabilitar MFA
     */
    public function disableMFA(Request $request)
    {
        $request->validate([
            'uid' => 'required|string'
        ]);

        try {
            $result = $this->mfaService->disableMFA($request->uid);
            
            return response()->json([
                'success' => true,
                'message' => 'MFA disabled successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to disable MFA',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Validar sesión MFA
     */
    public function validateSession(Request $request)
    {
        $request->validate([
            'uid' => 'required|string',
            'session_id' => 'required|string'
        ]);

        try {
            $isValid = $this->mfaService->validateMFASession($request->uid, $request->session_id);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'session_valid' => $isValid
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate session',
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
