<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PersonnelMedical;
use Illuminate\Http\Request;

class PersonnelMedicalController extends Controller
{
    public function index(Request $request)
    {
        $query = PersonnelMedical::with('utilisateur');
        if ($request->has('fonction')) {
            $query->where('fonction', $request->fonction);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'telephone'      => 'nullable|string|max:20',
            'fonction'       => 'required|string|max:100',
            'id_utilisateur' => 'nullable|exists:utilisateurs,id_utilisateur',
        ]);
        return response()->json(PersonnelMedical::create($data), 201);
    }

    public function show(int $id)
    {
        return response()->json(PersonnelMedical::with('utilisateur')->findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $personnel = PersonnelMedical::findOrFail($id);
        $personnel->update($request->validate([
            'nom'       => 'sometimes|string|max:100',
            'prenom'    => 'sometimes|string|max:100',
            'telephone' => 'nullable|string|max:20',
            'fonction'  => 'sometimes|string|max:100',
        ]));
        return response()->json($personnel);
    }

    public function destroy(int $id)
    {
        PersonnelMedical::findOrFail($id)->delete();
        return response()->json(['message' => 'Personnel supprimé']);
    }
}
?>