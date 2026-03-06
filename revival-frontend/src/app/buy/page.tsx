'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ShoppingBag, Search, Filter, MapPin, Grid, List,
  ChevronDown, Loader2, X, SlidersHorizontal, Scale
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
  furniture_type?: {
    id: number
    name: string
    icon: string | null
  }
  outlet?: {
    id: number
    name: string
    email?: string
    phone?: string | null
    address?: string | null
    city: string | null
    postcode: string | null
    latitude?: number | null
    longitude?: number | null
    description?: string | null
    opening_hours?: any | null
  }
}

interface FurnitureType {
  id: number
  name: string
  icon: string | null
}

const conditionOptions = [
  { value: '', label: 'All Conditions' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
]

const sortOptions = [
  { value: 'created_at', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
]

export default function BuyPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [compareProduct, setCompareProduct] = useState<Product | null>(null)
  const [compareModalOpen, setCompareModalOpen] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchFurnitureTypes()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [page, selectedType, selectedCondition, selectedCity, minPrice, maxPrice, sortBy])

  async function fetchFurnitureTypes() {
    try {
      const res = await api.getFurnitureTypes()
      setFurnitureTypes(res.data || [])
    } catch (error) {
      console.error('Error fetching furniture types:', error)
    }
  }

  async function fetchProducts() {
    setLoading(true)
    try {
      const params: any = {
        page,
        per_page: 12,
      }

      if (search) params.search = search
      if (selectedType) params.furniture_type_id = selectedType
      if (selectedCondition) params.condition = selectedCondition
      if (selectedCity) params.city = selectedCity
      if (minPrice) params.min_price = minPrice
      if (maxPrice) params.max_price = maxPrice

      // Handle sorting
      if (sortBy === 'price_asc') {
        params.sort = 'price'
        params.order = 'asc'
      } else if (sortBy === 'price_desc') {
        params.sort = 'price'
        params.order = 'desc'
      } else if (sortBy === 'name') {
        params.sort = 'name'
        params.order = 'asc'
      } else {
        params.sort = 'created_at'
        params.order = 'desc'
      }

      const res = await api.getProducts(params)
      setProducts(res.data || [])
      setTotalPages(res.last_page || 1)
      setTotal(res.total || 0)
    } catch (error) {
      console.error('Error fetching products:', error)
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

  function clearFilters() {
    setSearch('')
    setSelectedType('')
    setSelectedCondition('')
    setSelectedCity('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('created_at')
    setPage(1)
  }

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)

    try {
      const response = await api.getProduct(product.id)
      if (response.data) {
        setSelectedProduct(response.data)
      }
    } catch (error) {
      console.log('Using local product data')
    }
  }

  const handleCompareClick = (product: Product) => {
    setCompareProduct(product)
    setCompareModalOpen(true)
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.revivalstudio.uk'
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

  const formatPrice = (price: number | string | null | undefined) => {
    if (price === null || price === undefined) return '0.00'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
  }

  const hasActiveFilters = selectedType || selectedCondition || selectedCity || minPrice || maxPrice

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Products Section */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search furniture by name, brand, or description..."
                  className="w-full pl-12 pr-24 py-3 rounded-xl bg-[#faf8f5] text-[#3d4a3a] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a962]"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#c9a962] text-[#3d4a3a] rounded-lg font-medium hover:bg-[#d4b46d] transition-colors text-sm"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    showFilters || hasActiveFilters
                      ? 'bg-[#3d4a3a] text-white'
                      : 'bg-[#faf8f5] text-[#3d4a3a] hover:bg-[#3d4a3a]/10'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-[#c9a962] rounded-full"></span>
                  )}
                </button>

                {/* Quick Type Filters */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedType(''); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      !selectedType ? 'bg-[#3d4a3a] text-white' : 'bg-[#faf8f5] text-[#3d4a3a] hover:bg-[#3d4a3a]/10'
                    }`}
                  >
                    All
                  </button>
                  {furnitureTypes.slice(0, 5).map((type) => (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedType(type.id.toString()); setPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                        selectedType === type.id.toString()
                          ? 'bg-[#3d4a3a] text-white'
                          : 'bg-[#faf8f5] text-[#3d4a3a] hover:bg-[#3d4a3a]/10'
                      }`}
                    >
                      {type.icon && <span>{type.icon}</span>}
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#666] hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    className="px-3 py-2 bg-[#faf8f5] border-0 rounded-xl text-sm text-[#3d4a3a] focus:outline-none focus:ring-2 focus:ring-[#c9a962]"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* View Mode */}
                <div className="hidden sm:flex items-center bg-[#faf8f5] rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Results Count */}
                <span className="text-sm text-[#666]">
                  {total} {total === 1 ? 'product' : 'products'}
                </span>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-[#e5e5e5]"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {/* Furniture Type */}
                  <div>
                    <label className="block text-xs font-medium text-[#666] mb-1">Category</label>
                    <select
                      value={selectedType}
                      onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 bg-[#faf8f5] border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a962]"
                    >
                      <option value="">All Categories</option>
                      {furnitureTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-xs font-medium text-[#666] mb-1">Condition</label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => { setSelectedCondition(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 bg-[#faf8f5] border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a962]"
                    >
                      {conditionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-medium text-[#666] mb-1">City</label>
                    <input
                      type="text"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      onBlur={() => { if (selectedCity) { setPage(1); fetchProducts(); } }}
                      placeholder="e.g. London"
                      className="w-full px-3 py-2 bg-[#faf8f5] border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a962]"
                    />
                  </div>

                  {/* Min Price */}
                  <div>
                    <label className="block text-xs font-medium text-[#666] mb-1">Min Price</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      onBlur={() => { setPage(1); fetchProducts(); }}
                      placeholder="£0"
                      className="w-full px-3 py-2 bg-[#faf8f5] border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a962]"
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className="block text-xs font-medium text-[#666] mb-1">Max Price</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      onBlur={() => { setPage(1); fetchProducts(); }}
                      placeholder="£1000"
                      className="w-full px-3 py-2 bg-[#faf8f5] border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a962]"
                    />
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#c9a962]" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
              <h3 className="text-xl font-semibold text-[#3d4a3a] mb-2">No products found</h3>
              <p className="text-[#666] mb-4">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-[#3d4a3a] text-white rounded-xl font-medium hover:bg-[#2d3a2a] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 sm:gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
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

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.featured && (
                          <span className="px-2 py-1 bg-[#c9a962] text-[#3d4a3a] rounded-lg text-xs font-bold">
                            Featured
                          </span>
                        )}
                        {product.original_price && product.original_price > product.price && (
                          <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-bold">
                            Sale
                          </span>
                        )}
                      </div>

                      {/* Price Badge */}
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

                      <div className="flex items-center justify-between">
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

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCompareClick(product)
                          }}
                          className="flex-1 py-2 bg-[#faf8f5] text-[#3d4a3a] rounded-xl text-sm font-medium hover:bg-[#3d4a3a]/10 transition-colors flex items-center justify-center gap-1 border border-[#3d4a3a]/20"
                          title="Compare with IKEA prices"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3d4a3a] hover:text-white transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                            page === pageNum
                              ? 'bg-[#3d4a3a] text-white'
                              : 'bg-white hover:bg-[#3d4a3a] hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3d4a3a] hover:text-white transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

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
    </div>
  )
}
