<?php

/*
 * Configuración JWT para la aplicación
 * Adaptado para trabajar con Firebase Auth
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Firebase JWT Configuration
    |--------------------------------------------------------------------------
    |
    | Specify the settings for Firebase JWT verification and token handling
    |
    */
    
    'secret' => env('JWT_SECRET'),
    'ttl' => env('JWT_TTL', 60),
    'refresh_ttl' => env('JWT_REFRESH_TTL', 20160),
    
    'required_claims' => [
        'iss',
        'iat',
        'exp',
        'sub',
        'aud',
    ],
    
    'persistent_claims' => [
        // 'foo',
        // 'bar',
    ],
    
    'lock_subject' => true,
    'leeway' => env('JWT_LEEWAY', 0),
    'blacklist_enabled' => env('JWT_BLACKLIST_ENABLED', true),
    'blacklist_grace_period' => env('JWT_BLACKLIST_GRACE_PERIOD', 0),
    'decrypt_cookies' => false,
    
    'algo' => env('JWT_ALGO', 'HS256'),
    
    'firebase' => [
        'project_id' => env('FIREBASE_PROJECT_ID', ''),
        'credentials_path' => env('FIREBASE_CREDENTIALS', storage_path('app/firebase/firebase-credentials.json')),
    ],
    
    // Firebase verification settings
    'verify_iss' => true,
    'verify_aud' => true,
    'verify_sub' => false,
];