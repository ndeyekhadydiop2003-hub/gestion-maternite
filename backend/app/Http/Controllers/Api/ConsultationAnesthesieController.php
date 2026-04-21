<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ConsultationAnesthesieController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_consultation'        => 'required|exists:consultations,id_consultation',
            'date_consultation_pre_op'=> 'nullable|date',
            'allergie_medicament'    => 'nullable|string',
            'type_anesthesie'        => 'nullable|string',
            'risques'                => 'nullable|string',
            'protocole'              => 'nullable|string',
            'contre_indications'     => 'nullable|string',
            'asa_score'              => 'nullable|integer|min:1|max:5',
            'consentement'           => 'boolean',
        ]);
 
        return response()->json(ConsultationAnesthesie::create($validated), 201);
    }
 
    public function update(Request $request, $id)
    {
        $detail = ConsultationAnesthesie::findOrFail($id);
        $detail->update($request->only([
            'date_consultation_pre_op', 'allergie_medicament', 'type_anesthesie',
            'risques', 'protocole', 'contre_indications', 'asa_score', 'consentement',
        ]));
        return response()->json($detail);
    }
}
?>