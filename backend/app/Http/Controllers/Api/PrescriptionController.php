<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;
class PrescriptionController extends Controller
{
    public function index()
    {
        return response()->json(Prescription::with(['patiente', 'personnel'])->get());
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_patient'        => 'required|exists:patientes,id_patient',
            'id_personnel'      => 'required|exists:personnel_medical,id_personnel',
            'id_consultation'   => 'nullable|exists:consultations,id_consultation',
            'medicaments'       => 'required|string',
            'posologie'         => 'required|string',
            'date_prescription' => 'required|date',
            'date_fin'          => 'nullable|date|after:date_prescription',
        ]);
 
        return response()->json(Prescription::create($validated), 201);
    }
 
    public function show($id)
    {
        return response()->json(Prescription::with(['patiente', 'personnel', 'consultation'])->findOrFail($id));
    }
 
    public function update(Request $request, $id)
    {
        $prescription = Prescription::findOrFail($id);
        $prescription->update($request->only([
            'medicaments', 'posologie', 'date_fin'
        ]));
        return response()->json($prescription);
    }
 
    public function destroy($id)
    {
        Prescription::findOrFail($id)->delete();
        return response()->json(['message' => 'Prescription supprimée']);
    }
}
?>