'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingDown, Check, Leaf, Recycle, Package, Truck, ShieldCheck, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: number
  name: string
  price: number
  original_price?: number | null
  condition?: string
  brand?: string | null
  images?: string[] | null
  furniture_type?: {
    id: number
    name: string
    icon?: string | null
  }
}

interface CompareModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

// Simulated IKEA prices for common furniture types
const ikeaPrices: Record<string, { name: string; price: number; image: string }> = {
  'Sofa': { name: 'KIVIK Sofa', price: 699, image: '/compare/ikea-sofa.jpg' },
  'Chair': { name: 'POÄNG Armchair', price: 99, image: '/compare/ikea-chair.jpg' },
  'Table': { name: 'LISABO Table', price: 199, image: '/compare/ikea-table.jpg' },
  'Dining Table': { name: 'EKEDALEN Dining Table', price: 349, image: '/compare/ikea-dining.jpg' },
  'Bed': { name: 'MALM Bed Frame', price: 279, image: '/compare/ikea-bed.jpg' },
  'Wardrobe': { name: 'PAX Wardrobe', price: 495, image: '/compare/ikea-wardrobe.jpg' },
  'Desk': { name: 'BEKANT Desk', price: 299, image: '/compare/ikea-desk.jpg' },
  'Office Desk': { name: 'BEKANT Desk', price: 299, image: '/compare/ikea-desk.jpg' },
  'Bookshelf': { name: 'BILLY Bookcase', price: 59, image: '/compare/ikea-bookshelf.jpg' },
  'Cabinet': { name: 'HEMNES Cabinet', price: 199, image: '/compare/ikea-cabinet.jpg' },
  'Drawer': { name: 'MALM Chest of Drawers', price: 149, image: '/compare/ikea-drawer.jpg' },
  'Coffee Table': { name: 'LACK Coffee Table', price: 29, image: '/compare/ikea-coffee.jpg' },
  'Side Table': { name: 'LACK Side Table', price: 9, image: '/compare/ikea-side.jpg' },
  'TV Stand': { name: 'BESTÅ TV Unit', price: 189, image: '/compare/ikea-tv.jpg' },
  'Armchair': { name: 'STRANDMON Armchair', price: 279, image: '/compare/ikea-armchair.jpg' },
  'default': { name: 'Similar IKEA Product', price: 249, image: '/compare/ikea-default.jpg' }
}

