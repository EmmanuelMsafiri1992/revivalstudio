<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Outlet;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Get outlet IDs
        $outlets = Outlet::all();

        if ($outlets->isEmpty()) {
            $this->command->warn('No outlets found. Please run FurnitureDataSeeder first.');
            return;
        }

        $londonOutlet = $outlets->where('location', 'London')->first() ?? $outlets->first();
        $manchesterOutlet = $outlets->where('location', 'Manchester')->first() ?? $outlets->first();
        $birminghamOutlet = $outlets->where('location', 'Birmingham')->first() ?? $outlets->first();

        // Update outlets with full location details
        $londonOutlet->update([
            'city' => 'London',
            'postcode' => 'EC1A 1BB',
            'latitude' => 51.5074,
            'longitude' => -0.1278,
            'description' => 'Our flagship London showroom featuring the finest pre-loved furniture. Expert restoration services available.',
            'opening_hours' => json_encode(['Mon-Fri' => '9am-6pm', 'Sat' => '10am-5pm', 'Sun' => '11am-4pm']),
        ]);

        $manchesterOutlet->update([
            'city' => 'Manchester',
            'postcode' => 'M1 2AB',
            'latitude' => 53.4808,
            'longitude' => -2.2426,
            'description' => 'Northern England\'s premier destination for quality second-hand furniture.',
            'opening_hours' => json_encode(['Mon-Fri' => '9am-5:30pm', 'Sat' => '10am-5pm', 'Sun' => 'Closed']),
        ]);

        $birminghamOutlet->update([
            'city' => 'Birmingham',
            'postcode' => 'B1 1AA',
            'latitude' => 52.4862,
            'longitude' => -1.8904,
            'description' => 'Midlands furniture revival specialists. Large showroom with wide selection.',
            'opening_hours' => json_encode(['Mon-Sat' => '9am-5pm', 'Sun' => '10am-4pm']),
        ]);

        // Sample products
        $products = [
            // London Products
            [
                'outlet_id' => $londonOutlet->id,
                'furniture_type_id' => 1, // Sofa
                'name' => 'Chester 3-Seater Leather Sofa',
                'description' => 'Stunning Chesterfield-style 3-seater sofa in rich brown leather. Features classic button-tufted design with rolled arms. Minor wear consistent with age, professionally cleaned and conditioned.',
                'price' => 599.00,
                'original_price' => 1200.00,
                'condition' => 'excellent',
                'brand' => 'Chesterfield',
                'material' => 'Genuine Leather',
                'dimensions' => '220cm W x 90cm D x 75cm H',
                'color' => 'Chestnut Brown',
                'quantity' => 1,
                'images' => json_encode(['/products/blue-sofa.jpg']),
                'status' => 'available',
                'featured' => true,
            ],
            [
                'outlet_id' => $londonOutlet->id,
                'furniture_type_id' => 6, // Bed Frame
                'name' => 'Victorian Oak Bed Frame - King Size',
                'description' => 'Beautiful Victorian-era oak bed frame with ornate carved headboard. Solid construction, original finish restored. A statement piece for any bedroom.',
                'price' => 450.00,
                'original_price' => 800.00,
                'condition' => 'good',
                'brand' => 'Antique Victorian',
                'material' => 'Solid Oak',
                'dimensions' => '160cm W x 200cm L x 120cm H (headboard)',
                'color' => 'Natural Oak',
                'quantity' => 1,
                'images' => json_encode(['/products/bed-mattress.jpg']),
                'status' => 'available',
                'featured' => true,
            ],
            [
                'outlet_id' => $londonOutlet->id,
                'furniture_type_id' => 5, // Coffee Table
                'name' => 'Mid-Century Teak Coffee Table',
                'description' => 'Classic 1960s Danish-style teak coffee table with tapered legs. Surface refinished to show beautiful wood grain. Perfect for modern or retro interiors.',
                'price' => 175.00,
                'original_price' => null,
                'condition' => 'excellent',
                'brand' => 'G-Plan',
                'material' => 'Teak',
                'dimensions' => '120cm L x 60cm W x 45cm H',
                'color' => 'Teak',
                'quantity' => 1,
                'images' => json_encode(['/products/storage.jpg']),
                'status' => 'available',
                'featured' => false,
            ],
            [
                'outlet_id' => $londonOutlet->id,
                'furniture_type_id' => 10, // Desk
                'name' => 'Industrial Style Writing Desk',
                'description' => 'Reclaimed wood top with metal pipe legs. Perfect home office desk with authentic industrial character. Includes one drawer.',
                'price' => 225.00,
                'original_price' => 350.00,
                'condition' => 'good',
                'brand' => 'Handcrafted',
                'material' => 'Reclaimed Wood & Metal',
                'dimensions' => '140cm W x 70cm D x 76cm H',
                'color' => 'Weathered Oak / Black Metal',
                'quantity' => 1,
                'images' => json_encode(['/products/storage.jpg']),
                'status' => 'available',
                'featured' => false,
            ],

            // Manchester Products
            [
                'outlet_id' => $manchesterOutlet->id,
                'furniture_type_id' => 1, // Sofa
                'name' => 'Scandi Grey Fabric 2-Seater',
                'description' => 'Minimalist Scandinavian design loveseat in light grey fabric. Solid beech legs, removable cushion covers. Barely used condition.',
                'price' => 320.00,
                'original_price' => 550.00,
                'condition' => 'excellent',
                'brand' => 'MADE.com',
                'material' => 'Linen Blend Fabric',
                'dimensions' => '165cm W x 85cm D x 80cm H',
                'color' => 'Light Grey',
                'quantity' => 1,
                'images' => json_encode(['/products/blue-sofa.jpg']),
                'status' => 'available',
                'featured' => true,
            ],
            [
                'outlet_id' => $manchesterOutlet->id,
                'furniture_type_id' => 3, // Dining Table
                'name' => 'Farmhouse Pine Dining Table',
                'description' => 'Rustic farmhouse dining table seating 6-8. Solid pine construction with beautiful natural grain. Some character marks add to its charm.',
                'price' => 280.00,
                'original_price' => null,
                'condition' => 'good',
                'brand' => null,
                'material' => 'Solid Pine',
                'dimensions' => '180cm L x 90cm W x 76cm H',
                'color' => 'Natural Pine',
                'quantity' => 1,
                'images' => json_encode(['/products/storage.jpg']),
                'status' => 'available',
                'featured' => false,
            ],
            [
                'outlet_id' => $manchesterOutlet->id,
                'furniture_type_id' => 4, // Dining Chair
                'name' => 'Set of 4 Wishbone Chairs',
                'description' => 'Classic Hans Wegner style wishbone dining chairs. Solid ash frame with woven paper cord seats. Great condition with minor wear.',
                'price' => 350.00,
                'original_price' => 600.00,
                'condition' => 'good',
                'brand' => 'Designer Replica',
                'material' => 'Ash Wood / Paper Cord',
                'dimensions' => '56cm W x 55cm D x 76cm H',
                'color' => 'Natural Ash',
                'quantity' => 4,
                'images' => json_encode(['/products/chairs.jpg']),
                'status' => 'available',
                'featured' => false,
            ],
            [
                'outlet_id' => $manchesterOutlet->id,
                'furniture_type_id' => 7, // Wardrobe
                'name' => 'Art Deco Walnut Wardrobe',
                'description' => 'Stunning 1930s Art Deco wardrobe in walnut veneer. Features original handles and interior mirror. Professionally restored.',
                'price' => 425.00,
                'original_price' => 750.00,
                'condition' => 'excellent',
                'brand' => 'Art Deco Original',
                'material' => 'Walnut Veneer',
                'dimensions' => '120cm W x 55cm D x 185cm H',
                'color' => 'Walnut',
                'quantity' => 1,
                'images' => json_encode(['/products/storage.jpg']),
                'status' => 'available',
                'featured' => true,
            ],

            // Birmingham Products
            [
                'outlet_id' => $birminghamOutlet->id,
                'furniture_type_id' => 2, // Armchair
                'name' => 'Vintage Green Velvet Armchair',
                'description' => 'Luxurious vintage armchair reupholstered in emerald green velvet. Solid mahogany frame with brass caster wheels. A true statement piece.',
                'price' => 275.00,
                'original_price' => 450.00,
                'condition' => 'excellent',
                'brand' => 'Parker Knoll',
                'material' => 'Velvet / Mahogany',
                'dimensions' => '80cm W x 85cm D x 95cm H',
                'color' => 'Emerald Green',
                'quantity' => 1,
                'images' => json_encode(['/products/chairs.jpg']),
                'status' => 'available',
                'featured' => true,
            ],
            [
                'outlet_id' => $birminghamOutlet->id,
                'furniture_type_id' => 9, // Bookshelf
                'name' => 'Tall Industrial Bookcase',
                'description' => '5-tier industrial bookcase with reclaimed wood shelves and black metal frame. Perfect for displaying books and decor items.',
                'price' => 165.00,
                'original_price' => null,
                'condition' => 'good',
                'brand' => 'Urban Living',
                'material' => 'Reclaimed Wood / Metal',
                'dimensions' => '80cm W x 35cm D x 180cm H',
                'color' => 'Rustic Brown / Black',
                'quantity' => 1,
                'images' => json_encode(['/products/storage.jpg']),
                'status' => 'available',
                'featured' => false,
            ],
            [
                'outlet_id' => $birminghamOutlet->id,
                'furniture_type_id' => 17, // Office Chair
                'name' => 'Ergonomic Mesh Office Chair',
                'description' => 'High-quality ergonomic office chair with adjustable lumbar support, armrests, and headrest. Breathable mesh back. Excellent condition.',
                'price' => 145.00,
                'original_price' => 300.00,
                'condition' => 'excellent',
                'brand' => 'Herman Miller Style',
                'material' => 'Mesh / Aluminum',
                'dimensions' => '68cm W x 65cm D x 115-125cm H',
                'color' => 'Black',
                'quantity' => 3,
                'images' => json_encode(['/products/chairs.jpg']),
                'status' => 'available',
                'featured' => false,
            ],
            [
                'outlet_id' => $birminghamOutlet->id,
                'furniture_type_id' => 12, // Sideboard
                'name' => 'Mid-Century Teak Sideboard',
                'description' => 'Classic 1960s teak sideboard with sliding doors and internal shelving. Beautiful original condition with minor patina.',
                'price' => 395.00,
                'original_price' => 650.00,
                'condition' => 'good',
                'brand' => 'Nathan Furniture',
                'material' => 'Teak',
                'dimensions' => '160cm W x 45cm D x 80cm H',
                'color' => 'Teak',
                'quantity' => 1,
                'images' => json_encode(['/products/storage.jpg']),
                'status' => 'available',
                'featured' => true,
            ],

            // More London Products
            [
                'outlet_id' => $londonOutlet->id,
                'furniture_type_id' => 14, // Ottoman
                'name' => 'Leather Storage Ottoman',
                'description' => 'Spacious storage ottoman in cognac leather. Perfect as coffee table alternative or extra seating. Lift-top reveals ample storage.',
                'price' => 95.00,
                'original_price' => null,
                'condition' => 'good',
                'brand' => null,
                'material' => 'Bonded Leather',
                'dimensions' => '90cm L x 50cm W x 45cm H',
                'color' => 'Cognac',
                'quantity' => 1,
                'images' => json_encode(['/products/storage.jpg']),
                'status' => 'available',
                'featured' => false,
            ],
            [
                'outlet_id' => $londonOutlet->id,
                'furniture_type_id' => 16, // Bedside Table
                'name' => 'Pair of Art Deco Bedside Tables',
                'description' => 'Matching pair of 1930s bedside tables in walnut. Single drawer with original brass handles. Expertly restored.',
                'price' => 185.00,
                'original_price' => 280.00,
                'condition' => 'excellent',
                'brand' => 'Art Deco Original',
                'material' => 'Walnut',
                'dimensions' => '45cm W x 35cm D x 60cm H each',
                'color' => 'Walnut',
                'quantity' => 2,
                'images' => json_encode(['/products/storage.jpg']),
                'status' => 'available',
                'featured' => false,
            ],

            // More Manchester Products
            [
                'outlet_id' => $manchesterOutlet->id,
                'furniture_type_id' => 11, // TV Stand
                'name' => 'Scandi Oak TV Unit',
                'description' => 'Clean-lined Scandinavian TV unit in white oak. Two cupboards and cable management. Fits TVs up to 55 inches.',
                'price' => 155.00,
                'original_price' => 250.00,
                'condition' => 'excellent',
                'brand' => 'Swoon',
                'material' => 'Oak Veneer',
                'dimensions' => '140cm W x 40cm D x 50cm H',
                'color' => 'White Oak',
                'quantity' => 1,
                'images' => json_encode(['/products/storage.jpg']),
                'status' => 'available',
                'featured' => false,
            ],
            [
                'outlet_id' => $manchesterOutlet->id,
                'furniture_type_id' => 8, // Dresser
                'name' => 'Vintage Pine Chest of Drawers',
                'description' => '6-drawer pine dresser with original wooden handles. Stripped and waxed finish. Solid and sturdy with smooth-running drawers.',
                'price' => 195.00,
                'original_price' => null,
                'condition' => 'good',
                'brand' => null,
                'material' => 'Solid Pine',
                'dimensions' => '100cm W x 45cm D x 110cm H',
                'color' => 'Natural Waxed Pine',
                'quantity' => 1,
                'images' => json_encode(['/products/storage.jpg']),
                'status' => 'available',
                'featured' => false,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        $this->command->info('Created ' . count($products) . ' sample products.');
    }
}
