<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanifierRv;
use App\Models\RendezVous;
use Illuminate\Http\Request;

class PlanifierRvController extends Controller {

    // ── GET /api/planifier-rv ──────────────────────────────────
    public function index() {
        return response()->json(
            PlanifierRv::with(['patiente', 'personnel', 'rendezVous'])
                ->orderBy('priorite', 'desc')
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    // ── POST /api/planifier-rv ─────────────────────────────────
    public function store(Request $request) {
        $data = $request->validate([
            'id_patient'       => 'required|exists:patientes,id_patient',
            'id_personnel'     => 'required|exists:personnel_medical,id_personnel',
            'delai_recommande' => 'nullable|string|max:50',
            'date_souhaitee'   => 'nullable|date',
            'priorite'         => 'in:normale,urgente',
            'motif'            => 'nullable|string',
            'notes'            => 'nullable|string',
        ]);

        $data['statut'] = 'en_attente';

        $rv = PlanifierRv::create($data);
        return response()->json($rv->load(['patiente', 'personnel']), 201);
    }

    // ── GET /api/planifier-rv/{id} ─────────────────────────────
    public function show($id) {
        return response()->json(
            PlanifierRv::with(['patiente', 'personnel', 'rendezVous'])->findOrFail($id)
        );
    }

    // ── PUT /api/planifier-rv/{id} ─────────────────────────────
    public function update(Request $request, $id) {
        $planification = PlanifierRv::findOrFail($id);

        $data = $request->validate([
            'delai_recommande' => 'nullable|string|max:50',
            'date_souhaitee'   => 'nullable|date',
            'priorite'         => 'in:normale,urgente',
            'motif'            => 'nullable|string',
            'notes'            => 'nullable|string',
            'statut'           => 'in:en_attente,confirme',
        ]);

        $planification->update($data);
        return response()->json($planification->load(['patiente', 'personnel', 'rendezVous']));
    }

    // ── POST /api/planifier-rv/{id}/confirmer ──────────────────
    // Confirme la planification en créant un vrai RDV
    public function confirmer(Request $request, $id) {
        $planification = PlanifierRv::findOrFail($id);

        $data = $request->validate([
            'date_rv'  => 'required|date',
            'heure_rv' => 'required',
            'motif'    => 'nullable|string',
            'priorite' => 'in:normale,urgente,critique',
        ]);

        // Créer le RDV
        $rdv = RendezVous::create([
            'id_patient'       => $planification->id_patient,
            'id_personnel'     => $planification->id_personnel,
            'id_planification' => $planification->id,
            'date_rv'          => $data['date_rv'],
            'heure_rv'         => $data['heure_rv'],
            'motif'            => $data['motif'] ?? $planification->motif,
            'priorite'         => $data['priorite'] ?? $planification->priorite,
            'statut'           => 'confirme',
        ]);

        // Mettre à jour la planification
        $planification->update([
            'statut' => 'confirme',
            'id_rv'  => $rdv->id_rendez_vous,
        ]);

        return response()->json([
            'message'       => 'RDV confirmé avec succès !',
            'planification' => $planification->load(['patiente', 'personnel']),
            'rendez_vous'   => $rdv->load(['patiente', 'personnel']),
        ], 201);
    }

    // ── DELETE /api/planifier-rv/{id} ──────────────────────────
    public function destroy($id) {
        PlanifierRv::findOrFail($id)->delete();
        return response()->json(['message' => 'Planification supprimée.']);
    }
}
