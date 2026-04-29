<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatienteController;
use App\Http\Controllers\Api\PersonnelMedicalController;
use App\Http\Controllers\Api\RendezVousController;
use App\Http\Controllers\Api\AntecedentMedicalController;
use App\Http\Controllers\Api\GrossesseController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\ExamenController;
use App\Http\Controllers\Api\ResultatExamenController;
use App\Http\Controllers\Api\AccouchementController;
use App\Http\Controllers\Api\SupervisionController;
use App\Http\Controllers\Api\NouveauNeController;
use App\Http\Controllers\Api\SalleController;
use App\Http\Controllers\Api\LitController;
use App\Http\Controllers\Api\HospitalisationController;
use App\Http\Controllers\Api\DashboardController;
use App\Models\Notification;
use App\Http\Controllers\Api\VaccinController;
use App\Http\Controllers\Api\PlanifierRvController;
use App\Http\Controllers\Api\ConsultationPediatreController;
use App\Http\Controllers\Api\SoinController;
use App\Http\Controllers\Api\SageFemmeDashboardController;

// ============================================================
// ROUTES PUBLIQUES
// ============================================================
Route::post('/login', [AuthController::class, 'login']);

Route::get('/stats/public', function () {
    return response()->json([
        'total_naissances' => \App\Models\NouveauNe::count(),
        'satisfaction'     => 98,
    ]);
});

