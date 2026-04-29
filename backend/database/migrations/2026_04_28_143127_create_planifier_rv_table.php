<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('planifier_rv', function (Blueprint $table) {
            $table->date('date_souhaitee')->nullable()->after('delai_recommande');
            $table->text('notes')->nullable()->after('motif');
            $table->unsignedBigInteger('id_rv')->nullable()->after('notes');
            $table->foreign('id_rv')
                  ->references('id_rendez_vous')
                  ->on('rendez_vous')
                  ->onDelete('set null');
        });
    }

    public function down(): void {
        Schema::table('planifier_rv', function (Blueprint $table) {
            $table->dropForeign(['id_rv']);
            $table->dropColumn(['date_souhaitee', 'notes', 'id_rv']);
        });
    }
};
