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
        Schema::table('users', function (Blueprint $table) {
            $table->string('firebase_uid')->nullable()->after('email');
            $table->boolean('mfa_enabled')->default(false)->after('password');
            $table->string('phone_number')->nullable()->after('mfa_enabled');
            $table->timestamp('last_login_at')->nullable()->after('phone_number');
            $table->string('last_login_ip')->nullable()->after('last_login_at');
            $table->json('risk_factors')->nullable()->after('last_login_ip');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'firebase_uid',
                'mfa_enabled',
                'phone_number',
                'last_login_at',
                'last_login_ip',
                'risk_factors'
            ]);
        });
    }
};