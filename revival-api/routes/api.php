<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ComparisonPriceController;
use App\Http\Controllers\Api\FurnitureController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\OutletAuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RepairController;
use App\Http\Controllers\Api\ResaleController;
use App\Http\Controllers\Api\RoomPlannerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes - Furniture data
Route::get('/furniture-types', [FurnitureController::class, 'furnitureTypes']);
Route::get('/materials', [FurnitureController::class, 'materials']);
Route::get('/damage-types', [FurnitureController::class, 'damageTypes']);
Route::get('/catalog', [FurnitureController::class, 'catalog']);
Route::get('/room-types', [FurnitureController::class, 'roomTypes']);
Route::get('/room-sizes', [FurnitureController::class, 'roomSizes']);
Route::get('/styles', [FurnitureController::class, 'styles']);
Route::get('/resale-options', [FurnitureController::class, 'resaleOptions']);

// Public routes - Repair estimator
Route::post('/repair/calculate', [RepairController::class, 'calculate']);
Route::post('/repair/submit', [RepairController::class, 'submit']);

// Public routes - Resale calculator
Route::post('/resale/calculate', [ResaleController::class, 'calculate']);
Route::post('/resale/submit', [ResaleController::class, 'submit']);

// Public routes - Room planner
Route::post('/planner/generate', [RoomPlannerController::class, 'generate']);
Route::post('/planner/submit', [RoomPlannerController::class, 'submit']);

// Public routes - Products
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Public routes - Comparison prices
Route::get('/comparison-prices', [ComparisonPriceController::class, 'index']);
Route::get('/comparison-prices/furniture-type/{id}', [ComparisonPriceController::class, 'getByFurnitureType']);

// Outlet authentication
Route::post('/outlet/login', [OutletAuthController::class, 'login']);

// Protected routes - Outlet dashboard
Route::middleware('auth:sanctum')->prefix('outlet')->group(function () {
    Route::post('/logout', [OutletAuthController::class, 'logout']);
    Route::get('/profile', [OutletAuthController::class, 'profile']);
    Route::put('/profile', [OutletAuthController::class, 'updateProfile']);
    Route::get('/stats', [MarketplaceController::class, 'stats']);
    Route::get('/inventory', [MarketplaceController::class, 'inventory']);
    Route::post('/inventory', [MarketplaceController::class, 'createItem']);
    Route::put('/inventory/{id}', [MarketplaceController::class, 'updateItem']);

    // Products management
    Route::get('/products', [ProductController::class, 'partnerProducts']);
    Route::post('/products', [ProductController::class, 'partnerStore']);
    Route::put('/products/{id}', [ProductController::class, 'partnerUpdate']);
    Route::delete('/products/{id}', [ProductController::class, 'partnerDestroy']);
    Route::delete('/products/{id}/images/{imageIndex}', [ProductController::class, 'partnerDeleteImage']);
});

// Admin authentication
Route::post('/admin/login', [AdminAuthController::class, 'login']);

// Protected routes - Admin dashboard
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/profile', [AdminAuthController::class, 'profile']);
    Route::get('/dashboard', [AdminController::class, 'dashboard']);

    // Outlets management
    Route::get('/outlets', [AdminController::class, 'outlets']);
    Route::post('/outlets', [AdminController::class, 'createOutlet']);
    Route::put('/outlets/{id}', [AdminController::class, 'updateOutlet']);

    // Repair requests management
    Route::get('/repair-requests', [AdminController::class, 'repairRequests']);
    Route::put('/repair-requests/{id}', [AdminController::class, 'updateRepairRequest']);

    // Sell requests management
    Route::get('/sell-requests', [AdminController::class, 'sellRequests']);
    Route::put('/sell-requests/{id}', [AdminController::class, 'updateSellRequest']);

    // Inventory management
    Route::get('/inventory', [AdminController::class, 'inventoryItems']);

    // Furniture types management
    Route::get('/furniture-types', [AdminController::class, 'furnitureTypes']);
    Route::post('/furniture-types', [AdminController::class, 'createFurnitureType']);
    Route::put('/furniture-types/{id}', [AdminController::class, 'updateFurnitureType']);
    Route::delete('/furniture-types/{id}', [AdminController::class, 'deleteFurnitureType']);

    // Materials management
    Route::get('/materials', [AdminController::class, 'materials']);
    Route::post('/materials', [AdminController::class, 'createMaterial']);
    Route::put('/materials/{id}', [AdminController::class, 'updateMaterial']);
    Route::delete('/materials/{id}', [AdminController::class, 'deleteMaterial']);

    // Damage types management
    Route::get('/damage-types', [AdminController::class, 'damageTypes']);
    Route::post('/damage-types', [AdminController::class, 'createDamageType']);
    Route::put('/damage-types/{id}', [AdminController::class, 'updateDamageType']);
    Route::delete('/damage-types/{id}', [AdminController::class, 'deleteDamageType']);

    // Products management
    Route::get('/products', [ProductController::class, 'adminIndex']);
    Route::put('/products/{id}', [ProductController::class, 'adminUpdate']);
    Route::delete('/products/{id}', [ProductController::class, 'adminDestroy']);

    // Comparison prices management
    Route::get('/comparison-prices', [ComparisonPriceController::class, 'adminIndex']);
    Route::post('/comparison-prices', [ComparisonPriceController::class, 'store']);
    Route::put('/comparison-prices/{comparisonPrice}', [ComparisonPriceController::class, 'update']);
    Route::delete('/comparison-prices/{comparisonPrice}', [ComparisonPriceController::class, 'destroy']);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'Revival Studio API is running',
        'version' => '1.0.0',
    ]);
});
