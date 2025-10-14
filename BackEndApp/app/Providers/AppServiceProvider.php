<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\FirebaseService;
use App\Services\FirebaseMFAService;
use App\Services\LaravelMFAService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register Firebase Service as singleton
        $this->app->singleton(FirebaseService::class, function ($app) {
            return new FirebaseService();
        });

        // Register Firebase MFA Service as singleton
        $this->app->singleton(FirebaseMFAService::class, function ($app) {
            return new FirebaseMFAService();
        });

        // Register Laravel MFA Service as singleton
        $this->app->singleton(LaravelMFAService::class, function ($app) {
            return new LaravelMFAService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
