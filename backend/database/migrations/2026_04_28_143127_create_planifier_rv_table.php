<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('planifier_rv', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_patient')->nullable();
            $table->unsignedBigInteger('id_personnel')->nullable();
            $table->integer('delai_recommande')->nullable();
            $table->date('date_souhaitee')->nullable();
            $table->enum('priorite', ['normale', 'urgente', 'haute'])->default('normale');
            $table->string('motif')->nullable();
            $table->text('notes')->nullable();
            $table->enum('statut', ['en_attente', 'confirme', 'annule'])->default('en_attente');
            $table->unsignedBigInteger('id_rv')->nullable();

            $table->foreign('id_patient')
                  ->references('id_patient')
                  ->on('patientes')
                  ->onDelete('cascade');

            $table->foreign('id_personnel')
                  ->references('id_personnel')
                  ->on('personnel_medical')
                  ->onDelete('set null');

            $table->foreign('id_rv')
                  ->references('id_rv')
                  ->on('rendez_vous')
                  ->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('planifier_rv');
    }
};
