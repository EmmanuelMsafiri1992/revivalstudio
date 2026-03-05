<?php

namespace Database\Seeders;

use App\Models\DamageType;
use App\Models\FurnitureCatalog;
use App\Models\FurnitureType;
use App\Models\Material;
use App\Models\Outlet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FurnitureDataSeeder extends Seeder
{
    public function run(): void
    {
        // Furniture Types
        $furnitureTypes = [
            ['name' => 'Sofa', 'slug' => 'sofa', 'icon' => '🛋️', 'base_repair_cost' => 150, 'base_value' => 800, 'sort_order' => 1],
            ['name' => 'Armchair', 'slug' => 'armchair', 'icon' => '🪑', 'base_repair_cost' => 80, 'base_value' => 400, 'sort_order' => 2],
            ['name' => 'Dining Table', 'slug' => 'dining-table', 'icon' => '🍽️', 'base_repair_cost' => 120, 'base_value' => 600, 'sort_order' => 3],
            ['name' => 'Dining Chair', 'slug' => 'dining-chair', 'icon' => '🪑', 'base_repair_cost' => 40, 'base_value' => 150, 'sort_order' => 4],
            ['name' => 'Coffee Table', 'slug' => 'coffee-table', 'icon' => '☕', 'base_repair_cost' => 60, 'base_value' => 250, 'sort_order' => 5],
            ['name' => 'Bed Frame', 'slug' => 'bed', 'icon' => '🛏️', 'base_repair_cost' => 100, 'base_value' => 500, 'sort_order' => 6],
            ['name' => 'Wardrobe', 'slug' => 'wardrobe', 'icon' => '🚪', 'base_repair_cost' => 130, 'base_value' => 450, 'sort_order' => 7],
            ['name' => 'Dresser', 'slug' => 'dresser', 'icon' => '🗄️', 'base_repair_cost' => 90, 'base_value' => 350, 'sort_order' => 8],
            ['name' => 'Bookshelf', 'slug' => 'bookshelf', 'icon' => '📚', 'base_repair_cost' => 70, 'base_value' => 200, 'sort_order' => 9],
            ['name' => 'Desk', 'slug' => 'desk', 'icon' => '🖥️', 'base_repair_cost' => 85, 'base_value' => 300, 'sort_order' => 10],
            ['name' => 'TV Stand', 'slug' => 'tv-stand', 'icon' => '📺', 'base_repair_cost' => 55, 'base_value' => 180, 'sort_order' => 11],
            ['name' => 'Sideboard', 'slug' => 'sideboard', 'icon' => '🗃️', 'base_repair_cost' => 95, 'base_value' => 400, 'sort_order' => 12],
            ['name' => 'Cabinet', 'slug' => 'cabinet', 'icon' => '🗄️', 'base_repair_cost' => 80, 'base_value' => 280, 'sort_order' => 13],
            ['name' => 'Ottoman', 'slug' => 'ottoman', 'icon' => '🟫', 'base_repair_cost' => 45, 'base_value' => 120, 'sort_order' => 14],
            ['name' => 'Console Table', 'slug' => 'console-table', 'icon' => '🪵', 'base_repair_cost' => 50, 'base_value' => 200, 'sort_order' => 15],
            ['name' => 'Bedside Table', 'slug' => 'bedside-table', 'icon' => '🛏️', 'base_repair_cost' => 35, 'base_value' => 100, 'sort_order' => 16],
            ['name' => 'Office Chair', 'slug' => 'office-chair', 'icon' => '💺', 'base_repair_cost' => 60, 'base_value' => 250, 'sort_order' => 17],
        ];

        foreach ($furnitureTypes as $type) {
            FurnitureType::create($type);
        }

        // Materials
        $materials = [
            ['name' => 'Solid Wood', 'slug' => 'wood', 'icon' => '🪵', 'repair_multiplier' => 1.30, 'sort_order' => 1],
            ['name' => 'Wood Veneer', 'slug' => 'veneer', 'icon' => '📋', 'repair_multiplier' => 1.00, 'sort_order' => 2],
            ['name' => 'Fabric/Upholstered', 'slug' => 'fabric', 'icon' => '🧵', 'repair_multiplier' => 1.20, 'sort_order' => 3],
            ['name' => 'Leather', 'slug' => 'leather', 'icon' => '👜', 'repair_multiplier' => 1.50, 'sort_order' => 4],
            ['name' => 'Metal', 'slug' => 'metal', 'icon' => '🔩', 'repair_multiplier' => 1.10, 'sort_order' => 5],
            ['name' => 'Glass', 'slug' => 'glass', 'icon' => '🪟', 'repair_multiplier' => 1.40, 'sort_order' => 6],
            ['name' => 'Rattan/Wicker', 'slug' => 'rattan', 'icon' => '🧺', 'repair_multiplier' => 1.20, 'sort_order' => 7],
            ['name' => 'Mixed Materials', 'slug' => 'mixed', 'icon' => '🔀', 'repair_multiplier' => 1.15, 'sort_order' => 8],
        ];

        foreach ($materials as $material) {
            Material::create($material);
        }

        // Damage Types
        $damageTypes = [
            ['name' => 'Surface Scratches', 'slug' => 'scratches', 'icon' => '✏️', 'repair_cost' => 25, 'sort_order' => 1],
            ['name' => 'Dents/Dings', 'slug' => 'dents', 'icon' => '🔨', 'repair_cost' => 40, 'sort_order' => 2],
            ['name' => 'Water Damage/Stains', 'slug' => 'water-damage', 'icon' => '💧', 'repair_cost' => 60, 'sort_order' => 3],
            ['name' => 'Broken Parts', 'slug' => 'broken-parts', 'icon' => '💔', 'repair_cost' => 80, 'sort_order' => 4],
            ['name' => 'Wobbly/Unstable', 'slug' => 'wobbly', 'icon' => '〰️', 'repair_cost' => 50, 'sort_order' => 5],
            ['name' => 'Fabric Tears', 'slug' => 'tears', 'icon' => '✂️', 'repair_cost' => 70, 'sort_order' => 6],
            ['name' => 'Fading/Discoloration', 'slug' => 'fading', 'icon' => '🌅', 'repair_cost' => 45, 'sort_order' => 7],
            ['name' => 'Peeling/Flaking', 'slug' => 'peeling', 'icon' => '📄', 'repair_cost' => 55, 'sort_order' => 8],
            ['name' => 'Missing Parts', 'slug' => 'missing-parts', 'icon' => '❓', 'repair_cost' => 90, 'sort_order' => 9],
            ['name' => 'Odor Issues', 'slug' => 'odor', 'icon' => '👃', 'repair_cost' => 35, 'sort_order' => 10],
        ];

        foreach ($damageTypes as $damage) {
            DamageType::create($damage);
        }

        // Furniture Catalog
        $catalogItems = [
            ['furniture_type_id' => 1, 'name' => '3-Seater Sofa', 'price' => 699, 'style' => 'modern', 'sort_order' => 1],
            ['furniture_type_id' => 1, 'name' => '2-Seater Loveseat', 'price' => 499, 'style' => 'modern', 'sort_order' => 2],
            ['furniture_type_id' => 1, 'name' => 'Corner Sofa', 'price' => 899, 'style' => 'scandinavian', 'sort_order' => 3],
            ['furniture_type_id' => 2, 'name' => 'Accent Armchair', 'price' => 349, 'style' => 'midCentury', 'sort_order' => 4],
            ['furniture_type_id' => 2, 'name' => 'Wingback Chair', 'price' => 449, 'style' => 'classic', 'sort_order' => 5],
            ['furniture_type_id' => 5, 'name' => 'Oak Coffee Table', 'price' => 199, 'style' => 'scandinavian', 'sort_order' => 6],
            ['furniture_type_id' => 5, 'name' => 'Glass Coffee Table', 'price' => 249, 'style' => 'modern', 'sort_order' => 7],
            ['furniture_type_id' => 11, 'name' => 'Media Console', 'price' => 249, 'style' => 'modern', 'sort_order' => 8],
            ['furniture_type_id' => 9, 'name' => 'Tall Bookcase', 'price' => 179, 'style' => 'classic', 'sort_order' => 9],
            ['furniture_type_id' => 9, 'name' => 'Open Shelving Unit', 'price' => 149, 'style' => 'industrial', 'sort_order' => 10],
            ['furniture_type_id' => 6, 'name' => 'King Size Bed Frame', 'price' => 599, 'style' => 'modern', 'sort_order' => 11],
            ['furniture_type_id' => 6, 'name' => 'Double Bed Frame', 'price' => 449, 'style' => 'scandinavian', 'sort_order' => 12],
            ['furniture_type_id' => 7, 'name' => '2-Door Wardrobe', 'price' => 399, 'style' => 'classic', 'sort_order' => 13],
            ['furniture_type_id' => 7, 'name' => '3-Door Wardrobe', 'price' => 549, 'style' => 'modern', 'sort_order' => 14],
            ['furniture_type_id' => 8, 'name' => '6-Drawer Dresser', 'price' => 329, 'style' => 'classic', 'sort_order' => 15],
            ['furniture_type_id' => 16, 'name' => 'Bedside Table Set', 'price' => 149, 'style' => 'scandinavian', 'sort_order' => 16],
            ['furniture_type_id' => 10, 'name' => 'Writing Desk', 'price' => 249, 'style' => 'midCentury', 'sort_order' => 17],
            ['furniture_type_id' => 10, 'name' => 'Computer Desk', 'price' => 199, 'style' => 'modern', 'sort_order' => 18],
            ['furniture_type_id' => 17, 'name' => 'Ergonomic Office Chair', 'price' => 299, 'style' => 'modern', 'sort_order' => 19],
            ['furniture_type_id' => 3, 'name' => '6-Seater Dining Table', 'price' => 549, 'style' => 'scandinavian', 'sort_order' => 20],
            ['furniture_type_id' => 3, 'name' => '4-Seater Dining Table', 'price' => 399, 'style' => 'modern', 'sort_order' => 21],
            ['furniture_type_id' => 4, 'name' => 'Upholstered Dining Chair', 'price' => 89, 'style' => 'classic', 'sort_order' => 22],
            ['furniture_type_id' => 4, 'name' => 'Wooden Dining Chair', 'price' => 69, 'style' => 'scandinavian', 'sort_order' => 23],
            ['furniture_type_id' => 12, 'name' => 'Oak Sideboard', 'price' => 449, 'style' => 'midCentury', 'sort_order' => 24],
            ['furniture_type_id' => 13, 'name' => 'Display Cabinet', 'price' => 299, 'style' => 'classic', 'sort_order' => 25],
            ['furniture_type_id' => 15, 'name' => 'Entryway Console', 'price' => 199, 'style' => 'modern', 'sort_order' => 26],
            ['furniture_type_id' => 14, 'name' => 'Storage Ottoman', 'price' => 129, 'style' => 'modern', 'sort_order' => 27],
        ];

        foreach ($catalogItems as $item) {
            FurnitureCatalog::create($item);
        }

        // Sample Outlets
        $outlets = [
            [
                'name' => 'London Central',
                'email' => 'london@revivalstudio.co.uk',
                'password' => Hash::make('revival2024'),
                'location' => 'London',
                'phone' => '020 1234 5678',
                'address' => '123 Furniture Lane, London EC1A 1BB',
            ],
            [
                'name' => 'Manchester North',
                'email' => 'manchester@revivalstudio.co.uk',
                'password' => Hash::make('revival2024'),
                'location' => 'Manchester',
                'phone' => '0161 234 5678',
                'address' => '456 Revival Road, Manchester M1 2AB',
            ],
            [
                'name' => 'Birmingham',
                'email' => 'birmingham@revivalstudio.co.uk',
                'password' => Hash::make('revival2024'),
                'location' => 'Birmingham',
                'phone' => '0121 234 5678',
                'address' => '789 Studio Street, Birmingham B1 1AA',
            ],
        ];

        foreach ($outlets as $outlet) {
            Outlet::create($outlet);
        }
    }
}
