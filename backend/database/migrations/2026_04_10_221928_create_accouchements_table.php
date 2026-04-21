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
        Schema::create('accouchements', function (Blueprint $table) {
    $table->id('id_accouchement');
    $table->foreignId('id_grossesse')
          ->constrained('grossesses', 'id_grossesse')
          ->onDelete('cascade');
    $table->foreignId('id_personnel')
          ->nullable()
          ->constrained('personnel_medical', 'id_personnel')
          ->onDelete('set null');
    $table->date('date_accouchement');
    $table->enum('type_accouchement', ['voie_basse', 'cesarienne', 'forceps', 'ventouse']);
    $table->integer('duree_travail')->nullable(); // en minutes
    $table->string('complication')->nullable();
    $table->enum('statut', ['en_cours', 'termine', 'complique'])->default('termine');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accouchements');
    }
};
