<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Examen;
use App\Models\ResultatExamen;
use Illuminate\Http\Request;

class ExamenController extends Controller
{
    public function index()
    {
        return response()->json(Examen::with('prescription', 'resultat')->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date_examen'     => 'required|date',
            'statut'          => 'in:prescrit,en_cours,realise,annule',
            'id_prescription' => 'required|exists:prescriptions,id_prescription',
        ]);
        return response()->json(Examen::create($data), 201);
    }

    public function show(int $id)
    {
        return response()->json(
            Examen::with('prescription.consultation.patiente', 'resultat')->findOrFail($id)
        );
    }

    public function update(Request $request, int $id)
    {
        $e = Examen::findOrFail($id);
        $e->update($request->validate(['statut' => 'in:prescrit,en_cours,realise,annule']));
        return response()->json($e);
    }

    public function destroy(int $id)
    {
        Examen::findOrFail($id)->delete();
        return response()->json(['message' => 'Examen supprimé']);
    }

    public function ajouterResultat(Request $request, int $id)
    {
        $examen = Examen::findOrFail($id);
        $data   = $request->validate([
            'valeur'        => 'required|string',
            'est_normal'    => 'required|boolean',
            'date_resultat' => 'required|date',
        ]);
        $resultat = ResultatExamen::updateOrCreate(['id_examen' => $examen->id_examen], $data);
        $examen->update(['statut' => 'realise']);
        return response()->json($resultat, 201);
    }
}
?>