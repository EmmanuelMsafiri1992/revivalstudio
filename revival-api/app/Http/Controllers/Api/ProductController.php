<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Get all available products (public)
     */
    public function index(Request $request)
    {
        $query = Product::with(['outlet:id,name,city,postcode,latitude,longitude', 'furnitureType:id,name,icon'])
            ->available();

        // Filter by furniture type
        if ($request->has('furniture_type_id')) {
            $query->where('furniture_type_id', $request->furniture_type_id);
        }

        // Filter by condition
        if ($request->has('condition')) {
            $query->where('condition', $request->condition);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by city
        if ($request->has('city')) {
            $query->whereHas('outlet', function ($q) use ($request) {
                $q->where('city', 'like', '%' . $request->city . '%');
            });
        }

        // Search by name or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('brand', 'like', '%' . $search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Featured products first option
        if ($request->has('featured_first')) {
            $query->orderBy('featured', 'desc');
        }

        $products = $query->paginate($request->get('per_page', 12));

        return response()->json($products);
    }

    /**
     * Get featured products
     */
    public function featured()
    {
        $products = Product::with(['outlet:id,name,city,postcode', 'furnitureType:id,name,icon'])
            ->available()
            ->featured()
            ->latest()
            ->take(6)
            ->get();

        return response()->json(['data' => $products]);
    }

    /**
     * Get single product details
     */
    public function show($id)
    {
        $product = Product::with([
            'outlet:id,name,email,phone,address,city,postcode,latitude,longitude,description,opening_hours',
            'furnitureType:id,name,icon'
        ])->findOrFail($id);

        // Get related products from the same outlet or category
        $relatedProducts = Product::with(['outlet:id,name,city'])
            ->available()
            ->where('id', '!=', $product->id)
            ->where(function ($query) use ($product) {
                $query->where('outlet_id', $product->outlet_id)
                      ->orWhere('furniture_type_id', $product->furniture_type_id);
            })
            ->take(4)
            ->get();

        return response()->json([
            'data' => $product,
            'related' => $relatedProducts,
        ]);
    }

    /**
     * Partner: Get own products
     */
    public function partnerProducts(Request $request)
    {
        $outlet = $request->user();

        $query = $outlet->products()->with('furnitureType:id,name,icon');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $products = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json($products);
    }

    /**
     * Partner: Create product
     */
    public function partnerStore(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'furniture_type_id' => 'nullable|exists:furniture_types,id',
            'condition' => 'required|in:excellent,good,fair,poor',
            'brand' => 'nullable|string|max:255',
            'material' => 'nullable|string|max:255',
            'dimensions' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:1',
            'images' => 'nullable|array',
            'images.*' => 'image|max:10240', // 10MB max per image
            'status' => 'nullable|in:available,draft',
        ]);

        $outlet = $request->user();

        $data = $request->except('images');
        $data['outlet_id'] = $outlet->id;

        // Handle image uploads
        if ($request->hasFile('images')) {
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $imagePaths[] = '/storage/' . $path;
            }
            $data['images'] = $imagePaths;
        }

        $product = Product::create($data);

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $product->load('furnitureType'),
        ], 201);
    }

    /**
     * Partner: Update product
     */
    public function partnerUpdate(Request $request, $id)
    {
        $outlet = $request->user();
        $product = $outlet->products()->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'furniture_type_id' => 'nullable|exists:furniture_types,id',
            'condition' => 'sometimes|required|in:excellent,good,fair,poor',
            'brand' => 'nullable|string|max:255',
            'material' => 'nullable|string|max:255',
            'dimensions' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:1',
            'images' => 'nullable|array',
            'images.*' => 'image|max:10240',
            'status' => 'nullable|in:available,reserved,sold,draft',
        ]);

        $data = $request->except('images');

        // Handle new image uploads
        if ($request->hasFile('images')) {
            $imagePaths = $product->images ?? [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $imagePaths[] = '/storage/' . $path;
            }
            $data['images'] = $imagePaths;
        }

        $product->update($data);

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => $product->fresh()->load('furnitureType'),
        ]);
    }

    /**
     * Partner: Delete product
     */
    public function partnerDestroy(Request $request, $id)
    {
        $outlet = $request->user();
        $product = $outlet->products()->findOrFail($id);

        // Delete product images
        if ($product->images) {
            foreach ($product->images as $image) {
                $path = str_replace('/storage/', '', $image);
                Storage::disk('public')->delete($path);
            }
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * Partner: Delete single image from product
     */
    public function partnerDeleteImage(Request $request, $id, $imageIndex)
    {
        $outlet = $request->user();
        $product = $outlet->products()->findOrFail($id);

        $images = $product->images ?? [];

        if (isset($images[$imageIndex])) {
            // Delete the file
            $path = str_replace('/storage/', '', $images[$imageIndex]);
            Storage::disk('public')->delete($path);

            // Remove from array
            array_splice($images, $imageIndex, 1);
            $product->update(['images' => $images]);
        }

        return response()->json([
            'message' => 'Image deleted successfully',
            'data' => $product->fresh(),
        ]);
    }

    /**
     * Admin: Get all products
     */
    public function adminIndex(Request $request)
    {
        $query = Product::with(['outlet:id,name,city', 'furnitureType:id,name,icon']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('outlet_id')) {
            $query->where('outlet_id', $request->outlet_id);
        }

        $products = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json($products);
    }

    /**
     * Admin: Update product (including featured status)
     */
    public function adminUpdate(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'condition' => 'sometimes|required|in:excellent,good,fair,poor',
            'status' => 'nullable|in:available,reserved,sold,draft',
            'featured' => 'nullable|boolean',
        ]);

        $product->update($request->all());

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => $product->fresh()->load(['outlet', 'furnitureType']),
        ]);
    }

    /**
     * Admin: Delete product
     */
    public function adminDestroy($id)
    {
        $product = Product::findOrFail($id);

        // Delete product images
        if ($product->images) {
            foreach ($product->images as $image) {
                $path = str_replace('/storage/', '', $image);
                Storage::disk('public')->delete($path);
            }
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
