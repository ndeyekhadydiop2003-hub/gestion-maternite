<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grossesse;
use Illuminate\Http\Request;
class GrossesseController extends Controller
{
    public function index()
    {
        return response()->json(Grossesse::with('patiente')->get());
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_patient'          => 'required|exists:patientes,id_patient',
            'date_debut'          => 'required|date',
            'date_terme_prevu'    => 'nullable|date',
            'semaines_amenorrhee' => 'nullable|integer',
            'nombre_foetus'       => 'integer|min:1',
            'rhesus'              => 'nullable|in:positif,negatif',
            'grossesse_a_risque'  => 'boolean',
            'type_grossesse'      => 'in:simple,gemellaire,multiple',
            'statut'              => 'in:en_cours,terminee,avortement,fausse_couche',
        ]);
 
        return response()->json(Grossesse::create($validated), 201);
    }
 
    public function show($id)
    {
        return response()->json(
            Grossesse::with([
                'patiente', 'accouchements.nouveauNes', 'consultations'
            ])->findOrFail($id)
        );
    }
 
    public function update(Request $request, $id)
    {
        $grossesse = Grossesse::findOrFail($id);
        $grossesse->update($request->only([
            'date_terme_prevu', 'semaines_amenorrhee', 'nombre_foetus',
            'rhesus', 'grossesse_a_risque', 'type_grossesse', 'statut',
        ]));
        return response()->json($grossesse);
    }
 
    public function destroy($id)
    {
        Grossesse::findOrFail($id)->delete();
        return response()->json(['message' => 'Grossesse supprimée']);
    }
}
 ?>