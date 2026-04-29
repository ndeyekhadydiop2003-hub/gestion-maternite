<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NouveauNe;
use Illuminate\Http\Request;

class NouveauNeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search  = $request->get('search', null);

        $query = NouveauNe::with([
            'accouchement.grossesse.patiente',
            'patiente',
        ])->latest();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->whereHas('accouchement.grossesse.patiente', function($q2) use ($search) {
                    $q2->where('nom',    'like', "%{$search}%")
                       ->orWhere('prenom', 'like', "%{$search}%");
                })->orWhereHas('patiente', function($q2) use ($search) {
                    $q2->where('nom',    'like', "%{$search}%")
                       ->orWhere('prenom', 'like', "%{$search}%");
                });
            });
        }

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sexe'            => 'required|in:masculin,feminin,indetermine',
            'poids_naissance' => 'nullable|numeric|min:0.1|max:10',
            'taille'          => 'nullable|numeric|min:10|max:70',
            'apgar_1min'      => 'nullable|integer|min:0|max:10',
            'apgar_5min'      => 'nullable|integer|min:0|max:10',
            'etat_sante'      => 'nullable|in:bon,moyen,critique',
            'id_accouchement' => 'nullable|exists:accouchements,id_accouchement',
            'id_patient'      => 'nullable|exists:patientes,id_patient',
        ]);

        return response()->json(NouveauNe::create([
            'sexe'            => $data['sexe'],
            'poids_naissance' => $data['poids_naissance'] ?? null,
            'taille'          => $data['taille']          ?? null,
            'apgar_1min'      => $data['apgar_1min']      ?? null,
            'apgar_5min'      => $data['apgar_5min']      ?? null,
            'etat_sante'      => $data['etat_sante']      ?? 'bon',
            'id_accouchement' => $data['id_accouchement'] ?? null,
            'id_patient'      => $data['id_patient']      ?? null,
        ]), 201);
    }

    public function show(int $id)
    {
        return response()->json(
            NouveauNe::with([
                'accouchement.grossesse.patiente',
                'patiente',
            ])->findOrFail($id)
        );
    }

    public function update(Request $request, int $id)
    {
        $n    = NouveauNe::findOrFail($id);
        $data = $request->validate([
            'sexe'            => 'sometimes|in:masculin,feminin,indetermine',
            'poids_naissance' => 'nullable|numeric',
            'taille'          => 'nullable|numeric',
            'apgar_1min'      => 'nullable|integer|min:0|max:10',
            'apgar_5min'      => 'nullable|integer|min:0|max:10',
            'etat_sante'      => 'nullable|in:bon,moyen,critique',
        ]);

        $n->update($data);
        return response()->json($n);
    }

    public function destroy(int $id)
    {
        NouveauNe::findOrFail($id)->delete();
        return response()->json(['message' => 'Nouveau-né supprimé']);
    }
}
