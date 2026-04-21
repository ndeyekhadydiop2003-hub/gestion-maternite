<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use Illuminate\Http\Request;

class RendezVousController extends Controller
{
    public function index()
    {
        return response()->json(RendezVous::with(['patiente', 'personnel'])->get());
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_patient'   => 'required|exists:patientes,id_patient',
            'id_personnel' => 'required|exists:personnel_medical,id_personnel',
            'date_rv'      => 'required|date',
            'heure_rv'     => 'required',
            'motif'        => 'nullable|string',
            'priorite'     => 'in:normale,urgente,critique',
            'statut'       => 'in:planifie,confirme,annule,effectue',
        ]);
 
        return response()->json(RendezVous::create($validated), 201);
    }
 
    public function show($id)
    {
        return response()->json(RendezVous::with(['patiente', 'personnel'])->findOrFail($id));
    }
 
    public function update(Request $request, $id)
    {
        $rv = RendezVous::findOrFail($id);
        $rv->update($request->only(['date_rv', 'heure_rv', 'motif', 'priorite', 'statut']));
        return response()->json($rv);
    }
 
    public function destroy($id)
    {
        RendezVous::findOrFail($id)->delete();
        return response()->json(['message' => 'Rendez-vous supprimé']);
    }
}

?>
