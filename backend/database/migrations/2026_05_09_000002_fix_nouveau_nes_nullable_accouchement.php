<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Rendre id_accouchement nullable pour les transferts
        Schema::table('nouveau_nes', function (Blueprint $table) {
            // Supprimer la contrainte FK d'abord
            $table->dropForeign(['id_accouchement']);
            // Modifier la colonne pour la rendre nullable
            $table->unsignedBigInteger('id_accouchement')->nullable()->change();
            // Remettre la contrainte FK
            $table->foreign('id_accouchement')
                  ->references('id_accouchement')
                  ->on('accouchements')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('nouveau_nes', function (Blueprint $table) {
            $table->dropForeign(['id_accouchement']);
            $table->unsignedBigInteger('id_accouchement')->nullable(false)->change();
            $table->foreign('id_accouchement')
                  ->references('id_accouchement')
                  ->on('accouchements')
                  ->onDelete('cascade');
        });
    }
};
