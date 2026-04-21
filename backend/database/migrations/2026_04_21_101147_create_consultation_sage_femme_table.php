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
        Schema::create('consultation_sage_femme', function (Blueprint $table) {
            $table->id();
 
            // ── Clés étrangères ───────────────────────────────────
            $table->foreignId('id_consultation')
                  ->constrained('consultations', 'id_consultation')
                  ->onDelete('cascade');
 
            $table->foreignId('id_grossesse')          // lien direct grossesse
                  ->nullable()
                  ->constrained('grossesses', 'id_grossesse')
                  ->onDelete('set null');
 
            // ── Attributs cliniques ───────────────────────────────
            $table->decimal('hauteur_uterine', 5, 2)->nullable();   // en cm
            $table->string('bruit_coeur_foetal')->nullable();        // ex: "140 bpm"
            $table->enum('mouvements_foetaux', [
                'absents', 'faibles', 'normaux', 'actifs'
            ])->nullable();
            $table->integer('gravite')->nullable();    // nombre de grossesses
            $table->integer('parite')->nullable();     // nombre d'accouchements
            $table->string('type_presentation')->nullable(); // céphalique, siège, transverse
 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_sage_femme');
    }
};
