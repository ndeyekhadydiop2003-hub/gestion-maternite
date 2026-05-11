<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Corriger la table vaccins (actuellement vide de colonnes)
        Schema::table('vaccins', function (Blueprint $table) {
            $table->foreignId('id_nouveau_ne')->constrained('nouveau_nes', 'id_nouveau_ne')->onDelete('cascade');
            $table->enum('nom_vaccin', ['BCG', 'Hepatite_B', 'Polio', 'Pentavalent', 'Rotavirus', 'Autre']);
            $table->date('date_administration')->nullable();
            $table->enum('statut', ['fait', 'prevu', 'non_fait'])->default('prevu');
            $table->string('lot', 50)->nullable();
            $table->string('site_injection', 100)->nullable();
            $table->text('observations')->nullable();
            $table->unsignedBigInteger('id_personnel')->nullable();
            $table->unsignedBigInteger('id_assigne')->nullable();

            $table->foreign('id_personnel')
                  ->references('id_personnel')
                  ->on('personnel_medical')
                  ->onDelete('set null');

            $table->foreign('id_assigne')
                  ->references('id_personnel')
                  ->on('personnel_medical')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('vaccins', function (Blueprint $table) {
            $table->dropForeign(['id_nouveau_ne']);
            $table->dropForeign(['id_personnel']);
            $table->dropForeign(['id_assigne']);
            $table->dropColumn([
                'id_nouveau_ne', 'nom_vaccin', 'date_administration',
                'statut', 'lot', 'site_injection', 'observations',
                'id_personnel', 'id_assigne',
            ]);
        });
    }
};
