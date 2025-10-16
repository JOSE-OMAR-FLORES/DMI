<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear usuario Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Crear usuario Normal
        User::create([
            'name' => 'Regular User',
            'email' => 'user@test.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);

        // Crear usuario Guest
        User::create([
            'name' => 'Guest User',
            'email' => 'guest@test.com',
            'password' => Hash::make('password123'),
            'role' => 'guest',
        ]);

        $this->command->info('✅ Usuarios de prueba creados exitosamente!');
        $this->command->info('📧 Admin: admin@test.com | password123');
        $this->command->info('📧 User: user@test.com | password123');
        $this->command->info('📧 Guest: guest@test.com | password123');
    }
}
