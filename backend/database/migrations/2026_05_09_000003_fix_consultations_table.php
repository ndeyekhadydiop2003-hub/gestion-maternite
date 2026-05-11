<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            // Ajouter motif si pas présent
            if (!Schema::hasColumn('consultations', 'motif')) {
                $table->string('motif', 255)->nullable()->after('date_consultation');
            }

            // Changer tension de decimal en varchar pour accepter "120/80"
            if (Schema::hasColumn('consultations', 'tension')) {
                $table->string('tension', 20)->nullable()->change();
            }

            // Ajouter prochain_rdv si pas présent
            if (!Schema::hasColumn('consultations', 'prochain_rdv')) {
                $table->date('prochain_rdv')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            if (Schema::hasColumn('consultations', 'motif')) {
                $table->dropColumn('motif');
            }
            if (Schema::hasColumn('consultations', 'prochain_rdv')) {
                $table->dropColumn('prochain_rdv');
            }
        });
    }
};
