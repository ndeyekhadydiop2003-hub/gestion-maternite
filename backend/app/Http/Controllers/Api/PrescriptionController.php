<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    public function index()
    {
        return response()->json(Prescription::with('consultation', 'examens')->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date_prescription' => 'required|date',
            'type_examen'       => 'nullable|string|max:255',
            'id_consultation'   => 'required|exists:consultations,id_consultation',
        ]);
        return response()->json(Prescription::create($data), 201);
    }

    public function show(int $id)
    {
        return response()->json(Prescription::with('consultation.patiente', 'examens.resultat')->findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $p = Prescription::findOrFail($id);
        $p->update($request->validate([
            'date_prescription' => 'sometimes|date',
            'type_examen'       => 'nullable|string|max:255',
        ]));
        return response()->json($p);
    }

    public function destroy(int $id)
    {
        Prescription::findOrFail($id)->delete();
        return response()->json(['message' => 'Prescription supprimée']);
    }
}
?>