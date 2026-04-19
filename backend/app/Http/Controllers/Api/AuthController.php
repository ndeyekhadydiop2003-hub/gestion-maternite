<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
   public function login(Request $request)
{
    $request->validate([
        'login' => 'required|string',
        'mdp'   => 'required|string', // ← changer password en mdp
    ]);

    $user = User::where('login', $request->login)->first();

    if (!$user || !Hash::check($request->mdp, $user->mdp)) { // ← request->mdp
        return response()->json(['message' => 'Identifiants incorrects'], 401);
    }

    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user'  => [
            'id'         => $user->id_utilisateur,
            'login'      => $user->login,
            'role_acces' => $user->role_acces,
        ],
    ]);
}

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}