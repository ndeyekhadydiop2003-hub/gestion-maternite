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
        Schema::create('resultats_examens', function (Blueprint $table) {
    $table->id('id_resultat');
    $table->foreignId('id_examen')
          ->constrained('examens', 'id_examen')
          ->onDelete('cascade');
    $table->text('resultat'); // chiffrement recommandé (RGPD)
    $table->date('date_resultat');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resultats_examens');
    }
};
