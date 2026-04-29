<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->id('id_rendez_vous');
            $table->foreignId('id_patient')->constrained('patientes', 'id_patient');
            $table->foreignId('id_personnel')->constrained('personnel_medical', 'id_personnel');
            $table->unsignedBigInteger('id_planification')->nullable();
            $table->date('date_rv');
            $table->time('heure_rv');
            $table->string('motif', 255)->nullable();
            $table->enum('priorite', ['normale', 'urgente', 'critique'])->default('normale');
            $table->enum('statut', ['planifie', 'confirme', 'annule', 'effectue'])->default('planifie');
            $table->timestamps();

            $table->foreign('id_planification')
                  ->references('id')
                  ->on('planifier_rv')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};
