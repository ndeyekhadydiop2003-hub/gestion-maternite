<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            // Ajouter nom si absent
            if (!Schema::hasColumn('utilisateurs', 'nom')) {
                $table->string('nom')->after('id_utilisateur')->default('');
            }
            // Ajouter prenom si absent
            if (!Schema::hasColumn('utilisateurs', 'prenom')) {
                $table->string('prenom')->after('nom')->default('');
            }
            // Ajouter medecin_chef à l'enum si pas présent
            // Note: modifier un enum en Laravel nécessite doctrine/dbal
        });
    }

    public function down(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            if (Schema::hasColumn('utilisateurs', 'nom')) {
                $table->dropColumn('nom');
            }
            if (Schema::hasColumn('utilisateurs', 'prenom')) {
                $table->dropColumn('prenom');
            }
        });
    }
};
