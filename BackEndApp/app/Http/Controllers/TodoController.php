<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TodoController extends Controller
{
    /**
     * Display a listing of todos for the authenticated user.
     * Zero-Trust: Solo muestra los TODOs del usuario autenticado.
     * RBAC: Admin puede ver todos, User solo los suyos.
     */
    public function index(Request $request)
    {
        try {
            $user = auth()->user();

            // RBAC: Admin puede ver todos los TODOs
            if ($user->isAdmin()) {
                $todos = Todo::with('user:id,name,email')->latest()->get();
            } else {
                // Zero-Trust: Users y Guests solo ven sus propios TODOs
                $todos = Todo::forUser($user->id)->latest()->get();
            }

            return response()->json([
                'success' => true,
                'data' => $todos,
                'message' => 'TODOs recuperados exitosamente',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener TODOs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener TODOs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created todo in storage.
     * Zero-Trust: Solo puede crear TODOs para sí mismo.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Zero-Trust: Asignar automáticamente el user_id del usuario autenticado
            $todo = Todo::create([
                'user_id' => auth()->id(),
                'title' => $request->title,
                'description' => $request->description,
                'completed' => false,
            ]);

            return response()->json([
                'success' => true,
                'data' => $todo,
                'message' => 'TODO creado exitosamente',
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear TODO: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear TODO',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified todo.
     * Zero-Trust: Solo puede ver sus propios TODOs (excepto admin).
     */
    public function show(string $id)
    {
        try {
            $user = auth()->user();
            $todo = Todo::with('user:id,name,email')->find($id);

            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'TODO no encontrado',
                ], 404);
            }

            // Zero-Trust: Verificar ownership (excepto admin)
            if (!$user->isAdmin() && $todo->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para ver este TODO',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $todo,
                'message' => 'TODO recuperado exitosamente',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener TODO: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener TODO',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified todo in storage.
     * Zero-Trust: Solo puede actualizar sus propios TODOs (excepto admin).
     */
    public function update(Request $request, string $id)
    {
        try {
            $user = auth()->user();
            $todo = Todo::find($id);

            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'TODO no encontrado',
                ], 404);
            }

            // Zero-Trust: Verificar ownership (excepto admin)
            if (!$user->isAdmin() && $todo->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para actualizar este TODO',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'completed' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $todo->update($request->only(['title', 'description', 'completed']));

            return response()->json([
                'success' => true,
                'data' => $todo->fresh(),
                'message' => 'TODO actualizado exitosamente',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al actualizar TODO: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar TODO',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified todo from storage.
     * Zero-Trust: Solo puede eliminar sus propios TODOs (excepto admin).
     * RBAC: Admin puede eliminar cualquier TODO.
     */
    public function destroy(string $id)
    {
        try {
            $user = auth()->user();
            $todo = Todo::find($id);

            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'TODO no encontrado',
                ], 404);
            }

            // Zero-Trust: Verificar ownership (excepto admin)
            if (!$user->isAdmin() && $todo->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para eliminar este TODO',
                ], 403);
            }

            $todo->delete();

            return response()->json([
                'success' => true,
                'message' => 'TODO eliminado exitosamente',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al eliminar TODO: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar TODO',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
