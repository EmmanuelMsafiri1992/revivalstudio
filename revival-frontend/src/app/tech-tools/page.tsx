'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutGrid, Wrench, TrendingUp, Tag, MapPin, RefreshCw, Gavel,
  Crown, ArrowRight, Lock, Sparkles, Zap, Star
} from 'lucide-react'

interface Tool {
  icon: React.ElementType
  title: string
  description: string
  longDescription: string
  isPremium: boolean
  href: string
  imageBg: string
  badge?: string
}

const tools: Tool[] = [
  {
    icon: LayoutGrid,
    title: 'Room Planner',
    description: 'Plan your dream room with AI assistance',
    longDescription: 'Use our AI-powered room planner to visualise furniture arrangements, colour schemes, and styles. Get personalised recommendations based on your room dimensions and preferred style.',
    isPremium: false,
    href: '/planner',
    imageBg: 'from-[#7a9b76] to-[#3d4a3a]',
    badge: 'Free',
  },
  {
    icon: Wrench,
    title: 'Repair Cost Estimator',
    description: 'Get instant repair cost estimates',
    longDescription: 'Discover how much it would cost to repair your furniture before committing. Our estimator factors in furniture type, material, and damage severity to give you an accurate quote range.',
    isPremium: false,
    href: '/repair',
    imageBg: 'from-[#7a9b76] to-[#4a5a46]',
    badge: 'Free',
  },
  {
    icon: TrendingUp,
    title: 'Resale Value Generator',
    description: "Know your furniture's worth",
    longDescription: 'Get a fair and transparent market valuation for your furniture. Our AI analyses brand, age, condition, and current market demand to give you a realistic price range.',
    isPremium: false,
    href: '/sell',
    imageBg: 'from-[#3d4a3a] to-[#7a9b76]',
    badge: 'Free',
  },
  {
    icon: Tag,
    title: 'Discount Pro',
    description: 'Exclusive discounted furniture for premium members',
    longDescription: 'Access hand-picked discounted furniture from our exclusive partner network. Premium members get first access to deeply discounted pieces before they go public — often saving 30-60% off retail.',
    isPremium: true,
    href: '/premium-login',
    imageBg: 'from-[#c9a962] to-[#d4b46d]',
    badge: 'Premium',
  },
  {
    icon: MapPin,
    title: 'Near Me',
    description: 'Find furniture near your location',
    longDescription: 'Search for quality second-hand furniture within a specified radius of your postcode. Filter by type, condition, and price to find the perfect piece without travelling far.',
    isPremium: true,
    href: '/premium-login',
    imageBg: 'from-[#c9a962] to-[#a8883e]',
    badge: 'Premium',
  },
  {
    icon: RefreshCw,
    title: 'Exchange Pro',
    description: 'Get 20% more value for your furniture',
    longDescription: 'Our premium exchange programme offers 20% above standard resale value. Connect with our curated partner network who will provide enhanced offers for quality pieces — perfect for upgrading your home.',
    isPremium: true,
    href: '/premium-login',
    imageBg: 'from-[#d4b46d] to-[#c9a962]',
    badge: 'Premium',
  },
  {
    icon: Gavel,
    title: 'Bidding Pro',
    description: 'Let partners compete for your furniture',
    longDescription: 'Submit your furniture to a live bidding system where our verified partner network competes to offer you the highest price. More competition always means better value — sit back and let the bids come to you.',
    isPremium: true,
    href: '/premium-login',
    imageBg: 'from-[#a8883e] to-[#c9a962]',
    badge: 'Premium',
  },
]

export default function TechToolsPage() {
  const freeTools = tools.filter(t => !t.isPremium)
  const premiumTools = tools.filter(t => t.isPremium)

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#7a9b76] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-[#c9a962]" />
            All Tools in One Place
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Tech &amp;
            <span className="text-[#c9a962]"> Tools</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Discover our suite of free and premium tools designed to help you get the most from your furniture — whether buying, selling, repairing, or upgrading.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-5 h-5 text-[#c9a962]" />
              <span>3 Free Tools</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Crown className="w-5 h-5 text-[#c9a962]" />
              <span>4 Premium Tools</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-5 h-5 text-[#c9a962]" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Free Tools */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#7a9b76]/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#7a9b76]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#3d4a3a]">Free Tools</h2>
              <p className="text-sm text-[#666]">No account required — try them now</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeTools.map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
              >
                {/* Image Placeholder */}
                <div className={`h-44 bg-gradient-to-br ${tool.imageBg} relative overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <tool.icon className="w-16 h-16 text-white/30" />
                  </div>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#7a9b76] text-white rounded-full text-xs font-bold">
                      Free
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/40 to-transparent">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <tool.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3d4a3a] mb-2">{tool.title}</h3>
                  <p className="text-[#c9a962] font-medium text-sm mb-3">{tool.description}</p>
                  <p className="text-[#666] text-sm leading-relaxed mb-6">{tool.longDescription}</p>
                  <Link
                    href={tool.href}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#3d4a3a] text-white rounded-full font-semibold hover:bg-[#2d3a2a] transition-all group-hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  >
                    Try Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Tools */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#c9a962]/20 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#c9a962]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#3d4a3a]">Premium Tools</h2>
              <p className="text-sm text-[#666]">Exclusive features for premium members</p>
            </div>
          </div>

          {/* Premium CTA Banner */}
          <div className="bg-gradient-to-r from-[#3d4a3a] to-[#4a5a46] rounded-2xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Unlock All Premium Features</h3>
              <p className="text-white/70 text-sm">Get access to exclusive deals, enhanced valuations, and our partner bidding network.</p>
            </div>
            <Link
              href="/premium-login"
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold hover:from-[#d4b46d] hover:to-[#c9a962] transition-all shadow-lg whitespace-nowrap"
            >
              <Crown className="w-5 h-5" />
              Get Premium Access
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumTools.map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#faf8f5] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group border-2 border-[#c9a962]/20"
              >
                {/* Image Placeholder */}
                <div className={`h-40 bg-gradient-to-br ${tool.imageBg} relative overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <tool.icon className="w-14 h-14 text-white/30" />
                  </div>
                  <div className="absolute inset-0 bg-black/20" />
                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full text-xs font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#3d4a3a] mb-2">{tool.title}</h3>
                  <p className="text-[#c9a962] font-medium text-xs mb-2">{tool.description}</p>
                  <p className="text-[#666] text-xs leading-relaxed mb-5 line-clamp-3">{tool.longDescription}</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#c9a962]/10 rounded-lg">
                      <Lock className="w-4 h-4 text-[#c9a962] flex-shrink-0" />
                      <span className="text-xs font-semibold text-[#c9a962]">Premium Feature</span>
                    </div>
                    <Link
                      href="/premium-login"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold hover:from-[#d4b46d] hover:to-[#c9a962] transition-all text-sm shadow-md"
                    >
                      <Crown className="w-4 h-4" />
                      Get Premium Access
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#3d4a3a] to-[#4a5a46]">
        <div className="max-w-3xl mx-auto text-center">
          <Crown className="w-12 h-12 text-[#c9a962] mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to unlock the full potential?
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            Premium access gives you exclusive deals, 20% more on exchanges, location-based search, and our partner bidding network — all for the best furniture experience.
          </p>
          <Link
            href="/premium-login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold hover:from-[#d4b46d] hover:to-[#c9a962] transition-all shadow-xl text-lg"
          >
            <Crown className="w-5 h-5" />
            Get Premium Access Now
          </Link>
        </div>
      </section>
    </div>
  )
}
