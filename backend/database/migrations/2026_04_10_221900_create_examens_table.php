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
        Schema::create('examens', function (Blueprint $table) {
            $table->id('id_examen');
            $table->date('date_examen');
            $table->enum('statut', ['prescrit','en_cours','realise','annule'])->default('prescrit');
            $table->unsignedBigInteger('id_prescription');
            $table->foreign('id_prescription')->references('id_prescription')->on('prescriptions')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('examens');
    }
};
