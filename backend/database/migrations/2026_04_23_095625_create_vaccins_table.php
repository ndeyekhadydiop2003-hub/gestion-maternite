<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vaccins', function (Blueprint $table) {
            $table->id('id_vaccin');
            $table->foreignId('id_nouveau_ne')->constrained('nouveau_nes', 'id_nouveau_ne')->onDelete('cascade');
            $table->enum('nom_vaccin', ['BCG', 'Hepatite_B', 'Polio', 'Pentavalent', 'Rotavirus', 'Autre']);
            $table->date('date_administration')->nullable();
            $table->enum('statut', ['fait', 'prevu', 'non_fait'])->default('prevu');
            $table->string('lot', 50)->nullable();
            $table->string('site_injection', 100)->nullable();
            $table->text('observations')->nullable();
            $table->foreignId('id_personnel')->nullable()->constrained('personnel_medical', 'id_personnel')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccins');
    }
};
