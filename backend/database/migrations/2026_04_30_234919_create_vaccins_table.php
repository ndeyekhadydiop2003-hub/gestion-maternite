<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vaccins', function (Blueprint $table) {
            $table->id('id_vaccin');

            // Bébé OU femme (nullable sur les deux, un seul rempli)
            $table->foreignId('id_nouveau_ne')
                  ->nullable()
                  ->constrained('nouveau_nes', 'id_nouveau_ne')
                  ->onDelete('cascade');

            $table->foreignId('id_patient')
                  ->nullable()
                  ->constrained('patientes', 'id_patient')
                  ->nullOnDelete();

            // Vaccins bébés + vaccins femmes dans le même enum
            $table->enum('nom_vaccin', [
                // Bébés
                'BCG', 'Hepatite_B', 'Polio', 'Pentavalent', 'Rotavirus',
                // Femmes
                'Tetanos', 'Rubeole', 'Grippe', 'COVID', 'HPV', 'Autre'
            ]);

            $table->date('date_administration')->nullable();
            $table->enum('statut', ['fait', 'prevu', 'non_fait'])->default('prevu');
            $table->string('lot', 50)->nullable();
            $table->string('site_injection', 100)->nullable();
            $table->text('observations')->nullable();

            $table->foreignId('id_personnel')
                  ->nullable()
                  ->constrained('personnel_medical', 'id_personnel')
                  ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccins');
    }
};
