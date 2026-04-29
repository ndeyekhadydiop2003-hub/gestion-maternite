<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Soin;
use Illuminate\Http\Request;

class SoinController extends Controller
{
    public function index(Request $request)
    {
        $query = Soin::with('nouveauNe.accouchement.grossesse.patiente', 'personnel');
        if ($request->has('statut')) $query->where('statut', $request->statut);
        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_nouveau_ne' => 'required|exists:nouveau_nes,id_nouveau_ne',
            'id_personnel'  => 'required|exists:personnel_medical,id_personnel',
            'type_soin'     => 'required|string|max:255',
            'date_soin'     => 'required|date',
            'heure_soin'    => 'nullable|date_format:H:i',
            'frequence'     => 'required|string|max:255',
            'note'          => 'nullable|string',
            'statut'        => 'sometimes|string|max:255',
        ]);
        $soin = Soin::create($data);
        return response()->json($soin->load('nouveauNe.accouchement.grossesse.patiente'), 201);
    }

    public function show(int $id)
    {
        return response()->json(
            Soin::with('nouveauNe.accouchement.grossesse.patiente', 'personnel')->findOrFail($id)
        );
    }

    public function update(Request $request, int $id)
    {
        $soin = Soin::findOrFail($id);
        $soin->update($request->validate([
            'type_soin'  => 'sometimes|string|max:255',
            'date_soin'  => 'sometimes|date',
            'heure_soin' => 'nullable|date_format:H:i',
            'frequence'  => 'sometimes|string|max:255',
            'note'       => 'nullable|string',
            'statut'     => 'sometimes|string|max:255',
        ]));
        return response()->json($soin);
    }

    public function destroy(int $id)
    {
        Soin::findOrFail($id)->delete();
        return response()->json(['message' => 'Soin supprimé']);
    }
}
