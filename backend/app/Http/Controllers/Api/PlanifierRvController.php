<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanifierRv;
use Illuminate\Http\Request;

class PlanifierRvController extends Controller
{
    public function index(Request $request)
    {
        $query = PlanifierRv::with('patiente', 'personnel', 'rendezVous');

        if ($request->has('statut'))   $query->where('statut',   $request->statut);
        if ($request->has('priorite')) $query->where('priorite', $request->priorite);

        return response()->json(
            $query->orderByRaw("FIELD(priorite, 'urgente', 'normale')")
                  ->orderBy('created_at', 'desc')
                  ->paginate(15)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_patient'       => 'required|exists:patientes,id_patient',
            'id_personnel'     => 'required|exists:personnel_medical,id_personnel',
            'delai_recommande' => 'nullable|string|max:50',
            'priorite'         => 'in:normale,urgente',
            'motif'            => 'nullable|string',
            'statut'           => 'in:en_attente,confirme',
        ]);

        $planification = PlanifierRv::create($data);
        return response()->json(
            $planification->load('patiente', 'personnel'), 201
        );
    }

    public function show(int $id)
    {
        return response()->json(
            PlanifierRv::with('patiente', 'personnel', 'rendezVous')->findOrFail($id)
        );
    }

    // La confirmation se fait maintenant côté RendezVous
    // On met juste le statut à jour
    public function confirmer(Request $request, int $id)
    {
        $planification = PlanifierRv::findOrFail($id);
        $planification->update(['statut' => 'confirme']);
        return response()->json(
            $planification->load('patiente', 'personnel', 'rendezVous')
        );
    }

    public function destroy(int $id)
    {
        PlanifierRv::findOrFail($id)->delete();
        return response()->json(['message' => 'Planification supprimée']);
    }
}
