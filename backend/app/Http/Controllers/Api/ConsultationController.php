<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function index(Request $request)
    {
        // Récupère le nombre d'éléments par page (par défaut 15)
        $perPage = $request->get('per_page', 15);

        $query = Consultation::with([
            'patiente',
            'personnel.utilisateur',
            'grossesse'
        ])->orderBy('date_consultation', 'desc');

        // Filtre par patiente si l'ID est présent dans la requête
        if ($request->has('id_patient')) {
            $query->where('id_patient', $request->id_patient);
        }

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_patient'        => 'required|exists:patientes,id_patient',
            'id_grossesse'      => 'nullable|exists:grossesses,id_grossesse',
            'id_personnel'      => 'required|exists:personnel_medical,id_personnel',
            'date_consultation' => 'required|date',
            'motif_consultation'=> 'nullable|string|max:255',
            'poids'             => 'nullable|numeric',
            'temperature'       => 'nullable|numeric|min:35|max:42',
            'tension'           => 'nullable|string|max:255',
            'observation'       => 'nullable|string',
            'prochain_rdv'      => 'nullable|date',
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
