<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Co2Emission;

class Co2EmissionSeeder extends Seeder {
    public function run(): void {
        $data = [
            ['product_name' => 'Dining Table (Wood)', 'new_co2' => 120, 'refurbished_co2' => 35, 'transport_co2' => 10, 'net_co2_saved' => 75],
            ['product_name' => 'Sofa (3-Seater)', 'new_co2' => 180, 'refurbished_co2' => 50, 'transport_co2' => 15, 'net_co2_saved' => 115],
            ['product_name' => 'Office Chair', 'new_co2' => 60, 'refurbished_co2' => 20, 'transport_co2' => 5, 'net_co2_saved' => 35],
            ['product_name' => 'Wardrobe (2 Door)', 'new_co2' => 150, 'refurbished_co2' => 45, 'transport_co2' => 12, 'net_co2_saved' => 93],
            ['product_name' => 'Coffee Table', 'new_co2' => 70, 'refurbished_co2' => 20, 'transport_co2' => 6, 'net_co2_saved' => 44],
            ['product_name' => 'Bed Frame (Double)', 'new_co2' => 130, 'refurbished_co2' => 40, 'transport_co2' => 10, 'net_co2_saved' => 80],
            ['product_name' => 'Bookshelf', 'new_co2' => 90, 'refurbished_co2' => 25, 'transport_co2' => 8, 'net_co2_saved' => 57],
            ['product_name' => 'TV Unit', 'new_co2' => 85, 'refurbished_co2' => 22, 'transport_co2' => 7, 'net_co2_saved' => 56],
            ['product_name' => 'Chest of Drawers', 'new_co2' => 100, 'refurbished_co2' => 30, 'transport_co2' => 9, 'net_co2_saved' => 61],
            ['product_name' => 'Side Table', 'new_co2' => 40, 'refurbished_co2' => 12, 'transport_co2' => 4, 'net_co2_saved' => 24],
            ['product_name' => 'Dining Chair', 'new_co2' => 35, 'refurbished_co2' => 10, 'transport_co2' => 3, 'net_co2_saved' => 22],
            ['product_name' => 'Glass Dining Table', 'new_co2' => 140, 'refurbished_co2' => 50, 'transport_co2' => 12, 'net_co2_saved' => 78],
            ['product_name' => 'Recliner Sofa', 'new_co2' => 200, 'refurbished_co2' => 65, 'transport_co2' => 15, 'net_co2_saved' => 120],
            ['product_name' => 'Office Desk', 'new_co2' => 110, 'refurbished_co2' => 30, 'transport_co2' => 9, 'net_co2_saved' => 71],
            ['product_name' => 'Kitchen Cabinet', 'new_co2' => 160, 'refurbished_co2' => 55, 'transport_co2' => 12, 'net_co2_saved' => 93],
            ['product_name' => 'Bar Stool', 'new_co2' => 30, 'refurbished_co2' => 8, 'transport_co2' => 3, 'net_co2_saved' => 19],
            ['product_name' => 'Shoe Rack', 'new_co2' => 50, 'refurbished_co2' => 15, 'transport_co2' => 5, 'net_co2_saved' => 30],
            ['product_name' => 'Dressing Table', 'new_co2' => 95, 'refurbished_co2' => 28, 'transport_co2' => 7, 'net_co2_saved' => 60],
            ['product_name' => 'Outdoor Bench', 'new_co2' => 80, 'refurbished_co2' => 25, 'transport_co2' => 8, 'net_co2_saved' => 47],
            ['product_name' => 'Storage Cabinet', 'new_co2' => 120, 'refurbished_co2' => 35, 'transport_co2' => 10, 'net_co2_saved' => 75],
        ];
        foreach ($data as $row) {
            Co2Emission::updateOrCreate(['product_name' => $row['product_name']], $row);
        }
    }
}
