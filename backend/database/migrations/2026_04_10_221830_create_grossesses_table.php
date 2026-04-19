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
    {  Schema::create('grossesses', function (Blueprint $table) {
            $table->id('id_grossesse');
            $table->date('date_debut');
            $table->date('date_terme_prevu')->nullable();
            $table->integer('semaines_amenorrhee')->nullable();
            $table->enum('statut', ['en_cours','terminee','interrompue'])->default('en_cours');
            $table->enum('type_grossesse', ['simple','gemellaire','multiple'])->default('simple');
            $table->unsignedBigInteger('id_patient');
            $table->foreign('id_patient')->references('id_patient')->on('patientes')->onDelete('cascade');
            $table->timestamps();
        });;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grossesses');
    }
};
