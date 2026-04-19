<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supervision;
use Illuminate\Http\Request;

class SupervisionController extends Controller
{
    public function index()
    {
        return response()->json(Supervision::with('personnel', 'accouchement')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date_supervision' => 'required|date',
            'id_personnel'     => 'required|exists:personnel_medical,id_personnel',
            'id_accouchement'  => 'required|exists:accouchements,id_accouchement',
        ]);
        return response()->json(Supervision::create($data), 201);
    }

    public function show(int $id)
    {
        return response()->json(Supervision::with('personnel', 'accouchement.grossesse.patiente')->findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $s = Supervision::findOrFail($id);
        $s->update($request->validate(['date_supervision' => 'sometimes|date']));
        return response()->json($s);
    }

    public function destroy(int $id)
    {
        Supervision::findOrFail($id)->delete();
        return response()->json(['message' => 'Supervision supprimée']);
    }
}?>