<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;
use App\Services\AuditService;

class FirebaseAuthMiddleware
{
    protected $auditService;
    
    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }
    
    public function handle(Request $request, Closure $next)
    {
        try {
            $token = $request->bearerToken();

            if (!$token) {
                return response()->json(['error' => 'Token no proporcionado'], 401);
            }

            // Verificar token JWT personalizado
            $decoded = $this->verifyCustomToken($token);
            
            // Obtener claims y uid
            $uid = $decoded->sub;
            $mfaVerified = $decoded->mfa_verified ?? false;
            
            // Buscar usuario en nuestra BD
            $user = User::where('firebase_uid', $uid)->first();
            
            if (!$user) {
                return response()->json(['error' => 'Usuario no encontrado'], 404);
            }

            // Evaluar nivel de riesgo
            $contextData = [
                'ip' => $request->ip(),
                'device_id' => $request->header('X-Device-ID'),
                'location' => $request->header('X-Location'),
                'user_agent' => $request->userAgent(),
                'resource_type' => $this->getResourceSensitivityLevel($request)
            ];
            
            $riskLevel = $user->evaluateRiskLevel($contextData);
            
            // Ajustar nivel de autenticación según el riesgo
            if (($user->mfa_enabled || $riskLevel >= 5) && !$mfaVerified) {
                Log::warning('MFA requerido debido a nivel de riesgo elevado', [
                    'user_id' => $user->id,
                    'risk_level' => $riskLevel,
                    'ip' => $request->ip()
                ]);
                
                return response()->json([
                    'error' => 'MFA requerido', 
                    'code' => 'MFA_REQUIRED',
                    'risk_level' => $riskLevel
                ], 403);
            }

            // Verificar nivel de riesgo y privilegios
            if (!$this->checkPrivileges($user, $request)) {
                // Registro detallado de denegación de acceso
                $this->auditService->logResourceAccess(
                    $user,
                    $request->path(),
                    $request->method(),
                    $request,
                    false,
                    'Privilegios insuficientes'
                );
                return response()->json(['error' => 'Privilegios insuficientes'], 403);
            }

            // Registro de auditoría avanzado
            $resourceType = $this->getResourceSensitivityLevel($request);
            $this->auditService->logAuthEvent($user, 'access_authorized', $request, [
                'mfa_verified' => $mfaVerified,
                'risk_level' => $riskLevel ?? 0,
                'resource_type' => $resourceType,
                'route' => $request->route() ? $request->route()->getName() : $request->path()
            ]);

            // También registramos acceso al recurso
            $this->auditService->logResourceAccess(
                $user,
                $request->path(),
                $request->method(),
                $request,
                true
            );

            // Adjuntar usuario a request
            $request->merge(['user' => $user]);
            
            return $next($request);

        } catch (Exception $e) {
            Log::error('Error validando token JWT', [
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);
            
            return response()->json(['error' => 'Token inválido'], 401);
        }
    }

    /**
     * Verificar un token JWT personalizado
     *
     * @param string $token
     * @return object
     * @throws Exception
     */
    protected function verifyCustomToken(string $token): object
    {
        $key = config('jwt.secret');
        $algorithm = config('jwt.algo', 'HS256');
        
        try {
            return JWT::decode($token, new Key($key, $algorithm));
        } catch (Exception $e) {
            Log::error('Error decodificando JWT', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Verificar nivel de privilegios del usuario
     *
     * @param User $user
     * @param Request $request
     * @return bool
     */
    protected function checkPrivileges(User $user, Request $request): bool
    {
        // TODO: Implementar lógica de verificación de privilegios específica
        // Por ejemplo: roles, permisos por ruta, etc.
        return true;
    }
    
    /**
     * Determina el nivel de sensibilidad del recurso solicitado
     *
     * @param Request $request
     * @return string 'standard'|'sensitive'|'critical'
     */
    protected function getResourceSensitivityLevel(Request $request): string
    {
        // Lista de rutas sensibles que requieren mayor seguridad
        $sensitiveRoutes = [
            'api/users/*',
            'api/admin/*',
            'api/finance/*',
            'api/auth/update-*',
            'api/auth/toggle-*',
            'api/payments/*',
            'api/settings/*'
        ];
        
        // Lista de rutas críticas que requieren seguridad máxima
        $criticalRoutes = [
            'api/admin/users/delete',
            'api/admin/system-settings',
            'api/auth/delete-account',
            'api/payments/transfer'
        ];
        
        $path = $request->path();
        
        // Verificar si es una ruta crítica
        foreach ($criticalRoutes as $route) {
            if ($this->routeMatches($route, $path)) {
                return 'critical';
            }
        }
        
        // Verificar si es una ruta sensible
        foreach ($sensitiveRoutes as $route) {
            if ($this->routeMatches($route, $path)) {
                return 'sensitive';
            }
        }
        
        // Por defecto, rutas estándar
        return 'standard';
    }
    
    /**
     * Verifica si una ruta coincide con un patrón
     *
     * @param string $pattern
     * @param string $path
     * @return bool
     */
    protected function routeMatches(string $pattern, string $path): bool
    {
        // Convertir el patrón a expresión regular
        $pattern = preg_quote($pattern, '/');
        $pattern = str_replace('\*', '.*', $pattern);
        return (bool) preg_match('/^' . $pattern . '$/', $path);
    }
}