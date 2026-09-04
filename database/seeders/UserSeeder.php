<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'username' => 'admin',
                'lname' => 'Dela Cruz',
                'fname' => 'Juan',
                'mname' => '',
                'email' => 'admin@localhost',
                'password' => Hash::make('a'),
                'role' => 'admin'
            ],
            [
                'username' => 'grace',
                'lname' => 'Villanueva',
                'fname' => 'Grace',
                'mname' => 'Santos',
                'email' => 'encoder@localhost',
                'password' => Hash::make('a'),
                'role' => 'staff'
            ],
            [
                'username' => 'carlo',
                'lname' => 'Bautista',
                'fname' => 'Carlo',
                'mname' => 'Reyes',
                'email' => 'external.encoder@localhost',
                'password' => Hash::make('a'),
                'role' => 'staff'
            ],
        ];

        \App\Models\User::insertOrIgnore($data);
    }
}
