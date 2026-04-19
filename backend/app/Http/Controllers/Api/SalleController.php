<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    public function index()
    {
        return response()->json(Salle::with('lits')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type_chambre'   => 'required|string|max:100',
            'numero_chambre' => 'required|string|unique:salles',
            'batiment'       => 'nullable|string|max:100',
        ]);
        return response()->json(Salle::create($data), 201);
    }

    public function show(int $id)
    {
        return response()->json(Salle::with('lits')->findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $s = Salle::findOrFail($id);
        $s->update($request->validate([
            'type_chambre' => 'sometimes|string|max:100',
            'batiment'     => 'nullable|string|max:100',
        ]));
        return response()->json($s);
    }

    public function destroy(int $id)
    {
        Salle::findOrFail($id)->delete();
        return response()->json(['message' => 'Salle supprimée']);
    }
}
?>