<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('rendez_vous'); // supprimer d'abord car il dépend de planifier_rv
        Schema::dropIfExists('planifier_rv');

        Schema::create('planifier_rv', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_patient')->constrained('patientes', 'id_patient');
            $table->foreignId('id_personnel')->constrained('personnel_medical', 'id_personnel');
            $table->string('delai_recommande', 50)->nullable();
            $table->enum('priorite', ['normale', 'urgente'])->default('normale');
            $table->text('motif')->nullable();
            $table->enum('statut', ['en_attente', 'confirme'])->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planifier_rv');
    }
};
