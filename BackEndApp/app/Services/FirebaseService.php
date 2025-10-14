<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth;
use Kreait\Firebase\Database;
use Kreait\Firebase\Storage;
use Kreait\Firebase\Messaging;

class FirebaseService
{
    protected $factory;
    protected $auth;
    protected $database;
    protected $storage;
    protected $messaging;

    public function __construct()
    {
        $credentialsPath = config('firebase.credentials');
        
        // Verificar si el archivo de credenciales existe
        if (!file_exists($credentialsPath)) {
            throw new \Exception("Firebase credentials file not found at: {$credentialsPath}");
        }

        $this->factory = (new Factory)
            ->withServiceAccount($credentialsPath)
            ->withDatabaseUri(config('firebase.database_url'));
    }

    /**
     * Get Firebase Auth instance
     */
    public function auth(): Auth
    {
        if (!$this->auth) {
            $this->auth = $this->factory->createAuth();
        }
        return $this->auth;
    }

    /**
     * Get Firebase Realtime Database instance
     */
    public function database(): Database
    {
        if (!$this->database) {
            $this->database = $this->factory->createDatabase();
        }
        return $this->database;
    }

    /**
     * Get Firebase Storage instance
     */
    public function storage(): Storage
    {
        if (!$this->storage) {
            $this->storage = $this->factory->createStorage();
        }
        return $this->storage;
    }

    /**
     * Get Firebase Cloud Messaging instance
     */
    public function messaging(): Messaging
    {
        if (!$this->messaging) {
            $this->messaging = $this->factory->createMessaging();
        }
        return $this->messaging;
    }

    /**
     * Verify Firebase ID Token
     */
    public function verifyIdToken(string $idToken)
    {
        try {
            return $this->auth()->verifyIdToken($idToken);
        } catch (\Exception $e) {
            throw new \Exception("Invalid Firebase token: " . $e->getMessage());
        }
    }

    /**
     * Create a custom token for a user
     */
    public function createCustomToken(string $uid, array $claims = [])
    {
        return $this->auth()->createCustomToken($uid, $claims);
    }

    /**
     * Get user by UID
     */
    public function getUser(string $uid)
    {
        return $this->auth()->getUser($uid);
    }

    /**
     * Create a new user
     */
    public function createUser(array $properties)
    {
        return $this->auth()->createUser($properties);
    }

    /**
     * Update user
     */
    public function updateUser(string $uid, array $properties)
    {
        return $this->auth()->updateUser($uid, $properties);
    }

    /**
     * Delete user
     */
    public function deleteUser(string $uid)
    {
        return $this->auth()->deleteUser($uid);
    }

    /**
     * Send notification to device token
     */
    public function sendNotification(string $deviceToken, string $title, string $body, array $data = [])
    {
        $message = [
            'token' => $deviceToken,
            'notification' => [
                'title' => $title,
                'body' => $body,
            ],
            'data' => $data,
        ];

        return $this->messaging()->send($message);
    }
}
