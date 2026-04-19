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
        Schema::create('lits', function (Blueprint $table) {
            $table->id('id_lit');
            $table->string('numero_lit')->unique();
            $table->enum('statut', ['libre','occupe','maintenance'])->default('libre');
            $table->boolean('est_occupe')->default(false);
            $table->unsignedBigInteger('id_chambre');
            $table->foreign('id_chambre')->references('id_chambre')->on('salles')->onDelete('cascade');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lits');
    }
};
