<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\PremiumAuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ComparisonPriceController;
use App\Http\Controllers\Api\FurnitureController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OutletAuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RepairController;
use App\Http\Controllers\Api\ResaleController;
use App\Http\Controllers\Api\RoomPlannerController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\NearMeController;
use App\Http\Controllers\ExchangeProController;
use App\Http\Controllers\BiddingProController;
use App\Http\Controllers\Co2EmissionController;
use App\Http\Controllers\PremiumCodeController;
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

// Public routes - Premium code verification (legacy)
Route::post('/premium-codes/verify', [PremiumCodeController::class, 'verify']);

// Premium user auth
Route::post('/premium/register', [PremiumAuthController::class, 'register']);
Route::post('/premium/login', [PremiumAuthController::class, 'login']);

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

// Public routes - Site settings (for frontend to fetch dynamic content)
Route::get('/site-settings', [SiteSettingController::class, 'index']);
Route::get('/site-settings/group/{group}', [SiteSettingController::class, 'getByGroup']);
Route::get('/site-settings/{key}', [SiteSettingController::class, 'show']);

// Public routes - Orders and checkout
Route::get('/payment-methods', [OrderController::class, 'paymentMethods']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

// Public routes - Near Me, Exchange Pro, Bidding Pro, CO2
Route::get('/near-me/search', [NearMeController::class, 'search']);
Route::post('/exchange-pro/calculate', [ExchangeProController::class, 'calculate']);
Route::post('/exchange-pro/submit', [ExchangeProController::class, 'submit']);
Route::post('/bidding-pro/submit', [BiddingProController::class, 'submit']);
Route::get('/co2-emissions', [Co2EmissionController::class, 'index']);

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

    // Bidding Pro - Partner routes
    Route::get('/bidding-requests', [BiddingProController::class, 'outletIndex']);
    Route::post('/bidding-requests/{id}/offer', [BiddingProController::class, 'outletOffer']);
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
    Route::delete('/repair-requests/{id}', [AdminController::class, 'deleteRepairRequest']);

    // Sell requests management
    Route::get('/sell-requests', [AdminController::class, 'sellRequests']);
    Route::put('/sell-requests/{id}', [AdminController::class, 'updateSellRequest']);
    Route::delete('/sell-requests/{id}', [AdminController::class, 'deleteSellRequest']);

    // Inventory management
    Route::get('/inventory', [AdminController::class, 'inventoryItems']);
    Route::post('/inventory', [AdminController::class, 'createInventoryItem']);
    Route::put('/inventory/{id}', [AdminController::class, 'updateInventoryItem']);
    Route::delete('/inventory/{id}', [AdminController::class, 'deleteInventoryItem']);

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
    Route::post('/products', [ProductController::class, 'adminStore']);
    Route::get('/products/{id}', [ProductController::class, 'adminShow']);
    Route::post('/products/{id}', [ProductController::class, 'adminUpdate']); // Use POST with _method for file uploads
    Route::put('/products/{id}', [ProductController::class, 'adminUpdate']);
    Route::delete('/products/{id}', [ProductController::class, 'adminDestroy']);
    Route::delete('/products/{id}/images/{imageIndex}', [ProductController::class, 'adminDeleteImage']);

    // Comparison prices management
    Route::get('/comparison-prices', [ComparisonPriceController::class, 'adminIndex']);
    Route::post('/comparison-prices', [ComparisonPriceController::class, 'store']);
    Route::put('/comparison-prices/{comparisonPrice}', [ComparisonPriceController::class, 'update']);
    Route::delete('/comparison-prices/{comparisonPrice}', [ComparisonPriceController::class, 'destroy']);

    // Site settings management
    Route::get('/site-settings', [SiteSettingController::class, 'adminIndex']);
    Route::post('/site-settings', [SiteSettingController::class, 'store']);
    Route::put('/site-settings/{key}', [SiteSettingController::class, 'update']);
    Route::post('/site-settings/bulk', [SiteSettingController::class, 'bulkUpdate']);
    Route::delete('/site-settings/{key}', [SiteSettingController::class, 'destroy']);

    // Room plans management
    Route::get('/room-plans', [AdminController::class, 'roomPlans']);
    Route::get('/room-plans/{id}', [AdminController::class, 'showRoomPlan']);
    Route::put('/room-plans/{id}', [AdminController::class, 'updateRoomPlan']);
    Route::delete('/room-plans/{id}', [AdminController::class, 'deleteRoomPlan']);

    // Payment methods management
    Route::get('/payment-methods', [AdminController::class, 'paymentMethods']);
    Route::post('/payment-methods', [AdminController::class, 'createPaymentMethod']);
    Route::put('/payment-methods/{id}', [AdminController::class, 'updatePaymentMethod']);
    Route::delete('/payment-methods/{id}', [AdminController::class, 'deletePaymentMethod']);

    // Orders management
    Route::get('/orders', [AdminController::class, 'orders']);
    Route::get('/orders/{id}', [AdminController::class, 'showOrder']);
    Route::put('/orders/{id}', [AdminController::class, 'updateOrder']);

    // Near Me requests management
    Route::get('/near-me-requests', [NearMeController::class, 'adminIndex']);
    Route::put('/near-me-requests/{id}', [NearMeController::class, 'adminUpdate']);

    // Exchange Pro requests management
    Route::get('/exchange-pro-requests', [ExchangeProController::class, 'adminIndex']);
    Route::put('/exchange-pro-requests/{id}', [ExchangeProController::class, 'adminUpdate']);

    // Bidding Pro requests management
    Route::get('/bidding-pro-requests', [BiddingProController::class, 'adminIndex']);
    Route::put('/bidding-pro-requests/{id}', [BiddingProController::class, 'adminUpdate']);

    // CO2 Emissions management
    Route::apiResource('/co2-emissions', Co2EmissionController::class)->except(['show']);

    // Premium codes management
    Route::get('/premium-codes', [PremiumCodeController::class, 'adminIndex']);
    Route::post('/premium-codes', [PremiumCodeController::class, 'adminStore']);
    Route::put('/premium-codes/{id}', [PremiumCodeController::class, 'adminUpdate']);
    Route::delete('/premium-codes/{id}', [PremiumCodeController::class, 'adminDestroy']);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'Revival Studio API is running',
        'version' => '1.0.0',
    ]);
});
