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
            Hospitalisation::with(['patiente', 'lit.salle', 'personnel'])->get()
        );
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_patient'   => 'required|exists:patientes,id_patient',
            'id_lit'       => 'required|exists:lits,id_lit',
            'id_personnel' => 'nullable|exists:personnel_medical,id_personnel',
            'date_entree'  => 'required|date',
            'date_sortie'  => 'nullable|date|after:date_entree',
            'motif'        => 'required|string',
            'statut'       => 'in:en_cours,terminee,transferee',
        ]);
 
        // Marquer le lit comme occupé
        Lit::findOrFail($validated['id_lit'])->update(['statut' => 'occupe']);
 
        return response()->json(Hospitalisation::create($validated), 201);
    }
 
    public function show($id)
    {
        return response()->json(
            Hospitalisation::with(['patiente', 'lit.salle', 'personnel'])->findOrFail($id)
        );
    }
 
    public function update(Request $request, $id)
    {
        $hosp = Hospitalisation::findOrFail($id);
        $hosp->update($request->only(['date_sortie', 'motif', 'statut']));
 
        // Libérer le lit si hospitalisiation terminée
        if ($request->statut === 'terminee') {
            Lit::find($hosp->id_lit)->update(['statut' => 'disponible']);
        }
 
        return response()->json($hosp);
    }
 
    public function destroy($id)
    {
        Hospitalisation::findOrFail($id)->delete();
        return response()->json(['message' => 'Hospitalisation supprimée']);
    }
}
