<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AntecedentMedical;
use Illuminate\Http\Request;

class AntecedentMedicalController extends Controller
{
    public function index()
    {
        return response()->json(AntecedentMedical::with('patiente')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'categorie'  => 'required|string|max:100',
            'description'=> 'required|string',
            'gravite'    => 'required|in:faible,modere,grave,critique',
            'id_patient' => 'required|exists:patientes,id_patient',
        ]);
        return response()->json(AntecedentMedical::create($data), 201);
    }

    public function show(int $id)
    {
        return response()->json(AntecedentMedical::with('patiente')->findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $a = AntecedentMedical::findOrFail($id);
        $a->update($request->validate([
            'categorie'   => 'sometimes|string|max:100',
            'description' => 'sometimes|string',
            'gravite'     => 'sometimes|in:faible,modere,grave,critique',
        ]));
        return response()->json($a);
    }

    public function destroy(int $id)
    {
        AntecedentMedical::findOrFail($id)->delete();
        return response()->json(['message' => 'Antécédent supprimé']);
    }
}
?>