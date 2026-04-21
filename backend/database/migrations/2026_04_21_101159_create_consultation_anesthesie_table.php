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
         Schema::create('consultation_anesthesie', function (Blueprint $table) {
            $table->id();
 
            // ── Clé étrangère ─────────────────────────────────────
            $table->foreignId('id_consultation')
                  ->constrained('consultations', 'id_consultation')
                  ->onDelete('cascade');
 
            // ── Attributs cliniques ───────────────────────────────
            $table->date('date_consultation_pre_op')->nullable();
            $table->text('allergie_medicament')->nullable();
            $table->string('type_anesthesie')->nullable(); // générale, péridurale, locale, rachianesthésie
            $table->text('risques')->nullable();
            $table->text('protocole')->nullable();
            $table->text('contre_indications')->nullable();
            $table->integer('asa_score')->nullable();      // Classification ASA : I à V
            $table->boolean('consentement')->default(false); // consentement signé
 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_anesthesie');
    }
};
