'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, MapPin, Phone, Mail, Clock, ChevronLeft, ChevronRight, Star, Shield, Truck } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  original_price: number | null
  condition: string
  brand: string | null
  material: string | null
  dimensions: string | null
  color: string | null
  quantity: number
  images: string[] | null
  status: string
  featured: boolean
  furniture_type?: {
    id: number
    name: string
    icon: string | null
  }
  outlet?: {
    id: number
    name: string
    email: string
    phone: string | null
    address: string | null
    city: string | null
    postcode: string | null
    latitude: number | null
    longitude: number | null
    description: string | null
    opening_hours: any | null
  }
}

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

const conditionColors: Record<string, string> = {
  excellent: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  fair: 'bg-yellow-100 text-yellow-800',
  poor: 'bg-red-100 text-red-800',
}

const formatPrice = (price: number | string | null | undefined): string => {
  if (price === null || price === undefined) return '0.00'
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
}

const toNumber = (price: number | string | null | undefined): number => {
  if (price === null || price === undefined) return 0
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(numPrice) ? 0 : numPrice
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [product?.id])

  if (!product) return null

  // Parse images if it's a JSON string
  let parsedImages = product.images
  if (typeof parsedImages === 'string') {
    try {
      parsedImages = JSON.parse(parsedImages)
    } catch {
      parsedImages = null
    }
  }
  const images = (Array.isArray(parsedImages) && parsedImages.length > 0)
    ? parsedImages
    : ['/products/placeholder.jpg']
  const hasMultipleImages = images.length > 1
  const price = toNumber(product.price)
  const originalPrice = toNumber(product.original_price)
  const discountPercent = originalPrice > 0
    ? Math.round((1 - price / originalPrice) * 100)
    : 0

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const formatOpeningHours = (hours: any) => {
    if (!hours) return null
    // Parse JSON string if needed
    let parsedHours = hours
    if (typeof hours === 'string') {
      try {
        parsedHours = JSON.parse(hours)
      } catch {
        return hours // Return as-is if not valid JSON
      }
    }
    if (Array.isArray(parsedHours)) return parsedHours.join(', ')
    if (typeof parsedHours === 'object') {
      return Object.entries(parsedHours)
        .map(([day, time]) => `${day}: ${time}`)
        .join(' | ')
    }
    return String(parsedHours)
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-4xl sm:w-full sm:max-h-[90vh] bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative bg-gray-100">
                  <div className="relative h-64 sm:h-80 md:h-full md:min-h-[400px]">
                    <Image
                      src={images[currentImageIndex]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                          -{discountPercent}% OFF
                        </span>
                      </div>
                    )}

                    {/* Featured Badge */}
                    {product.featured && (
                      <div className="absolute top-4 left-4" style={{ left: discountPercent > 0 ? '120px' : '16px' }}>
                        <span className="px-3 py-1 bg-[#c9a962] text-[#3d4a3a] rounded-full text-sm font-bold flex items-center gap-1">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      </div>
                    )}

                    {/* Image Navigation */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Image Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {hasMultipleImages && (
                    <div className="flex gap-2 p-3 bg-white border-t overflow-x-auto">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                            idx === currentImageIndex ? 'border-[#c9a962]' : 'border-transparent'
                          }`}
                        >
                          <Image src={img} alt="" fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-6 flex flex-col">
                  {/* Category & Condition */}
                  <div className="flex items-center gap-2 mb-3">
                    {product.furniture_type && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        {product.furniture_type.name}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${conditionColors[product.condition] || 'bg-gray-100 text-gray-800'}`}>
                      {product.condition}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-[#3d4a3a] mb-2">{product.name}</h2>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold text-[#c9a962]">
                      £{formatPrice(product.price)}
                    </span>
                    {product.original_price && (
                      <span className="text-lg text-gray-400 line-through">
                        £{formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Product Details */}
                  <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                    {product.brand && (
                      <div>
                        <span className="text-gray-500">Brand:</span>
                        <span className="ml-2 font-medium text-[#3d4a3a]">{product.brand}</span>
                      </div>
                    )}
                    {product.material && (
                      <div>
                        <span className="text-gray-500">Material:</span>
                        <span className="ml-2 font-medium text-[#3d4a3a]">{product.material}</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div>
                        <span className="text-gray-500">Dimensions:</span>
                        <span className="ml-2 font-medium text-[#3d4a3a]">{product.dimensions}</span>
                      </div>
                    )}
                    {product.color && (
                      <div>
                        <span className="text-gray-500">Color:</span>
                        <span className="ml-2 font-medium text-[#3d4a3a]">{product.color}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Available:</span>
                      <span className="ml-2 font-medium text-[#3d4a3a]">{product.quantity} in stock</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex flex-wrap gap-3 mb-6 text-xs">
                    <div className="flex items-center gap-1 text-green-600">
                      <Shield className="w-4 h-4" />
                      <span>Quality Checked</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Truck className="w-4 h-4" />
                      <span>Delivery Available</span>
                    </div>
                  </div>

                  {/* Partner/Outlet Location */}
                  {product.outlet && (
                    <div className="bg-[#f8f6f3] rounded-xl p-4 mb-6">
                      <h3 className="font-semibold text-[#3d4a3a] mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#c9a962]" />
                        Available at Partner Location
                      </h3>

                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-[#3d4a3a]">{product.outlet.name}</p>

                        {(product.outlet.address || product.outlet.city) && (
                          <p className="text-gray-600">
                            {[product.outlet.address, product.outlet.city, product.outlet.postcode]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}

                        {product.outlet.phone && (
                          <a href={`tel:${product.outlet.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-[#3d4a3a]">
                            <Phone className="w-4 h-4" />
                            {product.outlet.phone}
                          </a>
                        )}

                        {product.outlet.email && (
                          <a href={`mailto:${product.outlet.email}`} className="flex items-center gap-2 text-gray-600 hover:text-[#3d4a3a]">
                            <Mail className="w-4 h-4" />
                            {product.outlet.email}
                          </a>
                        )}

                        {product.outlet.opening_hours && (
                          <div className="flex items-start gap-2 text-gray-600">
                            <Clock className="w-4 h-4 mt-0.5" />
                            <span>{formatOpeningHours(product.outlet.opening_hours)}</span>
                          </div>
                        )}

                        {/* Map Link */}
                        {product.outlet.latitude && product.outlet.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${product.outlet.latitude},${product.outlet.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#c9a962] hover:underline mt-2"
                          >
                            <MapPin className="w-4 h-4" />
                            View on Map
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
