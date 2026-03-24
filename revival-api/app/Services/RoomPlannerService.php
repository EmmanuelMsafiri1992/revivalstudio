<?php

namespace App\Services;

use App\Models\FurnitureCatalog;
use App\Models\FurnitureType;
use App\Models\RoomPlannerStyle;

class RoomPlannerService
{
    protected array $roomTypes = [
        'livingRoom' => [
            'name' => 'Living Room',
            'icon' => '🛋️',
            'suggestedTypes' => ['sofa', 'armchair', 'coffee-table', 'tv-stand', 'bookshelf'],
        ],
        'bedroom' => [
            'name' => 'Bedroom',
            'icon' => '🛏️',
            'suggestedTypes' => ['bed', 'wardrobe', 'dresser', 'bedside-table'],
        ],
        'diningRoom' => [
            'name' => 'Dining Room',
            'icon' => '🍽️',
            'suggestedTypes' => ['dining-table', 'dining-chair', 'sideboard', 'cabinet'],
        ],
        'homeOffice' => [
            'name' => 'Home Office',
            'icon' => '💼',
            'suggestedTypes' => ['desk', 'office-chair', 'bookshelf', 'cabinet'],
        ],
        'hallway' => [
            'name' => 'Hallway',
            'icon' => '🚪',
            'suggestedTypes' => ['console-table', 'cabinet', 'ottoman'],
        ],
    ];

    protected array $roomSizes = [
        'small'  => ['name' => 'Small (up to 12m²)',  'maxItems' => 4],
        'medium' => ['name' => 'Medium (12-20m²)',     'maxItems' => 6],
        'large'  => ['name' => 'Large (20m²+)',        'maxItems' => 10],
    ];

    // Fallback styles used only when DB has no records
    private array $fallbackStyles = [
        'modern'       => ['name' => 'Modern',       'priceMultiplier' => 1.1],
        'classic'      => ['name' => 'Classic',      'priceMultiplier' => 1.0],
        'midCentury'   => ['name' => 'Mid-Century',  'priceMultiplier' => 1.2],
        'scandinavian' => ['name' => 'Scandinavian', 'priceMultiplier' => 1.15],
        'industrial'   => ['name' => 'Industrial',   'priceMultiplier' => 1.05],
        'rustic'       => ['name' => 'Rustic',       'priceMultiplier' => 0.95],
    ];

    private function getStylesFromDb(): array
    {
        $rows = RoomPlannerStyle::active()->orderBy('sort_order')->get();

        if ($rows->isEmpty()) {
            return [];
        }

        $result = [];
        foreach ($rows as $row) {
            $result[$row->key] = ['name' => $row->name, 'priceMultiplier' => $row->price_multiplier];
        }

        return $result;
    }

    private function resolvedStyles(): array
    {
        $db = $this->getStylesFromDb();
        return $db ?: $this->fallbackStyles;
    }

    public function generatePlan(
        string $roomType,
        string $roomSize,
        string $style,
        ?float $budget = null
    ): array {
        $roomConfig  = $this->roomTypes[$roomType]  ?? $this->roomTypes['livingRoom'];
        $sizeConfig  = $this->roomSizes[$roomSize]  ?? $this->roomSizes['medium'];

        $styles      = $this->resolvedStyles();
        $styleConfig = $styles[$style] ?? $styles['modern'] ?? ['name' => $style, 'priceMultiplier' => 1.0];

        // Get furniture types for this room
        $furnitureTypes = FurnitureType::whereIn('slug', $roomConfig['suggestedTypes'])
            ->active()
            ->get();

        // Get catalog items
        $suggestions = FurnitureCatalog::whereIn('furniture_type_id', $furnitureTypes->pluck('id'))
            ->available()
            ->when($style, function ($query) use ($style) {
                // Prefer matching style, but include others
                return $query->orderByRaw("CASE WHEN style = ? THEN 0 ELSE 1 END", [$style]);
            })
            ->orderBy('sort_order')
            ->limit($sizeConfig['maxItems'])
            ->get();

        // Apply style price multiplier
        $items = $suggestions->map(function ($item) use ($styleConfig) {
            return [
                'id'                  => $item->id,
                'name'                => $item->name,
                'furniture_type'      => $item->furnitureType?->name,
                'furniture_type_icon' => $item->furnitureType?->icon,
                'original_price'      => $item->price,
                'adjusted_price'      => round($item->price * $styleConfig['priceMultiplier'], 2),
                'style'               => $item->style,
                'image'               => $item->image,
                'selected'            => true,
            ];
        });

        $totalCost = $items->sum('adjusted_price');

        return [
            'room' => [
                'type' => $roomType,
                'name' => $roomConfig['name'],
                'icon' => $roomConfig['icon'],
            ],
            'size' => [
                'key'      => $roomSize,
                'name'     => $sizeConfig['name'],
                'maxItems' => $sizeConfig['maxItems'],
            ],
            'style' => [
                'key'             => $style,
                'name'            => $styleConfig['name'],
                'priceMultiplier' => $styleConfig['priceMultiplier'],
            ],
            'budget'        => $budget,
            'items'         => $items->toArray(),
            'total_cost'    => $totalCost,
            'within_budget' => $budget ? $totalCost <= $budget : true,
            'currency'      => 'GBP',
        ];
    }

    public function getRoomTypes(): array
    {
        return $this->roomTypes;
    }

    public function getRoomSizes(): array
    {
        return $this->roomSizes;
    }

    public function getStyles(): array
    {
        return $this->resolvedStyles();
    }
}
