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
                'lname' => 'Dela Cruz',
                'fname' => 'Juan',
                'mname' => '',
                'email' => 'admin@localhost',
                'password' => Hash::make('a'),
                'role' => 'admin'
            ],

            [
                'lname' => 'Reyes',
                'fname' => 'Paolo',
                'mname' => 'Cruz',
                'email' => 'publisher@localhost',
                'password' => Hash::make('a'),
                'role' => 'publisher'
            ],

            [
                'lname' => 'Villanueva',
                'fname' => 'Grace',
                'mname' => 'Santos',
                'email' => 'encoder@localhost',
                'password' => Hash::make('a'),
                'role' => 'encoder'
            ],

            [
                'lname' => 'Bautista',
                'fname' => 'Carlo',
                'mname' => 'Reyes',
                'email' => 'external.encoder@localhost',
                'password' => Hash::make('a'),
                'role' => 'external-encoder'
            ],
        ];

        \App\Models\User::insertOrIgnore($data);
    }
}
