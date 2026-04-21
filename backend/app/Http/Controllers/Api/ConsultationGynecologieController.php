<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ConsultationGynecologieController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_consultation'     => 'required|exists:consultations,id_consultation',
            'date_derniere_regles'=> 'nullable|date',
            'cycle_menstruel'     => 'nullable|integer',
            'dernier_frottis'     => 'nullable|date',
            'examen_seins'        => 'nullable|in:normal,anomalie_detectee,non_effectue',
            'diagnostic'          => 'nullable|string',
            'type_contraception'  => 'nullable|string',
        ]);
 
        return response()->json(ConsultationGynecologie::create($validated), 201);
    }
 
    public function update(Request $request, $id)
    {
        $detail = ConsultationGynecologie::findOrFail($id);
        $detail->update($request->only([
            'date_derniere_regles', 'cycle_menstruel', 'dernier_frottis',
            'examen_seins', 'diagnostic', 'type_contraception',
        ]));
        return response()->json($detail);
    }
}
 
class ConsultationPsychologieController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_consultation'  => 'required|exists:consultations,id_consultation',
            'type_suivi'       => 'nullable|string',
            'bilan'            => 'nullable|string',
            'objectifs'        => 'nullable|string',
            'niveau_stress'    => 'nullable|in:faible,modere,eleve,critique',
            'score_edinburgh'  => 'nullable|integer|min:0|max:30',
            'orientation_ext'  => 'nullable|string',
        ]);
 
        return response()->json(ConsultationPsychologie::create($validated), 201);
    }
 
    public function update(Request $request, $id)
    {
        $detail = ConsultationPsychologie::findOrFail($id);
        $detail->update($request->only([
            'type_suivi', 'bilan', 'objectifs',
            'niveau_stress', 'score_edinburgh', 'orientation_ext',
        ]));
        return response()->json($detail);
    }
}
?>