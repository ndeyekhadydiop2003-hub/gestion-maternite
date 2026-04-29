<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ─────────────────────────────────────────
    // POST /api/login
    // ─────────────────────────────────────────
    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required|string',
            'password' => 'required|string',
        ]);

        $utilisateur = User::where('login', $request->login)->first();

        if (!$utilisateur || !Hash::check($request->password, $utilisateur->password)) {
            throw ValidationException::withMessages([
                'login' => ['Identifiants incorrects.'],
            ]);
        }

        // Supprime les anciens tokens (une seule session active)
        $utilisateur->tokens()->delete();

        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token'       => $token,
            'token_type'  => 'Bearer',
            'utilisateur' => [
                'id'         => $utilisateur->id_utilisateur,
                'login'      => $utilisateur->login,
                'role_acces' => $utilisateur->role_acces,
                'personnel'  => $utilisateur->personnel,
            ],
        ]);
    }

    // ─────────────────────────────────────────
    // POST /api/logout
    // ─────────────────────────────────────────
    public function logout(Request $request)
    {
        // Supprime uniquement le token actuel
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnecté avec succès.'
        ]);
    }

    // ─────────────────────────────────────────
    // GET /api/me
    // ─────────────────────────────────────────
    public function me(Request $request)
    {
        $utilisateur = $request->user()->load('personnel');

        return response()->json([
            'id'         => $utilisateur->id_utilisateur,
            'login'      => $utilisateur->login,
            'role_acces' => $utilisateur->role_acces,
            'personnel'  => $utilisateur->personnel,
        ]);
    }
}
