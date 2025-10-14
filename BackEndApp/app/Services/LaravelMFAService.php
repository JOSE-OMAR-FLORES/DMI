<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Mail\MFACodeMail;

class LaravelMFAService
{
    /**
     * Verificar si un usuario tiene MFA habilitado
     */
    public function hasMFAEnabled(User $user): bool
    {
        return $user->mfa_enabled ?? false;
    }

    /**
     * Habilitar MFA para un usuario
     */
    public function enableMFA(User $user)
    {
        $user->mfa_enabled = true;
        $user->save();

        // Generar códigos de respaldo
        $backupCodes = $this->generateBackupCodes($user);

        return [
            'success' => true,
            'message' => 'MFA enabled successfully',
            'backup_codes' => $backupCodes
        ];
    }

    /**
     * Deshabilitar MFA para un usuario
     */
    public function disableMFA(User $user)
    {
        $user->mfa_enabled = false;
        $user->mfa_backup_codes = null;
        $user->save();

        return [
            'success' => true,
            'message' => 'MFA disabled successfully'
        ];
    }

    /**
     * Generar código de verificación de 6 dígitos
     */
    public function generateVerificationCode(): string
    {
        return sprintf("%06d", mt_rand(1, 999999));
    }

    /**
     * Enviar código de verificación por email
     */
    public function sendVerificationCode(User $user): array
    {
        $code = $this->generateVerificationCode();
        $expiresInMinutes = 5;
        
        // Almacenar el código en cache por 5 minutos
        $cacheKey = "mfa_code_{$user->id}";
        Cache::put($cacheKey, $code, now()->addMinutes($expiresInMinutes));

        // Enviar email con el código
        try {
            Mail::to($user->email)->send(new MFACodeMail($code, $user->name, $expiresInMinutes));
            
            return [
                'success' => true,
                'message' => 'Verification code sent to your email',
                'code' => config('app.debug') ? $code : null, // Solo mostrar en debug
                'expires_in' => $expiresInMinutes * 60 // 5 minutos en segundos
            ];
        } catch (\Exception $e) {
            // En caso de error al enviar email, eliminar el código del cache
            Cache::forget($cacheKey);
            
            return [
                'success' => false,
                'message' => 'Failed to send verification code',
                'error' => config('app.debug') ? $e->getMessage() : 'Email service unavailable'
            ];
        }
    }

    /**
     * Verificar código de verificación
     */
    public function verifyCode(User $user, string $code): bool
    {
        $cacheKey = "mfa_code_{$user->id}";
        $storedCode = Cache::get($cacheKey);

        if (!$storedCode) {
            return false;
        }

        if ($storedCode === $code) {
            // Eliminar el código usado
            Cache::forget($cacheKey);
            
            // Crear sesión MFA
            $this->createMFASession($user);
            
            return true;
        }

        return false;
    }

    /**
     * Generar códigos de respaldo
     */
    public function generateBackupCodes(User $user, int $count = 8): array
    {
        $codes = [];
        
        for ($i = 0; $i < $count; $i++) {
            $codes[] = strtoupper(bin2hex(random_bytes(4))); // 8 caracteres
        }

        // Guardar códigos hasheados en la base de datos
        $hashedCodes = array_map(fn($code) => hash('sha256', $code), $codes);
        
        $user->mfa_backup_codes = json_encode($hashedCodes);
        $user->save();

        return $codes;
    }

    /**
     * Verificar código de respaldo
     */
    public function verifyBackupCode(User $user, string $code): bool
    {
        if (!$user->mfa_backup_codes) {
            return false;
        }

        $hashedCode = hash('sha256', strtoupper($code));
        $backupCodes = json_decode($user->mfa_backup_codes, true);

        $index = array_search($hashedCode, $backupCodes);
        
        if ($index !== false) {
            // Eliminar el código usado
            unset($backupCodes[$index]);
            $user->mfa_backup_codes = json_encode(array_values($backupCodes));
            $user->save();
            
            // Crear sesión MFA
            $this->createMFASession($user);
            
            return true;
        }

        return false;
    }

    /**
     * Crear sesión MFA después de verificación exitosa
     */
    public function createMFASession(User $user): string
    {
        $sessionId = bin2hex(random_bytes(32));
        $cacheKey = "mfa_session_{$user->id}_{$sessionId}";
        
        // Sesión válida por 1 hora
        Cache::put($cacheKey, true, now()->addHour());
        
        return $sessionId;
    }

    /**
     * Validar sesión MFA
     */
    public function validateMFASession(User $user, string $sessionId): bool
    {
        $cacheKey = "mfa_session_{$user->id}_{$sessionId}";
        return Cache::has($cacheKey);
    }

    /**
     * Invalidar sesión MFA
     */
    public function invalidateMFASession(User $user, string $sessionId): void
    {
        $cacheKey = "mfa_session_{$user->id}_{$sessionId}";
        Cache::forget($cacheKey);
    }

    /**
     * Registrar intento de MFA fallido
     */
    public function recordFailedAttempt(User $user): void
    {
        $cacheKey = "mfa_failed_attempts_{$user->id}";
        $attempts = Cache::get($cacheKey, 0);
        $attempts++;
        
        // Bloquear por 15 minutos después de 5 intentos fallidos
        if ($attempts >= 5) {
            Cache::put("mfa_blocked_{$user->id}", true, now()->addMinutes(15));
        }
        
        Cache::put($cacheKey, $attempts, now()->addMinutes(15));
    }

    /**
     * Verificar si el usuario está bloqueado
     */
    public function isBlocked(User $user): bool
    {
        return Cache::has("mfa_blocked_{$user->id}");
    }

    /**
     * Limpiar intentos fallidos
     */
    public function clearFailedAttempts(User $user): void
    {
        Cache::forget("mfa_failed_attempts_{$user->id}");
        Cache::forget("mfa_blocked_{$user->id}");
    }
}
