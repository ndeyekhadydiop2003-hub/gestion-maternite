<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void {
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id('id_utilisateur');
            $table->string('login')->unique();
            $table->string('mdp');
            $table->enum('role_acces', [
                'admin',
                'pediatre',
                'sage_femme',
                'infirmiere',
                'psychologue',
                'genycologue',
                'secretaire'
            ]);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('utilisateurs');
    }
};