<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsultationPediatrie;
use Illuminate\Http\Request;

class ConsultationPediatreController extends Controller
{
    public function index()
    {
        return response()->json(
            ConsultationPediatrie::with('consultation.patiente', 'nouveauNe')
                ->latest()->paginate(15)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_consultation'   => 'required|exists:consultations,id_consultation',
            'id_nouveau_ne'     => 'nullable|exists:nouveau_nes,id_nouveau_ne',
            'taille'            => 'nullable|numeric|min:10|max:120',
            'perimetre_cranien' => 'nullable|numeric|min:10|max:60',
            'vaccin_a_jour'     => 'boolean',
            'vaccins_notes'     => 'nullable|string',
            'developpement'     => 'nullable|string',
            'allaitement'       => 'nullable|in:maternel,artificiel,mixte,sevrage',
        ]);

        $cp = ConsultationPediatrie::create($data);
        return response()->json($cp->load('consultation.patiente', 'nouveauNe'), 201);
    }

    public function show(int $id)
    {
        return response()->json(
            ConsultationPediatrie::with('consultation.patiente', 'nouveauNe')->findOrFail($id)
        );
    }

    public function update(Request $request, int $id)
    {
        $cp = ConsultationPediatrie::findOrFail($id);
        $cp->update($request->validate([
            'taille'            => 'nullable|numeric|min:10|max:120',
            'perimetre_cranien' => 'nullable|numeric|min:10|max:60',
            'vaccin_a_jour'     => 'boolean',
            'vaccins_notes'     => 'nullable|string',
            'developpement'     => 'nullable|string',
            'allaitement'       => 'nullable|in:maternel,artificiel,mixte,sevrage',
        ]));
        return response()->json($cp);
    }

    public function destroy(int $id)
    {
        ConsultationPediatrie::findOrFail($id)->delete();
        return response()->json(['message' => 'Consultation pédiatrique supprimée']);
    }

    // ── Toutes les consultations pédiatriques d'un bébé ──────────────────────
   public function parBebe(int $id_nouveau_ne)
{
    $data = ConsultationPediatrie::with('consultation.personnel.utilisateur')
        ->where('id_nouveau_ne', $id_nouveau_ne)
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function ($cp) {
            return [
                'date'              => $cp->consultation->date_consultation ?? $cp->created_at,
                'poids'             => $cp->consultation->poids             ?? null,
                'taille'            => $cp->taille,
                'perimetre_cranien' => $cp->perimetre_cranien,
                'allaitement'       => $cp->allaitement,
                'developpement'     => $cp->developpement,
                'vaccin_a_jour'     => $cp->vaccin_a_jour,
                'vaccins_notes'     => $cp->vaccins_notes,
                // ✅ Données consultation complètes
                'consultation' => [
                    'id_consultation'    => $cp->consultation->id_consultation,
                    'date_consultation'  => $cp->consultation->date_consultation,
                    'motif_consultation' => $cp->consultation->motif_consultation,
                    'observation'        => $cp->consultation->observation,
                    'poids'              => $cp->consultation->poids,
                    'personnel'          => $cp->consultation->personnel,
                ],
            ];
        });

    return response()->json($data);
}
}
