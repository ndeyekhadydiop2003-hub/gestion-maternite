<?php
// ============================================================
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    public function index()
    {
        return response()->json(
            Salle::with('lits')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'      => 'required|string|max:100',
            'type'     => 'required|string|max:50',
            'capacite' => 'required|integer|min:1',
        ]);

        $salle = Salle::create($data);

        return response()->json($salle, 201);
    }

    public function show(Salle $salle)
    {
        return response()->json(
            $salle->load('lits.hospitalisations')
        );
    }

    public function update(Request $request, Salle $salle)
    {
        $data = $request->validate([
            'nom'      => 'sometimes|string|max:100',
            'type'     => 'sometimes|string|max:50',
            'capacite' => 'sometimes|integer|min:1',
        ]);

        $salle->update($data);

        return response()->json($salle->load('lits'));
    }

    public function destroy(Salle $salle)
    {
        $litsOccupes = $salle->lits()
            ->whereHas('hospitalisations', fn($q) => $q->whereNull('date_sortie'))
            ->exists();

        if ($litsOccupes) {
            return response()->json([
                'message' => 'Impossible de supprimer une salle avec des lits occupés.'
            ], 422);
        }

        $salle->delete();
        return response()->json(['message' => 'Salle supprimée.']);
    }
}
?>