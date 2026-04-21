<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function index()
    {
        return response()->json(
            Consultation::with(['patiente', 'personnel', 'grossesse'])->get()
        );
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_patient'          => 'required|exists:patientes,id_patient',
            'id_personnel'        => 'required|exists:personnel_medical,id_personnel',
            'id_grossesse'        => 'nullable|exists:grossesses,id_grossesse',
            'date_consultation'   => 'required|date',
            'motif_consultation'  => 'nullable|string',
            'poids'               => 'nullable|numeric',
            'temperature'         => 'nullable|numeric',
            'tension'             => 'nullable|string',
            'observation'         => 'nullable|string',
            'prochain_rdv'        => 'nullable|date',
        ]);
 
        $consultation = Consultation::create($validated);
 
        // Créer automatiquement le détail selon le rôle du personnel
        $role = auth()->user()->role_acces;
        $this->creerDetailParRole($role, $consultation->id_consultation);
 
        return response()->json($consultation, 201);
    }
 
    // Créer le détail selon le rôle connecté
    private function creerDetailParRole(string $role, int $idConsultation): void
    {
        match ($role) {
            'sage_femme'   => ConsultationSageFemme::create(['id_consultation' => $idConsultation]),
            'pediatre'     => ConsultationPediatrie::create(['id_consultation' => $idConsultation]),
            'gynécologue'  => ConsultationGynecologie::create(['id_consultation' => $idConsultation]),
            'psychologue'  => ConsultationPsychologie::create(['id_consultation' => $idConsultation]),
            'anesthésiste' => ConsultationAnesthesie::create(['id_consultation' => $idConsultation]),
            'infectiologue'=> ConsultationInfectiologie::create(['id_consultation' => $idConsultation]),
            default        => null,
        };
    }
 
    public function show($id)
    {
        $role = auth()->user()->role_acces;
 
        $consultation = Consultation::with([
            'patiente', 'personnel', 'grossesse',
            'prescriptions', 'examens.resultats',
            'supervisions',
        ])->findOrFail($id);
 
        // Charger uniquement le détail du rôle connecté
        $detail = match ($role) {
            'sage_femme'    => $consultation->load('sageFemme'),
            'pediatre'      => $consultation->load('pediatrie'),
            'gynécologue'   => $consultation->load('gynecologie'),
            'psychologue'   => $consultation->load('psychologie'),
            'anesthésiste'  => $consultation->load('anesthesie'),
            'infectiologue' => $consultation->load('infectiologie'),
            'admin'         => $consultation->load(
                'sageFemme', 'pediatrie', 'gynecologie',
                'psychologie', 'anesthesie', 'planning', 'infectiologie'
            ),
            default => $consultation,
        };
 
        return response()->json($consultation);
    }
 
    public function update(Request $request, $id)
    {
        $consultation = Consultation::findOrFail($id);
        $consultation->update($request->only([
            'motif_consultation', 'poids', 'temperature',
            'tension', 'observation', 'prochain_rdv',
        ]));
        return response()->json($consultation);
    }
 
    public function destroy($id)
    {
        Consultation::findOrFail($id)->delete();
        return response()->json(['message' => 'Consultation supprimée']);
    }
}
 
?>