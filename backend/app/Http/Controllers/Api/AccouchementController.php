<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accouchement;
use Illuminate\Http\Request;
class AccouchementController extends Controller
{
    public function index()
    {
        return response()->json(Accouchement::with(['grossesse', 'personnel'])->get());
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_grossesse'       => 'required|exists:grossesses,id_grossesse',
            'id_personnel'       => 'nullable|exists:personnel_medical,id_personnel',
            'date_accouchement'  => 'required|date',
            'type_accouchement'  => 'required|in:voie_basse,cesarienne,forceps,ventouse',
            'duree_travail'      => 'nullable|integer',
            'complication'       => 'nullable|string',
            'statut'             => 'in:en_cours,termine,complique',
        ]);
 
        return response()->json(Accouchement::create($validated), 201);
    }
 
    public function show($id)
    {
        return response()->json(
            Accouchement::with(['grossesse.patiente', 'personnel', 'nouveauNes'])
                        ->findOrFail($id)
        );
    }
 
    public function update(Request $request, $id)
    {
        $accouchement = Accouchement::findOrFail($id);
        $accouchement->update($request->only([
            'type_accouchement', 'duree_travail', 'complication', 'statut'
        ]));
        return response()->json($accouchement);
    }
 
    public function destroy($id)
    {
        Accouchement::findOrFail($id)->delete();
        return response()->json(['message' => 'Accouchement supprimé']);
    }
}

?>