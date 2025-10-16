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
        Schema::create('user_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('purpose', 50); // essential, analytics, personalization, etc.
            $table->boolean('granted')->default(false);
            $table->string('method', 50)->nullable(); // explicit_ui, implicit, etc.
            $table->string('legal_basis', 100)->nullable(); // Consent, Contract, etc.
            $table->string('version', 20)->default('1.0'); // Versión de la política
            $table->timestamp('granted_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            // Índices para búsquedas rápidas
            $table->index(['user_id', 'purpose']);
            $table->index(['user_id', 'granted']);
            $table->index('granted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_consents');
    }
};
