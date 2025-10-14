<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FirebaseService;

class FirebaseAuthController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    /**
     * Verify Firebase token
     */
    public function verifyToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string'
        ]);

        try {
            $verifiedIdToken = $this->firebase->verifyIdToken($request->token);
            
            return response()->json([
                'success' => true,
                'message' => 'Token verified successfully',
                'data' => [
                    'uid' => $verifiedIdToken->claims()->get('sub'),
                    'email' => $verifiedIdToken->claims()->get('email'),
                    'claims' => $verifiedIdToken->claims()->all()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token verification failed',
                'error' => $e->getMessage()
            ], 401);
        }
    }

    /**
     * Get user profile by UID
     */
    public function getUser(Request $request)
    {
        $request->validate([
            'uid' => 'required|string'
        ]);

        try {
            $user = $this->firebase->getUser($request->uid);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'uid' => $user->uid,
                    'email' => $user->email,
                    'displayName' => $user->displayName,
                    'photoURL' => $user->photoUrl,
                    'emailVerified' => $user->emailVerified,
                    'disabled' => $user->disabled,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create custom token
     */
    public function createCustomToken(Request $request)
    {
        $request->validate([
            'uid' => 'required|string',
            'claims' => 'array'
        ]);

        try {
            $customToken = $this->firebase->createCustomToken(
                $request->uid,
                $request->claims ?? []
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Custom token created successfully',
                'data' => [
                    'custom_token' => $customToken->toString()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create custom token',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send push notification
     */
    public function sendNotification(Request $request)
    {
        $request->validate([
            'device_token' => 'required|string',
            'title' => 'required|string',
            'body' => 'required|string',
            'data' => 'array'
        ]);

        try {
            $result = $this->firebase->sendNotification(
                $request->device_token,
                $request->title,
                $request->body,
                $request->data ?? []
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Notification sent successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
