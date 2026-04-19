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
         Schema::create('nouveau_nes', function (Blueprint $table) {
            $table->id('id_nouveau');
            $table->enum('sexe', ['M','F','indetermine']);
            $table->decimal('poids_naissance', 5, 2)->nullable();
            $table->decimal('taille', 5, 2)->nullable();
            $table->integer('score_apgar_1min')->nullable();
            $table->integer('score_apgar_5min')->nullable();
            $table->unsignedBigInteger('id_accouchement');
            $table->foreign('id_accouchement')->references('id_accouchement')->on('accouchements')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nouveau_nes');
    }
};
