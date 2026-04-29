<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vaccin;
use App\Models\NouveauNe;
use Illuminate\Http\Request;

class VaccinController extends Controller
{
    public function index()
    {
        $bbs = \App\Models\NouveauNe::with([
            'accouchement.grossesse.patiente',
            'vaccins' => function($q) {
                $q->orderBy('created_at', 'desc');
            }
        ])->orderBy('id_nouveau_ne', 'desc')->get();

        return response()->json($bbs);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_nouveau_ne'       => 'required|exists:nouveau_nes,id_nouveau_ne',
            'nom_vaccin'          => 'required|in:BCG,Hepatite_B,Polio,Pentavalent,Rotavirus,Autre',
            'date_administration' => 'nullable|date',
            'statut'              => 'required|in:fait,prevu,non_fait',
            'lot'                 => 'nullable|string|max:50',
            'site_injection'      => 'nullable|string|max:100',
            'observations'        => 'nullable|string',
            'id_personnel'        => 'nullable|exists:personnel_medical,id_personnel',
        ]);

        $vaccin = Vaccin::create($data);
        return response()->json($vaccin->load('nouveauNe.accouchement.grossesse.patiente', 'personnel'), 201);
    }

    public function show(int $id)
    {
        return response()->json(
            Vaccin::with('nouveauNe.accouchement.grossesse.patiente', 'personnel')->findOrFail($id)
        );
    }

    public function update(Request $request, int $id)
    {
        $vaccin = Vaccin::findOrFail($id);
        $vaccin->update($request->validate([
            'nom_vaccin'          => 'sometimes|in:BCG,Hepatite_B,Polio,Pentavalent,Rotavirus,Autre',
            'date_administration' => 'nullable|date',
            'statut'              => 'sometimes|in:fait,prevu,non_fait',
            'lot'                 => 'nullable|string|max:50',
            'site_injection'      => 'nullable|string|max:100',
            'observations'        => 'nullable|string',
            'id_personnel'        => 'nullable|exists:personnel_medical,id_personnel',
        ]));
        return response()->json($vaccin);
    }

    public function destroy(int $id)
    {
        Vaccin::findOrFail($id)->delete();
        return response()->json(['message' => 'Vaccin supprimé']);
    }

    // Vaccins d'un bébé spécifique
    public function parBebe(int $idNouveauNe)
    {
        $vaccins = Vaccin::with('personnel.utilisateur')
            ->where('id_nouveau_ne', $idNouveauNe)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($vaccins);
    }
}
