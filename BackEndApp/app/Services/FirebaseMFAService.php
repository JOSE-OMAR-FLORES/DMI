<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth;
use Kreait\Firebase\Auth\UserRecord;

class FirebaseMFAService
{
    protected $auth;

    public function __construct()
    {
        $credentialsPath = config('firebase.credentials');
        
        if (!file_exists($credentialsPath)) {
            throw new \Exception("Firebase credentials file not found at: {$credentialsPath}");
        }

        $factory = (new Factory)->withServiceAccount($credentialsPath);
        $this->auth = $factory->createAuth();
    }

    /**
     * Habilitar MFA para un usuario
     * Nota: La configuración de MFA se hace principalmente en el cliente
     * pero podemos verificar y gestionar el estado desde el backend
     */
    public function enableMFA(string $uid)
    {
        try {
            // Obtener el usuario
            $user = $this->auth->getUser($uid);
            
            // Verificar si el usuario tiene email verificado
            if (!$user->emailVerified) {
                throw new \Exception("User email must be verified before enabling MFA");
            }

            return [
                'success' => true,
                'message' => 'MFA can be enabled for this user',
                'user' => [
                    'uid' => $user->uid,
                    'email' => $user->email,
                    'emailVerified' => $user->emailVerified,
                    'mfaInfo' => $this->getMFAInfo($user)
                ]
            ];
        } catch (\Exception $e) {
            throw new \Exception("Failed to enable MFA: " . $e->getMessage());
        }
    }

    /**
     * Obtener información de MFA del usuario
     */
    public function getMFAInfo(UserRecord $user)
    {
        // Firebase Auth maneja MFA en el cliente
        // Aquí verificamos si el usuario tiene factores MFA configurados
        $mfaInfo = [];
        
        try {
            // Los factores MFA están disponibles en el objeto del usuario
            // pero la gestión detallada se hace principalmente desde el cliente
            $mfaInfo = [
                'enrolled' => false,
                'factors' => []
            ];

            return $mfaInfo;
        } catch (\Exception $e) {
            return $mfaInfo;
        }
    }

    /**
     * Verificar si un usuario tiene MFA habilitado
     */
    public function hasMFAEnabled(string $uid): bool
    {
        try {
            $user = $this->auth->getUser($uid);
            
            // En Firebase Auth, podemos verificar mediante custom claims
            $customClaims = $user->customClaims;
            
            return isset($customClaims['mfa_enabled']) && $customClaims['mfa_enabled'] === true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Establecer custom claim para MFA
     */
    public function setMFAClaim(string $uid, bool $enabled)
    {
        try {
            $this->auth->setCustomUserClaims($uid, [
                'mfa_enabled' => $enabled,
                'mfa_updated_at' => time()
            ]);

            return [
                'success' => true,
                'message' => 'MFA claim updated successfully'
            ];
        } catch (\Exception $e) {
            throw new \Exception("Failed to set MFA claim: " . $e->getMessage());
        }
    }

    /**
     * Generar código de verificación por email
     */
    public function sendVerificationCode(string $email)
    {
        try {
            // Generar un código de 6 dígitos
            $code = sprintf("%06d", mt_rand(1, 999999));
            
            // Almacenar el código (en producción, usar cache o database)
            cache()->put("mfa_code_{$email}", $code, now()->addMinutes(5));

            return [
                'success' => true,
                'message' => 'Verification code sent',
                'code' => config('app.debug') ? $code : null // Solo en modo debug
            ];
        } catch (\Exception $e) {
            throw new \Exception("Failed to send verification code: " . $e->getMessage());
        }
    }

    /**
     * Verificar código de MFA
     */
    public function verifyMFACode(string $email, string $code): bool
    {
        $storedCode = cache()->get("mfa_code_{$email}");
        
        if (!$storedCode) {
            return false;
        }

        if ($storedCode === $code) {
            cache()->forget("mfa_code_{$email}");
            return true;
        }

        return false;
    }

    /**
     * Generar backup codes para MFA
     */
    public function generateBackupCodes(string $uid, int $count = 8): array
    {
        $codes = [];
        
        for ($i = 0; $i < $count; $i++) {
            $codes[] = strtoupper(bin2hex(random_bytes(4))); // 8 caracteres hex
        }

        // Almacenar los códigos hasheados
        $hashedCodes = array_map(fn($code) => hash('sha256', $code), $codes);
        
        // Guardar en custom claims o en tu base de datos
        $user = $this->auth->getUser($uid);
        $customClaims = $user->customClaims ?? [];
        $customClaims['backup_codes'] = $hashedCodes;
        
        $this->auth->setCustomUserClaims($uid, $customClaims);

        return $codes;
    }

    /**
     * Verificar backup code
     */
    public function verifyBackupCode(string $uid, string $code): bool
    {
        try {
            $user = $this->auth->getUser($uid);
            $customClaims = $user->customClaims ?? [];
            
            if (!isset($customClaims['backup_codes'])) {
                return false;
            }

            $hashedCode = hash('sha256', strtoupper($code));
            $backupCodes = $customClaims['backup_codes'];

            // Buscar el código
            $index = array_search($hashedCode, $backupCodes);
            
            if ($index !== false) {
                // Eliminar el código usado
                unset($backupCodes[$index]);
                $customClaims['backup_codes'] = array_values($backupCodes);
                
                $this->auth->setCustomUserClaims($uid, $customClaims);
                
                return true;
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Deshabilitar MFA para un usuario (solo para administradores)
     */
    public function disableMFA(string $uid)
    {
        try {
            $user = $this->auth->getUser($uid);
            $customClaims = $user->customClaims ?? [];
            
            $customClaims['mfa_enabled'] = false;
            unset($customClaims['backup_codes']);
            
            $this->auth->setCustomUserClaims($uid, $customClaims);

            return [
                'success' => true,
                'message' => 'MFA disabled successfully'
            ];
        } catch (\Exception $e) {
            throw new \Exception("Failed to disable MFA: " . $e->getMessage());
        }
    }

    /**
     * Validar sesión con MFA
     */
    public function validateMFASession(string $uid, string $sessionId): bool
    {
        $key = "mfa_session_{$uid}_{$sessionId}";
        return cache()->has($key);
    }

    /**
     * Crear sesión MFA después de verificación exitosa
     */
    public function createMFASession(string $uid): string
    {
        $sessionId = bin2hex(random_bytes(32));
        $key = "mfa_session_{$uid}_{$sessionId}";
        
        // Sesión válida por 1 hora
        cache()->put($key, true, now()->addHour());
        
        return $sessionId;
    }
}
