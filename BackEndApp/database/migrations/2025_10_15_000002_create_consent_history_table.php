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
        Schema::create('consent_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('consent_id')->nullable()->constrained('user_consents')->onDelete('set null');
            $table->string('purpose', 50);
            $table->enum('action', ['granted', 'revoked', 'updated']); // Tipo de acción
            $table->boolean('previous_value')->nullable();
            $table->boolean('new_value')->nullable();
            $table->string('method', 50)->nullable(); // Método de cambio
            $table->text('metadata')->nullable(); // JSON con información adicional
            $table->timestamp('timestamp')->useCurrent();
            $table->timestamps();

            // Índices
            $table->index(['user_id', 'timestamp']);
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consent_history');
    }
};
