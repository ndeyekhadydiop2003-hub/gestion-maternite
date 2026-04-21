<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
       Schema::create('personnel_medical', function (Blueprint $table) {
    $table->id('id_personnel');
    $table->foreignId('id_utilisateur')
          ->constrained('utilisateurs', 'id_utilisateur')
          ->onDelete('restrict'); // archiver avant suppression
  
    $table->string('telephone');
    $table->string('fonction');
    $table->timestamps();
});
    }

    public function down(): void
    {
        Schema::dropIfExists('personnel_medical');
    }
};