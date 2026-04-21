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
       Schema::create('lits', function (Blueprint $table) {
    $table->id('id_lit');
    $table->foreignId('id_salle')
          ->constrained('salles', 'id_salle')
          ->onDelete('cascade');
    $table->string('numero');
    $table->string('type'); // standard, réanimation, isolement...
    $table->enum('statut', ['disponible', 'occupe', 'maintenance'])->default('disponible');
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lits');
    }
};
