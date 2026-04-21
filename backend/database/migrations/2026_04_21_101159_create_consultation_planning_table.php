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
         Schema::create('consultation_planning', function (Blueprint $table) {
            $table->id();
 
            // ── Clé étrangère ─────────────────────────────────────
            $table->foreignId('id_consultation')
                  ->constrained('consultations', 'id_consultation')
                  ->onDelete('cascade');
 
            // ── Attributs cliniques ───────────────────────────────
            $table->string('methode_contraceptive')->nullable();  // pilule, DIU, implant...
            $table->enum('desir_grossesse', [
                'oui', 'non', 'indecis'
            ])->nullable();
            $table->date('date_prochaine_visite')->nullable();
            $table->text('notes')->nullable();
 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_planning');
    }
};
