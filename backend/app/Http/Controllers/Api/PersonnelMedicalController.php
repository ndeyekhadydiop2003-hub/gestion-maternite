<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PersonnelMedical;
use Illuminate\Http\Request;
class PersonnelMedicalController extends Controller
{
    public function index()
    {
        return response()->json(PersonnelMedical::with('utilisateur')->get());
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_utilisateur' => 'required|exists:utilisateurs,id_utilisateur',
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'telephone'      => 'required|string|max:20',
            'fonction'       => 'required|string|max:100',
        ]);
 
        $personnel = PersonnelMedical::create($validated);
        return response()->json($personnel, 201);
    }
 
    public function show($id)
    {
        $personnel = PersonnelMedical::with([
            'utilisateur', 'patientes', 'consultations', 'rendezVous'
        ])->findOrFail($id);
 
        return response()->json($personnel);
    }
 
    public function update(Request $request, $id)
    {
        $personnel = PersonnelMedical::findOrFail($id);
        $personnel->update($request->validate([
            'nom'       => 'string|max:100',
            'prenom'    => 'string|max:100',
            'telephone' => 'string|max:20',
            'fonction'  => 'string|max:100',
        ]));
        return response()->json($personnel);
    }
 
    public function destroy($id)
    {
        PersonnelMedical::findOrFail($id)->delete();
        return response()->json(['message' => 'Personnel supprimé']);
    }
}
 
?>