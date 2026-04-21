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
       Schema::create('hospitalisations', function (Blueprint $table) {
    $table->id('id_hospitalisation');
    $table->foreignId('id_patient')
          ->constrained('patientes', 'id_patient')
          ->onDelete('cascade');
    $table->foreignId('id_lit')
          ->constrained('lits', 'id_lit')
          ->onDelete('restrict');
    $table->foreignId('id_personnel')
          ->nullable()
          ->constrained('personnel_medical', 'id_personnel')
          ->onDelete('set null');
    $table->date('date_entree');
    $table->date('date_sortie')->nullable();
    $table->string('motif');
    $table->enum('statut', ['en_cours', 'terminee', 'transferee'])->default('en_cours');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hospitalisations');
    }
};
