<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accouchement;
use Illuminate\Http\Request;

class AccouchementController extends Controller
{
    public function index()
    {
        return response()->json(
            Accouchement::with('grossesse.patiente', 'personnel', 'nouveauNes')->latest('date_accouchement')->paginate(15)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date_accouchement'  => 'required|date',
            'heure_accouchement' => 'nullable|date_format:H:i',
            'mode_accouchement'  => 'required|in:voie_basse,cesarienne,forceps,ventouse',
            'a_accoucher'        => 'nullable|string',
            'id_grossesse'       => 'required|exists:grossesses,id_grossesse',
            'id_personnel'       => 'required|exists:personnel_medical,id_personnel',
        ]);
        $accouchement = Accouchement::create($data);
        $accouchement->grossesse()->update(['statut' => 'terminee']);
        return response()->json($accouchement->load('grossesse.patiente', 'personnel'), 201);
    }

    public function show(int $id)
    {
        return response()->json(
            Accouchement::with('grossesse.patiente', 'personnel', 'nouveauNes', 'supervisions', 'hospitalisations.lit.salle')->findOrFail($id)
        );
    }

    public function update(Request $request, int $id)
    {
        $a = Accouchement::findOrFail($id);
        $a->update($request->validate([
            'heure_accouchement' => 'nullable|date_format:H:i',
            'mode_accouchement'  => 'sometimes|in:voie_basse,cesarienne,forceps,ventouse',
            'a_accoucher'        => 'nullable|string',
        ]));
        return response()->json($a);
    }

    public function destroy(int $id)
    {
        Accouchement::findOrFail($id)->delete();
        return response()->json(['message' => 'Accouchement supprimé']);
    }
}

?>