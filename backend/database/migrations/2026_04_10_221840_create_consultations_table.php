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
        Schema::create('consultations', function (Blueprint $table) {
    $table->id('id_consultation');
    $table->foreignId('id_patient')
          ->constrained('patientes', 'id_patient')
          ->onDelete('cascade');
    $table->foreignId('id_grossesse')
          ->nullable()
          ->constrained('grossesses', 'id_grossesse')
          ->onDelete('set null');
    $table->foreignId('id_personnel')
          ->constrained('personnel_medical', 'id_personnel')
          ->onDelete('restrict');
    $table->date('date_consultation');
    $table->string('motif_consultation')->nullable();
    $table->decimal('poids', 5, 2)->nullable();
    // ✅ CORRECTION : hauteur_uterine supprimée ici — déjà dans details_sage_femme (redondance évitée)
    $table->decimal('temperature', 4, 1)->nullable();
    $table->string('tension')->nullable(); // ex: "12/8"
    $table->text('observation')->nullable();
    $table->date('prochain_rdv')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
