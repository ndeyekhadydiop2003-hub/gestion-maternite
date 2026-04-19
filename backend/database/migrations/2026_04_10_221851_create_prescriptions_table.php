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
       Schema::create('prescriptions', function (Blueprint $table) {
            $table->id('id_prescription');
            $table->date('date_prescription');
            $table->string('type_examen')->nullable();
            $table->unsignedBigInteger('id_consultation');
            $table->foreign('id_consultation')->references('id_consultation')->on('consultations')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
