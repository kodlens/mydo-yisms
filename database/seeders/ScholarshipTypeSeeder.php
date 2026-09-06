<?php

namespace Database\Seeders;

use App\Models\ScholarshipType;
use Illuminate\Database\Seeder;

class ScholarshipTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Source: PIA, March 7, 2022:
        // https://mirror.pia.gov.ph/news/2022/03/07/dumingag-lgu-mydc-to-launch-youth-scholarship-on-march-11
        // These are two school tracks of one GPA Youth Scholarship Program,
        // not independently verified official scholarship type names.
        // Current availability and cash allowances require MYDO confirmation.
        // 0.00 is a schema-compatible placeholder, not an official grant amount.
        $scholarships = [
            [
                'scholarship' => 'GPA Youth Scholarship Program - DTTS',
                'target_beneficiary' => 'Dumingag youth aged 18 and above interested in technical-vocational training at Dumingag Technological Training School (DTTS).',
                'benefit' => 'Free tuition, ID, uniform, tool kits and allowance; technical-vocational training leading to TESDA competency certification. Cash amount and current availability require MYDO confirmation.',
            ],
            [
                'scholarship' => 'GPA Youth Scholarship Program - DISOA',
                'target_beneficiary' => 'Dumingag youth aged 18 and above interested in organic agriculture training at Dumingag Institute of Sustainable Organic Agriculture (DISOA).',
                'benefit' => 'Free tuition, ID, uniform, tool kits and allowance; training in organic crop and livestock production. Cash amount and current availability require MYDO confirmation.',
            ],
        ];

        foreach ($scholarships as $scholarship) {
            // Preserve staff changes to benefits, amounts and availability on reruns.
            ScholarshipType::firstOrCreate(
                ['scholarship' => $scholarship['scholarship']],
                [
                    'target_beneficiary' => $scholarship['target_beneficiary'],
                    'benefit' => $scholarship['benefit'],
                    'amount' => '0.00',
                    'is_active' => false,
                ],
            );
        }
    }
}
