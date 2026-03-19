'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ShoppingBag, Loader2, MapPin, Scale, Crown, Tag,
  Search, SlidersHorizontal, Grid, List, ChevronDown
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
  }
}

const sortOptions = [
  { value: 'created_at', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
]

export default function DiscountedPage() {
  const router = useRouter()
  const [hasPremium, setHasPremium] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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
        router.replace('/premium-login?redirect=/discounted')
        return
      }
    }
    setCheckingAuth(false)
  }, [router])

  useEffect(() => {
    if (!hasPremium) return
    fetchProducts()
  }, [hasPremium, page, sortBy])

  async function fetchProducts() {
    setLoading(true)
    try {
      const params: any = {
        page,
        per_page: 12,
        discounted: true,
      }

      if (search) params.search = search

      if (sortBy === 'price_asc') { params.sort = 'price'; params.order = 'asc' }
      else if (sortBy === 'price_desc') { params.sort = 'price'; params.order = 'desc' }
      else if (sortBy === 'name') { params.sort = 'name'; params.order = 'asc' }
      else { params.sort = 'created_at'; params.order = 'desc' }

      const res = await api.getProducts(params)
      setProducts(res.data || [])
      setTotalPages(res.last_page || 1)
      setTotal(res.total || 0)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)
    try {
      const response = await api.getProduct(product.id)
      if (response.data) setSelectedProduct(response.data)
    } catch { /* use local data */ }
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a962]/20 rounded-full text-[#c9a962] text-sm font-bold mb-6">
              <Crown className="w-4 h-4" />
              Premium Members Only
            </div>
            <div className="w-16 h-16 mx-auto mb-4 bg-[#c9a962]/20 rounded-full flex items-center justify-center">
              <Tag className="w-8 h-8 text-[#c9a962]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Discount Pro —
              <span className="text-[#c9a962]"> Exclusive Deals</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              Exclusive discounted products for premium members only. Hand-picked deals from our trusted partner network.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search discounted furniture..."
                  className="w-full pl-12 pr-24 py-3 rounded-xl bg-[#faf8f5] text-[#3d4a3a] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a962]"
                />
                <button type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#c9a962] text-[#3d4a3a] rounded-lg font-medium hover:bg-[#d4b46d] transition-colors text-sm">
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#c9a962]" />
                <span className="text-sm font-semibold text-[#3d4a3a]">
                  {total} exclusive deal{total !== 1 ? 's' : ''} available
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#666] hidden sm:inline">Sort:</span>
                  <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                    className="px-3 py-2 bg-[#faf8f5] border-0 rounded-xl text-sm text-[#3d4a3a] focus:outline-none focus:ring-2 focus:ring-[#c9a962]">
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="hidden sm:flex items-center bg-[#faf8f5] rounded-xl p-1">
                  <button onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}>
                    <Grid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#c9a962]" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Tag className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
              <h3 className="text-xl font-semibold text-[#3d4a3a] mb-2">No discounted products found</h3>
              <p className="text-[#666]">Check back soon for new exclusive deals</p>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group ${viewMode === 'list' ? 'flex' : ''}`}
                    onClick={() => handleProductClick(product)}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'h-48 sm:h-56'}`}>
                      <Image
                        src={getImageUrl(product)}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes={viewMode === 'list' ? '192px' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
                      />
                      {/* Exclusive Deal Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-lg text-xs font-bold flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Exclusive Deal
                        </span>
                      </div>
                      {product.original_price && product.original_price > product.price && (
                        <div className="absolute top-8 left-2 mt-1">
                          <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-bold">Sale</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-[#c9a962] text-[#3d4a3a] rounded-lg text-sm font-bold shadow-md">
                          £{formatPrice(product.price)}
                        </span>
                      </div>
                    </div>

                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-center' : ''}`}>
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

                      {viewMode === 'list' && product.description && (
                        <p className="text-sm text-[#666] mb-2 line-clamp-2">{product.description}</p>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-xs text-[#666]">
                          <MapPin className="w-3 h-3" />
                          <span>{product.outlet?.city || product.outlet?.name || 'UK'}</span>
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
                          onClick={(e) => { e.stopPropagation(); setCompareProduct(product); setCompareModalOpen(true) }}
                          className="flex-1 py-2 bg-[#faf8f5] text-[#3d4a3a] rounded-xl text-sm font-medium hover:bg-[#3d4a3a]/10 transition-colors flex items-center justify-center gap-1 border border-[#3d4a3a]/20">
                          <Scale className="w-4 h-4" /> Compare
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleProductClick(product) }}
                          className="flex-1 py-2 bg-[#3d4a3a] text-white rounded-xl text-sm font-medium hover:bg-[#2d3a2a] transition-colors flex items-center justify-center gap-2">
                          <ShoppingBag className="w-4 h-4" /> Buy
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                    className="px-4 py-2 bg-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3d4a3a] hover:text-white transition-colors">
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                      return (
                        <button key={pageNum} onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${page === pageNum ? 'bg-[#3d4a3a] text-white' : 'bg-white hover:bg-[#3d4a3a] hover:text-white'}`}>
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                    className="px-4 py-2 bg-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3d4a3a] hover:text-white transition-colors">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
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
