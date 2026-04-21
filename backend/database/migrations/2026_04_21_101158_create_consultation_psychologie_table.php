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
       Schema::create('consultation_psychologie', function (Blueprint $table) {
            $table->id();
 
            // ── Clé étrangère ─────────────────────────────────────
            $table->foreignId('id_consultation')
                  ->constrained('consultations', 'id_consultation')
                  ->onDelete('cascade');
 
            // ── Attributs cliniques ───────────────────────────────
            $table->string('type_suivi')->nullable();   // individuel, groupe, familial
            $table->text('bilan')->nullable();
            $table->text('objectifs')->nullable();
            $table->enum('niveau_stress', [
                'faible', 'modere', 'eleve', 'critique'
            ])->nullable();
            $table->integer('score_edinburgh')->nullable(); // 0-30 dépression post-partum
            $table->string('orientation_ext')->nullable();  // orientation vers spécialiste
 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_psychologie');
    }
};
