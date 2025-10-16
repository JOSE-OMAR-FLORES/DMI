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
        Schema::create('privacy_rights_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_id', 100)->unique(); // REQ-timestamp-random
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('request_type', [
                'right_of_access',
                'right_of_rectification',
                'right_to_erasure',
                'right_to_restriction',
                'right_to_portability',
                'right_to_object',
                'ccpa_do_not_sell',
                'ccpa_opt_out'
            ]);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'rejected'])->default('pending');
            $table->text('details')->nullable();
            $table->string('regulation', 20)->default('GDPR'); // GDPR, CCPA, CPRA
            $table->timestamp('response_deadline');
            $table->text('response')->nullable();
            $table->text('metadata')->nullable(); // JSON con información adicional
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Índices
            $table->index(['user_id', 'status']);
            $table->index('request_type');
            $table->index('response_deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('privacy_rights_requests');
    }
};
