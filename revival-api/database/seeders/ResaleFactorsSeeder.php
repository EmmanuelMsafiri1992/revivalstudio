<?php

namespace Database\Seeders;

use App\Models\ResaleFactor;
use Illuminate\Database\Seeder;

class ResaleFactorsSeeder extends Seeder
{
    public function run(): void
    {
        $factors = [
            // Age factors
            ['type' => 'age', 'key' => 'new',    'name' => 'Like New (< 1 year)',   'factor' => 0.70, 'sort_order' => 1],
            ['type' => 'age', 'key' => '1-3',    'name' => '1-3 Years',             'factor' => 0.50, 'sort_order' => 2],
            ['type' => 'age', 'key' => '3-5',    'name' => '3-5 Years',             'factor' => 0.35, 'sort_order' => 3],
            ['type' => 'age', 'key' => '5-10',   'name' => '5-10 Years',            'factor' => 0.20, 'sort_order' => 4],
            ['type' => 'age', 'key' => '10+',    'name' => '10+ Years',             'factor' => 0.10, 'sort_order' => 5],
            ['type' => 'age', 'key' => 'antique','name' => 'Antique (50+ years)',   'factor' => 0.80, 'sort_order' => 6],

            // Condition factors
            ['type' => 'condition', 'key' => 'excellent', 'name' => 'Excellent', 'factor' => 1.00, 'sort_order' => 1],
            ['type' => 'condition', 'key' => 'good',      'name' => 'Good',      'factor' => 0.75, 'sort_order' => 2],
            ['type' => 'condition', 'key' => 'fair',      'name' => 'Fair',      'factor' => 0.50, 'sort_order' => 3],
            ['type' => 'condition', 'key' => 'poor',      'name' => 'Poor',      'factor' => 0.25, 'sort_order' => 4],

            // Brand factors
            ['type' => 'brand', 'key' => 'designer', 'name' => 'Designer/Luxury Brand', 'factor' => 1.50, 'sort_order' => 1],
            ['type' => 'brand', 'key' => 'premium',  'name' => 'Premium Brand',          'factor' => 1.25, 'sort_order' => 2],
            ['type' => 'brand', 'key' => 'standard', 'name' => 'Standard Brand',         'factor' => 1.00, 'sort_order' => 3],
            ['type' => 'brand', 'key' => 'budget',   'name' => 'Budget Brand',           'factor' => 0.80, 'sort_order' => 4],
            ['type' => 'brand', 'key' => 'unknown',  'name' => 'Unknown/Unbranded',      'factor' => 0.70, 'sort_order' => 5],
        ];

        foreach ($factors as $data) {
            ResaleFactor::firstOrCreate(
                ['type' => $data['type'], 'key' => $data['key']],
                array_merge($data, ['active' => true])
            );
        }
    }
}
