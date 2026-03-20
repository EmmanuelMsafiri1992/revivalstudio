<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $newSettings = [
            [
                'key' => 'contact_phone_alt',
                'value' => '+44 7511 775529',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Alternative Phone Number',
                'description' => 'Secondary phone number shown in the footer',
            ],
            [
                'key' => 'contact_email_main',
                'value' => 'revivalstudio2026@gmail.com',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Main Contact Email',
                'description' => 'Primary contact email shown in footer and contact sections',
            ],
            [
                'key' => 'contact_email_partners',
                'value' => 'partners@revivalstudio.co.uk',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Partners Contact Email',
                'description' => 'Email address shown on the partner login page for new partner enquiries',
            ],
            [
                'key' => 'contact_email_discounted',
                'value' => 'discounted@revivalstudio.co.uk',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Discounted Outlet Email',
                'description' => 'Email of the outlet whose products are shown on the Discounted Products page',
            ],
            [
                'key' => 'business_address_full',
                'value' => 'Canberra Road 10, London, United Kingdom, SE7 7BA',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Full Business Address',
                'description' => 'Complete business address shown in the footer',
            ],
            [
                'key' => 'footer_tagline',
                'value' => 'London Based | Delivery Available | UK-Wide Partner Network',
                'type' => 'text',
                'group' => 'general',
                'label' => 'Footer Tagline',
                'description' => 'Short tagline shown at the bottom of the footer',
            ],
        ];

        foreach ($newSettings as $setting) {
            DB::table('site_settings')->insertOrIgnore(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Update social_facebook with the actual URL (was empty)
        DB::table('site_settings')
            ->where('key', 'social_facebook')
            ->where('value', '')
            ->update([
                'value' => 'https://www.facebook.com/profile.php?id=61588351737342',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        DB::table('site_settings')->whereIn('key', [
            'contact_phone_alt',
            'contact_email_main',
            'contact_email_partners',
            'contact_email_discounted',
            'business_address_full',
            'footer_tagline',
        ])->delete();

        DB::table('site_settings')
            ->where('key', 'social_facebook')
            ->update(['value' => '', 'updated_at' => now()]);
    }
};
