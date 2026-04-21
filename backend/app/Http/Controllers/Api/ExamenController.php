<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Examen;
use App\Models\ResultatExamen;
use Illuminate\Http\Request;
class ExamenController extends Controller
{
    public function index()
    {
        return response()->json(Examen::with(['patiente', 'personnel', 'resultats'])->get());
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_patient'      => 'required|exists:patientes,id_patient',
            'id_personnel'    => 'required|exists:personnel_medical,id_personnel',
            'id_consultation' => 'nullable|exists:consultations,id_consultation',
            'type_examen'     => 'required|string',
            'date_examen'     => 'required|date',
        ]);
 
        return response()->json(Examen::create($validated), 201);
    }
 
    public function show($id)
    {
        return response()->json(Examen::with(['patiente', 'personnel', 'resultats'])->findOrFail($id));
    }
 
    public function update(Request $request, $id)
    {
        $examen = Examen::findOrFail($id);
        $examen->update($request->only(['type_examen', 'date_examen']));
        return response()->json($examen);
    }
 
    public function destroy($id)
    {
        Examen::findOrFail($id)->delete();
        return response()->json(['message' => 'Examen supprimé']);
    }
}
?>