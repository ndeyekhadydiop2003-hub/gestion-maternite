<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NouveauNe;
use Illuminate\Http\Request;
class NouveauNeController extends Controller
{
    public function index()
    {
        return response()->json(NouveauNe::with('accouchement')->get());
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_accouchement'  => 'required|exists:accouchements,id_accouchement',
            'id_patient'       => 'nullable|exists:patientes,id_patient',
            'sexe'             => 'required|in:masculin,feminin,indetermine',
            'poids_naissance'  => 'nullable|numeric',
            'taille'           => 'nullable|numeric',
            'apgar_1min'       => 'nullable|integer|min:0|max:10',
            'apgar_5min'       => 'nullable|integer|min:0|max:10',
            'etat_sante'       => 'in:bon,moyen,critique',
        ]);
 
        return response()->json(NouveauNe::create($validated), 201);
    }
 
    public function show($id)
    {
        return response()->json(
            NouveauNe::with(['accouchement.grossesse.patiente', 'dossierPatient'])
                     ->findOrFail($id)
        );
    }
 
    public function update(Request $request, $id)
    {
        $nouveauNe = NouveauNe::findOrFail($id);
        $nouveauNe->update($request->only([
            'id_patient', 'sexe', 'poids_naissance',
            'taille', 'apgar_1min', 'apgar_5min', 'etat_sante',
        ]));
        return response()->json($nouveauNe);
    }
 
    public function destroy($id)
    {
        NouveauNe::findOrFail($id)->delete();
        return response()->json(['message' => 'Nouveau-né supprimé']);
    }
}
?>