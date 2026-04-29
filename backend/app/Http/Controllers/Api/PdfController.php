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

    public function dossierBebe($id)
{
    $bebe = DB::table('nouveau_nes')
        ->where('id_nouveau_ne', $id)
        ->first();

    if (!$bebe) {
        return response()->json(['message' => 'Bébé introuvable'], 404);
    }

    $accouchement = DB::table('accouchements')
        ->where('id_accouchement', $bebe->id_accouchement)
        ->first();

    $grossesse = $accouchement
        ? DB::table('grossesses')->where('id_grossesse', $accouchement->id_grossesse)->first()
        : null;

    $patiente = $grossesse
        ? DB::table('patientes')->where('id_patient', $grossesse->id_patient)->first()
        : null;

    $consultations = $patiente
        ? DB::table('consultations')
            ->where('id_patient', $patiente->id_patient)
            ->orderBy('date_consultation', 'desc')
            ->limit(5)
            ->get()
        : [];

    $prescriptions = $patiente
        ? DB::table('prescriptions')
            ->where('id_patient', $patiente->id_patient)
            ->orderBy('date_prescription', 'desc')
            ->limit(5)
            ->get()
        : [];

    $soins = DB::table('soins')
        ->where('id_nouveau_ne', $id)
        ->orderBy('date_soin', 'desc')
        ->limit(5)
        ->get();

    $vaccins = DB::table('vaccins')
        ->where('id_nouveau_ne', $id)
        ->get();

    $nomBebe = $patiente
        ? 'Bébé de ' . $patiente->prenom . ' ' . $patiente->nom
        : 'Nouveau-né #' . $id;

    $html = $this->style();

    // ── En-tête ──
    $html .= '<h1>Dossier Médical — ' . $nomBebe . '</h1>';
    $html .= '<p>Maternité · Généré le ' . now()->format('d/m/Y à H:i') . '</p>';

    // ── Infos bébé ──
    $html .= '<h2 style="color:#c2185b;margin-top:16px">👶 Informations du nouveau-né</h2>';
    $html .= '<table><tr><th>ID</th><th>Poids naissance</th><th>Taille</th><th>Sexe</th><th>Apgar 1min</th><th>Apgar 5min</th></tr>';
    $html .= '<tr>';
    $html .= '<td>NB' . str_pad($id, 4, '0', STR_PAD_LEFT) . '</td>';
    $html .= '<td>' . ($bebe->poids_naissance ? $bebe->poids_naissance . ' kg' : '—') . '</td>';
    $html .= '<td>' . ($bebe->taille ? $bebe->taille . ' cm' : '—') . '</td>';
    $html .= '<td>' . ($bebe->sexe ?? '—') . '</td>';
    $html .= '<td>' . ($bebe->apgar_1min ?? '—') . '/10</td>';
    $html .= '<td>' . ($bebe->apgar_5min ?? '—') . '/10</td>';
    $html .= '</tr></table>';

    // ── Infos mère ──
    $html .= '<h2 style="color:#c2185b;margin-top:16px">👩 Mère & accouchement</h2>';
    $html .= '<table><tr><th>Mère</th><th>Type accouchement</th><th>Date accouchement</th><th>Complications</th></tr>';
    $html .= '<tr>';
    $html .= '<td>' . ($patiente ? $patiente->prenom . ' ' . $patiente->nom : '—') . '</td>';
    $html .= '<td>' . ($accouchement->type_accouchement ?? '—') . '</td>';
    $html .= '<td>' . ($accouchement->date_accouchement ?? '—') . '</td>';
    $html .= '<td>' . ($accouchement->complication ?? 'Aucune') . '</td>';
    $html .= '</tr></table>';

    // ── Consultations ──
    $html .= '<h2 style="color:#c2185b;margin-top:16px">🩺 Dernières consultations</h2>';
    $html .= '<table><tr><th>Date</th><th>Motif</th><th>Poids</th><th>Température</th><th>Observation</th></tr>';
    if (count($consultations) === 0) {
        $html .= '<tr><td colspan="5" style="text-align:center">Aucune consultation</td></tr>';
    } else {
        foreach ($consultations as $c) {
            $html .= '<tr>';
            $html .= '<td>' . ($c->date_consultation ?? '—') . '</td>';
            $html .= '<td>' . ($c->motif_consultation ?? '—') . '</td>';
            $html .= '<td>' . ($c->poids ? $c->poids . ' kg' : '—') . '</td>';
            $html .= '<td>' . ($c->temperature ? $c->temperature . '°C' : '—') . '</td>';
            $html .= '<td>' . ($c->observation ?? '—') . '</td>';
            $html .= '</tr>';
        }
    }
    $html .= '</table>';

    // ── Prescriptions ──
    $html .= '<h2 style="color:#c2185b;margin-top:16px">💊 Prescriptions actives</h2>';
    $html .= '<table><tr><th>Date</th><th>Médicaments</th><th>Posologie</th><th>Date fin</th></tr>';
    if (count($prescriptions) === 0) {
        $html .= '<tr><td colspan="4" style="text-align:center">Aucune prescription</td></tr>';
    } else {
        foreach ($prescriptions as $p) {
            $html .= '<tr>';
            $html .= '<td>' . ($p->date_prescription ?? '—') . '</td>';
            $html .= '<td>' . ($p->medicaments ?? '—') . '</td>';
            $html .= '<td>' . ($p->posologie ?? '—') . '</td>';
            $html .= '<td>' . ($p->date_fin ?? '—') . '</td>';
            $html .= '</tr>';
        }
    }
    $html .= '</table>';

    // ── Soins planifiés ──
    $html .= '<h2 style="color:#c2185b;margin-top:16px">🩹 Soins planifiés</h2>';
    $html .= '<table><tr><th>Type</th><th>Date</th><th>Heure</th><th>Fréquence</th><th>Statut</th><th>Note</th></tr>';
    if (count($soins) === 0) {
        $html .= '<tr><td colspan="6" style="text-align:center">Aucun soin planifié</td></tr>';
    } else {
        foreach ($soins as $s) {
            $html .= '<tr>';
            $html .= '<td>' . ($s->type_soin ?? '—') . '</td>';
            $html .= '<td>' . ($s->date_soin ?? '—') . '</td>';
            $html .= '<td>' . ($s->heure_soin ?? '—') . '</td>';
            $html .= '<td>' . ($s->frequence ?? '—') . '</td>';
            $html .= '<td>' . ($s->statut ?? '—') . '</td>';
            $html .= '<td>' . ($s->note ?? '—') . '</td>';
            $html .= '</tr>';
        }
    }
    $html .= '</table>';

    // ── Vaccins ──
    $html .= '<h2 style="color:#c2185b;margin-top:16px">💉 Vaccins</h2>';
    $html .= '<table><tr><th>Vaccin</th><th>Date administration</th><th>Statut</th><th>Lot</th><th>Observations</th></tr>';
    if (count($vaccins) === 0) {
        $html .= '<tr><td colspan="5" style="text-align:center">Aucun vaccin enregistré</td></tr>';
    } else {
        foreach ($vaccins as $v) {
            $html .= '<tr>';
            $html .= '<td>' . ($v->nom_vaccin ?? '—') . '</td>';
            $html .= '<td>' . ($v->date_administration ?? '—') . '</td>';
            $html .= '<td>' . ($v->statut ?? '—') . '</td>';
            $html .= '<td>' . ($v->lot ?? '—') . '</td>';
            $html .= '<td>' . ($v->observations ?? '—') . '</td>';
            $html .= '</tr>';
        }
    }
    $html .= '</table>';

    $html .= '<div class="footer">Maternité — Document confidentiel — ' . $nomBebe . '</div>';

    return Pdf::loadHTML($html)->setPaper('a4')->download('dossier-' . $id . '.pdf');
}

}
