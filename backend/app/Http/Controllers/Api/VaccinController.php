<?php
namespace App\Http\Controllers\Api;  // ← Api\ ajouté

use App\Http\Controllers\Controller;
use App\Models\Vaccin;
use Illuminate\Http\Request;

class VaccinController extends Controller
{

// Liste tous les vaccins
public function index(Request $request)
{
    $query = Vaccin::with(['personnel', 'nouveauNe']);

    if ($request->has('id_nouveau_ne')) {
        $query->where('id_nouveau_ne', $request->id_nouveau_ne);
    }
    if ($request->has('statut')) {
        $query->where('statut', $request->statut);
    }

    return response()->json($query->orderByDesc('created_at')->get());
}

// Vaccins par bébé
public function parBebe($id)
{
    $vaccins = Vaccin::with(['personnel'])
        ->where('id_nouveau_ne', $id)
        ->orderBy('date_administration')
        ->get();

    return response()->json($vaccins);
}
    // Liste vaccins d'un bébé
    public function indexBebe($id_nouveau_ne)
    {
        $vaccins = Vaccin::bebe()
            ->where('id_nouveau_ne', $id_nouveau_ne)
            ->with('personnel')
            ->orderBy('date_administration')
            ->get();

        return response()->json($vaccins);
    }

    // Liste vaccins d'une patiente
    public function indexFemme($id_patient)
    {
        $vaccins = Vaccin::femme()
            ->where('id_patient', $id_patient)
            ->with('personnel')
            ->orderBy('date_administration')
            ->get();

        return response()->json($vaccins);
    }

    // Créer un vaccin
    public function store(Request $request)
    {
        $request->validate([
            'nom_vaccin'          => 'required|string',
            'statut'              => 'required|in:fait,prevu,non_fait',
            'date_administration' => 'nullable|date',
            'id_nouveau_ne'       => 'nullable|exists:nouveau_nes,id_nouveau_ne',
            'id_patient'          => 'nullable|exists:patientes,id_patient',
            'id_personnel'        => 'nullable|exists:personnel_medical,id_personnel',
            'lot'                 => 'nullable|string|max:50',
            'site_injection'      => 'nullable|string|max:100',
            'observations'        => 'nullable|string',
        ]);

        // Au moins un des deux requis
        if (!$request->id_nouveau_ne && !$request->id_patient) {
            return response()->json([
                'message' => 'Un id_nouveau_ne ou id_patient est requis.'
            ], 422);
        }

        $vaccin = Vaccin::create($request->all());

        return response()->json($vaccin, 201);
    }

    // Voir un vaccin
    public function show($id)
    {
        $vaccin = Vaccin::with(['personnel', 'patiente', 'nouveauNe'])
            ->findOrFail($id);

        return response()->json($vaccin);
    }

    // Modifier un vaccin
    public function update(Request $request, $id)
    {
        $vaccin = Vaccin::findOrFail($id);

        $request->validate([
            'nom_vaccin'          => 'sometimes|string',
            'statut'              => 'sometimes|in:fait,prevu,non_fait',
            'date_administration' => 'nullable|date',
            'lot'                 => 'nullable|string|max:50',
            'site_injection'      => 'nullable|string|max:100',
            'observations'        => 'nullable|string',
            'id_personnel'        => 'nullable|exists:personnel_medical,id_personnel',
        ]);

        $vaccin->update($request->all());

        return response()->json($vaccin);
    }

    // Marquer comme fait
    public function marquerFait(Request $request, $id)
    {
        $vaccin = Vaccin::findOrFail($id);

        $vaccin->update([
            'statut'              => 'fait',
            'date_administration' => $request->date_administration ?? now()->toDateString(),
            'id_personnel'        => $request->id_personnel,
            'lot'                 => $request->lot,
            'site_injection'      => $request->site_injection,
        ]);

        return response()->json($vaccin);
    }

    // Supprimer un vaccin
    public function destroy($id)
    {
        $vaccin = Vaccin::findOrFail($id);
        $vaccin->delete();

        return response()->json(['message' => 'Vaccin supprimé.']);
    }
}
