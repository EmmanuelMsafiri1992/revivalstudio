<?php

namespace Database\Seeders;

use App\Models\ComparisonPrice;
use App\Models\FurnitureType;
use Illuminate\Database\Seeder;

class ComparisonPriceSeeder extends Seeder
{
    public function run(): void
    {
        $comparisonData = [
            'Sofa' => ['retailer' => 'IKEA', 'product' => 'KIVIK Sofa', 'price' => 699, 'url' => 'https://www.ikea.com/gb/en/p/kivik-3-seat-sofa-tibbleby-beige-grey-s59440568/'],
            'Bed' => ['retailer' => 'IKEA', 'product' => 'MALM Bed Frame', 'price' => 279, 'url' => 'https://www.ikea.com/gb/en/p/malm-bed-frame-high-white-s69931178/'],
            'Bedroom' => ['retailer' => 'IKEA', 'product' => 'MALM Bed Frame', 'price' => 279, 'url' => 'https://www.ikea.com/gb/en/p/malm-bed-frame-high-white-s69931178/'],
            'Chair' => ['retailer' => 'IKEA', 'product' => 'POÄNG Armchair', 'price' => 99, 'url' => 'https://www.ikea.com/gb/en/p/poaeng-armchair-birch-veneer-knisa-light-beige-s69299215/'],
            'Seating' => ['retailer' => 'IKEA', 'product' => 'STRANDMON Wing Chair', 'price' => 279, 'url' => 'https://www.ikea.com/gb/en/p/strandmon-wing-chair-nordvalla-dark-grey-00359822/'],
            'Table' => ['retailer' => 'IKEA', 'product' => 'LISABO Table', 'price' => 199, 'url' => 'https://www.ikea.com/gb/en/p/lisabo-table-ash-veneer-10291939/'],
            'Dining Table' => ['retailer' => 'IKEA', 'product' => 'EKEDALEN Dining Table', 'price' => 349, 'url' => 'https://www.ikea.com/gb/en/p/ekedalen-extendable-table-white-70340824/'],
            'Wardrobe' => ['retailer' => 'IKEA', 'product' => 'PAX Wardrobe', 'price' => 495, 'url' => 'https://www.ikea.com/gb/en/p/pax-wardrobe-white-s49930236/'],
            'Desk' => ['retailer' => 'IKEA', 'product' => 'BEKANT Desk', 'price' => 299, 'url' => 'https://www.ikea.com/gb/en/p/bekant-desk-white-s19022808/'],
            'Office' => ['retailer' => 'IKEA', 'product' => 'BEKANT Desk', 'price' => 299, 'url' => 'https://www.ikea.com/gb/en/p/bekant-desk-white-s19022808/'],
            'Bookshelf' => ['retailer' => 'IKEA', 'product' => 'BILLY Bookcase', 'price' => 59, 'url' => 'https://www.ikea.com/gb/en/p/billy-bookcase-white-00263850/'],
            'Cabinet' => ['retailer' => 'IKEA', 'product' => 'HEMNES Cabinet', 'price' => 199, 'url' => 'https://www.ikea.com/gb/en/p/hemnes-glass-door-cabinet-with-3-drawers-white-stain-40440530/'],
            'Storage' => ['retailer' => 'IKEA', 'product' => 'KALLAX Shelving Unit', 'price' => 79, 'url' => 'https://www.ikea.com/gb/en/p/kallax-shelving-unit-white-20275814/'],
            'Drawer' => ['retailer' => 'IKEA', 'product' => 'MALM Chest of Drawers', 'price' => 149, 'url' => 'https://www.ikea.com/gb/en/p/malm-chest-of-4-drawers-white-90403572/'],
            'Coffee Table' => ['retailer' => 'IKEA', 'product' => 'LACK Coffee Table', 'price' => 29, 'url' => 'https://www.ikea.com/gb/en/p/lack-coffee-table-white-00449900/'],
            'Side Table' => ['retailer' => 'IKEA', 'product' => 'LACK Side Table', 'price' => 9, 'url' => 'https://www.ikea.com/gb/en/p/lack-side-table-white-30449908/'],
            'TV Stand' => ['retailer' => 'IKEA', 'product' => 'BESTÅ TV Unit', 'price' => 189, 'url' => 'https://www.ikea.com/gb/en/p/besta-tv-bench-with-drawers-white-lappviken-white-s69229447/'],
            'Living Room' => ['retailer' => 'IKEA', 'product' => 'KIVIK Sofa', 'price' => 699, 'url' => 'https://www.ikea.com/gb/en/p/kivik-3-seat-sofa-tibbleby-beige-grey-s59440568/'],
        ];

        $furnitureTypes = FurnitureType::all()->keyBy('name');

        foreach ($comparisonData as $typeName => $data) {
            $furnitureType = $furnitureTypes->get($typeName);

            if ($furnitureType) {
                ComparisonPrice::updateOrCreate(
                    ['furniture_type_id' => $furnitureType->id],
                    [
                        'retailer_name' => $data['retailer'],
                        'product_name' => $data['product'],
                        'retail_price' => $data['price'],
                        'product_url' => $data['url'],
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
