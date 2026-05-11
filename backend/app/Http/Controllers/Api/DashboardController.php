<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_patientes'      => DB::table('patientes')->count(),
            'total_hospitalisees'  => DB::table('hospitalisations')->where('statut', 'active')->count(),
            'rdv_aujourdhui'       => DB::table('rendez_vous')->whereDate('date_rv', now()->toDateString())->count(),
            'transmissions_jour'   => 0,
        ]);
    }

    public function activiteJour()
    {
        $patientes = DB::table('patientes')->orderBy('created_at', 'desc')->limit(5)->get();
        return response()->json($patientes);
    }


    public function pediatreStats()
{
    $today = now()->toDateString();

    // ── Bébés ──
    $total_bebes      = \App\Models\NouveauNe::count();
    $bebes_normal     = \App\Models\NouveauNe::where('poids_naissance', '>=', 2.5)->count();
    $bebes_surveiller = \App\Models\NouveauNe::whereBetween('poids_naissance', [1.5, 2.499])->count();
    $bebes_critique   = \App\Models\NouveauNe::where('poids_naissance', '<', 1.5)->count();

    // ── Consultations pédiatrie ──
    $consultations_jour = \App\Models\ConsultationPediatrie::whereDate('created_at', $today)->count();

    $dernières_consultations = \App\Models\ConsultationPediatrie::latest()->take(5)->get();

    // ── Soins (pas de modèle Soin → valeurs vides) ──
    $soins_aujourd_hui = 0;
    $soins_du_jour     = [];

    // ── Planifications RDV ──
    $rv_en_attente = \App\Models\PlanifierRv::where('statut', 'en_attente')->count();
    $rv_urgents    = \App\Models\PlanifierRv::where('statut', 'en_attente')
                        ->where('priorite', 'urgente')->count();

    $planifications_en_attente = \App\Models\PlanifierRv::where('statut', 'en_attente')
                        ->latest()->take(5)->get();

    // ── Prochains RDV ──
    $prochain_rdv = \App\Models\Consultation::where('date_consultation', '>=', $today)
                        ->orderBy('date_consultation')->take(5)->get();

    // ── Derniers bébés ──
    $derniers_bebes = \App\Models\NouveauNe::latest()->take(5)->get();

    return response()->json(compact(
        'total_bebes', 'bebes_normal', 'bebes_surveiller', 'bebes_critique',
        'consultations_jour', 'soins_aujourd_hui', 'soins_du_jour',
        'rv_en_attente', 'rv_urgents', 'planifications_en_attente',
        'prochain_rdv', 'derniers_bebes', 'dernières_consultations'
    ));
}

public function statsPublic()
{
    return response()->json([
        'total_naissances' => DB::table('nouveau_nes')->count(),
        'satisfaction'     => 98,
    ]);
}
}
