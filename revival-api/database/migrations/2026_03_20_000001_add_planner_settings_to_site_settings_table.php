<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $settings = [
            [
                'key' => 'planner_budget_min',
                'value' => '500',
                'type' => 'number',
                'group' => 'planner',
                'label' => 'Budget Minimum (£)',
                'description' => 'Minimum budget value on the room planner slider',
            ],
            [
                'key' => 'planner_budget_max',
                'value' => '10000',
                'type' => 'number',
                'group' => 'planner',
                'label' => 'Budget Maximum (£)',
                'description' => 'Maximum budget value on the room planner slider',
            ],
            [
                'key' => 'planner_budget_default',
                'value' => '2000',
                'type' => 'number',
                'group' => 'planner',
                'label' => 'Default Budget (£)',
                'description' => 'Default budget value shown when the room planner loads',
            ],
            [
                'key' => 'planner_budget_presets',
                'value' => json_encode([1000, 2000, 3000, 5000]),
                'type' => 'json',
                'group' => 'planner',
                'label' => 'Budget Quick-Select Presets (£)',
                'description' => 'Comma-separated quick-select budget buttons shown below the slider (e.g. 1000,2000,3000,5000)',
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('site_settings')->insertOrIgnore(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        DB::table('site_settings')->whereIn('key', [
            'planner_budget_min',
            'planner_budget_max',
            'planner_budget_default',
            'planner_budget_presets',
        ])->delete();
    }
};
