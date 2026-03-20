'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { MessageCircle, ShoppingBag, Loader2, Scale } from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useContactSettings } from '@/lib/useContactSettings'
import { ProductDetailModal } from '@/components/products/ProductDetailModal'
import { CompareModal } from '@/components/products/CompareModal'

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
    city: string | null
    postcode: string | null
    latitude?: number | null
    longitude?: number | null
  }
}

// Default outlet info for fallback items
const defaultOutlet = {
  id: 1,
  name: 'Revival Studio',
  email: 'info@revivalstudio.co.uk',
  phone: '+44 7570 578520',
  address: '123 High Street',
  city: 'London',
  postcode: 'E1 1AA',
  latitude: 51.5074,
  longitude: -0.1278,
  description: 'Quality pre-loved furniture, professionally cleaned and restored.',
  opening_hours: 'Mon-Sat: 9am-6pm, Sun: 10am-4pm',
}

// Fallback static data when API is not available
const fallbackItems = [
  {
    id: 1,
    name: 'Solid Wooden Bed Frame',
    description: 'Beautiful solid wood bed frame in excellent condition. Perfect for any bedroom, this sturdy frame features classic design elements.',
    price: 125,
    original_price: null,
    condition: 'good',
    brand: 'Handcrafted',
    material: 'Solid Oak',
    dimensions: '200cm x 150cm x 45cm',
    color: 'Natural Oak',
    quantity: 1,
    images: ['/products/bed-mattress.jpg'],
    status: 'available',
    featured: true,
    furniture_type: { id: 1, name: 'Bedroom', icon: null },
    outlet: defaultOutlet,
  },
  {
    id: 2,
    name: 'Comfort Mattress',
    description: 'Quality mattress, professionally cleaned and sanitized. Medium-firm support for a great night sleep.',
    price: 100,
    original_price: 150,
    condition: 'excellent',
    brand: 'Sleep Well',
    material: 'Memory Foam',
    dimensions: '200cm x 150cm x 25cm',
    color: 'White',
    quantity: 1,
    images: ['/products/bed-mattress.jpg'],
    status: 'available',
    featured: false,
    furniture_type: { id: 1, name: 'Bedroom', icon: null },
    outlet: defaultOutlet,
  },
  {
    id: 3,
    name: 'Office / Bar Chairs',
    description: 'Versatile chairs perfect for office or bar use. Adjustable height with comfortable padding.',
    price: 10,
    original_price: null,
    condition: 'good',
    brand: null,
    material: 'Metal & Fabric',
    dimensions: '45cm x 45cm x 100cm',
    color: 'Black',
    quantity: 5,
    images: ['/products/chairs.jpg'],
    status: 'available',
    featured: false,
    furniture_type: { id: 2, name: 'Seating', icon: null },
    outlet: defaultOutlet,
  },
  {
    id: 4,
    name: 'Metal Storage Cabinet',
    description: 'Durable metal storage cabinet with multiple shelves. Great for garage, office or workshop.',
    price: 55,
    original_price: null,
    condition: 'good',
    brand: null,
    material: 'Steel',
    dimensions: '180cm x 90cm x 45cm',
    color: 'Grey',
    quantity: 1,
    images: ['/products/storage.jpg'],
    status: 'available',
    featured: false,
    furniture_type: { id: 3, name: 'Storage', icon: null },
    outlet: defaultOutlet,
  },
  {
    id: 5,
    name: 'Pedestal Drawer Unit',
    description: 'Compact pedestal drawer unit with 3 drawers. Perfect under-desk storage solution.',
    price: 55,
    original_price: null,
    condition: 'good',
    brand: null,
    material: 'Metal',
    dimensions: '60cm x 40cm x 55cm',
    color: 'White',
    quantity: 1,
    images: ['/products/storage.jpg'],
    status: 'available',
    featured: false,
    furniture_type: { id: 3, name: 'Storage', icon: null },
    outlet: defaultOutlet,
  },
  {
    id: 6,
    name: 'Blue Fabric Sofa',
    description: 'Stylish blue fabric sofa in great condition. Comfortable 3-seater with removable cushion covers.',
    price: 299,
    original_price: null,
    condition: 'excellent',
    brand: 'Designer Collection',
    material: 'Fabric',
    dimensions: '220cm x 90cm x 85cm',
    color: 'Navy Blue',
    quantity: 1,
    images: ['/products/blue-sofa.jpg'],
    status: 'available',
    featured: true,
    furniture_type: { id: 4, name: 'Living Room', icon: null },
    outlet: defaultOutlet,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  excellent: { label: 'Excellent', color: 'bg-green-500 text-white' },
  good: { label: 'Good', color: 'bg-blue-500 text-white' },
  fair: { label: 'Fair', color: 'bg-yellow-500 text-white' },
  poor: { label: 'Fair', color: 'bg-red-500 text-white' },
}

export function FurnitureShowcase() {
  const contact = useContactSettings()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [compareProduct, setCompareProduct] = useState<Product | null>(null)
  const [compareModalOpen, setCompareModalOpen] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.getFeaturedProducts()
        if (response.data && response.data.length > 0) {
          setProducts(response.data)
        } else {
          // If no featured products, get latest available products
          const allProducts = await api.getProducts({ per_page: 6 })
          if (allProducts.data && allProducts.data.length > 0) {
            setProducts(allProducts.data)
          } else {
            setProducts(fallbackItems)
          }
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setProducts(fallbackItems)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleBuyClick = async (product: Product) => {
    // Immediately show modal with the product data we have
    setSelectedProduct(product as any)
    setModalOpen(true)

    // Try to fetch full product details including outlet info in background
    try {
      const response = await api.getProduct(product.id)
      if (response.data) {
        setSelectedProduct(response.data)
      }
    } catch (error) {
      // Keep using the product we already set
      console.log('Using local product data')
    }
  }

  const handleCompareClick = (product: Product) => {
    setCompareProduct(product)
    setCompareModalOpen(true)
  }

  const formatPrice = (price: number | string | null | undefined) => {
    if (price === null || price === undefined) return '£0.00'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return `£${isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)}`
  }

  const getImageUrl = (product: Product) => {
    let images = product.images
    // Parse JSON string if needed
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images)
      } catch {
        images = null
      }
    }
    if (images && Array.isArray(images) && images.length > 0) {
      const img = images[0]
      // If it's an absolute URL (http/https), use as is
      if (img.startsWith('http')) {
        return img
      }
      // For storage paths, prepend API URL
      const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://api.revivalstudio.uk'
      if (img.startsWith('/storage/')) {
        return `${apiBase}${img}`
      }
      if (img.startsWith('/')) {
        return img
      }
      // Otherwise prepend the API storage path
      return `${apiBase}/storage/${img}`
    }
    return '/products/placeholder.jpg'
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#c9a962]" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-40 sm:h-52 lg:h-64 overflow-hidden">
                  <Image
                    src={getImageUrl(product)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Price Tag - Top Right */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <span className="px-2 sm:px-3 py-1 bg-[#c9a962] text-[#3d4a3a] rounded-lg text-xs sm:text-sm font-bold shadow-md">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  {/* Category Tag - Top Right Below Price */}
                  <div className="absolute top-10 sm:top-12 right-2 sm:right-3">
                    <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[#3d4a3a] rounded text-[10px] sm:text-xs font-medium">
                      {product.furniture_type?.name || 'Furniture'}
                    </span>
                  </div>

                  {/* Condition Badge - Top Left */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1">
                    {product.featured && (
                      <span className="px-2 sm:px-3 py-1 bg-[#c9a962] text-[#3d4a3a] rounded-lg text-[10px] sm:text-xs font-bold shadow-md">
                        Featured
                      </span>
                    )}
                    {product.original_price && product.original_price > product.price && (
                      <span className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-lg text-[10px] sm:text-xs font-bold shadow-md">
                        Sale
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 sm:p-4 lg:p-5">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[#3d4a3a] mb-1 sm:mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-[#c9a962]">
                        {formatPrice(product.price)}
                      </span>
                      {product.original_price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCompareClick(product)
                        }}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-[#3d4a3a] text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-[#2d3a2a] transition-colors cursor-pointer"
                        title="Compare with IKEA prices"
                      >
                        <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Compare</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleBuyClick(product)
                        }}
                        className="flex items-center gap-1 px-3 sm:px-4 py-1.5 bg-[#c9a962] text-[#3d4a3a] rounded-full text-xs sm:text-sm font-semibold hover:bg-[#d4b46d] transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Buy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8 sm:mt-12"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <a
              href={`https://wa.me/${contact.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#128C7E] transition-colors text-sm sm:text-base"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Message for FREE Quote
            </a>
            <a
              href="/sell"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold hover:bg-[#2d3a2a] transition-colors text-sm sm:text-base"
            >
              Sell Your Furniture
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-[#666]">
            First come, first served • Limited stock available
          </p>
        </motion.div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedProduct(null)
        }}
      />

      {/* Compare Modal */}
      <CompareModal
        product={compareProduct}
        isOpen={compareModalOpen}
        onClose={() => {
          setCompareModalOpen(false)
          setCompareProduct(null)
        }}
      />
    </section>
  )
}
