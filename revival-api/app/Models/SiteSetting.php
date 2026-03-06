<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
    ];

    /**
     * Get a setting value by key
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        return static::castValue($setting->value, $setting->type);
    }

    /**
     * Set a setting value by key
     */
    public static function setValue(string $key, $value): bool
    {
        $setting = static::where('key', $key)->first();

        if (!$setting) {
            return false;
        }

        if ($setting->type === 'json' && is_array($value)) {
            $value = json_encode($value);
        }

        $setting->value = $value;
        return $setting->save();
    }

    /**
     * Get all settings in a group
     */
    public static function getByGroup(string $group): array
    {
        return static::where('group', $group)
            ->get()
            ->mapWithKeys(function ($setting) {
                return [$setting->key => static::castValue($setting->value, $setting->type)];
            })
            ->toArray();
    }

    /**
     * Get all settings grouped
     */
    public static function getAllGrouped(): array
    {
        return static::all()
            ->groupBy('group')
            ->map(function ($items) {
                return $items->mapWithKeys(function ($setting) {
                    return [$setting->key => [
                        'value' => static::castValue($setting->value, $setting->type),
                        'type' => $setting->type,
                        'label' => $setting->label,
                        'description' => $setting->description,
                    ]];
                });
            })
            ->toArray();
    }

    /**
     * Cast value based on type
     */
    protected static function castValue($value, string $type)
    {
        return match ($type) {
            'json' => json_decode($value, true),
            'number' => (float) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            default => $value,
        };
    }
}
