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
        Schema::create('processing_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('activity_type', 100); // data_collection, data_storage, etc.
            $table->string('legal_basis', 100); // consent, contract, legal_obligation, etc.
            $table->json('data_categories')->nullable(); // ['identifiers', 'usage_data']
            $table->text('purpose')->nullable();
            $table->string('recipient', 100)->default('internal');
            $table->string('retention', 50)->default('365 days');
            $table->json('metadata')->nullable();
            $table->timestamp('activity_timestamp')->useCurrent();
            $table->timestamps();

            // Índices
            $table->index(['user_id', 'activity_timestamp']);
            $table->index('activity_type');
            $table->index('legal_basis');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('processing_activities');
    }
};
