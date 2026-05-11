<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsultationSageFemme;
use Illuminate\Http\Request;

class ConsultationSageFemmeController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_consultation'    => 'required|exists:consultations,id_consultation',
            'id_grossesse'       => 'nullable|exists:grossesses,id_grossesse',
            'hauteur_uterine'    => 'nullable|numeric',
            'bruit_coeur_foetal' => 'nullable|string',
            'mouvements_foetaux' => 'nullable|in:absents,faibles,normaux,actifs',
            'gravite'            => 'nullable|integer',
            'parite'             => 'nullable|integer',
            'type_presentation'  => 'nullable|string',
        ]);

        return response()->json(ConsultationSageFemme::create($validated), 201);
    }

    public function update(Request $request, $id)
    {
        $detail = ConsultationSageFemme::findOrFail($id);
        $detail->update($request->only([
            'hauteur_uterine', 'bruit_coeur_foetal',
            'mouvements_foetaux', 'gravite', 'parite', 'type_presentation',
        ]));
        return response()->json($detail);
    }
}
