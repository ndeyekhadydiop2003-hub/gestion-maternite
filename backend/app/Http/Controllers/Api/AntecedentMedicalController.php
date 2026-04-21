<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AntecedentMedical;
use Illuminate\Http\Request;
class AntecedentMedicalController extends Controller
{
    public function index(Patiente $patiente) {
        return view('antecedents.index', [
            'patiente'    => $patiente,
            'antecedents' => $patiente->antecedents()->orderBy('gravite', 'desc')->get(),
        ]);
    }

    public function store(Request $request, Patiente $patiente) {
        $data = $request->validate([
            'categorie'   => 'required|string|max:100',
            'description' => 'required|string',
            'gravite'     => 'required|in:faible,modere,eleve',
        ]);
        $patiente->antecedents()->create($data);
        return back()->with('success', 'Antécédent ajouté');
    }

    public function destroy(AntecedentMedical $antecedent) {
        $antecedent->delete();
        return back()->with('success', 'Supprimé');
    }
}?>