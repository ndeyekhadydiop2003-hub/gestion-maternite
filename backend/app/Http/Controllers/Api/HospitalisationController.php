<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use App\Models\Hospitalisation;
use App\Models\Lit;
use Illuminate\Http\Request;

class HospitalisationController extends Controller
{
    public function index()
    {
        return response()->json(
            Hospitalisation::with('patiente', 'lit.salle', 'accouchement')->latest('date_admission')->paginate(15)
        );
    }

    public function store(Request $request)
{
    $data = $request->validate([
        'date_admission'  => 'required|date',
        'motif'           => 'required|string|max:255',
        'statut'          => 'nullable|in:active,terminee,transferee,en_attente',
        'id_patient'      => 'required|exists:patientes,id_patient',
        'id_lit'          => 'nullable|exists:lits,id_lit',
        'id_accouchement' => 'nullable|exists:accouchements,id_accouchement',
        'id_utilisateur'  => 'nullable|exists:utilisateurs,id_utilisateur',
    ]);

    // Déterminer la priorité selon le motif
    $motif    = strtolower($data['motif']);
    $urgente  = str_contains($motif, 'urgence') || str_contains($motif, 'complication') || str_contains($motif, 'hémorragie') || str_contains($motif, 'hemorragie') || str_contains($motif, 'travail avancé') || str_contains($motif, 'detresse');
    $normale  = str_contains($motif, 'travail') || str_contains($motif, 'accouchement') || str_contains($motif, 'contraction');
    // sinon : stable

    // Lits disponibles en salle Maternité
    $litMaternite = DB::table('lits')
        ->join('salles', 'lits.id_chambre', '=', 'salles.id_chambre')
        ->where('lits.statut', 'libre')
        ->where('salles.type_chambre', 'Maternité')
        ->select('lits.*')
        ->first();

    if ($litMaternite && !empty($data['id_lit'])) {
        // Cas 1 : Lit disponible choisi par la secrétaire
        $lit = Lit::findOrFail($data['id_lit']);
        if ($lit->statut === 'occupe') {
            return response()->json(['message' => 'Ce lit est déjà occupé.'], 422);
        }
        $lit->update(['statut' => 'occupe', 'est_occupe' => true]);
        $data['statut'] = 'active';
        $hospitalisation = Hospitalisation::create($data)->load('patiente', 'lit.salle');
        return response()->json([
            'hospitalisation' => $hospitalisation,
            'message'         => 'Patiente admise — Lit ' . $lit->numero_lit . ' affecté',
            'statut'          => 'active',
            'orientation'     => 'Maternité',
        ], 201);
    }

    // Cas 2 : Aucun lit en Maternité — orienter selon priorité
    if ($urgente) {
        $typeSalle = 'Urgences';
        $msg       = 'Aucun lit disponible — Patiente orientée en Urgences (priorité haute)';
    } elseif ($normale) {
        $typeSalle = 'Salle de travail';
        $msg       = 'Aucun lit disponible — Patiente orientée en Salle de travail';
    } else {
        $typeSalle = 'Salle d\'observation';
        $msg       = 'Aucun lit disponible — Patiente orientée en Salle d\'observation (stable)';
    }

    // Trouver un lit dans la salle correspondante
    $litAlternatif = DB::table('lits')
        ->join('salles', 'lits.id_chambre', '=', 'salles.id_chambre')
        ->where('lits.statut', 'libre')
        ->where('salles.type_chambre', $typeSalle)
        ->select('lits.*')
        ->first();

    if ($litAlternatif) {
        DB::table('lits')->where('id_lit', $litAlternatif->id_lit)->update(['statut' => 'occupe', 'est_occupe' => true]);
        $data['id_lit'] = $litAlternatif->id_lit;
        $data['statut'] = 'en_attente';
    } else {
        // Aucune salle alternative disponible — salle d'attente
        $litAttente = DB::table('lits')
            ->join('salles', 'lits.id_chambre', '=', 'salles.id_chambre')
            ->where('lits.statut', 'libre')
            ->where('salles.type_chambre', "Salle d'attente")
            ->select('lits.*')
            ->first();

        if ($litAttente) {
            DB::table('lits')->where('id_lit', $litAttente->id_lit)->update(['statut' => 'occupe', 'est_occupe' => true]);
            $data['id_lit'] = $litAttente->id_lit;
        } else {
            $data['id_lit'] = Lit::first()->id_lit;
        }
        $data['statut'] = 'en_attente';
        $msg            = 'Aucune place disponible — Patiente mise en salle d\'attente';
        $typeSalle      = 'Salle d\'attente';
    }

    $hospitalisation = Hospitalisation::create($data)->load('patiente', 'lit.salle');
    return response()->json([
        'hospitalisation' => $hospitalisation,
        'message'         => $msg,
        'statut'          => 'en_attente',
        'orientation'     => $typeSalle,
    ], 201);
}

    public function show(int $id)
    {
        return response()->json(
            Hospitalisation::with('patiente', 'lit.salle', 'accouchement.nouveauNes', 'utilisateur')->findOrFail($id)
        );
    }

    public function update(Request $request, int $id)
    {
        $h = Hospitalisation::findOrFail($id);
        $h->update($request->validate([
            'date_sorti' => 'nullable|date',
            'motif'      => 'sometimes|string|max:255',
            'statut'     => 'in:active,terminee,transferee',
        ]));
        return response()->json($h);
    }

    public function destroy(int $id)
    {
        Hospitalisation::findOrFail($id)->delete();
        return response()->json(['message' => 'Hospitalisation supprimée']);
    }

    public function sortie(Request $request, int $id)
    {
        $request->validate(['date_sorti' => 'required|date']);
        $h = Hospitalisation::findOrFail($id);
        $h->update(['date_sorti' => $request->date_sorti, 'statut' => 'terminee']);
        $h->lit->update(['statut' => 'libre', 'est_occupe' => false]);
        return response()->json($h->load('lit'));
    }
}

