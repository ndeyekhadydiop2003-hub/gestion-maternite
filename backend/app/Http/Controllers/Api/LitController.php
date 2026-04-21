<?php
// ============================================================
// app/Http/Controllers/Api/LitController.php
// ============================================================
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lit;
use Illuminate\Http\Request;

class LitController extends Controller
{
    public function index()
    {
        return response()->json(
            Lit::with('salle')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_salle' => 'required|exists:salles,id_salle',
            'numero'   => 'required|string|max:20',
            'type'     => 'required|string|max:50',
            'statut'   => 'required|in:disponible,occupé,maintenance',
        ]);

        $lit = Lit::create($data);

        return response()->json($lit->load('salle'), 201);
    }

    public function show(Lit $lit)
    {
        return response()->json($lit->load('salle', 'hospitalisations'));
    }

    public function update(Request $request, Lit $lit)
    {
        $data = $request->validate([
            'id_salle' => 'sometimes|exists:salles,id_salle',
            'numero'   => 'sometimes|string|max:20',
            'type'     => 'sometimes|string|max:50',
            'statut'   => 'sometimes|in:disponible,occupé,maintenance',
        ]);

        $lit->update($data);

        return response()->json($lit->load('salle'));
    }

    public function destroy(Lit $lit)
    {
        // Vérifie qu'aucune hospitalisation active
        $actif = $lit->hospitalisations()->whereNull('date_sortie')->exists();
        if ($actif) {
            return response()->json([
                'message' => 'Impossible de supprimer un lit avec une hospitalisation active.'
            ], 422);
        }

        $lit->delete();
        return response()->json(['message' => 'Lit supprimé.']);
    }
}
