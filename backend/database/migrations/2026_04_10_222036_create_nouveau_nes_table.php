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
       Schema::create('nouveau_nes', function (Blueprint $table) {
    $table->id('id_nouveau_ne');
    $table->foreignId('id_accouchement')
          ->constrained('accouchements', 'id_accouchement')
          ->onDelete('cascade');
    $table->foreignId('id_patient')
          ->nullable() // (0,1) → deviendra patient à part entière
          ->constrained('patientes', 'id_patient')
          ->onDelete('set null');
    $table->enum('sexe', ['masculin', 'feminin', 'indetermine']);
    $table->decimal('poids_naissance', 5, 2)->nullable(); // en kg
    $table->decimal('taille', 5, 2)->nullable(); // en cm
    $table->integer('apgar_1min')->nullable();  // score 0-10
    $table->integer('apgar_5min')->nullable();  // score 0-10
    $table->enum('etat_sante', ['bon', 'moyen', 'critique'])->default('bon');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nouveau_nes');
    }
};
