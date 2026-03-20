'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  MapPin, Search, Loader2, ShoppingBag, Scale, Crown
} from 'lucide-react'
import { api } from '@/lib/api'
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
  furniture_type?: { id: number; name: string; icon: string | null }
  outlet?: {
    id: number
    name: string
    city: string | null
    postcode: string | null
    address?: string | null
  }
}

const distanceOptions = [5, 10, 20, 30, 50]

export default function NearMePage() {
  const router = useRouter()
  const [hasPremium, setHasPremium] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [postcode, setPostcode] = useState('')
  const [distance, setDistance] = useState(10)
  const [productType, setProductType] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [compareProduct, setCompareProduct] = useState<Product | null>(null)
  const [compareModalOpen, setCompareModalOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('premium_token')
      if (token === 'authenticated') {
        setHasPremium(true)
      } else {
        router.replace('/premium-login?redirect=/near-me')
        return
      }
    }
    setCheckingAuth(false)
  }, [router])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!postcode.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      // Call near-me/search endpoint with params
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const params = new URLSearchParams({
        postcode: postcode.trim().toUpperCase(),
        distance: distance.toString(),
        ...(productType.trim() && { product_name: productType.trim() }),
      })
      const res = await fetch(`${API_BASE}/near-me/search?${params}`, {
        headers: { 'Accept': 'application/json' },
      })
      const data = await res.json()
      setProducts(data.data || data.products || [])
      setTotal(data.total || (data.data || data.products || []).length)
    } catch (error) {
      console.error('Near me search error:', error)
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (product: Product) => {
    let images = product.images
    if (typeof images === 'string') {
      try { images = JSON.parse(images) } catch { images = null }
    }
    if (images && Array.isArray(images) && images.length > 0) {
      const img = images[0]
      if (img.startsWith('http')) return img
      const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://api.revivalstudio.uk'
      if (img.startsWith('/storage/')) return `${apiBase}${img}`
      if (img.startsWith('/')) return img
      return `${apiBase}/storage/${img}`
    }
    return '/products/placeholder.jpg'
  }

  const formatPrice = (price: number | string | null | undefined) => {
    if (price === null || price === undefined) return '0.00'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
  }

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)
    try {
      const response = await api.getProduct(product.id)
      if (response.data) setSelectedProduct(response.data)
    } catch { /* use local data */ }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a962]" />
      </div>
    )
  }

  if (!hasPremium) return null

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#7a9b76] text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a962]/20 rounded-full text-[#c9a962] text-sm font-medium mb-6">
              <Crown className="w-4 h-4" />
              Premium Feature
            </div>
            <div className="w-16 h-16 mx-auto mb-4 bg-[#c9a962]/20 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-[#c9a962]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Find Furniture
              <span className="text-[#c9a962]"> Near Me</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              Discover quality second-hand furniture close to your location. Enter your postcode and search radius to find great deals nearby.
            </p>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 -mt-8 relative z-10">
            <form onSubmit={handleSearch} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Postcode */}
                <div>
                  <label className="block text-sm font-semibold text-[#3d4a3a] mb-2">
                    <MapPin className="w-4 h-4 inline mr-1 text-[#7a9b76]" />
                    Your Postcode *
                  </label>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                    placeholder="e.g. SW1A 1AA"
                    required
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none text-[#3d4a3a] font-mono tracking-wider"
                  />
                </div>

                {/* Distance */}
                <div>
                  <label className="block text-sm font-semibold text-[#3d4a3a] mb-2">
                    Search Radius
                  </label>
                  <select
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none text-[#3d4a3a] bg-white"
                  >
                    {distanceOptions.map((d) => (
                      <option key={d} value={d}>{d} miles</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-sm font-semibold text-[#3d4a3a] mb-2">
                  Product Name / Type
                  <span className="text-[#999] font-normal ml-1">(optional)</span>
                </label>
                <input
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="e.g. sofa, dining table, bed frame..."
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none text-[#3d4a3a]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !postcode.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#3d4a3a] to-[#4a5a46] text-white rounded-full font-bold hover:from-[#2d3a2a] hover:to-[#3d4a3a] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Searching nearby...</>
                ) : (
                  <><Search className="w-5 h-5" /> Search Furniture Near Me</>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {searched && !loading && (
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#3d4a3a]">
                  {total > 0 ? `${total} result${total !== 1 ? 's' : ''} found` : 'No results found'}
                </h2>
                {postcode && (
                  <p className="text-sm text-[#666] mt-1">
                    Within {distance} miles of {postcode}
                    {productType && ` for "${productType}"`}
                  </p>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#c9a962]" />
              <p className="text-[#666]">Searching furniture near {postcode}...</p>
            </div>
          ) : searched && products.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
              <h3 className="text-xl font-semibold text-[#3d4a3a] mb-2">No furniture found nearby</h3>
              <p className="text-[#666] mb-4">
                Try increasing your search radius or changing your search terms
              </p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative h-48 sm:h-56">
                    <Image
                      src={getImageUrl(product)}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-[#7a9b76] text-white rounded-lg text-xs font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Nearby
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-[#c9a962] text-[#3d4a3a] rounded-lg text-sm font-bold shadow-md">
                        £{formatPrice(product.price)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#faf8f5] text-[#3d4a3a] rounded text-xs font-medium">
                        {product.furniture_type?.name || 'Furniture'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        product.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                        product.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.condition}
                      </span>
                    </div>

                    <h3 className="font-semibold text-[#3d4a3a] mb-1 line-clamp-1">{product.name}</h3>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-xs text-[#666]">
                        <MapPin className="w-3 h-3" />
                        <span>{product.outlet?.city || product.outlet?.postcode || 'UK'}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-[#c9a962]">£{formatPrice(product.price)}</span>
                        {product.original_price && (
                          <span className="text-xs text-gray-400 line-through">£{formatPrice(product.original_price)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCompareProduct(product)
                          setCompareModalOpen(true)
                        }}
                        className="flex-1 py-2 bg-[#faf8f5] text-[#3d4a3a] rounded-xl text-sm font-medium hover:bg-[#3d4a3a]/10 transition-colors flex items-center justify-center gap-1 border border-[#3d4a3a]/20"
                      >
                        <Scale className="w-4 h-4" />
                        Compare
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProductClick(product)
                        }}
                        className="flex-1 py-2 bg-[#3d4a3a] text-white rounded-xl text-sm font-medium hover:bg-[#2d3a2a] transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Buy
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : !searched ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-[#7a9b76]/10 rounded-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-[#7a9b76]" />
              </div>
              <h3 className="text-xl font-semibold text-[#3d4a3a] mb-2">Ready to search nearby</h3>
              <p className="text-[#666] max-w-md mx-auto">
                Enter your postcode and preferred distance above to find quality furniture near you.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedProduct(null) }}
      />
      <CompareModal
        product={compareProduct}
        isOpen={compareModalOpen}
        onClose={() => { setCompareModalOpen(false); setCompareProduct(null) }}
      />
    </div>
  )
}
