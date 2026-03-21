'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Loader2, LogOut, Package, Wrench, DollarSign, CheckCircle, Clock,
  LayoutDashboard, BoxIcon, PlusCircle, BarChart3, Settings, ChevronLeft,
  ChevronRight, Bell, Search, User, TrendingUp, Calendar, MapPin,
  ShoppingBag, Upload, X, Trash2, Edit2, Eye, Star, Gavel
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency, formatPrice } from '@/lib/utils'

interface Stats {
  pending: number
  collected: number
  repair: number
  sale: number
  sold: number
  total_revenue: number
}

interface InventoryItem {
  id: number
  item_name: string
  customer_name: string
  status: string
  created_at: string
  furniture_type?: {
    name: string
    icon: string
  }
}

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
}

interface FurnitureType {
  id: number
  name: string
  icon: string | null
}

interface BiddingRequest {
  id: number
  customer_name: string
  email: string
  phone?: string
  whatsapp?: string
  desired_price?: number | string | null
  furniture_type?: string
  brand?: string
  condition?: string
  damages?: string[]
  description?: string
  postcode?: string
  floor?: string | number | null
  delivery?: string
  photos?: string[]
  status: string
  created_at: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  collected: 'bg-blue-100 text-blue-800',
  repair: 'bg-purple-100 text-purple-800',
  sale: 'bg-green-100 text-green-800',
  sold: 'bg-gray-100 text-gray-800',
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
}

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'inventory', label: 'Inventory', icon: BoxIcon },
  { id: 'add-item', label: 'Add Item', icon: PlusCircle },
  { id: 'bidding', label: 'Bidding Pro', icon: Gavel },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function DashboardPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(true)
  const [outlet, setOutlet] = useState<any>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [productTab, setProductTab] = useState('all')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // React Query for cached section data
  const { data: productsData } = useQuery({
    queryKey: ['partner-products', productTab],
    queryFn: async () => {
      const params: any = {}
      if (productTab !== 'all') params.status = productTab
      const res = await api.getOutletProducts(params)
      return res.data || []
    },
    enabled: activeSection === 'products' && !loading,
    staleTime: 30_000,
  })
  const products: Product[] = productsData || []

  const { data: biddingData } = useQuery({
    queryKey: ['partner-bidding'],
    queryFn: async () => {
      const res = await api.getPartnerBiddingRequests()
      return res.data || []
    },
    enabled: activeSection === 'bidding' && !loading,
    staleTime: 30_000,
  })

  // Bidding state
  const biddingRequests: any[] = biddingData || []
  const [offerFormOpen, setOfferFormOpen] = useState<number | null>(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [offerSubmitting, setOfferSubmitting] = useState(false)
  const [offerSuccess, setOfferSuccess] = useState<number | null>(null)
  const [biddingSummaryReq, setBiddingSummaryReq] = useState<BiddingRequest | null>(null)
  const [summaryPhotoIndex, setSummaryPhotoIndex] = useState(0)

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    furniture_type_id: '',
    condition: 'good',
    brand: '',
    material: '',
    dimensions: '',
    color: '',
    quantity: '1',
    status: 'available',
  })
  const [productImages, setProductImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Settings form state
  const [settingsData, setSettingsData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    description: '',
  })
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  async function checkAuthAndLoadData() {
    const token = api.getToken()
    if (!token) {
      router.push('/partner/login')
      return
    }

    try {
      const [profileRes, statsRes, inventoryRes, furnitureRes] = await Promise.all([
        api.getOutletProfile(),
        api.getOutletStats(),
        api.getOutletInventory(),
        api.getFurnitureTypes(),
      ])
      setOutlet(profileRes.data)
      setStats(statsRes.data)
      setInventory(inventoryRes.data.data || [])
      setFurnitureTypes(furnitureRes.data || [])

      // Initialize settings data
      setSettingsData({
        name: profileRes.data.name || '',
        phone: profileRes.data.phone || '',
        address: profileRes.data.address || '',
        city: profileRes.data.city || '',
        postcode: profileRes.data.postcode || '',
        description: profileRes.data.description || '',
      })
    } catch (error) {
      console.error('Auth error:', error)
      api.setToken(null)
      router.push('/partner/login')
    } finally {
      setLoading(false)
    }
  }


  async function handleLogout() {
    try {
      await api.outletLogout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    api.setToken(null)
    router.push('/partner/login')
  }

  async function filterInventory(status: string) {
    setActiveTab(status)
    try {
      const res = await api.getOutletInventory(status)
      setInventory(res.data.data || [])
    } catch (error) {
      console.error('Error filtering:', error)
    }
  }

  function openProductForm(product?: Product) {
    if (product) {
      setEditingProduct(product)
      setProductFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        original_price: product.original_price?.toString() || '',
        furniture_type_id: product.furniture_type?.id?.toString() || '',
        condition: product.condition,
        brand: product.brand || '',
        material: product.material || '',
        dimensions: product.dimensions || '',
        color: product.color || '',
        quantity: product.quantity.toString(),
        status: product.status,
      })
      setExistingImages(product.images || [])
    } else {
      setEditingProduct(null)
      setProductFormData({
        name: '',
        description: '',
        price: '',
        original_price: '',
        furniture_type_id: '',
        condition: 'good',
        brand: '',
        material: '',
        dimensions: '',
        color: '',
        quantity: '1',
        status: 'available',
      })
      setExistingImages([])
    }
    setProductImages([])
    setShowProductForm(true)
  }

  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', productFormData.name)
      formData.append('price', productFormData.price)
      formData.append('condition', productFormData.condition)
      formData.append('status', productFormData.status)
      formData.append('quantity', productFormData.quantity)

      if (productFormData.description) formData.append('description', productFormData.description)
      if (productFormData.original_price) formData.append('original_price', productFormData.original_price)
      if (productFormData.furniture_type_id) formData.append('furniture_type_id', productFormData.furniture_type_id)
      if (productFormData.brand) formData.append('brand', productFormData.brand)
      if (productFormData.material) formData.append('material', productFormData.material)
      if (productFormData.dimensions) formData.append('dimensions', productFormData.dimensions)
      if (productFormData.color) formData.append('color', productFormData.color)

      productImages.forEach((image) => {
        formData.append('images[]', image)
      })

      if (editingProduct) {
        await api.updateOutletProduct(editingProduct.id, formData)
      } else {
        await api.createOutletProduct(formData)
      }

      setShowProductForm(false)
      queryClient.invalidateQueries({ queryKey: ['partner-products'] })
    } catch (error: any) {
      console.error('Error saving product:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save product. Please try again.'
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteProduct(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await api.deleteOutletProduct(id)
      queryClient.invalidateQueries({ queryKey: ['partner-products'] })
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product.')
    }
  }

  async function handleDeleteImage(productId: number, imageIndex: number) {
    try {
      await api.deleteOutletProductImage(productId, imageIndex)
      setExistingImages(prev => prev.filter((_, i) => i !== imageIndex))
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setProductImages(prev => [...prev, ...files])
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSavingSettings(true)

    try {
      const res = await api.updateOutletProfile(settingsData)
      setOutlet(res.data)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings.')
    } finally {
      setSavingSettings(false)
    }
  }

  // Helper to build full image URL (images stored as '/storage/...' relative paths)
  const getImageUrl = (img: string | null | undefined): string => {
    if (!img) return '/products/placeholder.jpg'
    if (img.startsWith('http')) return img
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://api.revivalstudio.uk'
    if (img.startsWith('/storage/')) return `${apiBase}${img}`
    if (img.startsWith('/')) return img
    return `${apiBase}/storage/${img}`
  }

  async function handleBiddingOfferSubmit(requestId: number) {
    if (!offerPrice) return
    setOfferSubmitting(true)
    try {
      await api.submitBiddingOffer(requestId, {
        offered_price: parseFloat(offerPrice),
        message: offerMessage,
      })
      setOfferSuccess(requestId)
      setOfferFormOpen(null)
      setOfferPrice('')
      setOfferMessage('')
    } catch (err) {
      console.error('Error submitting offer:', err)
      alert('Failed to submit offer. Please try again.')
    } finally {
      setOfferSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf8f5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7a9b76]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#3d4a3a] text-white flex flex-col transition-all duration-300 fixed h-full z-40`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#c9a962] flex items-center justify-center">
                  <span className="text-[#3d4a3a] font-bold text-lg">R</span>
                </div>
                <div>
                  <h2 className="font-bold text-sm">Revival Studio</h2>
                  <p className="text-xs text-white/60">Partner Portal</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Outlet Info */}
        <div className={`p-4 border-b border-white/10 ${sidebarCollapsed ? 'hidden' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#7a9b76] flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{outlet?.name}</p>
              <div className="flex items-center gap-1 text-xs text-white/60">
                <MapPin className="w-3 h-3" />
                <span>{outlet?.city || outlet?.location || 'Set location'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === item.id
                      ? 'bg-[#c9a962] text-[#3d4a3a]'
                      : 'hover:bg-white/10 text-white/80 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-white/80 hover:text-red-300 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#3d4a3a]">
                {sidebarItems.find(i => i.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-[#666]">Welcome back, {outlet?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border-2 border-[#e5e5e5] rounded-xl w-64 focus:border-[#7a9b76] focus:outline-none"
                />
              </div>
              <button className="relative p-2 hover:bg-[#faf8f5] rounded-xl transition-colors">
                <Bell className="w-6 h-6 text-[#3d4a3a]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-[#e5e5e5]">
                <div className="w-10 h-10 rounded-full bg-[#7a9b76] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {activeSection === 'dashboard' && (
            <>
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-3xl font-bold text-[#3d4a3a]">{stats.pending}</div>
                    <div className="text-sm text-[#666]">Pending</div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-[#3d4a3a]">{stats.collected}</div>
                    <div className="text-sm text-[#666]">Collected</div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-purple-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-[#3d4a3a]">{stats.repair}</div>
                    <div className="text-sm text-[#666]">In Repair</div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-[#3d4a3a]">{stats.sale}</div>
                    <div className="text-sm text-[#666]">For Sale</div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-gray-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-3xl font-bold text-[#3d4a3a]">{stats.sold}</div>
                    <div className="text-sm text-[#666]">Sold</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#3d4a3a] to-[#7a9b76] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                    <div className="text-sm text-white/80">Total Revenue</div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => { setActiveSection('products'); setShowProductForm(true); openProductForm(); }}
                  className="bg-[#c9a962] hover:bg-[#d4b46d] text-[#3d4a3a] rounded-2xl p-6 flex items-center gap-4 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-white/30 flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">Add Product</p>
                    <p className="text-sm opacity-80">List furniture for sale</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveSection('products')}
                  className="bg-white hover:bg-[#faf8f5] border-2 border-[#e5e5e5] text-[#3d4a3a] rounded-2xl p-6 flex items-center gap-4 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#7a9b76]/20 flex items-center justify-center">
                    <BoxIcon className="w-7 h-7 text-[#7a9b76]" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">View Products</p>
                    <p className="text-sm text-[#666]">Manage your listings</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveSection('settings')}
                  className="bg-white hover:bg-[#faf8f5] border-2 border-[#e5e5e5] text-[#3d4a3a] rounded-2xl p-6 flex items-center gap-4 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#3d4a3a]/10 flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-[#3d4a3a]" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">Update Location</p>
                    <p className="text-sm text-[#666]">Set your outlet address</p>
                  </div>
                </button>
              </div>

              {/* Recent Products */}
              <div className="bg-white rounded-2xl shadow-sm">
                <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-lg text-[#3d4a3a]">Recent Products</h2>
                    <p className="text-sm text-[#666]">Your latest listed products</p>
                  </div>
                  <button
                    onClick={() => setActiveSection('products')}
                    className="text-[#7a9b76] hover:text-[#3d4a3a] font-medium text-sm"
                  >
                    View All
                  </button>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-[#666]">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-[#e5e5e5]" />
                      <p>No products yet</p>
                      <button
                        onClick={() => { setActiveSection('products'); openProductForm(); }}
                        className="text-[#7a9b76] hover:text-[#3d4a3a] font-medium mt-2"
                      >
                        Add your first product
                      </button>
                    </div>
                  ) : (
                    products.slice(0, 3).map(product => (
                      <div key={product.id} className="border border-[#e5e5e5] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative h-32 bg-gray-100">
                          {product.images && product.images[0] ? (
                            <Image
                              src={getImageUrl(product.images[0])}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ShoppingBag className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                          <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                            {product.status}
                          </span>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-[#3d4a3a] truncate">{product.name}</h3>
                          <p className="text-lg font-bold text-[#c9a962]">£{formatPrice(product.price)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeSection === 'products' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg text-[#3d4a3a]">Products Management</h2>
                  <p className="text-sm text-[#666]">Manage your furniture listings</p>
                </div>
                <button
                  onClick={() => openProductForm()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#c9a962] text-[#3d4a3a] rounded-xl font-medium hover:bg-[#d4b46d] transition-colors"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add Product
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-4 border-b border-[#e5e5e5] overflow-x-auto">
                {['all', 'available', 'reserved', 'sold', 'draft'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setProductTab(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      productTab === tab
                        ? 'bg-[#3d4a3a] text-white'
                        : 'bg-[#faf8f5] text-[#3d4a3a] hover:bg-[#3d4a3a]/10'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              <div className="p-6">
                {products.length === 0 ? (
                  <div className="text-center py-12 text-[#666]">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
                    <p className="text-lg mb-2">No products found</p>
                    <p className="text-sm mb-4">Start listing your furniture for sale</p>
                    <button
                      onClick={() => openProductForm()}
                      className="px-6 py-3 bg-[#c9a962] text-[#3d4a3a] rounded-xl font-medium hover:bg-[#d4b46d] transition-colors"
                    >
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map(product => (
                      <div key={product.id} className="border border-[#e5e5e5] rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                        <div className="relative h-40 bg-gray-100">
                          {product.images && product.images[0] ? (
                            <Image
                              src={getImageUrl(product.images[0])}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ShoppingBag className="w-10 h-10 text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                              {product.status}
                            </span>
                            {product.featured && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#c9a962] text-[#3d4a3a] flex items-center gap-1">
                                <Star className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </div>
                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => openProductForm(product)}
                              className="p-2 bg-white rounded-full hover:bg-gray-100"
                            >
                              <Edit2 className="w-5 h-5 text-[#3d4a3a]" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 bg-white rounded-full hover:bg-gray-100"
                            >
                              <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-[#3d4a3a] truncate mb-1">{product.name}</h3>
                          <p className="text-xs text-[#666] mb-2">{product.furniture_type?.name || 'Furniture'}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-[#c9a962]">£{formatPrice(product.price)}</p>
                              {product.original_price && (
                                <p className="text-xs text-gray-400 line-through">£{formatPrice(product.original_price)}</p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs capitalize ${
                              product.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                              product.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                              product.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.condition}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'inventory' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5]">
                <h2 className="font-bold text-lg text-[#3d4a3a]">Inventory Management</h2>
                <p className="text-sm text-[#666]">Manage all furniture items in your outlet</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-4 border-b border-[#e5e5e5] overflow-x-auto">
                {['all', 'pending', 'collected', 'repair', 'sale', 'sold'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => filterInventory(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'bg-[#3d4a3a] text-white'
                        : 'bg-[#faf8f5] text-[#3d4a3a] hover:bg-[#3d4a3a]/10'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#faf8f5]">
                      <th className="text-left p-4 font-semibold text-[#3d4a3a]">Item</th>
                      <th className="text-left p-4 font-semibold text-[#3d4a3a]">Customer</th>
                      <th className="text-left p-4 font-semibold text-[#3d4a3a]">Status</th>
                      <th className="text-left p-4 font-semibold text-[#3d4a3a]">Date</th>
                      <th className="text-left p-4 font-semibold text-[#3d4a3a]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#666]">
                          <div className="flex flex-col items-center gap-3">
                            <BoxIcon className="w-12 h-12 text-[#e5e5e5]" />
                            <p>No items found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      inventory.map(item => (
                        <tr key={item.id} className="border-t border-[#e5e5e5] hover:bg-[#faf8f5]">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{item.furniture_type?.icon || '🪑'}</span>
                              <div>
                                <div className="font-medium text-[#3d4a3a]">{item.item_name}</div>
                                <div className="text-xs text-[#666]">{item.furniture_type?.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-[#666]">{item.customer_name || '-'}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-gray-100 text-gray-800'}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-[#666]">
                            {new Date(item.created_at).toLocaleDateString('en-GB')}
                          </td>
                          <td className="p-4">
                            <button className="text-[#7a9b76] hover:text-[#3d4a3a] font-medium text-sm">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'add-item' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="font-bold text-xl text-[#3d4a3a] mb-6">Add New Item</h2>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Item Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Victorian Oak Dresser"
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Furniture Type</label>
                    <select className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none">
                      <option>Select type...</option>
                      {furnitureTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Customer Name</label>
                    <input
                      type="text"
                      placeholder="Customer's full name"
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Status</label>
                    <select className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none">
                      <option value="pending">Pending Collection</option>
                      <option value="collected">Collected</option>
                      <option value="repair">In Repair</option>
                      <option value="sale">For Sale</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    className="w-full py-4 bg-[#c9a962] text-[#3d4a3a] rounded-xl font-bold hover:bg-[#d4b46d] transition-colors"
                  >
                    Add Item
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeSection === 'bidding' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#c9a962]/20 flex items-center justify-center">
                  <Gavel className="w-5 h-5 text-[#c9a962]" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[#3d4a3a]">Bidding Pro</h2>
                  <p className="text-sm text-[#666]">Customer bidding requests — make your best offer</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#faf8f5]">
                      <th className="text-left p-4 font-semibold text-[#3d4a3a]">Customer</th>
                      <th className="text-left p-4 font-semibold text-[#3d4a3a]">Furniture</th>
                      <th className="text-left p-4 font-semibold text-[#3d4a3a]">Condition</th>
                      <th className="text-left p-4 font-semibold text-[#3d4a3a]">Asking Price</th>
                      <th className="text-left p-4 font-semibold text-[#3d4a3a]">Contact</th>
                      <th className="text-left p-4 font-semibold text-[#3d4a3a]">Status</th>
                      <th className="text-left p-4 font-semibold text-[#3d4a3a]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biddingRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-[#666]">
                          <div className="flex flex-col items-center gap-3">
                            <Gavel className="w-12 h-12 text-[#e5e5e5]" />
                            <p className="text-base">No bidding requests yet</p>
                            <p className="text-sm text-[#999]">Customer requests will appear here when submitted</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      biddingRequests.map((req: BiddingRequest) => (
                        <React.Fragment key={req.id}>
                          <tr className="border-t border-[#e5e5e5] hover:bg-[#faf8f5] transition-colors">
                            <td className="p-4">
                              <div className="font-medium text-[#3d4a3a]">{req.customer_name}</div>
                              <div className="text-xs text-[#666]">{req.email}</div>
                              {req.phone && <div className="text-xs text-[#999]">{req.phone}</div>}
                            </td>
                            <td className="p-4 text-sm text-[#666]">
                              <div>{req.furniture_type || '—'}</div>
                              {req.description && <div className="text-xs text-[#999] mt-0.5 max-w-xs truncate">{req.description}</div>}
                            </td>
                            <td className="p-4 text-sm text-[#666] capitalize">{req.condition || '—'}</td>
                            <td className="p-4">
                              {req.desired_price ? (
                                <span className="text-lg font-bold text-[#c9a962]">
                                  £{parseFloat(String(req.desired_price)).toFixed(2)}
                                </span>
                              ) : <span className="text-[#999]">—</span>}
                            </td>
                            <td className="p-4">
                              {req.whatsapp ? (
                                <a
                                  href={`https://wa.me/${req.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${req.customer_name}, I saw your ${req.furniture_type || 'furniture'} listing on Revival Studio. I'm interested in buying it for £${req.desired_price ? parseFloat(String(req.desired_price)).toFixed(2) : 'your asking price'}. Can we discuss?`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366] text-white rounded-xl text-xs font-semibold hover:bg-[#128C7E] transition-colors"
                                >
                                  💬 Chat on WhatsApp
                                </a>
                              ) : (
                                <div className="text-xs text-[#666]">
                                  {req.email && <a href={`mailto:${req.email}`} className="text-blue-600 hover:underline">{req.email}</a>}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                req.status === 'open'
                                  ? 'bg-green-100 text-green-800'
                                  : req.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : req.status === 'accepted'
                                  ? 'bg-blue-100 text-blue-800'
                                  : req.status === 'closed'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setBiddingSummaryReq(req); setSummaryPhotoIndex(0) }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#c9a962] text-[#c9a962] rounded-lg text-sm font-medium hover:bg-[#c9a962]/10 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                                {offerSuccess === req.id ? (
                                  <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> Sent
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setOfferFormOpen(offerFormOpen === req.id ? null : req.id)
                                      setOfferPrice('')
                                      setOfferMessage('')
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-[#c9a962] text-[#3d4a3a] rounded-lg text-sm font-medium hover:bg-[#d4b46d] transition-colors"
                                  >
                                    <Gavel className="w-4 h-4" />
                                    Offer
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {offerFormOpen === req.id && (
                            <tr className="border-t border-[#e5e5e5] bg-[#faf8f5]">
                              <td colSpan={7} className="p-4">
                                <div className="max-w-lg bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
                                  <h4 className="font-semibold text-[#3d4a3a] mb-4 flex items-center gap-2">
                                    <Gavel className="w-4 h-4 text-[#c9a962]" />
                                    Submit Your Offer
                                  </h4>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-[#3d4a3a] mb-1">
                                        Offer Price (£) <span className="text-red-500">*</span>
                                      </label>
                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] font-medium">£</span>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={offerPrice}
                                          onChange={(e) => setOfferPrice(e.target.value)}
                                          placeholder="0.00"
                                          className="w-full pl-7 pr-4 py-2.5 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-[#3d4a3a] mb-1">
                                        Message <span className="text-[#999] font-normal">(optional)</span>
                                      </label>
                                      <textarea
                                        value={offerMessage}
                                        onChange={(e) => setOfferMessage(e.target.value)}
                                        placeholder="Add a note to the seller..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none resize-none text-sm"
                                      />
                                    </div>
                                    <div className="flex gap-3">
                                      <button
                                        type="button"
                                        onClick={() => setOfferFormOpen(null)}
                                        className="px-4 py-2 border-2 border-[#e5e5e5] text-[#666] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        disabled={offerSubmitting || !offerPrice}
                                        onClick={() => handleBiddingOfferSubmit(req.id)}
                                        className="flex items-center gap-2 px-5 py-2 bg-[#3d4a3a] text-white rounded-xl text-sm font-semibold hover:bg-[#2d3a2a] transition-colors disabled:opacity-50"
                                      >
                                        {offerSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Submit Offer
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bidding Pro Summary Modal */}
          {biddingSummaryReq && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#e5e5e5]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#c9a962]/20 flex items-center justify-center">
                      <Gavel className="w-5 h-5 text-[#c9a962]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#3d4a3a]">Item Summary</h3>
                      <p className="text-sm text-[#666]">Review details before making your offer</p>
                    </div>
                  </div>
                  <button onClick={() => setBiddingSummaryReq(null)} className="p-2 hover:bg-[#faf8f5] rounded-xl transition-colors">
                    <X className="w-5 h-5 text-[#666]" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Photo Gallery */}
                  {biddingSummaryReq.photos && biddingSummaryReq.photos.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[#3d4a3a] mb-3">Photos</h4>
                      <div className="relative">
                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#faf8f5] flex items-center justify-center">
                          <img
                            src={getImageUrl(biddingSummaryReq.photos[summaryPhotoIndex])}
                            alt={`Photo ${summaryPhotoIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {biddingSummaryReq.photos.length > 1 && (
                          <>
                            <button
                              onClick={() => setSummaryPhotoIndex(i => (i - 1 + biddingSummaryReq.photos!.length) % biddingSummaryReq.photos!.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white shadow"
                            >
                              <ChevronLeft className="w-5 h-5 text-[#3d4a3a]" />
                            </button>
                            <button
                              onClick={() => setSummaryPhotoIndex(i => (i + 1) % biddingSummaryReq.photos!.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white shadow"
                            >
                              <ChevronRight className="w-5 h-5 text-[#3d4a3a]" />
                            </button>
                            <div className="flex gap-1.5 mt-2 justify-center">
                              {biddingSummaryReq.photos.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setSummaryPhotoIndex(i)}
                                  className={`w-2 h-2 rounded-full transition-colors ${i === summaryPhotoIndex ? 'bg-[#c9a962]' : 'bg-[#e5e5e5]'}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      {biddingSummaryReq.photos.length > 1 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                          {biddingSummaryReq.photos.map((photo, i) => (
                            <button
                              key={i}
                              onClick={() => setSummaryPhotoIndex(i)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === summaryPhotoIndex ? 'border-[#c9a962]' : 'border-transparent'}`}
                            >
                              <img src={getImageUrl(photo)} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Item Details */}
                  <div>
                    <h4 className="font-semibold text-[#3d4a3a] mb-3">Item Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Type', value: biddingSummaryReq.furniture_type },
                        { label: 'Brand', value: biddingSummaryReq.brand },
                        { label: 'Condition', value: biddingSummaryReq.condition },
                        { label: 'Asking Price', value: biddingSummaryReq.desired_price ? `£${parseFloat(String(biddingSummaryReq.desired_price)).toFixed(2)}` : null },
                        { label: 'Postcode', value: biddingSummaryReq.postcode },
                        { label: 'Floor', value: biddingSummaryReq.floor != null ? String(biddingSummaryReq.floor) : null },
                        { label: 'Delivery', value: biddingSummaryReq.delivery },
                      ].filter(f => f.value).map(f => (
                        <div key={f.label} className="bg-[#faf8f5] rounded-xl p-3">
                          <div className="text-xs text-[#999] mb-0.5">{f.label}</div>
                          <div className="font-medium text-[#3d4a3a] capitalize">{f.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Damages */}
                  {biddingSummaryReq.damages && biddingSummaryReq.damages.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[#3d4a3a] mb-3">Reported Damages</h4>
                      <div className="flex flex-wrap gap-2">
                        {biddingSummaryReq.damages.map((d, i) => (
                          <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm capitalize">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {biddingSummaryReq.description && (
                    <div>
                      <h4 className="font-semibold text-[#3d4a3a] mb-2">Description</h4>
                      <p className="text-sm text-[#666] bg-[#faf8f5] rounded-xl p-4 leading-relaxed">{biddingSummaryReq.description}</p>
                    </div>
                  )}

                  {/* Customer Contact */}
                  <div>
                    <h4 className="font-semibold text-[#3d4a3a] mb-3">Customer Contact</h4>
                    <div className="bg-[#faf8f5] rounded-xl p-4 space-y-2">
                      <div className="font-medium text-[#3d4a3a]">{biddingSummaryReq.customer_name}</div>
                      {biddingSummaryReq.email && <div className="text-sm text-[#666]">{biddingSummaryReq.email}</div>}
                      {biddingSummaryReq.phone && <div className="text-sm text-[#666]">{biddingSummaryReq.phone}</div>}
                      {biddingSummaryReq.whatsapp && (
                        <a
                          href={`https://wa.me/${biddingSummaryReq.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${biddingSummaryReq.customer_name}, I saw your ${biddingSummaryReq.furniture_type || 'furniture'} listing on Revival Studio and I'm interested in making an offer.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366] text-white rounded-xl text-xs font-semibold hover:bg-[#128C7E] transition-colors"
                        >
                          💬 Chat on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Counter Offer Form */}
                  <div className="border-t border-[#e5e5e5] pt-5">
                    <h4 className="font-semibold text-[#3d4a3a] mb-4 flex items-center gap-2">
                      <Gavel className="w-4 h-4 text-[#c9a962]" />
                      Submit Counter Offer
                    </h4>
                    {offerSuccess === biddingSummaryReq.id ? (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle className="w-5 h-5" /> Offer submitted successfully!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#3d4a3a] mb-1">
                            Your Offer Price (£) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] font-medium">£</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={offerPrice}
                              onChange={(e) => setOfferPrice(e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-7 pr-4 py-2.5 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#3d4a3a] mb-1">
                            Message <span className="text-[#999] font-normal">(optional)</span>
                          </label>
                          <textarea
                            value={offerMessage}
                            onChange={(e) => setOfferMessage(e.target.value)}
                            placeholder="Add a note for the customer..."
                            rows={3}
                            className="w-full px-4 py-2.5 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none resize-none text-sm"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setBiddingSummaryReq(null)}
                            className="px-4 py-2 border-2 border-[#e5e5e5] text-[#666] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={offerSubmitting || !offerPrice}
                            onClick={async () => {
                              await handleBiddingOfferSubmit(biddingSummaryReq.id)
                            }}
                            className="flex items-center gap-2 px-5 py-2 bg-[#3d4a3a] text-white rounded-xl text-sm font-semibold hover:bg-[#2d3a2a] transition-colors disabled:opacity-50"
                          >
                            {offerSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Submit Offer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="font-bold text-xl text-[#3d4a3a] mb-4">Reports & Analytics</h2>
              <p className="text-[#666] mb-8">Detailed analytics coming soon. View your performance metrics and insights here.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#faf8f5] rounded-xl p-6">
                  <h3 className="font-semibold text-[#3d4a3a] mb-4">Monthly Performance</h3>
                  <div className="h-48 flex items-center justify-center text-[#666]">
                    <BarChart3 className="w-16 h-16 text-[#e5e5e5]" />
                  </div>
                </div>
                <div className="bg-[#faf8f5] rounded-xl p-6">
                  <h3 className="font-semibold text-[#3d4a3a] mb-4">Revenue Trends</h3>
                  <div className="h-48 flex items-center justify-center text-[#666]">
                    <TrendingUp className="w-16 h-16 text-[#e5e5e5]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="font-bold text-xl text-[#3d4a3a] mb-6">Outlet Settings</h2>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Outlet Name</label>
                    <input
                      type="text"
                      value={settingsData.name}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Email</label>
                    <input
                      type="email"
                      value={outlet?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Phone</label>
                    <input
                      type="tel"
                      value={settingsData.phone}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. 07123 456789"
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-[#e5e5e5]">
                    <h3 className="font-semibold text-[#3d4a3a] mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#c9a962]" />
                      Location Details
                    </h3>
                    <p className="text-sm text-[#666] mb-4">This information will be shown to customers when they view your products.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Street Address</label>
                    <input
                      type="text"
                      value={settingsData.address}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="e.g. 123 High Street"
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">City</label>
                      <input
                        type="text"
                        value={settingsData.city}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="e.g. London"
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Postcode</label>
                      <input
                        type="text"
                        value={settingsData.postcode}
                        onChange={(e) => setSettingsData(prev => ({ ...prev, postcode: e.target.value }))}
                        placeholder="e.g. SW1A 1AA"
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Description</label>
                    <textarea
                      value={settingsData.description}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell customers about your outlet..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full py-4 bg-[#3d4a3a] text-white rounded-xl font-bold hover:bg-[#2d3a2a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingSettings && <Loader2 className="w-5 h-5 animate-spin" />}
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-bold text-xl text-[#3d4a3a]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowProductForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-6">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Product Images</label>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <Image src={getImageUrl(img)} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => editingProduct && handleDeleteImage(editingProduct.id, idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {productImages.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setProductImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-[#e5e5e5] rounded-lg flex flex-col items-center justify-center text-[#666] hover:border-[#7a9b76] hover:text-[#7a9b76] transition-colors"
                  >
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">Add</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Victorian Oak Dresser"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Price (£) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Original Price (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productFormData.original_price}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, original_price: e.target.value }))}
                    placeholder="Optional - for sale items"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Furniture Type</label>
                  <select
                    value={productFormData.furniture_type_id}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, furniture_type_id: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                  >
                    <option value="">Select type...</option>
                    {furnitureTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Condition *</label>
                  <select
                    required
                    value={productFormData.condition}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Brand</label>
                  <input
                    type="text"
                    value={productFormData.brand}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Optional"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Material</label>
                  <input
                    type="text"
                    value={productFormData.material}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, material: e.target.value }))}
                    placeholder="e.g. Oak, Leather"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Dimensions</label>
                  <input
                    type="text"
                    value={productFormData.dimensions}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                    placeholder="e.g. 120cm x 80cm x 45cm"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Color</label>
                  <input
                    type="text"
                    value={productFormData.color}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="e.g. Natural Oak"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={productFormData.quantity}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Status</label>
                  <select
                    value={productFormData.status}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Description</label>
                  <textarea
                    value={productFormData.description}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the product..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 py-3 border-2 border-[#e5e5e5] text-[#666] rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#c9a962] text-[#3d4a3a] rounded-xl font-bold hover:bg-[#d4b46d] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
