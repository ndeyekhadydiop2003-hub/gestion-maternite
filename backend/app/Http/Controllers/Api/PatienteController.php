<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patiente;
use Illuminate\Http\Request;

class PatienteController extends Controller
{
    public function index(Request $request)
    {
        $query = Patiente::query();
        if ($request->has('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nom', 'like', "%{$s}%")
                  ->orWhere('telephone', 'like', "%{$s}%");
            });
        }
        return response()->json($query->orderBy('nom')->paginate(15));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'            => 'required|string|max:150',
            'date_naissance' => 'required|date|before:today',
            'telephone'      => 'nullable|string|max:20',
            'motif'          => 'nullable|string|max:255',
            'groupe_sanguin' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
        ]);
        return response()->json(Patiente::create($data), 201);
    }

    public function show(int $id)
    {
        return response()->json(
            Patiente::with(['antecedentsMedicaux', 'grossesses', 'rendezVous'])->findOrFail($id)
        );
    }

    public function update(Request $request, int $id)
    {
        $patiente = Patiente::findOrFail($id);
        $data = $request->validate([
            'nom'            => 'sometimes|string|max:150',
            'date_naissance' => 'sometimes|date|before:today',
            'telephone'      => 'nullable|string|max:20',
            'motif'          => 'nullable|string|max:255',
            'groupe_sanguin' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
        ]);
        $patiente->update($data);
        return response()->json($patiente);
    }

    public function destroy(int $id)
    {
        Patiente::findOrFail($id)->delete();
        return response()->json(['message' => 'Patiente supprimée']);
    }

    public function grossesses(int $id)
    {
        return response()->json(
            Patiente::findOrFail($id)->grossesses()->with('accouchement')->get()
        );
    }

    public function consultations(int $id)
    {
        return response()->json(
            Patiente::findOrFail($id)->consultations()->with('personnel')->latest('date_consultation')->get()
        );
    }

    public function antecedents(int $id)
    {
        return response()->json(Patiente::findOrFail($id)->antecedentsMedicaux);
    }

    public function hospitalisations(int $id)
    {
        return response()->json(
            Patiente::findOrFail($id)->hospitalisations()->with('lit.salle')->get()
        );
    }
}
?>
