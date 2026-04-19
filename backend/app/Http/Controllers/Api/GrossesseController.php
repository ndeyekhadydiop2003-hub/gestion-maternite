<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grossesse;
use Illuminate\Http\Request;

class GrossesseController extends Controller
{
    public function index(Request $request)
    {
        $query = Grossesse::with('patiente');
        if ($request->has('statut')) $query->where('statut', $request->statut);
        return response()->json($query->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date_debut'          => 'required|date',
            'date_terme_prevu'    => 'nullable|date|after:date_debut',
            'semaines_amenorrhee' => 'nullable|integer|min:1|max:45',
            'statut'              => 'in:en_cours,terminee,interrompue',
            'type_grossesse'      => 'in:simple,gemellaire,multiple',
            'id_patient'          => 'required|exists:patientes,id_patient',
        ]);
        return response()->json(Grossesse::create($data), 201);
    }

    public function show(int $id)
    {
        return response()->json(
            Grossesse::with('patiente', 'consultations.personnel', 'accouchement.nouveauNes')->findOrFail($id)
        );
    }

    public function update(Request $request, int $id)
    {
        $g = Grossesse::findOrFail($id);
        $g->update($request->validate([
            'semaines_amenorrhee' => 'nullable|integer',
            'statut'              => 'in:en_cours,terminee,interrompue',
            'date_terme_prevu'    => 'nullable|date',
        ]));
        return response()->json($g);
    }

    public function destroy(int $id)
    {
        Grossesse::findOrFail($id)->delete();
        return response()->json(['message' => 'Grossesse supprimée']);
    }
}?>