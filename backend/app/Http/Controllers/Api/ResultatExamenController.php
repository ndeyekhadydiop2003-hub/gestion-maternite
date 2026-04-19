<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResultatExamen;
use Illuminate\Http\Request;

class ResultatExamenController extends Controller
{
    public function index()
    {
        return response()->json(ResultatExamen::with('examen')->latest()->paginate(15));
    }

    public function show(int $id)
    {
        return response()->json(ResultatExamen::with('examen.prescription')->findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $r = ResultatExamen::findOrFail($id);
        $r->update($request->validate([
            'valeur'        => 'sometimes|string',
            'est_normal'    => 'sometimes|boolean',
            'date_resultat' => 'sometimes|date',
        ]));
        return response()->json($r);
    }

    public function destroy(int $id)
    {
        ResultatExamen::findOrFail($id)->delete();
        return response()->json(['message' => 'Résultat supprimé']);
    }
}