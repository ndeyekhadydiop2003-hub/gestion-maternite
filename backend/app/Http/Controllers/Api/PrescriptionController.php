<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    /**
     * GET /api/prescriptions
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);

        $prescriptions = Prescription::with([
                'patiente:id_patient,nom,prenom',
                // On charge le personnel et son utilisateur lié (qui contient le nom/prénom)
                'personnel.utilisateur',
                'consultation:id_consultation,id_patient',
            ])
            ->orderBy('date_prescription', 'desc')
            ->paginate($perPage);

        return response()->json($prescriptions);
    }

    /**
     * POST /api/prescriptions
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicaments'       => 'required|string',
            'posologie'         => 'nullable|string',
            'date_prescription' => 'required|date',
            'date_fin'          => 'nullable|date|after_or_equal:date_prescription',
            'id_consultation'   => 'required|exists:consultations,id_consultation',
            'id_patient'        => 'nullable|exists:patientes,id_patient',
            'id_personnel'      => 'nullable|exists:personnel_medical,id_personnel',
        ]);

        $prescription = Prescription::create($validated);

        return response()->json($prescription->load('patiente', 'personnel.utilisateur'), 201);
    }

    /**
     * GET /api/prescriptions/{id}
     */
    public function show($id)
    {
        $prescription = Prescription::with(['patiente', 'personnel.utilisateur', 'consultation'])
            ->findOrFail($id);

        return response()->json($prescription);
    }

    /**
     * PUT /api/prescriptions/{id}
     */
    public function update(Request $request, $id)
    {
        $prescription = Prescription::findOrFail($id);

        $validated = $request->validate([
            'type'              => 'sometimes|in:traitement,vaccin',
            'medicaments'       => 'sometimes|string',
            'posologie'         => 'nullable|string',
            'date_prescription' => 'sometimes|date',
            'date_fin'          => 'nullable|date',
        ]);

        $prescription->update($validated);

        return response()->json($prescription);
    }

    /**
     * DELETE /api/prescriptions/{id}
     */
    public function destroy($id)
    {
        Prescription::findOrFail($id)->delete();
        return response()->json(['message' => 'Supprimé avec succès.']);
    }
}
