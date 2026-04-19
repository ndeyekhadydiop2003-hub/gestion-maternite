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
        Schema::create('accouchements', function (Blueprint $table) {
            $table->id('id_accouchement');
            $table->date('date_accouchement');
            $table->time('heure_accouchement')->nullable();
            $table->enum('mode_accouchement', ['voie_basse','cesarienne','forceps','ventouse'])->default('voie_basse');
            $table->text('a_accoucher')->nullable();
            $table->unsignedBigInteger('id_grossesse');
            $table->unsignedBigInteger('id_personnel');
            $table->foreign('id_grossesse')->references('id_grossesse')->on('grossesses')->onDelete('cascade');
            $table->foreign('id_personnel')->references('id_personnel')->on('personnel_medical')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accouchements');
    }
};
