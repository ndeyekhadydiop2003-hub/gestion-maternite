<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NouveauNe;
use Illuminate\Http\Request;

class NouveauNeController extends Controller
{
    public function index()
    {
        return response()->json(NouveauNe::with('accouchement.grossesse.patiente')->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sexe'             => 'required|in:M,F,indetermine',
            'poids_naissance'  => 'nullable|numeric|min:0.1|max:10',
            'taille'           => 'nullable|numeric|min:10|max:70',
            'score_apgar_1min' => 'nullable|integer|min:0|max:10',
            'score_apgar_5min' => 'nullable|integer|min:0|max:10',
            'id_accouchement'  => 'required|exists:accouchements,id_accouchement',
        ]);
        return response()->json(NouveauNe::create($data), 201);
    }

    public function show(int $id)
    {
        return response()->json(NouveauNe::with('accouchement.grossesse.patiente')->findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $n = NouveauNe::findOrFail($id);
        $n->update($request->validate([
            'sexe'             => 'sometimes|in:M,F,indetermine',
            'poids_naissance'  => 'nullable|numeric',
            'taille'           => 'nullable|numeric',
            'score_apgar_1min' => 'nullable|integer|min:0|max:10',
            'score_apgar_5min' => 'nullable|integer|min:0|max:10',
        ]));
        return response()->json($n);
    }

    public function destroy(int $id)
    {
        NouveauNe::findOrFail($id)->delete();
        return response()->json(['message' => 'Nouveau-né supprimé']);
    }
}
?>