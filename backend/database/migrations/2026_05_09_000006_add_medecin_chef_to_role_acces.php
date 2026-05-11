<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter medecin_chef à l'enum role_acces
        DB::statement("ALTER TABLE utilisateurs MODIFY COLUMN role_acces ENUM(
            'admin','pediatre','sage_femme','infirmiere',
            'psychologue','genycologue','secretaire','medecin_chef'
        ) NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE utilisateurs MODIFY COLUMN role_acces ENUM(
            'admin','pediatre','sage_femme','infirmiere',
            'psychologue','genycologue','secretaire'
        ) NOT NULL");
    }
};
