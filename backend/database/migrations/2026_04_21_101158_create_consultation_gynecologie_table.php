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
      Schema::create('consultation_gynecologie', function (Blueprint $table) {
            $table->id();
 
            // ── Clé étrangère ─────────────────────────────────────
            $table->foreignId('id_consultation')
                  ->constrained('consultations', 'id_consultation')
                  ->onDelete('cascade');
 
            // ── Attributs cliniques ───────────────────────────────
            $table->date('date_derniere_regles')->nullable();
            $table->integer('cycle_menstruel')->nullable();          // en jours
            $table->date('dernier_frottis')->nullable();
            $table->enum('examen_seins', [
                'normal', 'anomalie_detectee', 'non_effectue'
            ])->nullable();
            $table->text('diagnostic')->nullable();
            $table->string('type_contraception')->nullable();
 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_gynecologie');
    }
};
