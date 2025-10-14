<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class MFAService
{
    const OTP_LENGTH = 6;
    const MAX_ATTEMPTS = 3;
    const CACHE_PREFIX = 'mfa_otp_';
    
    /**
     * Evalúa el nivel de riesgo basado en varios factores
     */
    public function assessRisk(Request $request, User $user): string
    {
        $riskScore = 0;
        
        // 1. IP nueva o sospechosa
        if (!$this->isKnownIP($user, $request->ip())) {
            $riskScore += 2;
        }
        
        // 2. Hora inusual (fuera de horario típico 8-20)
        $hour = now()->hour;
        if ($hour < 8 || $hour > 20) {
            $riskScore += 1;
        }
        
        // 3. Múltiples intentos fallidos recientes
        $recentFailedAttempts = Cache::get("failed_attempts_{$user->id}", 0);
        if ($recentFailedAttempts > 2) {
            $riskScore += 3;
        }
        
        // 4. Geolocalización diferente a la usual (placeholder)
        // TODO: Implementar check de geolocalización
        
        return match(true) {
            $riskScore >= 4 => 'high',
            $riskScore >= 2 => 'medium',
            default => 'low'
        };
    }
    
    /**
     * Envía un OTP al usuario
     */
    public function sendOTP(User $user): array
    {
        $ip = request()->ip();
        $method = $user->phone_number ? 'sms' : 'email';
        return $this->generateAndSendOTP($user, $method, $ip);
    }
    
    /**
     * Genera y envía un OTP al usuario
     */
    public function generateAndSendOTP(User $user, string $method, string $ip): array
    {
        // Generar OTP
        $otp = $this->generateOTP();
        $expiresAt = now()->addMinutes(5);
        
        // Guardar en cache con TTL
        $cacheKey = $this->getCacheKey($user->id);
        Cache::put($cacheKey, [
            'code' => $otp,
            'attempts' => 0,
            'method' => $method,
            'ip' => $ip
        ], $expiresAt);
        
        // Enviar OTP según método
        if ($method === 'email') {
            $this->sendEmailOTP($user->email, $otp);
        } else {
            $this->sendSMSOTP($user->phone_number, $otp);
        }
        
        return [
            'sent' => true,
            'method' => $method,
            'expiresAt' => $expiresAt
        ];
    }
    
    /**
     * Verifica un código OTP
     */
    public function verifyOTP(User $user, string $code, string $ip = null): array
    {
        $ip = $ip ?? request()->ip();
        $cacheKey = $this->getCacheKey($user->id);
        $otpData = Cache::get($cacheKey);
        
        if (!$otpData) {
            return ['valid' => false, 'error' => 'OTP expirado'];
        }
        
        // Incrementar intentos
        $otpData['attempts']++;
        Cache::put($cacheKey, $otpData, now()->addMinutes(5));
        
        // Verificar máximo de intentos
        if ($otpData['attempts'] > self::MAX_ATTEMPTS) {
            Cache::forget($cacheKey);
            return [
                'valid' => false,
                'error' => 'Máximo de intentos excedido',
                'remainingAttempts' => 0
            ];
        }
        
        // Verificar código
        if ($otpData['code'] !== $code) {
            return [
                'valid' => false,
                'error' => 'Código inválido',
                'remainingAttempts' => self::MAX_ATTEMPTS - $otpData['attempts']
            ];
        }
        
        // Éxito - limpiar cache
        Cache::forget($cacheKey);
        
        // Registrar IP exitosa
        $this->recordSuccessfulIP($user, $ip);
        
        return ['valid' => true];
    }
    
    /**
     * Genera un código OTP numérico
     */
    protected function generateOTP(): string
    {
        return str_pad((string) random_int(0, pow(10, self::OTP_LENGTH) - 1), self::OTP_LENGTH, '0', STR_PAD_LEFT);
    }
    
    /**
     * Envía OTP por email
     */
    protected function sendEmailOTP(string $email, string $otp): void
    {
        Mail::raw(
            "Tu código de verificación es: $otp\nVálido por 5 minutos.",
            function ($message) use ($email) {
                $message->to($email)
                    ->subject('Código de verificación');
            }
        );
    }
    
    /**
     * Envía OTP por SMS (placeholder - requiere proveedor SMS)
     */
    protected function sendSMSOTP(string $phone, string $otp): void
    {
        // TODO: Implementar con proveedor SMS real
        Log::info("SMS OTP enviado a $phone: $otp");
    }
    
    /**
     * Verifica si una IP es conocida para el usuario
     */
    protected function isKnownIP(User $user, string $ip): bool
    {
        $riskFactors = $user->risk_factors ?? [];
        return in_array($ip, $riskFactors['known_ips'] ?? []);
    }
    
    /**
     * Registra una IP exitosa para el usuario
     */
    protected function recordSuccessfulIP(User $user, string $ip): void
    {
        $riskFactors = $user->risk_factors ?? [];
        $knownIps = $riskFactors['known_ips'] ?? [];
        
        if (!in_array($ip, $knownIps)) {
            $knownIps[] = $ip;
            $riskFactors['known_ips'] = array_slice($knownIps, -5); // mantener últimas 5 IPs
            $user->risk_factors = $riskFactors;
            $user->save();
        }
    }
    
    /**
     * Genera key para cache de OTP
     */
    protected function getCacheKey(int $userId): string
    {
        return self::CACHE_PREFIX . $userId;
    }
}