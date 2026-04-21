<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResultatExamen;
use App\Models\Examen;
use Illuminate\Http\Request;

class ResultatExamenController extends Controller
{
    public function index()
    {
        return response()->json(
            ResultatExamen::with('examen')->latest()->get()
        );
    }

    // Résultats d'un examen spécifique
    public function parExamen(Examen $examen)
    {
        return response()->json(
            $examen->resultats()->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_examen'     => 'required|exists:examens,id_examen',
            'resultat'      => 'required|string',
            'date_resultat' => 'required|date',
        ]);

        $resultat = ResultatExamen::create($data);

        return response()->json($resultat->load('examen'), 201);
    }

    public function show(ResultatExamen $resultatExamen)
    {
        return response()->json($resultatExamen->load('examen'));
    }

    public function update(Request $request, ResultatExamen $resultatExamen)
    {
        $data = $request->validate([
            'resultat'      => 'sometimes|string',
            'date_resultat' => 'sometimes|date',
        ]);

        $resultatExamen->update($data);

        return response()->json($resultatExamen->load('examen'));
    }

    public function destroy(ResultatExamen $resultatExamen)
    {
        $resultatExamen->delete();
        return response()->json(['message' => 'Résultat supprimé.']);
    }
}

?>