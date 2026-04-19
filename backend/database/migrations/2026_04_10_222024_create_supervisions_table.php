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
       Schema::create('supervisions', function (Blueprint $table) {
            $table->id('id_supervision');
            $table->date('date_supervision');
            $table->unsignedBigInteger('id_personnel');
            $table->unsignedBigInteger('id_accouchement');
            $table->foreign('id_personnel')->references('id_personnel')->on('personnel_medical')->onDelete('cascade');
            $table->foreign('id_accouchement')->references('id_accouchement')->on('accouchements')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supervisions');
    }
};
