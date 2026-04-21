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

// ============================================================
// ROUTES PUBLIQUES
// ============================================================
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ============================================================
// ROUTES PROTÉGÉES
// ============================================================
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ── Accessible à tous les connectés ──────────────────────
    Route::apiResource('patientes',        PatienteController::class);
    Route::apiResource('grossesses',       GrossesseController::class);
    Route::apiResource('consultations',    ConsultationController::class);
    Route::apiResource('accouchements',    AccouchementController::class);
    Route::apiResource('nouveau-nes',      NouveauNeController::class);
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

    // ── Admin seulement ───────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('personnel', PersonnelMedicalController::class);
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