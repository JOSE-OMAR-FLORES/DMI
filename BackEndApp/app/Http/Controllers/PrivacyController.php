<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Carbon\Carbon;

class PrivacyController extends Controller
{
    /**
     * Guardar consentimientos del usuario
     */
    public function storeConsent(Request $request)
    {
        try {
            $validated = $request->validate([
                'consents' => 'required|array',
                'consents.*.purpose' => 'required|string',
                'consents.*.granted' => 'required|boolean',
                'method' => 'nullable|string',
                'version' => 'nullable|string'
            ]);

            $user = auth()->user();
            $method = $validated['method'] ?? 'explicit_ui';
            $version = $validated['version'] ?? '2.0';

            foreach ($validated['consents'] as $consent) {
                // Buscar consentimiento existente
                $existing = DB::table('user_consents')
                    ->where('user_id', $user->id)
                    ->where('purpose', $consent['purpose'])
                    ->first();

                if ($existing) {
                    // Actualizar consentimiento existente
                    DB::table('user_consents')
                        ->where('id', $existing->id)
                        ->update([
                            'granted' => $consent['granted'],
                            'method' => $method,
                            'version' => $version,
                            'granted_at' => $consent['granted'] ? now() : null,
                            'revoked_at' => !$consent['granted'] ? now() : null,
                            'updated_at' => now()
                        ]);

                    // Registrar en historial
                    $this->logConsentHistory(
                        $user->id,
                        $existing->id,
                        $consent['purpose'],
                        $consent['granted'] ? 'granted' : 'revoked',
                        $existing->granted,
                        $consent['granted'],
                        $method
                    );
                } else {
                    // Crear nuevo consentimiento
                    $newConsent = DB::table('user_consents')->insertGetId([
                        'user_id' => $user->id,
                        'purpose' => $consent['purpose'],
                        'granted' => $consent['granted'],
                        'method' => $method,
                        'legal_basis' => $this->getLegalBasis($consent['purpose']),
                        'version' => $version,
                        'granted_at' => $consent['granted'] ? now() : null,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);

                    // Registrar en historial
                    $this->logConsentHistory(
                        $user->id,
                        $newConsent,
                        $consent['purpose'],
                        'granted',
                        null,
                        $consent['granted'],
                        $method
                    );
                }

                // Registrar actividad de tratamiento
                $this->logProcessingActivity($user->id, [
                    'activity_type' => 'consent_' . ($consent['granted'] ? 'granted' : 'revoked'),
                    'legal_basis' => 'consent',
                    'data_categories' => ['user_preferences'],
                    'purpose' => "User {$method} consent for {$consent['purpose']}"
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Consentimientos guardados correctamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error guardando consentimientos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar consentimientos'
            ], 500);
        }
    }

    /**
     * Obtener consentimientos del usuario
     */
    public function getConsents(Request $request)
    {
        try {
            $user = auth()->user();

            $consents = DB::table('user_consents')
                ->where('user_id', $user->id)
                ->select('purpose', 'granted', 'granted_at', 'revoked_at', 'version')
                ->get();

            $consentMap = [];
            foreach ($consents as $consent) {
                $consentMap[$consent->purpose] = $consent->granted;
            }

            // Asegurar que todos los propósitos estén presentes
            $allPurposes = ['essential', 'analytics', 'personalization', 'marketing', 'third_party_sharing', 'location', 'profiling'];
            foreach ($allPurposes as $purpose) {
                if (!isset($consentMap[$purpose])) {
                    $consentMap[$purpose] = ($purpose === 'essential');
                }
            }

            return response()->json([
                'success' => true,
                'consents' => $consentMap
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo consentimientos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener consentimientos'
            ], 500);
        }
    }

    /**
     * Obtener historial de consentimientos
     */
    public function getConsentHistory(Request $request)
    {
        try {
            $user = auth()->user();

            $history = DB::table('consent_history')
                ->where('user_id', $user->id)
                ->orderBy('timestamp', 'desc')
                ->limit(50)
                ->get();

            return response()->json([
                'success' => true,
                'history' => $history
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo historial: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial'
            ], 500);
        }
    }

    /**
     * Solicitar datos del usuario (GDPR Art. 15, CCPA)
     */
    public function getUserData(Request $request)
    {
        try {
            $user = auth()->user();

            // Recopilar todos los datos del usuario
            $userData = [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                ],
                'todos' => DB::table('todos')->where('user_id', $user->id)->get(),
                'consents' => DB::table('user_consents')->where('user_id', $user->id)->get(),
                'consent_history' => DB::table('consent_history')->where('user_id', $user->id)->get(),
                'processing_activities' => DB::table('processing_activities')->where('user_id', $user->id)->get(),
                'rights_requests' => DB::table('privacy_rights_requests')->where('user_id', $user->id)->get()
            ];

            // Registrar solicitud
            $this->logRightsRequest($user->id, 'right_of_access', 'GDPR');

            return response()->json([
                'success' => true,
                'data' => $userData,
                'generated_at' => now()->toIso8601String()
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo datos de usuario: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener datos'
            ], 500);
        }
    }

    /**
     * Eliminar datos del usuario (GDPR Art. 17, CCPA)
     */
    public function deleteUserData(Request $request)
    {
        try {
            $user = auth()->user();

            // Registrar solicitud ANTES de eliminar
            $this->logRightsRequest($user->id, 'right_to_erasure', 'GDPR');

            DB::beginTransaction();

            // Eliminar datos del usuario (excepto lo legalmente requerido)
            DB::table('todos')->where('user_id', $user->id)->delete();
            DB::table('user_consents')->where('user_id', $user->id)->delete();
            DB::table('consent_history')->where('user_id', $user->id)->delete();
            DB::table('processing_activities')->where('user_id', $user->id)->delete();

            // Marcar usuario como eliminado (soft delete)
            $user->email = 'deleted_' . $user->id . '@deleted.local';
            $user->name = 'Usuario Eliminado';
            $user->save();
            $user->delete(); // Soft delete

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Datos eliminados correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error eliminando datos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar datos'
            ], 500);
        }
    }

    /**
     * CCPA: Do Not Sell My Data
     */
    public function doNotSell(Request $request)
    {
        try {
            $user = auth()->user();

            // Actualizar consentimiento de third_party_sharing
            DB::table('user_consents')
                ->updateOrInsert(
                    ['user_id' => $user->id, 'purpose' => 'third_party_sharing'],
                    [
                        'granted' => false,
                        'method' => 'ccpa_do_not_sell',
                        'legal_basis' => 'CCPA opt-out',
                        'revoked_at' => now(),
                        'updated_at' => now()
                    ]
                );

            // Registrar solicitud
            $this->logRightsRequest($user->id, 'ccpa_do_not_sell', 'CCPA');

            return response()->json([
                'success' => true,
                'message' => 'Preferencia "Do Not Sell" guardada'
            ]);

        } catch (\Exception $e) {
            Log::error('Error en Do Not Sell: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar preferencia'
            ], 500);
        }
    }

    /**
     * Exportar datos en formato portable (GDPR Art. 20)
     */
    public function exportUserData(Request $request)
    {
        try {
            $userData = $this->getUserData($request)->getData();

            // Registrar solicitud
            $user = auth()->user();
            $this->logRightsRequest($user->id, 'right_to_portability', 'GDPR');

            return response()->json([
                'success' => true,
                'data' => $userData->data,
                'format' => 'JSON',
                'exported_at' => now()->toIso8601String()
            ]);

        } catch (\Exception $e) {
            Log::error('Error exportando datos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar datos'
            ], 500);
        }
    }

    // ========== MÉTODOS AUXILIARES ==========

    /**
     * Determinar base legal según el propósito
     */
    private function getLegalBasis($purpose)
    {
        $legalBases = [
            'essential' => 'Contract necessity',
            'analytics' => 'Explicit consent',
            'personalization' => 'Explicit consent',
            'marketing' => 'Explicit consent',
            'third_party_sharing' => 'Explicit consent',
            'location' => 'Explicit consent',
            'profiling' => 'Explicit consent'
        ];

        return $legalBases[$purpose] ?? 'Explicit consent';
    }

    /**
     * Registrar cambio en historial de consentimientos
     */
    private function logConsentHistory($userId, $consentId, $purpose, $action, $previousValue, $newValue, $method)
    {
        DB::table('consent_history')->insert([
            'user_id' => $userId,
            'consent_id' => $consentId,
            'purpose' => $purpose,
            'action' => $action,
            'previous_value' => $previousValue,
            'new_value' => $newValue,
            'method' => $method,
            'timestamp' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Registrar actividad de tratamiento
     */
    private function logProcessingActivity($userId, $activity)
    {
        DB::table('processing_activities')->insert([
            'user_id' => $userId,
            'activity_type' => $activity['activity_type'],
            'legal_basis' => $activity['legal_basis'],
            'data_categories' => json_encode($activity['data_categories']),
            'purpose' => $activity['purpose'],
            'recipient' => $activity['recipient'] ?? 'internal',
            'retention' => $activity['retention'] ?? '365 days',
            'metadata' => isset($activity['metadata']) ? json_encode($activity['metadata']) : null,
            'activity_timestamp' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Registrar solicitud de ejercicio de derechos
     */
    private function logRightsRequest($userId, $type, $regulation)
    {
        $requestId = 'REQ-' . time() . '-' . substr(md5(random_bytes(10)), 0, 9);
        
        // Calcular deadline según regulación
        $deadline = $regulation === 'GDPR' ? now()->addDays(30) : now()->addDays(45);

        DB::table('privacy_rights_requests')->insert([
            'request_id' => $requestId,
            'user_id' => $userId,
            'request_type' => $type,
            'status' => 'pending',
            'regulation' => $regulation,
            'response_deadline' => $deadline,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return $requestId;
    }
}
