<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\FirebaseService;
use Symfony\Component\HttpFoundation\Response;

class VerifyFirebaseToken
{
    protected $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'No token provided'
            ], 401);
        }

        try {
            $verifiedIdToken = $this->firebase->verifyIdToken($token);
            
            // Add user info to request
            $request->merge([
                'firebase_uid' => $verifiedIdToken->claims()->get('sub'),
                'firebase_user' => $verifiedIdToken->claims()->all()
            ]);

            return $next($request);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired token',
                'error' => $e->getMessage()
            ], 401);
        }
    }
}
