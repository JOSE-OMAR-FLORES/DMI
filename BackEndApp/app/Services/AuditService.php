<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuditService
{
    /**
     * Registra un evento de autenticación
     *
     * @param User $user
     * @param string $eventType
     * @param Request $request
     * @param array $additionalData
     * @return void
     */
    public function logAuthEvent(User $user, string $eventType, Request $request, array $additionalData = []): void
    {
        $data = [
            'user_id' => $user->id,
            'email' => $user->email,
            'event' => $eventType,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
            'path' => $request->path(),
            'method' => $request->method(),
        ];

        // Merge additional data
        $data = array_merge($data, $additionalData);
        
        // Log the event
        Log::channel('auth')->info("Auth event: {$eventType}", $data);
        
        // En un escenario de producción, se podría almacenar en base de datos
        // o enviar a un servicio externo de monitoreo
    }
    
    /**
     * Registra un intento fallido de autenticación
     *
     * @param string $identifier
     * @param string $reason
     * @param Request $request
     * @return void
     */
    public function logFailedAuthAttempt(string $identifier, string $reason, Request $request): void
    {
        $data = [
            'identifier' => $identifier, // email o username
            'reason' => $reason,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ];
        
        Log::channel('auth')->warning("Failed auth attempt: {$reason}", $data);
    }
    
    /**
     * Registra un evento de acceso a recurso
     *
     * @param User $user
     * @param string $resource
     * @param string $action
     * @param Request $request
     * @param bool $success
     * @param string|null $reason
     * @return void
     */
    public function logResourceAccess(
        User $user, 
        string $resource, 
        string $action, 
        Request $request, 
        bool $success = true, 
        ?string $reason = null
    ): void {
        $data = [
            'user_id' => $user->id,
            'resource' => $resource,
            'action' => $action,
            'success' => $success,
            'reason' => $reason,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ];
        
        if ($success) {
            Log::channel('access')->info("Resource access: {$resource}.{$action}", $data);
        } else {
            Log::channel('access')->warning("Resource access denied: {$resource}.{$action}", $data);
        }
    }
    
    /**
     * Registra un cambio de estado de MFA
     *
     * @param User $user
     * @param string $action
     * @param Request $request
     * @param bool $success
     * @param array $additionalData
     * @return void
     */
    public function logMFAEvent(
        User $user, 
        string $action, 
        Request $request, 
        bool $success = true, 
        array $additionalData = []
    ): void {
        $data = [
            'user_id' => $user->id,
            'action' => $action,
            'success' => $success,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ];
        
        $data = array_merge($data, $additionalData);
        
        $logMessage = "MFA {$action}" . ($success ? ' successful' : ' failed');
        
        if ($success) {
            Log::channel('auth')->info($logMessage, $data);
        } else {
            Log::channel('auth')->warning($logMessage, $data);
        }
    }
}