export function CompareModal({ product, isOpen, onClose }: CompareModalProps) {
  const [ikeaProduct, setIkeaProduct] = useState<{ name: string; price: number; image: string } | null>(null)

  useEffect(() => {
    if (product) {
      // Find matching IKEA product based on furniture type
      const typeName = product.furniture_type?.name || 'default'
      const matchedProduct = ikeaPrices[typeName] || ikeaPrices['default']

      // Add some variation to IKEA price based on product name
      const priceVariation = 1 + (product.name.length % 5) * 0.1
      setIkeaProduct({
        ...matchedProduct,
        price: Math.round(matchedProduct.price * priceVariation)
      })
    }
  }, [product])

  if (!product || !ikeaProduct) return null

  const savings = ikeaProduct.price - product.price
  const savingsPercent = Math.round((savings / ikeaProduct.price) * 100)
  const co2Saved = Math.round(savings * 0.5) // Approximate CO2 savings in kg

  const getImageUrl = (images: string[] | null | undefined) => {
    if (!images) return '/products/placeholder.jpg'
    let parsed = images
    if (typeof images === 'string') {
      try {
        parsed = JSON.parse(images)
      } catch {
        return '/products/placeholder.jpg'
      }
    }
    if (Array.isArray(parsed) && parsed.length > 0) {
      const img = parsed[0]
      if (img.startsWith('http') || img.startsWith('/')) return img
      return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${img}`
    }
    return '/products/placeholder.jpg'
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-3xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3d4a3a] to-[#4a5a46] p-4 sm:p-6 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Market Price Comparison</h2>
                  <p className="text-white/80 text-sm mt-1">Revival vs New Retail Prices</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Savings Banner */}
              {savings > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 mb-6 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingDown className="w-5 h-5" />
                    <span className="text-lg sm:text-xl font-bold">Save {formatPrice(savings)}</span>
                  </div>
                  <p className="text-white/90 text-sm">That's {savingsPercent}% less than buying new!</p>
                </motion.div>
              )}

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {/* Revival Product */}
                <div className="border-2 border-[#c9a962] rounded-xl p-4 bg-[#c9a962]/5 relative">
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-[#c9a962] text-[#3d4a3a] rounded-full text-xs font-bold">
                    REVIVAL STUDIO
                  </div>
                  <div className="relative h-40 sm:h-48 rounded-lg overflow-hidden mb-4 mt-2 bg-gray-100">
                    <Image
                      src={getImageUrl(product.images)}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-[#3d4a3a] mb-2">{product.name}</h3>
                  {product.condition && (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-3 ${
                      product.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                      product.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.condition} condition
                    </span>
                  )}
                  <div className="text-3xl font-bold text-[#c9a962]">
                    {formatPrice(product.price)}
                  </div>
                </div>

                {/* IKEA Product */}
                <div className="border-2 border-[#0058a3] rounded-xl p-4 bg-[#0058a3]/5 relative">
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-[#0058a3] text-white rounded-full text-xs font-bold">
                    IKEA (NEW)
                  </div>
                  <div className="relative h-40 sm:h-48 rounded-lg overflow-hidden mb-4 mt-2 bg-gray-100 flex items-center justify-center">
                    <div className="text-6xl">🛒</div>
                  </div>
                  <h3 className="font-semibold text-[#0058a3] mb-2">{ikeaProduct.name}</h3>
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium mb-3 bg-blue-100 text-blue-800">
                    Brand New
                  </span>
                  <div className="text-3xl font-bold text-[#0058a3]">
                    {formatPrice(ikeaProduct.price)}
                  </div>
                </div>
              </div>

              {/* Price Comparison Summary */}
              <div className="bg-[#faf8f5] rounded-xl p-4 sm:p-6 mb-6">
                <h4 className="font-semibold text-[#3d4a3a] mb-4">Price Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-[#e5e5e5]">
                    <span className="text-[#666]">Revival Price</span>
                    <span className="font-bold text-[#c9a962] text-lg">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#e5e5e5]">
                    <span className="text-[#666]">IKEA Price</span>
                    <span className="font-bold text-[#0058a3] text-lg">{formatPrice(ikeaProduct.price)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between items-center py-2 bg-green-50 -mx-4 px-4 rounded-lg">
                      <span className="font-semibold text-green-700">Your Savings</span>
                      <span className="font-bold text-green-600 text-xl">{formatPrice(savings)} ({savingsPercent}%)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Leaf className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <div className="text-sm font-semibold text-green-700">Eco-Friendly</div>
                  <div className="text-xs text-green-600">~{co2Saved}kg CO2 saved</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Recycle className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-sm font-semibold text-blue-700">Circular Economy</div>
                  <div className="text-xs text-blue-600">Giving furniture new life</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-sm font-semibold text-purple-700">Quality Checked</div>
                  <div className="text-xs text-purple-600">Verified condition</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-sm font-semibold text-orange-700">Delivery Available</div>
                  <div className="text-xs text-orange-600">Convenient delivery</div>
                </div>
              </div>

              {/* Why Choose Revival */}
              <div className="bg-gradient-to-br from-[#3d4a3a]/5 to-[#7a9b76]/10 rounded-xl p-4 sm:p-6">
                <h4 className="font-semibold text-[#3d4a3a] mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  Why Choose Revival?
                </h4>
                <ul className="space-y-2 text-sm text-[#666]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Save up to 70% compared to buying new</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>All items quality-checked before listing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Support local partners and reduce waste</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Unique pieces with character and history</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#e5e5e5] p-4 sm:p-6 bg-[#faf8f5] flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-[#3d4a3a] text-white rounded-full font-semibold hover:bg-[#2d3a2a] transition-colors flex items-center justify-center gap-2"
                >
                  View Product Details
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
