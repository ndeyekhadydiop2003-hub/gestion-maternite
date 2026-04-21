<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
 

class ConsultationPlanningController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_consultation'      => 'required|exists:consultations,id_consultation',
            'methode_contraceptive'=> 'nullable|string',
            'desir_grossesse'      => 'nullable|in:oui,non,indecis',
            'date_prochaine_visite'=> 'nullable|date',
            'notes'                => 'nullable|string',
        ]);
 
        return response()->json(ConsultationPlanning::create($validated), 201);
    }
 
    public function update(Request $request, $id)
    {
        $detail = ConsultationPlanning::findOrFail($id);
        $detail->update($request->only([
            'methode_contraceptive', 'desir_grossesse',
            'date_prochaine_visite', 'notes',
        ]));
        return response()->json($detail);
    }
}
?>