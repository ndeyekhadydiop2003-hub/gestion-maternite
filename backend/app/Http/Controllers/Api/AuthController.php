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

    // ─────────────────────────────────────────
// PUT /api/me
// ─────────────────────────────────────────
public function updateMe(Request $request)
{
    $utilisateur = $request->user();

    $request->validate([
        'login' => 'required|string|unique:utilisateurs,login,' . $utilisateur->id_utilisateur . ',id_utilisateur',
    ]);

    $utilisateur->login = $request->login;
    $utilisateur->save();

    return response()->json([
        'message' => 'Identifiant mis à jour avec succès.',
        'login'   => $utilisateur->login,
    ]);
}

// ─────────────────────────────────────────
// PUT /api/me/password
// ─────────────────────────────────────────
public function updatePassword(Request $request)
{
    $utilisateur = $request->user();

    $request->validate([
        'ancien_mdp'  => 'required|string',
        'nouveau_mdp' => 'required|string|min:6',
    ]);

    if (!Hash::check($request->ancien_mdp, $utilisateur->password)) {
        return response()->json(['message' => 'Ancien mot de passe incorrect.'], 422);
    }

    $utilisateur->password = Hash::make($request->nouveau_mdp);
    $utilisateur->save();

    return response()->json(['message' => 'Mot de passe modifié avec succès.']);
}
}


