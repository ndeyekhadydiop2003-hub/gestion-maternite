<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use App\Models\PlanifierRv;
use Illuminate\Http\Request;

class RendezVousController extends Controller
{
    public function index(Request $request)
    {
        $query = RendezVous::with('patiente', 'personnel', 'planification');
        if ($request->has('date'))         $query->whereDate('date_rv', $request->date);
        if ($request->has('id_personnel')) $query->where('id_personnel', $request->id_personnel);
        if ($request->has('statut'))       $query->where('statut', $request->statut);
        return response()->json(
            $query->orderBy('date_rv')->orderBy('heure_rv')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_patient'       => 'required|exists:patientes,id_patient',
            'id_personnel'     => 'required|exists:personnel_medical,id_personnel',
            'id_planification' => 'nullable|exists:planifier_rv,id',
            'date_rv'          => 'required|date',
            'heure_rv'         => 'required|date_format:H:i',
            'motif'            => 'nullable|string',
            'priorite'         => 'in:normale,urgente,critique',
            'statut'           => 'in:planifie,confirme,annule,effectue',
        ]);

        $rv = RendezVous::create($data);

        // Si lié à une planification, on la marque comme confirmée
        if (!empty($data['id_planification'])) {
            PlanifierRv::where('id', $data['id_planification'])
                       ->update(['statut' => 'confirme']);
        }

        return response()->json(
            $rv->load('patiente', 'personnel', 'planification'), 201
        );
    }

    public function show(int $id)
    {
        return response()->json(
            RendezVous::with('patiente', 'personnel', 'planification')->findOrFail($id)
        );
    }

    public function update(Request $request, int $id)
    {
        $rv = RendezVous::findOrFail($id);
        $rv->update($request->validate([
            'date_rv'  => 'sometimes|date',
            'heure_rv' => 'sometimes|date_format:H:i',
            'motif'    => 'nullable|string',
            'priorite' => 'in:normale,urgente,critique',
            'statut'   => 'in:planifie,confirme,annule,effectue',
        ]));
        return response()->json($rv);
    }

    public function updateStatut(Request $request, int $id)
    {
        $rv = RendezVous::findOrFail($id);
        $request->validate(['statut' => 'required|in:planifie,confirme,annule,effectue']);
        $rv->update(['statut' => $request->statut]);
        return response()->json($rv);
    }

    public function destroy(int $id)
    {
        RendezVous::findOrFail($id)->delete();
        return response()->json(['message' => 'Rendez-vous supprimé']);
    }
}
