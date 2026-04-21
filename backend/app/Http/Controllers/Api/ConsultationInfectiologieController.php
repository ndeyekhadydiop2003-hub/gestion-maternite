<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AntecedentMedical;
use Illuminate\Http\Request;
class ConsultationInfectiologieController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_consultation'  => 'required|exists:consultations,id_consultation',
            'type_infection'   => 'nullable|string',
            'agent_pathogene'  => 'nullable|string',
            'date_diagnostic'  => 'nullable|date',
            'antibiogramme'    => 'nullable|string',
            'traitement_ATB'   => 'nullable|string',
            'statut_resolution'=> 'nullable|in:en_cours,resolu,chronique,echec',
            'risque_neonatal'  => 'nullable|in:faible,modere,eleve',
        ]);
 
        return response()->json(ConsultationInfectiologie::create($validated), 201);
    }
 
    public function update(Request $request, $id)
    {
        $detail = ConsultationInfectiologie::findOrFail($id);
        $detail->update($request->only([
            'type_infection', 'agent_pathogene', 'date_diagnostic',
            'antibiogramme', 'traitement_ATB', 'statut_resolution', 'risque_neonatal',
        ]));
        return response()->json($detail);
    }
}
 
 
?>