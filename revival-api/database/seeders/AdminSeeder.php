<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@revivalstudio.co.uk'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin2024'),
                'role' => 'super_admin',
                'active' => true,
            ]
        );

        $this->command->info('Admin user created: admin@revivalstudio.co.uk / admin2024');
    }
}
