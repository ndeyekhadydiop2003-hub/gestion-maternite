<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patiente;
use Illuminate\Http\Request;
class PatienteController extends Controller
{
    // Liste toutes les patientes
    public function index()
    {
        $patientes = Patiente::with('personnel')->orderBy('nom')->get();
        return response()->json($patientes);
    }
 
    // Créer une patiente
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'                    => 'required|string|max:100',
            'prenom'                 => 'required|string|max:100',
            'date_naissance'         => 'required|date',
            'situation_matrimoniale' => 'required|in:celibataire,mariee,divorcee,veuve',
            'telephone'              => 'nullable|string|max:20',
            'adresse'                => 'nullable|string',
            'groupe_sanguin'         => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'motif'                  => 'nullable|string',
            'statut'                 => 'in:active,inactive,archivee',
            'notes_cliniques'        => 'nullable|string',
            'id_personnel'           => 'nullable|exists:personnel_medical,id_personnel',
        ]);
 
        $patiente = Patiente::create($validated);
        return response()->json($patiente, 201);
    }
 
    // Afficher une patiente avec tout son dossier
    public function show($id)
    {
        $patiente = Patiente::with([
            'personnel',
            'grossesses.accouchements.nouveauNes',
            'consultations.sageFemme',
            'consultations.pediatrie',
            'consultations.gynecologie',
            'consultations.psychologie',
            'consultations.anesthesie',
            'consultations.planning',
            'consultations.infectiologie',
            'antecedents',
            'prescriptions',
            'examens.resultats',
            'rendezVous',
            'hospitalisations.lit.salle',
        ])->findOrFail($id);
 
        return response()->json($patiente);
    }
 
    // Modifier une patiente
    public function update(Request $request, $id)
    {
        $patiente  = Patiente::findOrFail($id);
        $validated = $request->validate([
            'nom'                    => 'string|max:100',
            'prenom'                 => 'string|max:100',
            'date_naissance'         => 'date',
            'situation_matrimoniale' => 'in:celibataire,mariee,divorcee,veuve',
            'telephone'              => 'nullable|string|max:20',
            'adresse'                => 'nullable|string',
            'groupe_sanguin'         => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'motif'                  => 'nullable|string',
            'statut'                 => 'in:active,inactive,archivee',
            'notes_cliniques'        => 'nullable|string',
        ]);
 
        $patiente->update($validated);
        return response()->json($patiente);
    }
 
    // Supprimer une patiente
    public function destroy($id)
    {
        $patiente = Patiente::findOrFail($id);
        $patiente->delete();
        return response()->json(['message' => 'Patiente supprimée']);
    }
}
?>
