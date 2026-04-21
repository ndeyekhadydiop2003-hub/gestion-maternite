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
    { Schema::create('grossesses', function (Blueprint $table) {
    $table->id('id_grossesse');
    $table->foreignId('id_patient')
          ->constrained('patientes', 'id_patient')
          ->onDelete('cascade');
    $table->date('date_debut');
    $table->date('date_terme_prevu')->nullable();
    $table->integer('semaines_amenorrhee')->nullable();
    $table->integer('nombre_foetus')->default(1);
    $table->enum('rhesus', ['positif', 'negatif'])->nullable();
    $table->boolean('grossesse_a_risque')->default(false);
    $table->enum('type_grossesse', ['simple', 'gemellaire', 'multiple'])->default('simple');
    $table->enum('statut', ['en_cours', 'terminee', 'avortement', 'fausse_couche'])
          ->default('en_cours');
    $table->timestamps();
});;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grossesses');
    }
};
