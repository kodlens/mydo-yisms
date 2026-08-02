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
                'lname' => 'Santos',
                'fname' => 'Maria Angela',
                'mname' => 'Reyes',
                'email' => 'maria.santos@example.com',
                'password' => Hash::make('a'),
                'role' => 'student'
            ],

            [
                'lname' => 'Garcia',
                'fname' => 'John Michael',
                'mname' => 'Lopez',
                'email' => 'john.garcia@example.com',
                'password' => Hash::make('a'),
                'role' => 'student'
            ],

            [
                'lname' => 'Mendoza',
                'fname' => 'Christine Joy',
                'mname' => 'Villanueva',
                'email' => 'christine.mendoza@example.com',
                'password' => Hash::make('a'),
                'role' => 'student'
            ],

            [
                'lname' => 'Ramos',
                'fname' => 'Joshua',
                'mname' => 'Fernandez',
                'email' => 'joshua.ramos@example.com',
                'password' => Hash::make('a'),
                'role' => 'student'
            ],

            [
                'lname' => 'Torres',
                'fname' => 'Angelica Mae',
                'mname' => 'Castillo',
                'email' => 'angelica.torres@example.com',
                'password' => Hash::make('a'),
                'role' => 'student'
            ],

            [
                'lname' => 'Aquino',
                'fname' => 'Mark Anthony',
                'mname' => 'Diaz',
                'email' => 'mark.aquino@example.com',
                'password' => Hash::make('a'),
                'role' => 'student'
            ],

            [
                'lname' => 'Navarro',
                'fname' => 'Princess Anne',
                'mname' => 'Rivera',
                'email' => 'princess.navarro@example.com',
                'password' => Hash::make('a'),
                'role' => 'student'
            ],

            [
                'lname' => 'Bautista',
                'fname' => 'Kevin',
                'mname' => 'Morales',
                'email' => 'kevin.bautista@example.com',
                'password' => Hash::make('a'),
                'role' => 'student'
            ],

            [
                'lname' => 'Cruz',
                'fname' => 'Nicole',
                'mname' => 'Salazar',
                'email' => 'nicole.cruz@example.com',
                'password' => Hash::make('a'),
                'role' => 'student'
            ],

            [
                'lname' => 'Flores',
                'fname' => 'Daniel',
                'mname' => 'Torres',
                'email' => 'daniel.flores@example.com',
                'password' => Hash::make('a'),
                'role' => 'student'
            ],
        ];

        \App\Models\User::insertOrIgnore($data);
    }
}
