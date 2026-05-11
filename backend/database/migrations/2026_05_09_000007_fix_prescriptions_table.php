<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            // Ajouter les colonnes manquantes
            if (!Schema::hasColumn('prescriptions', 'id_patient')) {
                $table->unsignedBigInteger('id_patient')->nullable()->after('id_prescription');
                $table->foreign('id_patient')
                      ->references('id_patient')
                      ->on('patientes')
                      ->onDelete('cascade');
            }
            if (!Schema::hasColumn('prescriptions', 'id_personnel')) {
                $table->unsignedBigInteger('id_personnel')->nullable()->after('id_patient');
                $table->foreign('id_personnel')
                      ->references('id_personnel')
                      ->on('personnel_medical')
                      ->onDelete('set null');
            }
            if (!Schema::hasColumn('prescriptions', 'medicaments')) {
                $table->text('medicaments')->nullable()->after('id_personnel');
            }
            if (!Schema::hasColumn('prescriptions', 'posologie')) {
                $table->text('posologie')->nullable()->after('medicaments');
            }
            if (!Schema::hasColumn('prescriptions', 'date_fin')) {
                $table->date('date_fin')->nullable()->after('date_prescription');
            }
            // Rendre id_consultation nullable
            $table->unsignedBigInteger('id_consultation')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropForeign(['id_patient']);
            $table->dropForeign(['id_personnel']);
            $table->dropColumn(['id_patient', 'id_personnel', 'medicaments', 'posologie', 'date_fin']);
        });
    }
};
