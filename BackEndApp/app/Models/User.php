<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'firebase_uid',
        'mfa_enabled',
        'phone_number',
        'last_login_at',
        'last_login_ip',
        'risk_factors',
        'last_login_ip',
        'failed_attempts'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'mfa_enabled' => 'boolean',
            'risk_factors' => 'array',
            'last_login_at' => 'datetime'
        ];
    }

    /**
     * Evalúa el nivel de riesgo de una sesión basada en varios factores
     *
     * @param array $contextData
     * @return int Nivel de riesgo (1-10)
     */
    public function evaluateRiskLevel(array $contextData): int
    {
        $riskScore = 1; // Nivel base de riesgo
        
        // Dispositivo desconocido
        if (!empty($contextData['device_id']) && 
            (!$this->risk_factors || !in_array($contextData['device_id'], $this->risk_factors['known_devices'] ?? []))) {
            $riskScore += 2;
        }
        
        // IP desconocida
        if (!empty($contextData['ip']) && $this->last_login_ip && $contextData['ip'] !== $this->last_login_ip) {
            $riskScore += 2;
        }
        
        // Ubicación inusual
        if (!empty($contextData['location']) && 
            (!$this->risk_factors || !in_array($contextData['location'], $this->risk_factors['known_locations'] ?? []))) {
            $riskScore += 3;
        }
        
        // Múltiples intentos fallidos
        if (!empty($this->risk_factors['failed_attempts']) && $this->risk_factors['failed_attempts'] > 3) {
            $riskScore += 2;
        }
        
        // Hora inusual (fuera de horario típico 8-20)
        $hour = now()->hour;
        if ($hour < 8 || $hour > 20) {
            $riskScore += 1;
        }
        
        // Solicitud de recurso sensible
        if (!empty($contextData['resource_type']) && $contextData['resource_type'] === 'sensitive') {
            $riskScore += 2;
        }
        
        // Frecuencia de login inusual
        if ($this->last_login_at && now()->diffInMinutes($this->last_login_at) < 5) {
            // Si el último login fue hace menos de 5 minutos
            $riskScore += 1;
        }
        
        // Patrón de comportamiento inusual (ejemplo simple)
        if (!empty($contextData['user_agent']) && 
            (!$this->risk_factors || !in_array($contextData['user_agent'], $this->risk_factors['known_agents'] ?? []))) {
            $riskScore += 1;
        }
        
        return min($riskScore, 10); // Máximo nivel de riesgo es 10
    }
}
