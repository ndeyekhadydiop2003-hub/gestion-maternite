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
    $table->foreignId('id_patient')
          ->constrained('patientes', 'id_patient')
          ->onDelete('cascade');
    $table->string('categorie'); // chirurgical, médical, obstétrical...
    $table->text('description');
    $table->enum('gravite', ['faible', 'modere', 'grave', 'critique']);
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
