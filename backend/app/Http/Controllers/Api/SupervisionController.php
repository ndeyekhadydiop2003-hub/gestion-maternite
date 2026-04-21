<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supervision;
use Illuminate\Http\Request;

class SupervisionController extends Controller
{
    public function index()
    {
        return response()->json(
            Supervision::with('consultation', 'personnel')->latest('date_supervision')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_consultation' => 'required|exists:consultations,id_consultation',
            'id_personnel'    => 'required|exists:personnel_medical,id_personnel',
            'date_supervision'=> 'required|date',
            'commentaire'     => 'nullable|string',
        ]);

        $supervision = Supervision::create($data);

        return response()->json($supervision->load('consultation', 'personnel'), 201);
    }

    public function show(Supervision $supervision)
    {
        return response()->json($supervision->load('consultation', 'personnel'));
    }

    public function update(Request $request, Supervision $supervision)
    {
        $data = $request->validate([
            'id_consultation'  => 'sometimes|exists:consultations,id_consultation',
            'id_personnel'     => 'sometimes|exists:personnel_medical,id_personnel',
            'date_supervision' => 'sometimes|date',
            'commentaire'      => 'nullable|string',
        ]);

        $supervision->update($data);

        return response()->json($supervision->load('consultation', 'personnel'));
    }

    public function destroy(Supervision $supervision)
    {
        $supervision->delete();
        return response()->json(['message' => 'Supervision supprimée.']);
    }
}?>