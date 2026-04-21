<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('consultation_infectiologie', function (Blueprint $table) {
            $table->id();
 
            // ── Clé étrangère ─────────────────────────────────────
            $table->foreignId('id_consultation')
                  ->constrained('consultations', 'id_consultation')
                  ->onDelete('cascade');
 
            // ── Attributs cliniques ───────────────────────────────
            $table->string('type_infection')->nullable();      // urinaire, vaginale, listériose...
            $table->string('agent_pathogene')->nullable();     // E.coli, Streptocoque B...
            $table->date('date_diagnostic')->nullable();
            $table->text('antibiogramme')->nullable();         // résultats sensibilité ATB
            $table->text('traitement_ATB')->nullable();        // antibiotique prescrit + durée
            $table->enum('statut_resolution', [
                'en_cours', 'resolu', 'chronique', 'echec'
            ])->nullable();
            $table->enum('risque_neonatal', [
                'faible', 'modere', 'eleve'
            ])->nullable();                                    // risque de transmission au bébé
 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_infectiologie');
    }
};
