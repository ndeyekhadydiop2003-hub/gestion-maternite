<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

class PdfController extends Controller
{
    private function style()
    {
        return '
        <style>
            body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
            h1 { color: #c2185b; text-align: center; margin-bottom: 5px; }
            p { text-align: center; color: #888; margin: 5px 0 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #fce4ec; color: #880e4f; padding: 8px; text-align: left; border: 1px solid #f8bbd0; }
            td { padding: 7px 8px; border: 1px solid #f8bbd0; }
            tr:nth-child(even) { background: #fff8f9; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #aaa; }
        </style>';
    }

    public function listePatientes()
    {
        $patientes = DB::table('patientes')->orderBy('created_at', 'desc')->get();
        $html = $this->style();
        $html .= '<h1>Liste des patientes</h1>';
        $html .= '<p>Maternité · Généré le ' . now()->format('d/m/Y à H:i') . ' · Total : ' . count($patientes) . ' patiente(s)</p>';
        $html .= '<table><tr><th>#</th><th>Nom</th><th>Date naissance</th><th>Téléphone</th><th>Groupe sanguin</th><th>Motif</th></tr>';
        foreach ($patientes as $i => $p) {
            $html .= '<tr><td>' . ($i+1) . '</td><td>' . $p->nom . '</td><td>' . $p->date_naissance . '</td><td>' . ($p->telephone ?? '—') . '</td><td>' . ($p->groupe_sanguin ?? '—') . '</td><td>' . ($p->motif ?? '—') . '</td></tr>';
        }
        $html .= '</table><div class="footer">Maternité — Document confidentiel</div>';
        return Pdf::loadHTML($html)->setPaper('a4', 'landscape')->download('liste-patientes.pdf');
    }

    public function ficheAdmission()
    {
        $patientes = DB::table('patientes')->orderBy('created_at', 'desc')->get();
        $html = $this->style();
        $html .= '<h1>Fiche d\'admission</h1>';
        $html .= '<p>Maternité · Généré le ' . now()->format('d/m/Y à H:i') . '</p>';
        $html .= '<table><tr><th>Nom</th><th>Date naissance</th><th>Téléphone</th><th>Groupe sanguin</th><th>Motif</th></tr>';
        foreach ($patientes as $p) {
            $html .= '<tr><td>' . $p->nom . '</td><td>' . $p->date_naissance . '</td><td>' . ($p->telephone ?? '—') . '</td><td>' . ($p->groupe_sanguin ?? '—') . '</td><td>' . ($p->motif ?? '—') . '</td></tr>';
        }
        $html .= '</table><div class="footer">Maternité — Document confidentiel</div>';
        return Pdf::loadHTML($html)->setPaper('a4', 'landscape')->download('fiche-admission.pdf');
    }

    public function planningRdv()
    {
        $rdvs = DB::table('rendez_vous')
            ->whereDate('date_rv', now()->toDateString())
            ->orderBy('heure_rv')
            ->get();
        $html = $this->style();
        $html .= '<h1>Planning des rendez-vous</h1>';
        $html .= '<p>Maternité · ' . now()->format('d/m/Y') . ' · Total : ' . count($rdvs) . ' rendez-vous</p>';
        $html .= '<table><tr><th>Heure</th><th>Patiente ID</th><th>Motif</th><th>Statut</th></tr>';
        foreach ($rdvs as $r) {
            $html .= '<tr><td>' . $r->heure_rv . '</td><td>#' . $r->id_patient . '</td><td>' . ($r->motif ?? '—') . '</td><td>' . $r->statut . '</td></tr>';
        }
        if (count($rdvs) === 0) {
            $html .= '<tr><td colspan="4" style="text-align:center">Aucun rendez-vous aujourd\'hui</td></tr>';
        }
        $html .= '</table><div class="footer">Maternité — Document confidentiel</div>';
        return Pdf::loadHTML($html)->setPaper('a4')->download('planning-rdv.pdf');
    }

    public function bulletinSortie()
    {
        $sorties = DB::table('hospitalisations')->where('statut', 'terminee')->get();
        $html = $this->style();
        $html .= '<h1>Bulletins de sortie</h1>';
        $html .= '<p>Maternité · Généré le ' . now()->format('d/m/Y à H:i') . ' · Total : ' . count($sorties) . ' sortie(s)</p>';
        $html .= '<table><tr><th>Patiente ID</th><th>Lit ID</th><th>Date admission</th><th>Date sortie</th><th>Motif</th></tr>';
        foreach ($sorties as $s) {
            $html .= '<tr><td>#' . $s->id_patient . '</td><td>#' . $s->id_lit . '</td><td>' . $s->date_admission . '</td><td>' . ($s->date_sorti ?? '—') . '</td><td>' . $s->motif . '</td></tr>';
        }
        if (count($sorties) === 0) {
            $html .= '<tr><td colspan="5" style="text-align:center">Aucune sortie enregistrée</td></tr>';
        }
        $html .= '</table><div class="footer">Maternité — Document confidentiel</div>';
        return Pdf::loadHTML($html)->setPaper('a4', 'landscape')->download('bulletins-sortie.pdf');
    }

    public function occupationLits()
    {
        $lits = DB::table('lits')->get();
        $html = $this->style();
        $html .= '<h1>Occupation des lits</h1>';
        $html .= '<p>Maternité · Généré le ' . now()->format('d/m/Y à H:i') . ' · Total : ' . count($lits) . ' lit(s)</p>';
        $html .= '<table><tr><th>Numéro lit</th><th>Statut</th><th>Occupé</th></tr>';
        foreach ($lits as $l) {
            $html .= '<tr><td>' . $l->numero_lit . '</td><td>' . $l->statut . '</td><td>' . ($l->est_occupe ? 'Oui' : 'Non') . '</td></tr>';
        }
        if (count($lits) === 0) {
            $html .= '<tr><td colspan="3" style="text-align:center">Aucun lit enregistré</td></tr>';
        }
        $html .= '</table><div class="footer">Maternité — Document confidentiel</div>';
        return Pdf::loadHTML($html)->setPaper('a4')->download('occupation-lits.pdf');
    }

    public function rapportTransmissions()
    {
        $html = $this->style();
        $html .= '<h1>Rapport des transmissions</h1>';
        $html .= '<p>Maternité · Généré le ' . now()->format('d/m/Y à H:i') . '</p>';
        $html .= '<p style="margin-top:30px">Ce rapport résume les transmissions inter-équipes de la journée.</p>';
        $html .= '<div class="footer">Maternité — Document confidentiel</div>';
        return Pdf::loadHTML($html)->setPaper('a4')->download('rapport-transmissions.pdf');
    }
}
