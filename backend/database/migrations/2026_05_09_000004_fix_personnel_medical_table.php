<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personnel_medical', function (Blueprint $table) {
            // Ajouter nom si absent
            if (!Schema::hasColumn('personnel_medical', 'nom')) {
                $table->string('nom')->after('id_personnel')->default('');
            }
            // Ajouter prenom si absent
            if (!Schema::hasColumn('personnel_medical', 'prenom')) {
                $table->string('prenom')->after('nom')->default('');
            }
            // Ajouter service si absent
            if (!Schema::hasColumn('personnel_medical', 'service')) {
                $table->string('service')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('personnel_medical', function (Blueprint $table) {
            $cols = ['nom', 'prenom', 'service'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('personnel_medical', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
