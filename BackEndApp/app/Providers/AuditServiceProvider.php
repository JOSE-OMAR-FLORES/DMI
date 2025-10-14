<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\LineFormatter;

class AuditServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Definimos canales de log específicos para auditoría en config/logging.php
        // Esta es una mejor práctica que manipular los canales directamente
        // Ver la documentación: modificar config/logging.php para añadir:
        //
        // 'auth' => [
        //     'driver' => 'daily',
        //     'path' => storage_path('logs/auth.log'),
        //     'level' => 'info',
        //     'days' => 30,
        // ],
        // 'access' => [
        //     'driver' => 'daily',
        //     'path' => storage_path('logs/access.log'),
        //     'level' => 'info',
        //     'days' => 30,
        // ],
        // 'security' => [
        //     'driver' => 'daily',
        //     'path' => storage_path('logs/security.log'),
        //     'level' => 'info',
        //     'days' => 30,
        // ]
        
        // Aquí solo aseguramos que existan los directorios necesarios
        $this->ensureLogDirectoriesExist();
    }
    
    /**
     * Asegurarse de que los directorios para logs existan
     */
    protected function ensureLogDirectoriesExist(): void
    {
        $logPath = storage_path('logs');
        
        if (!file_exists($logPath)) {
            mkdir($logPath, 0755, true);
        }
    }
    
    /**
     * Configurar handler para logs de auditoría
     */
    protected function configureHandler(string $path, int $level = Logger::INFO)
    {
        // Formato que incluye más detalles útiles para auditoría
        $dateFormat = 'Y-m-d H:i:s';
        $output = "[%datetime%] %channel%.%level_name%: %message% %context% %extra%\n";
        $formatter = new LineFormatter($output, $dateFormat);
        
        $handler = new StreamHandler($path, $level);
        $handler->setFormatter($formatter);
        
        return $handler;
    }
}