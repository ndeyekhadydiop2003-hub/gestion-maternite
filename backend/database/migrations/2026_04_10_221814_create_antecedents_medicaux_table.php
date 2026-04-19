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
       Schema::create('antecedents_medicaux', function (Blueprint $table) {
            $table->id('id_antecedent');
            $table->string('categorie');
            $table->text('description');
            $table->enum('gravite', ['faible','modere','grave','critique'])->default('faible');
            $table->unsignedBigInteger('id_patient');
            $table->foreign('id_patient')->references('id_patient')->on('patientes')->onDelete('cascade');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('antecedents_medicaux');
    }
};
