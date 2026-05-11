<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsultationPediatrie;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConsultationPediatrieController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $personnel = DB::table('personnel_medical')
            ->where('id_utilisateur', $user->id_utilisateur)->first();
        $idPersonnel = $personnel?->id_personnel;

        $query = ConsultationPediatrie::with('consultation.patiente', 'nouveauNe')
            ->latest();

        if ($idPersonnel) {
            $query->whereHas('consultation', function ($q) use ($idPersonnel) {
                $q->where('id_personnel', $idPersonnel);
            });
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_nouveau_ne'     => 'required|exists:nouveau_nes,id_nouveau_ne',
            'id_patient'        => 'required|exists:patientes,id_patient',

            // Champs table 'consultations'
            'date_consultation'  => 'required|date',
            'motif_consultation' => 'nullable|string|max:255',
            'poids'              => 'nullable|numeric|min:0|max:30',
            'temperature'        => 'nullable|numeric|min:30|max:45',
            'tension'            => 'nullable|string|max:20',           // ← Corrigé
            'observation'        => 'nullable|string',

            // Champs table 'consultation_pediatrie'
            'taille'             => 'nullable|numeric|min:10|max:120',
            'perimetre_cranien'  => 'nullable|numeric|min:10|max:60',
            'vaccin_a_jour'      => 'boolean',
            'vaccins_notes'      => 'nullable|string',
            'developpement'      => 'nullable|string',
            'allaitement'        => 'nullable|in:maternel,artificiel,mixte,sevrage',
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                $user = $request->user();
                $personnel = DB::table('personnel_medical')
                    ->where('id_utilisateur', $user->id_utilisateur)
                    ->first();

                if (!$personnel) {
                    throw new \Exception("Personnel médical non trouvé.");
                }

                // Création de la consultation principale
                $consultationBase = Consultation::create([
                    'id_patient'        => $validated['id_patient'],
                    'id_personnel'      => $personnel->id_personnel,
                    'date_consultation' => $validated['date_consultation'],
                    'motif_consultation'=> $validated['motif_consultation'] ?? null,
                    'poids'             => $validated['poids'],
                    'temperature'       => $validated['temperature'],
                    'tension'           => $validated['tension'],
                    'observation'       => $validated['observation'],
                    'id_grossesse'      => null,
                ]);

                // Création de la partie pédiatrique
                $cp = ConsultationPediatrie::create([
                    'id_consultation'   => $consultationBase->id_consultation,
                    'id_nouveau_ne'     => $validated['id_nouveau_ne'],
                    'taille'            => $validated['taille'],
                    'perimetre_cranien' => $validated['perimetre_cranien'],
                    'vaccin_a_jour'     => $validated['vaccin_a_jour'] ?? false,
                    'vaccins_notes'     => $validated['vaccins_notes'],
                    'developpement'     => $validated['developpement'],
                    'allaitement'       => $validated['allaitement'],
                ]);

                return response()->json(
                    $cp->load('consultation.patiente', 'nouveauNe'),
                    201
                );
            });
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur serveur',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show( $id)
    {

        $id = (int) $id;
         return response()->json(
            ConsultationPediatrie::with('consultation.patiente', 'nouveauNe')->findOrFail($id)
        );
    }

    public function update(Request $request,  $id)

    {
        $id = (int) $id;
        $cp = ConsultationPediatrie::with('consultation')->findOrFail($id);

        $validated = $request->validate([
            'date_consultation'  => 'nullable|date',
            'motif_consultation' => 'nullable|string|max:255',
            'poids'              => 'nullable|numeric',
            'temperature'        => 'nullable|numeric',
            'tension'            => 'nullable|string|max:20',
            'observation'        => 'nullable|string',
            'taille'             => 'nullable|numeric',
            'perimetre_cranien'  => 'nullable|numeric',
            'allaitement'        => 'nullable|in:maternel,artificiel,mixte,sevrage',
        ]);

        DB::transaction(function () use ($cp, $validated) {
            $cp->consultation->update([
                'date_consultation'  => $validated['date_consultation'] ?? $cp->consultation->date_consultation,
                'motif_consultation' => $validated['motif_consultation'] ?? $cp->consultation->motif_consultation,
                'poids'              => $validated['poids'] ?? $cp->consultation->poids,
                'temperature'        => $validated['temperature'] ?? $cp->consultation->temperature,
                'tension'            => $validated['tension'] ?? $cp->consultation->tension,
                'observation'        => $validated['observation'] ?? $cp->consultation->observation,
            ]);

            $cp->update($validated);
        });

        return response()->json($cp->load('consultation'));
    }

    public function destroy( $id)
    {
        $id = (int) $id;
        ConsultationPediatrie::findOrFail($id)->delete();
        return response()->json(['message' => 'Consultation pédiatrique supprimée']);
    }

    public function parBebe( $id_nouveau_ne)
    {
        $id_nouveau_ne = (int) $id_nouveau_ne;
        $data = ConsultationPediatrie::with([
            'consultation' => function($q) {
                $q->select('id_consultation', 'date_consultation', 'motif_consultation',
                          'observation', 'poids', 'temperature', 'tension', 'id_personnel');
            },
            'consultation.personnel.utilisateur'
        ])
        ->where('id_nouveau_ne', $id_nouveau_ne)
        ->orderBy('created_at', 'desc')   // ← mieux d'avoir les plus récentes en premier
        ->get()
        ->map(function ($cp) {
            return [
                'id_cp'             => $cp->id,
                'id_consultation'   => $cp->consultation->id_consultation,
                'date_consultation' => $cp->consultation->date_consultation,
                'motif_consultation'=> $cp->consultation->motif_consultation,
                'observation'       => $cp->consultation->observation,
                'poids'             => $cp->consultation->poids,
                'temperature'       => $cp->consultation->temperature,  // ← aussi utile
                'tension'           => $cp->consultation->tension,
                'taille'            => $cp->taille,
                'perimetre_cranien' => $cp->perimetre_cranien,
                'allaitement'       => $cp->allaitement,
                'developpement'     => $cp->developpement,
                'vaccin_a_jour'     => $cp->vaccin_a_jour,
                'vaccins_notes'     => $cp->vaccins_notes,
                'personnel'         => $cp->consultation->personnel,
            ];
        });

        return response()->json($data);
    }
}
