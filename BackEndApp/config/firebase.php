<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Firebase Credentials
    |--------------------------------------------------------------------------
    |
    | Path to the Firebase service account JSON file.
    | You can download this from Firebase Console:
    | Project Settings > Service Accounts > Generate New Private Key
    |
    */
    'credentials' => env('FIREBASE_CREDENTIALS', storage_path('app/firebase-credentials.json')),

    /*
    |--------------------------------------------------------------------------
    | Firebase Database URL
    |--------------------------------------------------------------------------
    |
    | The URL of your Firebase Realtime Database.
    | Format: https://your-project-id.firebaseio.com
    |
    */
    'database_url' => env('FIREBASE_DATABASE_URL', 'https://dmi-app-88868-default-rtdb.firebaseio.com'),

    /*
    |--------------------------------------------------------------------------
    | Firebase Project ID
    |--------------------------------------------------------------------------
    |
    | Your Firebase project ID from the Firebase Console.
    |
    */
    'project_id' => env('FIREBASE_PROJECT_ID', 'dmi-app-88868'),

    /*
    |--------------------------------------------------------------------------
    | Firebase Storage Bucket
    |--------------------------------------------------------------------------
    |
    | Your Firebase Storage bucket name.
    |
    */
    'storage_bucket' => env('FIREBASE_STORAGE_BUCKET', 'dmi-app-88868.firebasestorage.app'),
];
