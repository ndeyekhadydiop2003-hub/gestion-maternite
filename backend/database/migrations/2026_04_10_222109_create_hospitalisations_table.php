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
            $table->date('date_admission');
            $table->date('date_sorti')->nullable();
            $table->string('motif');
            $table->enum('statut', ['active','terminee','transferee'])->default('active');
            $table->date('date_occupation')->nullable();
            $table->unsignedBigInteger('id_patient');
            $table->unsignedBigInteger('id_lit');
            $table->unsignedBigInteger('id_accouchement')->nullable();
            $table->unsignedBigInteger('id_utilisateur')->nullable();
            $table->foreign('id_patient')->references('id_patient')->on('patientes')->onDelete('cascade');
            $table->foreign('id_lit')->references('id_lit')->on('lits')->onDelete('cascade');
            $table->foreign('id_accouchement')->references('id_accouchement')->on('accouchements')->onDelete('set null');
            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('utilisateurs')->onDelete('set null');
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
