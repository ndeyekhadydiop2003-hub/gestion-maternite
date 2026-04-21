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
      Schema::create('supervisions', function (Blueprint $table) {
    $table->id('id_supervision');
    $table->foreignId('id_consultation')
          ->constrained('consultations', 'id_consultation')
          ->onDelete('cascade');
    $table->foreignId('id_personnel')
          ->constrained('personnel_medical', 'id_personnel')
          ->onDelete('restrict');
    $table->date('date_supervision');
    $table->text('commentaire')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supervisions');
    }
};
