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
        Schema::create('consultation_pediatrie', function (Blueprint $table) {
            $table->id();
 
            // ── Clés étrangères ───────────────────────────────────
            $table->foreignId('id_consultation')
                  ->constrained('consultations', 'id_consultation')
                  ->onDelete('cascade');
 
            $table->foreignId('id_nouveau_ne')         // lien vers le bébé suivi
                  ->nullable()
                  ->constrained('nouveau_nes', 'id_nouveau_ne')
                  ->onDelete('set null');
 
            // ── Attributs cliniques ───────────────────────────────
            $table->decimal('taille', 5, 2)->nullable();             // en cm
            $table->decimal('perimetre_cranien', 5, 2)->nullable();  // en cm
            $table->boolean('vaccin_a_jour')->default(false);
            $table->text('vaccins_notes')->nullable();
            $table->text('developpement')->nullable();
            $table->enum('allaitement', [
                'maternel', 'artificiel', 'mixte', 'sevrage'
            ])->nullable();
 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_pediatrie');
    }
};
