<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "🔍 Probando Firebase...\n\n";
    
    // Verificar que el archivo de credenciales existe
    $credentialsPath = storage_path('app/firebase-credentials.json');
    if (!file_exists($credentialsPath)) {
        echo "❌ Error: Archivo de credenciales no encontrado en: {$credentialsPath}\n";
        exit(1);
    }
    echo "✅ Archivo de credenciales encontrado\n";
    echo "📁 Ruta: {$credentialsPath}\n";
    echo "📊 Tamaño: " . filesize($credentialsPath) . " bytes\n\n";
    
    // Intentar cargar el servicio de Firebase
    $firebase = app(\App\Services\FirebaseService::class);
    echo "✅ FirebaseService cargado correctamente\n\n";
    
    // Intentar inicializar Firebase Auth
    $auth = $firebase->auth();
    echo "✅ Firebase Auth inicializado correctamente\n\n";
    
    echo "🎉 ¡TODO FUNCIONA PERFECTAMENTE!\n";
    echo "🔥 Firebase está listo para usar\n\n";
    
    echo "📋 Puedes usar los siguientes métodos:\n";
    echo "  - Firebase Authentication (auth)\n";
    echo "  - Firebase Realtime Database (database)\n";
    echo "  - Firebase Storage (storage)\n";
    echo "  - Firebase Cloud Messaging (messaging)\n";
    echo "  - Firebase MFA (Multi-Factor Authentication)\n\n";
    
} catch (\Exception $e) {
    echo "❌ Error al inicializar Firebase:\n";
    echo "   " . $e->getMessage() . "\n";
    echo "\n📝 Detalles del error:\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}
