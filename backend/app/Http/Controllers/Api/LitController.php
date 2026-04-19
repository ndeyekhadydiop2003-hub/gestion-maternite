<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lit;
use Illuminate\Http\Request;

class LitController extends Controller
{
    public function index()
    {
        return response()->json(Lit::with('salle')->get());
    }

    public function disponibles()
    {
        return response()->json(Lit::with('salle')->where('statut', 'libre')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'numero_lit' => 'required|string|unique:lits',
            'statut'     => 'in:libre,occupe,maintenance',
            'id_chambre' => 'required|exists:salles,id_chambre',
        ]);
        return response()->json(Lit::create($data), 201);
    }

    public function show(int $id)
    {
        return response()->json(Lit::with('salle', 'hospitalisations.patiente')->findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $lit = Lit::findOrFail($id);
        $lit->update($request->validate(['statut' => 'in:libre,occupe,maintenance']));
        return response()->json($lit);
    }

    public function destroy(int $id)
    {
        Lit::findOrFail($id)->delete();
        return response()->json(['message' => 'Lit supprimé']);
    }
}?>