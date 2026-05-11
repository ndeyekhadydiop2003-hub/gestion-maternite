<?php

use Illuminate\Support\Facades\Route;
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
use App\Http\Controllers\Api\ConsultationSageFemmeController;
use App\Http\Controllers\Api\ConsultationPediatrieController;
use App\Http\Controllers\Api\ConsultationGynecologieController;
use App\Http\Controllers\Api\ConsultationPsychologieController;
use App\Http\Controllers\Api\ConsultationAnesthesieController;
use App\Http\Controllers\Api\ConsultationPlanningController;
use App\Http\Controllers\Api\ConsultationInfectiologieController;
use App\Http\Controllers\Api\PlanifierRvController;
use App\Http\Controllers\Api\PdfController;
use App\Http\Controllers\Api\VaccinController;
use App\Http\Controllers\Api\NotificationController;

// ============================================================
// ROUTES PUBLIQUES
// ============================================================
Route::post('/login',       [AuthController::class, 'login']);
Route::post('/register',    [AuthController::class, 'register']);
Route::get('/stats/public', [DashboardController::class, 'statsPublic']);

// ============================================================
// ROUTES PROTÉGÉES
// ============================================================
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ────────────────────────────────────────────────
    Route::post('/logout',     [AuthController::class, 'logout']);
    Route::get('/me',          [AuthController::class, 'me']);
    Route::put('/me',          [AuthController::class, 'updateMe']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);

    // ── Notifications ────────────────────────────────────────
    Route::get('/notifications',           [NotificationController::class, 'index']);
    Route::post('/notifications',          [NotificationController::class, 'store']);
    Route::patch('/notifications/tout-lu', [NotificationController::class, 'toutMarquerLu']);
    Route::patch('/notifications/{id}/lu', [NotificationController::class, 'marquerLu']);

    // ── Dashboard ────────────────────────────────────────────
    Route::get('/dashboard',                [DashboardController::class, 'index']);
    Route::get('/dashboard/stats',          [DashboardController::class, 'stats']);
    Route::get('/dashboard/pediatre/stats', [DashboardController::class, 'pediatreStats']);

    // ── PDF ──────────────────────────────────────────────────
    Route::prefix('pdf')->group(function () {
        Route::get('liste-patientes',       [PdfController::class, 'listePatientes']);
        Route::get('fiche-admission',       [PdfController::class, 'ficheAdmission']);
        Route::get('planning-rdv',          [PdfController::class, 'planningRdv']);
        Route::get('bulletin-sortie',       [PdfController::class, 'bulletinSortie']);
        Route::get('occupation-lits',       [PdfController::class, 'occupationLits']);
        Route::get('rapport-transmissions', [PdfController::class, 'rapportTransmissions']);
    });

    // ── Resources communes ───────────────────────────────────
    Route::apiResource('planifier-rv',     PlanifierRvController::class);
    Route::post('planifier-rv/{id}/confirmer', [PlanifierRvController::class, 'confirmer']);
    Route::apiResource('patientes',        PatienteController::class);
    Route::apiResource('grossesses',       GrossesseController::class);
    Route::apiResource('consultations',    ConsultationController::class);
    Route::apiResource('accouchements',    AccouchementController::class);
    Route::apiResource('prescriptions',    PrescriptionController::class);
    Route::apiResource('examens',          ExamenController::class);
    Route::apiResource('rendez-vous',      RendezVousController::class);
    Route::apiResource('hospitalisations', HospitalisationController::class);
    Route::apiResource('antecedents',      AntecedentMedicalController::class);
    Route::apiResource('supervisions',     SupervisionController::class);
    Route::apiResource('salles',           SalleController::class);
    Route::apiResource('lits',             LitController::class);
    Route::apiResource('resultats-examens', ResultatExamenController::class);
    Route::get('examens/{examen}/resultats', [ResultatExamenController::class, 'parExamen']);

    // ── Nouveau-nés ──────────────────────────────────────────
    Route::apiResource('nouveau-nes', NouveauNeController::class);
    Route::get('nouveau-nes/{id}/vaccins',                [VaccinController::class, 'parBebe']);
    Route::get('nouveau-nes/{id}/consultations-pediatrie', [ConsultationPediatrieController::class, 'parBebe']);

    // ── Vaccins ──────────────────────────────────────────────
    Route::apiResource('vaccins', VaccinController::class, ['parameters' => ['vaccins' => 'id']]);
    Route::post('vaccins/{id}/marquer-fait', [VaccinController::class, 'marquerFait']);
    Route::get('patientes/{id}/vaccins',     [VaccinController::class, 'indexFemme']);

    // ── Consultations pédiatriques ───────────────────────────
    Route::post('consultations-pediatrie', [ConsultationPediatrieController::class, 'store']);
    Route::get('consultations-pediatrie',  [ConsultationPediatrieController::class, 'index']);

    // ── Personnel — lecture pour tous ────────────────────────
    Route::get('personnel',      [PersonnelMedicalController::class, 'index']);
    Route::get('personnel/{id}', [PersonnelMedicalController::class, 'show']);

    // ── Admin et médecin chef ─────────────────────────────────
    Route::middleware('role:admin,medecin_chef')->group(function () {
        Route::post('personnel',        [PersonnelMedicalController::class, 'store']);
        Route::put('personnel/{id}',    [PersonnelMedicalController::class, 'update']);
        Route::delete('personnel/{id}', [PersonnelMedicalController::class, 'destroy']);
    });

    // ── Par rôle ─────────────────────────────────────────────
    Route::middleware('role:sage_femme,admin')->group(function () {
        Route::apiResource('consultation-sage-femme', ConsultationSageFemmeController::class);
    });

    Route::middleware('role:pediatre,admin')->group(function () {
        Route::apiResource('consultation-pediatrie', ConsultationPediatrieController::class);
    });

    Route::middleware('role:gynecologue,admin')->group(function () {
        Route::apiResource('consultation-gynecologie', ConsultationGynecologieController::class);
    });

    Route::middleware('role:psychologue,admin')->group(function () {
        Route::apiResource('consultation-psychologie', ConsultationPsychologieController::class);
    });

    Route::middleware('role:anesthesiste,admin')->group(function () {
        Route::apiResource('consultation-anesthesie', ConsultationAnesthesieController::class);
    });

    Route::middleware('role:sage_femme,gynecologue,admin')->group(function () {
        Route::apiResource('consultation-planning', ConsultationPlanningController::class);
    });

    Route::middleware('role:infectiologue,admin')->group(function () {
        Route::apiResource('consultation-infectiologie', ConsultationInfectiologieController::class);
    });
});
