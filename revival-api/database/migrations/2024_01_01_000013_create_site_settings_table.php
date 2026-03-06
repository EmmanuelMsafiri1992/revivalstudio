<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text'); // text, json, number, boolean
            $table->string('group')->default('general'); // hero, features, testimonials, stats, cta, contact
            $table->string('label')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        $this->seedDefaultSettings();
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }

    private function seedDefaultSettings(): void
    {
        $settings = [
            // Hero Section
            [
                'key' => 'hero_headline',
                'value' => 'AI-Powered Circular Furniture Marketplace',
                'type' => 'text',
                'group' => 'hero',
                'label' => 'Hero Headline',
                'description' => 'Main headline on the homepage hero section'
            ],
            [
                'key' => 'hero_tagline',
                'value' => 'Affordable • Sustainable • Professional',
                'type' => 'text',
                'group' => 'hero',
                'label' => 'Hero Tagline',
                'description' => 'Tagline displayed below the headline'
            ],
            [
                'key' => 'hero_description',
                'value' => 'Get instant AI-powered estimates for furniture repair, find the best resale value, or plan your perfect room with our smart tools.',
                'type' => 'text',
                'group' => 'hero',
                'label' => 'Hero Description',
                'description' => 'Description text in hero section'
            ],
            [
                'key' => 'whatsapp_number',
                'value' => '447570578520',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'WhatsApp Number',
                'description' => 'WhatsApp number for customer contact (without + or spaces)'
            ],
            [
                'key' => 'contact_email',
                'value' => 'info@revivalstudio.co.uk',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Contact Email',
                'description' => 'Main contact email address'
            ],
            [
                'key' => 'contact_phone',
                'value' => '+44 7570 578520',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Contact Phone',
                'description' => 'Main contact phone number'
            ],

            // Stats Section
            [
                'key' => 'stat_pieces_restored',
                'value' => '500+',
                'type' => 'text',
                'group' => 'stats',
                'label' => 'Pieces Restored',
                'description' => 'Number of furniture pieces restored'
            ],
            [
                'key' => 'stat_partner_outlets',
                'value' => '50+',
                'type' => 'text',
                'group' => 'stats',
                'label' => 'Partner Outlets',
                'description' => 'Number of partner outlets'
            ],
            [
                'key' => 'stat_satisfaction_rate',
                'value' => '98%',
                'type' => 'text',
                'group' => 'stats',
                'label' => 'Satisfaction Rate',
                'description' => 'Customer satisfaction percentage'
            ],
            [
                'key' => 'stat_happy_customers',
                'value' => '2,500+',
                'type' => 'text',
                'group' => 'stats',
                'label' => 'Happy Customers',
                'description' => 'Total number of happy customers'
            ],
            [
                'key' => 'stat_average_rating',
                'value' => '4.9',
                'type' => 'text',
                'group' => 'stats',
                'label' => 'Average Rating',
                'description' => 'Average customer rating out of 5'
            ],

            // Features Section
            [
                'key' => 'features',
                'value' => json_encode([
                    [
                        'title' => 'Repair Estimator',
                        'description' => 'Get instant AI-powered estimates for furniture repair costs',
                        'icon' => 'wrench',
                        'link' => '/repair'
                    ],
                    [
                        'title' => 'Resale Generator',
                        'description' => 'Find out what your furniture is worth on the market',
                        'icon' => 'dollar',
                        'link' => '/sell'
                    ],
                    [
                        'title' => 'Furniture Planner',
                        'description' => 'Plan your perfect room with our smart tool',
                        'icon' => 'layout',
                        'link' => '/planner'
                    ],
                    [
                        'title' => 'Partner Marketplace',
                        'description' => 'Buy quality pre-loved furniture from trusted partners',
                        'icon' => 'store',
                        'link' => '/buy'
                    ]
                ]),
                'type' => 'json',
                'group' => 'features',
                'label' => 'Features List',
                'description' => 'List of features displayed on the homepage'
            ],

            // How It Works Section
            [
                'key' => 'how_it_works',
                'value' => json_encode([
                    [
                        'step' => 1,
                        'title' => 'Submit Request',
                        'description' => 'Tell us about your furniture using our simple online forms'
                    ],
                    [
                        'step' => 2,
                        'title' => 'We Connect You',
                        'description' => 'Our AI matches you with the best local partners and options'
                    ],
                    [
                        'step' => 3,
                        'title' => 'Revival Complete',
                        'description' => 'Get your furniture repaired, sold, or find your perfect piece'
                    ]
                ]),
                'type' => 'json',
                'group' => 'how_it_works',
                'label' => 'How It Works Steps',
                'description' => 'Steps displayed in How It Works section'
            ],

            // Testimonials
            [
                'key' => 'testimonials',
                'value' => json_encode([
                    [
                        'name' => 'Sarah M.',
                        'location' => 'London',
                        'text' => 'Revival Studio saved me hundreds on furniture repairs. The AI estimate was spot-on!',
                        'rating' => 5
                    ],
                    [
                        'name' => 'James K.',
                        'location' => 'Manchester',
                        'text' => 'Sold my old sofa through their platform. Quick, easy, and got a great price.',
                        'rating' => 5
                    ],
                    [
                        'name' => 'Emma T.',
                        'location' => 'Birmingham',
                        'text' => 'The room planner helped me furnish my new flat sustainably. Love it!',
                        'rating' => 5
                    ]
                ]),
                'type' => 'json',
                'group' => 'testimonials',
                'label' => 'Customer Testimonials',
                'description' => 'Testimonials displayed on the homepage'
            ],

            // CTA Section
            [
                'key' => 'cta_headline',
                'value' => 'Ready to Revive Your Furniture?',
                'type' => 'text',
                'group' => 'cta',
                'label' => 'CTA Headline',
                'description' => 'Call-to-action section headline'
            ],
            [
                'key' => 'cta_description',
                'value' => 'Whether you want to repair, sell, or buy sustainable furniture, we\'re here to help.',
                'type' => 'text',
                'group' => 'cta',
                'label' => 'CTA Description',
                'description' => 'Call-to-action section description'
            ],

            // Business Info
            [
                'key' => 'business_name',
                'value' => 'Revival Studio',
                'type' => 'text',
                'group' => 'general',
                'label' => 'Business Name',
                'description' => 'Name of the business'
            ],
            [
                'key' => 'business_address',
                'value' => 'London, United Kingdom',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Business Address',
                'description' => 'Physical address of the business'
            ],
            [
                'key' => 'social_facebook',
                'value' => '',
                'type' => 'text',
                'group' => 'social',
                'label' => 'Facebook URL',
                'description' => 'Facebook page URL'
            ],
            [
                'key' => 'social_instagram',
                'value' => '',
                'type' => 'text',
                'group' => 'social',
                'label' => 'Instagram URL',
                'description' => 'Instagram profile URL'
            ],
            [
                'key' => 'social_twitter',
                'value' => '',
                'type' => 'text',
                'group' => 'social',
                'label' => 'Twitter URL',
                'description' => 'Twitter profile URL'
            ],
        ];

        foreach ($settings as $setting) {
            \DB::table('site_settings')->insert(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
};
