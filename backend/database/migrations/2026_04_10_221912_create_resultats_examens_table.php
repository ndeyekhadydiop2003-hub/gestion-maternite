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
            $table->text('valeur');
            $table->boolean('est_normal')->default(true);
            $table->date('date_resultat');
            $table->unsignedBigInteger('id_examen');
            $table->foreign('id_examen')->references('id_examen')->on('examens')->onDelete('cascade');
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
