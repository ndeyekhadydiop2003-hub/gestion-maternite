<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('soins', function (Blueprint $table) {
            $table->id('id_soin');
            $table->unsignedBigInteger('id_nouveau_ne');
            $table->foreign('id_nouveau_ne')->references('id_nouveau_ne')->on('nouveau_nes')->onDelete('cascade');
            $table->unsignedBigInteger('id_personnel');
            $table->foreign('id_personnel')->references('id_personnel')->on('personnel_medical')->onDelete('cascade');
            $table->string('type_soin');
            $table->date('date_soin');
            $table->time('heure_soin')->nullable();
            $table->string('frequence')->default('unique');
            $table->text('note')->nullable();
            $table->string('statut')->default('planifie');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soins');
    }
};
