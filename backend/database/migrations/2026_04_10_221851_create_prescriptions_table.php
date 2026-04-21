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
     Schema::create('prescriptions', function (Blueprint $table) {
    $table->id('id_prescription');
    $table->foreignId('id_patient')
          ->constrained('patientes', 'id_patient')
          ->onDelete('cascade');
    $table->foreignId('id_personnel')
          ->constrained('personnel_medical', 'id_personnel')
          ->onDelete('restrict');
    $table->foreignId('id_consultation') // ✅ CORRECTION : lien vers la consultation d'origine
          ->nullable()
          ->constrained('consultations', 'id_consultation')
          ->onDelete('set null');
    $table->text('medicaments');
    $table->text('posologie');
    $table->date('date_prescription');
    $table->date('date_fin')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
