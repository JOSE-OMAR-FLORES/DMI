<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ApiController extends Controller
{
    /**
     * Muestra el estado de la API
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'api' => 'BackEnd DMI API',
            'status' => 'active',
            'version' => '1.0.0',
            'framework' => 'Laravel ' . app()->version(),
            'php_version' => PHP_VERSION,
            'timestamp' => now()->toISOString(),
            'endpoints' => [
                'health' => '/api/v1/health',
                'status' => '/api/v1/',
                'auth' => [
                    'login' => '/api/v1/auth/login',
                    'register' => '/api/v1/auth/register',
                    'logout' => '/api/v1/auth/logout'
                ]
            ]
        ]);
    }

    /**
     * Health check de la API
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'OK',
            'message' => 'API funcionando correctamente',
            'server_time' => now()->toISOString(),
            'uptime' => 'OK',
            'database' => $this->checkDatabase(),
            'version' => '1.0.0'
        ]);
    }

    /**
     * Verifica la conexión a la base de datos
     */
    private function checkDatabase(): string
    {
        try {
            DB::connection()->getPdo();
            return 'connected';
        } catch (\Exception $e) {
            return 'disconnected';
        }
    }
}