// ============================================================
// ROUTES PROTÉGÉES — Sanctum
// ============================================================
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ─────────────────────────────────────────────────
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    Route::put('/me', function(\Illuminate\Http\Request $request) {
        $user = $request->user();
        $user->update(['login' => $request->login]);
        return response()->json(['message' => 'Profil mis à jour']);
    });

    Route::put('/me/password', function(\Illuminate\Http\Request $request) {
        $request->validate(['ancien_mdp' => 'required', 'nouveau_mdp' => 'required|min:6']);
        $user = $request->user();
        if (!\Hash::check($request->ancien_mdp, $user->mdp)) {
            return response()->json(['message' => 'Ancien mot de passe incorrect'], 422);
        }
        $user->update(['mdp' => \Hash::make($request->nouveau_mdp)]);
        return response()->json(['message' => 'Mot de passe modifié avec succès']);
    });

    // ── Dashboard Sage-femme ──────────────────────────────────
    Route::prefix('sage-femme/dashboard')->group(function () {
        Route::get('/stats',           [SageFemmeDashboardController::class, 'stats']);
        Route::get('/urgences',        [SageFemmeDashboardController::class, 'urgences']);
        Route::get('/prochain-rdv',    [SageFemmeDashboardController::class, 'prochainRdv']);
        Route::get('/grossesse-rapide',[SageFemmeDashboardController::class, 'grossesseRapide']);
    });

    // ── Planifications RV ─────────────────────────────────────
    Route::apiResource('planifier-rv', PlanifierRvController::class, [
        'parameters' => ['planifier-rv' => 'id']
    ]);
    Route::patch('planifier-rv/{id}/confirmer', [PlanifierRvController::class, 'confirmer']);

    // ── Vaccins ───────────────────────────────────────────────
    Route::apiResource('vaccins', VaccinController::class, [
        'parameters' => ['vaccins' => 'id']
    ]);
    Route::get('nouveau-nes/{id}/vaccins', [VaccinController::class, 'parBebe']);

    // ── Notifications ─────────────────────────────────────────
    Route::get('/notifications', function (\Illuminate\Http\Request $request) {
        $notifications = Notification::where('id_destinataire', $request->user()->id_utilisateur)
            ->orderByDesc('created_at')
            ->get();
        return response()->json($notifications);
    });

    Route::put('/notifications/{id}/lu', function ($id, \Illuminate\Http\Request $request) {
        Notification::where('id', $id)
            ->where('id_destinataire', $request->user()->id_utilisateur)
            ->update(['lu' => true]);
        return response()->json(['message' => 'Lu']);
    });

    Route::put('/notifications/lire-tout', function (\Illuminate\Http\Request $request) {
        Notification::where('id_destinataire', $request->user()->id_utilisateur)
            ->update(['lu' => true]);
        return response()->json(['message' => 'Toutes lues']);
    });

    // ── Patientes ────────────────────────────────────────────
    Route::apiResource('patientes', PatienteController::class, [
        'parameters' => ['patientes' => 'id']
    ]);
    Route::get('patientes/{id}/grossesses',       [PatienteController::class, 'grossesses']);
    Route::get('patientes/{id}/consultations',    [PatienteController::class, 'consultations']);
    Route::get('patientes/{id}/antecedents',      [PatienteController::class, 'antecedents']);
    Route::get('patientes/{id}/hospitalisations', [PatienteController::class, 'hospitalisations']);

    // ── Personnel Médical ─────────────────────────────────────
    Route::apiResource('personnel-medical', PersonnelMedicalController::class, [
        'parameters' => ['personnel-medical' => 'id']
    ]);

    // ── Rendez-vous ───────────────────────────────────────────
    Route::apiResource('rendez-vous', RendezVousController::class, [
        'parameters' => ['rendez-vous' => 'id']
    ]);
    Route::patch('rendez-vous/{id}/statut', [RendezVousController::class, 'updateStatut']);

    // ── Antécédents Médicaux ──────────────────────────────────
    Route::apiResource('antecedents-medicaux', AntecedentMedicalController::class, [
        'parameters' => ['antecedents-medicaux' => 'id']
    ]);

    // ── Grossesses ────────────────────────────────────────────
    Route::apiResource('grossesses', GrossesseController::class, [
        'parameters' => ['grossesses' => 'id']
    ]);

    // ── Consultations ─────────────────────────────────────────
    Route::apiResource('consultations', ConsultationController::class, [
        'parameters' => ['consultations' => 'id']
    ]);

    // ── Prescriptions ─────────────────────────────────────────
    Route::apiResource('prescriptions', PrescriptionController::class, [
        'parameters' => ['prescriptions' => 'id']
    ]);

    // ── Examens ───────────────────────────────────────────────
    Route::apiResource('examens', ExamenController::class, [
        'parameters' => ['examens' => 'id']
    ]);
    Route::post('examens/{id}/resultat', [ExamenController::class, 'ajouterResultat']);

    // ── Résultats d'examens ───────────────────────────────────
    Route::apiResource('resultats-examens', ResultatExamenController::class, [
        'parameters' => ['resultats-examens' => 'id'],
        'only'       => ['index', 'show', 'update', 'destroy']
    ]);

    // ── Accouchements ─────────────────────────────────────────
    Route::apiResource('accouchements', AccouchementController::class, [
        'parameters' => ['accouchements' => 'id']
    ]);

    // ── Supervisions ──────────────────────────────────────────
    Route::apiResource('supervisions', SupervisionController::class, [
        'parameters' => ['supervisions' => 'id']
    ]);

    // ── Consultations pédiatriques ────────────────────────────
    Route::get('nouveau-nes/{id}/consultations-pediatrie',
        [ConsultationPediatreController::class, 'parBebe']);

    Route::apiResource('consultations-pediatrie', ConsultationPediatreController::class, [
        'parameters' => ['consultations-pediatrie' => 'id']
    ]);

    // ── Nouveau-nés ───────────────────────────────────────────
    Route::apiResource('nouveau-nes', NouveauNeController::class, [
        'parameters' => ['nouveau-nes' => 'id']
    ]);

    // ── Soins ─────────────────────────────────────────────────
    Route::get('nouveau-nes/{id}/soins', [SoinController::class, 'parBebe']);
    Route::apiResource('soins', SoinController::class, [
        'parameters' => ['soins' => 'id']
    ]);

    // ── Salles ────────────────────────────────────────────────
    Route::apiResource('salles', SalleController::class, [
        'parameters' => ['salles' => 'id']
    ]);

    // ── Lits ──────────────────────────────────────────────────
    Route::get('lits/disponibles', [LitController::class, 'disponibles']);
    Route::apiResource('lits', LitController::class, [
        'parameters' => ['lits' => 'id']
    ]);

    // ── Hospitalisations ──────────────────────────────────────
    Route::apiResource('hospitalisations', HospitalisationController::class, [
        'parameters' => ['hospitalisations' => 'id']
    ]);
    Route::patch('hospitalisations/{id}/sortie', [HospitalisationController::class, 'sortie']);

    // ── Dashboard général ─────────────────────────────────────
    Route::get('/dashboard/stats',         [DashboardController::class, 'stats']);
    Route::get('/dashboard/activite-jour', [DashboardController::class, 'activiteJour']);
    Route::get('/dashboard/pediatre/stats', [\App\Http\Controllers\Api\DashboardPediatreController::class, 'stats']); // ← nouvelle ligne

    // ── PDF ───────────────────────────────────────────────────
    Route::get('/pdf/liste-patientes',       [\App\Http\Controllers\Api\PdfController::class, 'listePatientes']);
    Route::get('/pdf/fiche-admission',       [\App\Http\Controllers\Api\PdfController::class, 'ficheAdmission']);
    Route::get('/pdf/planning-rdv',          [\App\Http\Controllers\Api\PdfController::class, 'planningRdv']);
    Route::get('/pdf/bulletin-sortie',       [\App\Http\Controllers\Api\PdfController::class, 'bulletinSortie']);
    Route::get('/pdf/occupation-lits',       [\App\Http\Controllers\Api\PdfController::class, 'occupationLits']);
    Route::get('/pdf/rapport-transmissions', [\App\Http\Controllers\Api\PdfController::class, 'rapportTransmissions']);
    Route::get('/pdf/dossier-bebe/{id}',     [\App\Http\Controllers\Api\PdfController::class, 'dossierBebe']);

});
