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
            $table->date('date_consultation');
            $table->decimal('poids', 5, 2)->nullable();
            $table->decimal('hauteur_uterine', 5, 2)->nullable();
            $table->decimal('temperature', 4, 1)->nullable();
            $table->decimal('tension', 5, 2)->nullable();
            $table->text('observation')->nullable();
            $table->unsignedBigInteger('id_patient');
            $table->unsignedBigInteger('id_grossesse')->nullable();
            $table->unsignedBigInteger('id_personnel');
            $table->foreign('id_patient')->references('id_patient')->on('patientes')->onDelete('cascade');
            $table->foreign('id_grossesse')->references('id_grossesse')->on('grossesses')->onDelete('set null');
            $table->foreign('id_personnel')->references('id_personnel')->on('personnel_medical')->onDelete('cascade');
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
