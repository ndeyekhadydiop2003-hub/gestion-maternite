<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function index()
    {
        return response()->json(
            Consultation::with('patiente', 'personnel', 'grossesse')->latest('date_consultation')->paginate(15)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date_consultation' => 'required|date',
            'poids'             => 'nullable|numeric|min:20|max:200',
            'hauteur_uterine'   => 'nullable|numeric|min:0|max:50',
            'temperature'       => 'nullable|numeric|min:35|max:42',
            'tension'           => 'nullable|numeric|min:0',
            'observation'       => 'nullable|string',
            'id_patient'        => 'required|exists:patientes,id_patient',
            'id_grossesse'      => 'nullable|exists:grossesses,id_grossesse',
            'id_personnel'      => 'required|exists:personnel_medical,id_personnel',
        ]);
        return response()->json(
            Consultation::create($data)->load('patiente', 'personnel'), 201
        );
    }

    public function show(int $id)
    {
        return response()->json(
            Consultation::with('patiente', 'personnel', 'grossesse', 'prescriptions.examens.resultat')->findOrFail($id)
        );
    }

    public function update(Request $request, int $id)
    {
        $c = Consultation::findOrFail($id);
        $c->update($request->validate([
            'poids'           => 'nullable|numeric',
            'hauteur_uterine' => 'nullable|numeric',
            'temperature'     => 'nullable|numeric|min:35|max:42',
            'tension'         => 'nullable|numeric',
            'observation'     => 'nullable|string',
        ]));
        return response()->json($c);
    }

    public function destroy(int $id)
    {
        Consultation::findOrFail($id)->delete();
        return response()->json(['message' => 'Consultation supprimée']);
    }
}
?>