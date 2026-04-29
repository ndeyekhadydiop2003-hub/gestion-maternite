<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardPediatreController extends Controller
{
    public function stats(Request $request)
    {
        $user        = $request->user();
        $personnel   = DB::table('personnel_medical')->where('id_utilisateur', $user->id_utilisateur)->first();
        $idPersonnel = $personnel?->id_personnel;

        $today = now()->toDateString();

        // ── Bébés ──────────────────────────────────────────────
        $totalBebes    = DB::table('nouveau_nes')->count();
        $bebesCritique = DB::table('nouveau_nes')->where('poids_naissance', '<', 1.5)->where('poids_naissance', '>', 0)->count();
        $bebesSurveiller = DB::table('nouveau_nes')->whereBetween('poids_naissance', [1.5, 2.49])->count();
        $bebesNormal   = DB::table('nouveau_nes')->where('poids_naissance', '>=', 2.5)->count();

        // ── Consultations ──────────────────────────────────────
        $consultationsJour = DB::table('consultations')
            ->whereDate('date_consultation', $today)
            ->when($idPersonnel, fn($q) => $q->where('id_personnel', $idPersonnel))
            ->count();

        $dernieresConsultations = DB::table('consultations as c')
            ->leftJoin('patientes as p', 'c.id_patient', '=', 'p.id_patient')
            ->leftJoin('personnel_medical as pm', 'c.id_personnel', '=', 'pm.id_personnel')
            ->leftJoin('utilisateurs as u', 'pm.id_utilisateur', '=', 'u.id_utilisateur')
            ->when($idPersonnel, fn($q) => $q->where('c.id_personnel', $idPersonnel))
            ->select(
                'c.id_consultation',
                'c.date_consultation',
                'c.motif_consultation',
                'c.observation',
                'c.poids',
                'p.nom as patiente_nom',
                'p.prenom as patiente_prenom',
                'u.nom as medecin_nom',
                'u.prenom as medecin_prenom'
            )
            ->orderBy('c.date_consultation', 'desc')
            ->limit(5)
            ->get();

        // ── Soins ──────────────────────────────────────────────
        $soinsAujourdhui = DB::table('soins')
            ->whereDate('date_soin', $today)
            ->count();

        $soinsDuJour = DB::table('soins as s')
            ->leftJoin('nouveau_nes as nn', 's.id_nouveau_ne', '=', 'nn.id_nouveau_ne')
            ->leftJoin('accouchements as a', 'nn.id_accouchement', '=', 'a.id_accouchement')
            ->leftJoin('grossesses as g', 'a.id_grossesse', '=', 'g.id_grossesse')
            ->leftJoin('patientes as p', 'g.id_patient', '=', 'p.id_patient')
            ->whereDate('s.date_soin', $today)
            ->select(
                's.id_soin',
                's.type_soin',
                's.heure_soin',
                's.frequence',
                's.statut',
                's.note',
                's.id_nouveau_ne',
                'p.nom as mere_nom',
                'p.prenom as mere_prenom'
            )
            ->orderBy('s.heure_soin')
            ->limit(5)
            ->get();

        // ── Planifications RV ──────────────────────────────────
        $rvEnAttente = DB::table('planifier_rv')
            ->where('statut', 'en_attente')
            ->when($idPersonnel, fn($q) => $q->where('id_personnel', $idPersonnel))
            ->count();

        $rvUrgents = DB::table('planifier_rv')
            ->where('statut', 'en_attente')
            ->where('priorite', 'urgente')
            ->when($idPersonnel, fn($q) => $q->where('id_personnel', $idPersonnel))
            ->count();

        $planificationsEnAttente = DB::table('planifier_rv as rv')
            ->leftJoin('patientes as p', 'rv.id_patient', '=', 'p.id_patient')
            ->where('rv.statut', 'en_attente')
            ->when($idPersonnel, fn($q) => $q->where('rv.id_personnel', $idPersonnel))
            ->select(
                'rv.id',
                'rv.delai_recommande',
                'rv.priorite',
                'rv.motif',
                'rv.statut',
                'rv.created_at',
                'p.nom as patiente_nom',
                'p.prenom as patiente_prenom'
            )
            ->orderByRaw("CASE WHEN rv.priorite = 'urgente' THEN 0 ELSE 1 END")
            ->orderBy('rv.created_at', 'desc')
            ->limit(5)
            ->get();

        // ── RDV confirmés à venir ──────────────────────────────
        $prochainRdv = DB::table('rendez_vous as rv')
            ->leftJoin('patientes as p', 'rv.id_patient', '=', 'p.id_patient')
            ->whereDate('rv.date_rv', '>=', $today)
            ->where('rv.statut', '!=', 'annule')
            ->when($idPersonnel, fn($q) => $q->where('rv.id_personnel', $idPersonnel))
            ->select(
                'rv.id_rendez_vous',
                'rv.date_rv',
                'rv.heure_rv',
                'rv.motif',
                'rv.priorite',
                'rv.statut',
                'p.nom as patiente_nom',
                'p.prenom as patiente_prenom'
            )
            ->orderBy('rv.date_rv')
            ->orderBy('rv.heure_rv')
            ->limit(5)
            ->get();

        // ── Prescriptions actives ──────────────────────────────
        $prescriptionsActives = DB::table('prescriptions')
            ->where(function($q) use ($today) {
                $q->where('date_fin', '>=', $today)->orWhereNull('date_fin');
            })
            ->when($idPersonnel, fn($q) => $q->where('id_personnel', $idPersonnel))
            ->count();

        // ── Derniers bébés ─────────────────────────────────────
        $derniersBebes = DB::table('nouveau_nes as nn')
            ->leftJoin('accouchements as a', 'nn.id_accouchement', '=', 'a.id_accouchement')
            ->leftJoin('grossesses as g', 'a.id_grossesse', '=', 'g.id_grossesse')
            ->leftJoin('patientes as p', 'g.id_patient', '=', 'p.id_patient')
            ->select(
                'nn.id_nouveau_ne',
                'nn.poids_naissance',
                'nn.taille',
                'nn.sexe',
                'nn.apgar_1min',
                'nn.apgar_5min',
                'nn.created_at',
                'p.nom as mere_nom',
                'p.prenom as mere_prenom'
            )
            ->orderBy('nn.created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            // Chiffres clés
            'total_bebes'            => $totalBebes,
            'bebes_normal'           => $bebesNormal,
            'bebes_surveiller'       => $bebesSurveiller,
            'bebes_critique'         => $bebesCritique,
            'consultations_jour'     => $consultationsJour,
            'soins_aujourd_hui'      => $soinsAujourdhui,
            'rv_en_attente'          => $rvEnAttente,
            'rv_urgents'             => $rvUrgents,
            'prescriptions_actives'  => $prescriptionsActives,

            // Listes
            'derniers_bebes'              => $derniersBebes,
            'dernières_consultations'     => $dernieresConsultations,
            'soins_du_jour'               => $soinsDuJour,
            'planifications_en_attente'   => $planificationsEnAttente,
            'prochain_rdv'                => $prochainRdv,
        ]);
    }
}
