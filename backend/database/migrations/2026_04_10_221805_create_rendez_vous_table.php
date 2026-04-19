<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->id('id_rv');
            $table->date('date_rv');
            $table->time('heure_rv');
            $table->string('motif')->nullable();
            $table->enum('statut', ['planifie','confirme','annule','effectue'])->default('planifie');
            $table->unsignedBigInteger('id_patient')->nullable();
            $table->unsignedBigInteger('id_personnel')->nullable();
            $table->timestamps();
        });

        Schema::table('rendez_vous', function (Blueprint $table) {
            $table->foreign('id_patient')->references('id_patient')->on('patientes')->onDelete('cascade');
            $table->foreign('id_personnel')->references('id_personnel')->on('personnel_medical')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};