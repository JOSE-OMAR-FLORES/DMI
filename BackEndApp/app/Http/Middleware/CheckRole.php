<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request - Zero-Trust RBAC Implementation.
     * Verifica que el usuario autenticado tenga el rol requerido.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Roles permitidos para acceder al recurso
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Zero-Trust: Verificar que el usuario esté autenticado
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado. Acceso denegado.',
            ], 401);
        }

        $user = auth()->user();

        // Zero-Trust: Verificar que el usuario tenga un rol asignado
        if (!$user->role) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario sin rol asignado. Acceso denegado.',
            ], 403);
        }

        // RBAC: Verificar que el rol del usuario esté en los roles permitidos
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para acceder a este recurso.',
                'required_roles' => $roles,
                'your_role' => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
