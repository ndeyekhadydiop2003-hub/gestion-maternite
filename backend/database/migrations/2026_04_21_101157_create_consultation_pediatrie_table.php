<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultation_pediatrie', function (Blueprint $table) {
            $table->id();

            // ── Clés étrangères ───────────────────────────────────
            $table->foreignId('id_consultation')
                  ->constrained('consultations', 'id_consultation')
                  ->onDelete('cascade');

            // ✅ Correction : référence explicite vers la PK personnalisée
            $table->unsignedBigInteger('id_nouveau_ne')->nullable();
            $table->foreign('id_nouveau_ne')
                  ->references('id_nouveau_ne')
                  ->on('nouveau_nes')
                  ->onDelete('set null');

            // ── Attributs cliniques ───────────────────────────────
            $table->decimal('taille', 5, 2)->nullable();
            $table->decimal('perimetre_cranien', 5, 2)->nullable();
            $table->boolean('vaccin_a_jour')->default(false);
            $table->text('vaccins_notes')->nullable();
            $table->text('developpement')->nullable();
            $table->enum('allaitement', [
                'maternel', 'artificiel', 'mixte', 'sevrage'
            ])->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_pediatrie');
    }
};
