<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patientes', function (Blueprint $table) {
            $table->id('id_patient');

            // ✅ CORRECTION : nullable() DOIT être avant constrained()
            $table->unsignedBigInteger('id_personnel')->nullable();
            $table->foreign('id_personnel')
                  ->references('id_personnel')
                  ->on('personnel_medical')
                  ->onDelete('set null');

            $table->string('nom');
            $table->string('prenom');
            $table->date('date_naissance');
            $table->enum('situation_matrimoniale', [
                'celibataire', 'mariee', 'divorcee', 'veuve'
            ]);
            $table->string('telephone')->nullable();
            $table->text('adresse')->nullable();
            $table->enum('groupe_sanguin', [
                'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
            ])->nullable();
            $table->string('motif')->nullable();
            $table->enum('statut', [
                'active', 'inactive', 'archivee'
            ])->default('active');
            $table->text('notes_cliniques')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patientes');
    }
};