<?php

namespace Database\Seeders;

use App\Models\RoomPlannerStyle;
use Illuminate\Database\Seeder;

class RoomPlannerStylesSeeder extends Seeder
{
    public function run(): void
    {
        $styles = [
            ['key' => 'modern',       'name' => 'Modern',       'price_multiplier' => 1.10, 'sort_order' => 1],
            ['key' => 'classic',      'name' => 'Classic',      'price_multiplier' => 1.00, 'sort_order' => 2],
            ['key' => 'midCentury',   'name' => 'Mid-Century',  'price_multiplier' => 1.20, 'sort_order' => 3],
            ['key' => 'scandinavian', 'name' => 'Scandinavian', 'price_multiplier' => 1.15, 'sort_order' => 4],
            ['key' => 'industrial',   'name' => 'Industrial',   'price_multiplier' => 1.05, 'sort_order' => 5],
            ['key' => 'rustic',       'name' => 'Rustic',       'price_multiplier' => 0.95, 'sort_order' => 6],
        ];

        foreach ($styles as $data) {
            RoomPlannerStyle::firstOrCreate(
                ['key' => $data['key']],
                array_merge($data, ['active' => true])
            );
        }
    }
}
