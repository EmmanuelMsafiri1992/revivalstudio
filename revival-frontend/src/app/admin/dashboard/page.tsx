'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, LogOut, Store, Wrench, DollarSign, Package, Users,
  LayoutDashboard, BoxIcon, Settings, ChevronLeft, ChevronRight,
  Bell, Search, User, TrendingUp, Shield, Armchair, Hammer, AlertTriangle,
  CheckCircle, Clock, XCircle, Eye, Edit2, Trash2, Plus, X, ShoppingBag, Star, Scale,
  Upload, Image as ImageIcon, Globe, MessageSquare, BarChart3, Save
} from 'lucide-react'
import Image from 'next/image'
import { api } from '@/lib/api'
import { formatCurrency, formatPrice } from '@/lib/utils'

interface DashboardStats {
  total_outlets: number
  active_outlets: number
  total_repair_requests: number
  pending_repair_requests: number
  total_sell_requests: number
  pending_sell_requests: number
  total_inventory: number
  items_for_sale: number
  total_revenue: number
  furniture_types: number
  materials: number
  damage_types: number
}

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'outlets', label: 'Outlets', icon: Store },
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'repair-requests', label: 'Repair Requests', icon: Wrench },
  { id: 'sell-requests', label: 'Sell Requests', icon: DollarSign },
  { id: 'inventory', label: 'Inventory', icon: BoxIcon },
  { id: 'furniture-types', label: 'Furniture Types', icon: Armchair },
  { id: 'materials', label: 'Materials', icon: Hammer },
  { id: 'damage-types', label: 'Damage Types', icon: AlertTriangle },
  { id: 'comparison-prices', label: 'Comparison Prices', icon: Scale },
  { id: 'site-settings', label: 'Site Settings', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-purple-100 text-purple-800',
  collected: 'bg-indigo-100 text-indigo-800',
  repair: 'bg-orange-100 text-orange-800',
  sale: 'bg-green-100 text-green-800',
  sold: 'bg-gray-100 text-gray-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Data states
  const [outlets, setOutlets] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [repairRequests, setRepairRequests] = useState<any[]>([])
  const [sellRequests, setSellRequests] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [furnitureTypes, setFurnitureTypes] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [damageTypes, setDamageTypes] = useState<any[]>([])
  const [comparisonPrices, setComparisonPrices] = useState<any[]>([])
  const [siteSettings, setSiteSettings] = useState<any[]>([])

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<string>('')
  const [editItem, setEditItem] = useState<any>(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  async function checkAuthAndLoadData() {
    const token = api.getAdminToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    try {
      const [profileRes, dashboardRes] = await Promise.all([
        api.getAdminProfile(),
        api.getAdminDashboard(),
      ])
      setAdmin(profileRes.data)
      setStats(dashboardRes.data.stats)
    } catch (error) {
      console.error('Auth error:', error)
      api.setAdminToken(null)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  async function loadSectionData(section: string) {
    try {
      switch (section) {
        case 'outlets':
          const outletsRes = await api.getAdminOutlets()
          setOutlets(outletsRes.data.data || [])
          break
        case 'products':
          const productsRes = await api.getAdminProducts({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            search: searchQuery || undefined
          })
          setProducts(productsRes.data || [])
          // Load furniture types and outlets for product form
          const ftForProducts = await api.getAdminFurnitureTypes()
          setFurnitureTypes(ftForProducts.data || [])
          const outletsForProducts = await api.getAdminOutlets()
          setOutlets(outletsForProducts.data.data || [])
          break
        case 'repair-requests':
          const repairRes = await api.getAdminRepairRequests({ status: statusFilter !== 'all' ? statusFilter : undefined })
          setRepairRequests(repairRes.data.data || [])
          break
        case 'sell-requests':
          const sellRes = await api.getAdminSellRequests({ status: statusFilter !== 'all' ? statusFilter : undefined })
          setSellRequests(sellRes.data.data || [])
          break
        case 'inventory':
          const invRes = await api.getAdminInventory({ status: statusFilter !== 'all' ? statusFilter : undefined })
          setInventory(invRes.data.data || [])
          break
        case 'furniture-types':
          const ftRes = await api.getAdminFurnitureTypes()
          setFurnitureTypes(ftRes.data || [])
          break
        case 'materials':
          const matRes = await api.getAdminMaterials()
          setMaterials(matRes.data || [])
          break
        case 'damage-types':
          const dtRes = await api.getAdminDamageTypes()
          setDamageTypes(dtRes.data || [])
          break
        case 'comparison-prices':
          const cpRes = await api.getAdminComparisonPrices()
          setComparisonPrices(cpRes.data || [])
          const ftForCp = await api.getAdminFurnitureTypes()
          setFurnitureTypes(ftForCp.data || [])
          break
        case 'site-settings':
          const ssRes = await api.getAdminSiteSettings()
          setSiteSettings(ssRes.data || [])
          break
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  useEffect(() => {
    if (!loading && activeSection !== 'dashboard' && activeSection !== 'settings') {
      loadSectionData(activeSection)
    }
  }, [activeSection, statusFilter, loading])

  // Debounced search for products
  useEffect(() => {
    if (!loading && activeSection === 'products') {
      const timer = setTimeout(() => {
        loadSectionData('products')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  async function handleLogout() {
    try {
      await api.adminLogout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    api.setAdminToken(null)
    router.push('/admin/login')
  }

  async function toggleOutletStatus(outlet: any) {
    try {
      await api.updateAdminOutlet(outlet.id, { active: !outlet.active })
      loadSectionData('outlets')
    } catch (error) {
      console.error('Error updating outlet:', error)
    }
  }

  async function updateRequestStatus(type: 'repair' | 'sell', id: number, status: string) {
    try {
      if (type === 'repair') {
        await api.updateAdminRepairRequest(id, { status })
        loadSectionData('repair-requests')
      } else {
        await api.updateAdminSellRequest(id, { status })
        loadSectionData('sell-requests')
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  async function toggleProductFeatured(product: any) {
    try {
      await api.updateAdminProduct(product.id, { featured: !product.featured })
      loadSectionData('products')
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  async function updateProductStatus(id: number, status: string) {
    try {
      await api.updateAdminProduct(id, { status })
      loadSectionData('products')
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  async function handleDeleteProduct(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await api.deleteAdminProduct(id)
      loadSectionData('products')
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  async function handleDeleteFurnitureType(id: number) {
    if (!confirm('Are you sure you want to delete this furniture type?')) return
    try {
      await api.deleteAdminFurnitureType(id)
      loadSectionData('furniture-types')
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  async function handleDeleteMaterial(id: number) {
    if (!confirm('Are you sure you want to delete this material?')) return
    try {
      await api.deleteAdminMaterial(id)
      loadSectionData('materials')
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  async function handleDeleteDamageType(id: number) {
    if (!confirm('Are you sure you want to delete this damage type?')) return
    try {
      await api.deleteAdminDamageType(id)
      loadSectionData('damage-types')
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  async function handleDeleteComparisonPrice(id: number) {
    if (!confirm('Are you sure you want to delete this comparison price?')) return
    try {
      await api.deleteAdminComparisonPrice(id)
      loadSectionData('comparison-prices')
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  async function toggleComparisonPriceActive(item: any) {
    try {
      await api.updateAdminComparisonPrice(item.id, { is_active: !item.is_active })
      loadSectionData('comparison-prices')
    } catch (error) {
      console.error('Error updating:', error)
    }
  }

  // Helper to get image URL
  const getImageUrl = (img: string) => {
    if (!img) return '/products/placeholder.jpg'
    if (img.startsWith('http')) return img
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://api.revivalstudio.uk'
    if (img.startsWith('/storage/')) return `${apiBase}${img}`
    if (img.startsWith('/')) return img
    return `${apiBase}/storage/${img}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0f3460]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#1a1a2e] text-white flex flex-col transition-all duration-300 fixed h-full z-40`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0f3460] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Revival Studio</h2>
                  <p className="text-xs text-white/60">Admin Portal</p>
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

        <div className={`p-4 border-b border-white/10 ${sidebarCollapsed ? 'hidden' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0f3460] flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{admin?.name}</p>
              <p className="text-xs text-white/60">{admin?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {sidebarItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === item.id
                      ? 'bg-[#0f3460] text-white'
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
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a2e]">
                {sidebarItems.find(i => i.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-[#666]">Welcome back, {admin?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              {activeSection === 'products' && (
                <div className="relative hidden md:block">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border-2 border-[#e5e5e5] rounded-xl w-64 focus:border-[#0f3460] focus:outline-none"
                  />
                </div>
              )}
              <button className="relative p-2 hover:bg-[#f8f9fa] rounded-xl transition-colors">
                <Bell className="w-6 h-6 text-[#1a1a2e]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && stats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Store} label="Total Outlets" value={stats.total_outlets} color="blue" />
                <StatCard icon={CheckCircle} label="Active Outlets" value={stats.active_outlets} color="green" />
                <StatCard icon={Wrench} label="Repair Requests" value={stats.total_repair_requests} color="purple" />
                <StatCard icon={Clock} label="Pending Repairs" value={stats.pending_repair_requests} color="yellow" />
                <StatCard icon={DollarSign} label="Sell Requests" value={stats.total_sell_requests} color="indigo" />
                <StatCard icon={Clock} label="Pending Sales" value={stats.pending_sell_requests} color="orange" />
                <StatCard icon={BoxIcon} label="Total Inventory" value={stats.total_inventory} color="cyan" />
                <StatCard icon={TrendingUp} label="Revenue" value={formatCurrency(stats.total_revenue)} color="emerald" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-[#1a1a2e] mb-2">Furniture Types</h3>
                  <p className="text-3xl font-bold text-[#0f3460]">{stats.furniture_types}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-[#1a1a2e] mb-2">Materials</h3>
                  <p className="text-3xl font-bold text-[#0f3460]">{stats.materials}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-[#1a1a2e] mb-2">Damage Types</h3>
                  <p className="text-3xl font-bold text-[#0f3460]">{stats.damage_types}</p>
                </div>
              </div>
            </>
          )}

          {/* Outlets Section */}
          {activeSection === 'outlets' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center">
                <h2 className="font-bold text-lg text-[#1a1a2e]">Partner Outlets</h2>
                <button
                  onClick={() => { setModalType('outlet'); setEditItem(null); setShowModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0f3460] text-white rounded-xl hover:bg-[#1a1a2e] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Outlet
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8f9fa]">
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Name</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Email</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Location</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Items</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outlets.map(outlet => (
                      <tr key={outlet.id} className="border-t border-[#e5e5e5] hover:bg-[#f8f9fa]">
                        <td className="p-4 font-medium text-[#1a1a2e]">{outlet.name}</td>
                        <td className="p-4 text-[#666]">{outlet.email}</td>
                        <td className="p-4 text-[#666]">{outlet.location}</td>
                        <td className="p-4 text-[#666]">{outlet.inventory_items_count || 0}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${outlet.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {outlet.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleOutletStatus(outlet)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${outlet.active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          >
                            {outlet.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Section */}
          {activeSection === 'products' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg text-[#1a1a2e]">All Products</h2>
                  <button
                    onClick={() => { setModalType('product'); setEditItem(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f3460] text-white rounded-xl hover:bg-[#1a1a2e] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'available', 'reserved', 'sold', 'draft'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === status ? 'bg-[#0f3460] text-white' : 'bg-[#f8f9fa] text-[#1a1a2e] hover:bg-[#e5e5e5]'}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {products.length === 0 ? (
                  <div className="text-center py-12 text-[#666]">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
                    <p>No products found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product: any) => {
                      const productImages = Array.isArray(product.images) ? product.images : (product.images ? JSON.parse(product.images) : [])
                      return (
                        <div key={product.id} className="border border-[#e5e5e5] rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                          <div className="relative h-40 bg-gray-100">
                            {productImages && productImages[0] ? (
                              <Image
                                src={getImageUrl(productImages[0])}
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
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                                {product.status}
                              </span>
                              {product.featured && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                                  <Star className="w-3 h-3" /> Featured
                                </span>
                              )}
                            </div>
                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => { setModalType('product'); setEditItem(product); setShowModal(true); }}
                                className="p-2 bg-white rounded-full hover:bg-gray-100"
                                title="Edit product"
                              >
                                <Edit2 className="w-5 h-5 text-blue-600" />
                              </button>
                              <button
                                onClick={() => toggleProductFeatured(product)}
                                className={`p-2 rounded-full ${product.featured ? 'bg-yellow-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                                title={product.featured ? 'Remove from featured' : 'Mark as featured'}
                              >
                                <Star className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 bg-white rounded-full hover:bg-gray-100"
                                title="Delete product"
                              >
                                <Trash2 className="w-5 h-5 text-red-500" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-[#1a1a2e] truncate mb-1">{product.name}</h3>
                            <p className="text-xs text-[#666] mb-1">{product.furniture_type?.name || 'Furniture'}</p>
                            <p className="text-xs text-[#666] mb-2">
                              Partner: {product.outlet?.name || 'Admin'}
                            </p>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-lg font-bold text-[#0f3460]">£{formatPrice(product.price)}</p>
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
                            <select
                              value={product.status}
                              onChange={(e) => updateProductStatus(product.id, e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460]"
                            >
                              <option value="available">Available</option>
                              <option value="reserved">Reserved</option>
                              <option value="sold">Sold</option>
                              <option value="draft">Draft</option>
                            </select>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Repair Requests Section */}
          {activeSection === 'repair-requests' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5]">
                <h2 className="font-bold text-lg text-[#1a1a2e] mb-4">Repair Requests</h2>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'contacted', 'scheduled', 'completed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === status ? 'bg-[#0f3460] text-white' : 'bg-[#f8f9fa] text-[#1a1a2e] hover:bg-[#e5e5e5]'}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8f9fa]">
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Customer</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Furniture</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Address</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Estimate</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairRequests.map(req => (
                      <tr key={req.id} className="border-t border-[#e5e5e5] hover:bg-[#f8f9fa]">
                        <td className="p-4">
                          <div className="font-medium text-[#1a1a2e]">{req.customer_name}</div>
                          <div className="text-sm text-[#666]">{req.email}</div>
                          {req.phone && <div className="text-sm text-[#666]">{req.phone}</div>}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{req.furniture_type?.icon || '🪑'}</span>
                            <span>{req.furniture_type?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-[#666] max-w-xs truncate">
                          {req.address || 'No address'}
                        </td>
                        <td className="p-4 text-[#666]">
                          {formatCurrency(req.estimated_min)} - {formatCurrency(req.estimated_max)}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[req.status] || 'bg-gray-100 text-gray-800'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={req.status}
                            onChange={(e) => updateRequestStatus('repair', req.id, e.target.value)}
                            className="px-3 py-1 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sell Requests Section */}
          {activeSection === 'sell-requests' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5]">
                <h2 className="font-bold text-lg text-[#1a1a2e] mb-4">Sell Requests</h2>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'contacted', 'collected', 'sold', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === status ? 'bg-[#0f3460] text-white' : 'bg-[#f8f9fa] text-[#1a1a2e] hover:bg-[#e5e5e5]'}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8f9fa]">
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Customer</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Furniture</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Address</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Condition</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Estimate</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellRequests.map(req => (
                      <tr key={req.id} className="border-t border-[#e5e5e5] hover:bg-[#f8f9fa]">
                        <td className="p-4">
                          <div className="font-medium text-[#1a1a2e]">{req.customer_name}</div>
                          <div className="text-sm text-[#666]">{req.email}</div>
                          {req.phone && <div className="text-sm text-[#666]">{req.phone}</div>}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{req.furniture_type?.icon || '🪑'}</span>
                            <span>{req.furniture_type?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-[#666] max-w-xs truncate">
                          {req.address || 'No address'}
                        </td>
                        <td className="p-4 text-[#666]">{req.condition}</td>
                        <td className="p-4 text-[#666]">
                          {formatCurrency(req.estimated_min)} - {formatCurrency(req.estimated_max)}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[req.status] || 'bg-gray-100 text-gray-800'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={req.status}
                            onChange={(e) => updateRequestStatus('sell', req.id, e.target.value)}
                            className="px-3 py-1 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="collected">Collected</option>
                            <option value="sold">Sold</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inventory Section */}
          {activeSection === 'inventory' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5]">
                <h2 className="font-bold text-lg text-[#1a1a2e] mb-4">All Inventory</h2>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'collected', 'repair', 'sale', 'sold'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === status ? 'bg-[#0f3460] text-white' : 'bg-[#f8f9fa] text-[#1a1a2e] hover:bg-[#e5e5e5]'}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8f9fa]">
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Item</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Outlet</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Customer</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Sale Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id} className="border-t border-[#e5e5e5] hover:bg-[#f8f9fa]">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.furniture_type?.icon || '🪑'}</span>
                            <div>
                              <div className="font-medium text-[#1a1a2e]">{item.item_name}</div>
                              <div className="text-sm text-[#666]">{item.furniture_type?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-[#666]">{item.outlet?.name || '-'}</td>
                        <td className="p-4 text-[#666]">{item.customer_name || '-'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-gray-100 text-gray-800'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-[#666]">{item.sale_price ? formatCurrency(item.sale_price) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Furniture Types Section */}
          {activeSection === 'furniture-types' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center">
                <h2 className="font-bold text-lg text-[#1a1a2e]">Furniture Types</h2>
                <button
                  onClick={() => { setModalType('furniture-type'); setEditItem(null); setShowModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0f3460] text-white rounded-xl hover:bg-[#1a1a2e] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Type
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8f9fa]">
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Icon</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Name</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Base Repair Cost</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Base Value</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {furnitureTypes.map(type => (
                      <tr key={type.id} className="border-t border-[#e5e5e5] hover:bg-[#f8f9fa]">
                        <td className="p-4 text-2xl">{type.icon || '🪑'}</td>
                        <td className="p-4 font-medium text-[#1a1a2e]">{type.name}</td>
                        <td className="p-4 text-[#666]">{formatCurrency(type.base_repair_cost)}</td>
                        <td className="p-4 text-[#666]">{formatCurrency(type.base_value)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${type.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {type.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() => { setModalType('furniture-type'); setEditItem(type); setShowModal(true); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFurnitureType(type.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Materials Section */}
          {activeSection === 'materials' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center">
                <h2 className="font-bold text-lg text-[#1a1a2e]">Materials</h2>
                <button
                  onClick={() => { setModalType('material'); setEditItem(null); setShowModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0f3460] text-white rounded-xl hover:bg-[#1a1a2e] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Material
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8f9fa]">
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Icon</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Name</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Repair Multiplier</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map(mat => (
                      <tr key={mat.id} className="border-t border-[#e5e5e5] hover:bg-[#f8f9fa]">
                        <td className="p-4 text-2xl">{mat.icon || '🪵'}</td>
                        <td className="p-4 font-medium text-[#1a1a2e]">{mat.name}</td>
                        <td className="p-4 text-[#666]">{mat.repair_multiplier}x</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${mat.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {mat.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() => { setModalType('material'); setEditItem(mat); setShowModal(true); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(mat.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Damage Types Section */}
          {activeSection === 'damage-types' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center">
                <h2 className="font-bold text-lg text-[#1a1a2e]">Damage Types</h2>
                <button
                  onClick={() => { setModalType('damage-type'); setEditItem(null); setShowModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0f3460] text-white rounded-xl hover:bg-[#1a1a2e] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Damage Type
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8f9fa]">
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Icon</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Name</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Repair Cost</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {damageTypes.map(dt => (
                      <tr key={dt.id} className="border-t border-[#e5e5e5] hover:bg-[#f8f9fa]">
                        <td className="p-4 text-2xl">{dt.icon || '⚠️'}</td>
                        <td className="p-4 font-medium text-[#1a1a2e]">{dt.name}</td>
                        <td className="p-4 text-[#666]">{formatCurrency(dt.repair_cost)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${dt.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {dt.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() => { setModalType('damage-type'); setEditItem(dt); setShowModal(true); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDamageType(dt.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Comparison Prices Section */}
          {activeSection === 'comparison-prices' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg text-[#1a1a2e]">Comparison Prices</h2>
                  <p className="text-sm text-[#666] mt-1">Set retail prices for comparing with Revival products</p>
                </div>
                <button
                  onClick={() => { setModalType('comparison-price'); setEditItem(null); setShowModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0f3460] text-white rounded-xl hover:bg-[#1a1a2e] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Comparison
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8f9fa]">
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Furniture Type</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Retailer</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Product Name</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Retail Price</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonPrices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#666]">
                          <Scale className="w-12 h-12 mx-auto mb-4 text-[#ccc]" />
                          <p>No comparison prices set yet.</p>
                          <p className="text-sm mt-1">Add comparison prices to show customers how much they save.</p>
                        </td>
                      </tr>
                    ) : (
                      comparisonPrices.map(cp => (
                        <tr key={cp.id} className="border-t border-[#e5e5e5] hover:bg-[#f8f9fa]">
                          <td className="p-4 font-medium text-[#1a1a2e]">
                            {cp.furniture_type?.icon || '🪑'} {cp.furniture_type?.name || 'Unknown'}
                          </td>
                          <td className="p-4 text-[#666]">{cp.retailer_name}</td>
                          <td className="p-4 text-[#666]">{cp.product_name}</td>
                          <td className="p-4 font-semibold text-[#0f3460]">{formatCurrency(cp.retail_price)}</td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleComparisonPriceActive(cp)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${cp.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {cp.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-4 flex gap-2">
                            <button
                              onClick={() => { setModalType('comparison-price'); setEditItem(cp); setShowModal(true); }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteComparisonPrice(cp.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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

          {/* Site Settings Section */}
          {activeSection === 'site-settings' && (
            <SiteSettingsSection settings={siteSettings} onRefresh={() => loadSectionData('site-settings')} />
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="font-bold text-xl text-[#1a1a2e] mb-6">Admin Settings</h2>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Name</label>
                    <input
                      type="text"
                      defaultValue={admin?.name}
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={admin?.email}
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    className="w-full py-4 bg-[#0f3460] text-white rounded-xl font-bold hover:bg-[#1a1a2e] transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <Modal
          type={modalType}
          item={editItem}
          furnitureTypes={furnitureTypes}
          outlets={outlets}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); loadSectionData(activeSection); }}
        />
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    orange: 'bg-orange-100 text-orange-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="text-2xl font-bold text-[#1a1a2e]">{value}</div>
      <div className="text-sm text-[#666]">{label}</div>
    </div>
  )
}

// Site Settings Component
function SiteSettingsSection({ settings, onRefresh }: { settings: any[], onRefresh: () => void }) {
  const [editingSettings, setEditingSettings] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [activeGroup, setActiveGroup] = useState('hero')

  const groups = [
    { id: 'hero', label: 'Hero Section', icon: LayoutDashboard },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'contact', label: 'Contact Info', icon: MessageSquare },
    { id: 'cta', label: 'Call to Action', icon: Bell },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'features', label: 'Features', icon: BoxIcon },
    { id: 'how_it_works', label: 'How It Works', icon: Settings },
    { id: 'social', label: 'Social Media', icon: Globe },
    { id: 'general', label: 'General', icon: Settings },
  ]

  const groupedSettings = settings.reduce((acc: Record<string, any[]>, setting) => {
    const group = setting.group || 'general'
    if (!acc[group]) acc[group] = []
    acc[group].push(setting)
    return acc
  }, {})

  const handleSave = async (key: string, value: any) => {
    setSaving(prev => ({ ...prev, [key]: true }))
    try {
      await api.updateAdminSiteSetting(key, value)
      setEditingSettings(prev => {
        const newState = { ...prev }
        delete newState[key]
        return newState
      })
      onRefresh()
    } catch (error) {
      console.error('Error saving setting:', error)
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  const renderSettingInput = (setting: any) => {
    const isEditing = editingSettings[setting.key] !== undefined
    const currentValue = isEditing ? editingSettings[setting.key] : setting.value

    if (setting.type === 'json') {
      return (
        <div className="space-y-2">
          <textarea
            value={typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                setEditingSettings(prev => ({ ...prev, [setting.key]: parsed }))
              } catch {
                setEditingSettings(prev => ({ ...prev, [setting.key]: e.target.value }))
              }
            }}
            rows={6}
            className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none font-mono text-sm"
          />
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => handleSave(setting.key, currentValue)}
                disabled={saving[setting.key]}
                className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a1a2e] disabled:opacity-50 flex items-center gap-2"
              >
                {saving[setting.key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
              <button
                onClick={() => setEditingSettings(prev => {
                  const newState = { ...prev }
                  delete newState[setting.key]
                  return newState
                })}
                className="px-4 py-2 border border-[#e5e5e5] rounded-lg hover:bg-[#f8f9fa]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="flex gap-2">
        <input
          type={setting.type === 'number' ? 'number' : 'text'}
          value={currentValue || ''}
          onChange={(e) => setEditingSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
          className="flex-1 px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
        />
        {isEditing && (
          <>
            <button
              onClick={() => handleSave(setting.key, currentValue)}
              disabled={saving[setting.key]}
              className="px-4 py-3 bg-[#0f3460] text-white rounded-xl hover:bg-[#1a1a2e] disabled:opacity-50"
            >
              {saving[setting.key] ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setEditingSettings(prev => {
                const newState = { ...prev }
                delete newState[setting.key]
                return newState
              })}
              className="px-4 py-3 border border-[#e5e5e5] rounded-xl hover:bg-[#f8f9fa]"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Group Navigation */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold text-[#1a1a2e] mb-4">Settings Groups</h3>
          <nav className="space-y-1">
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeGroup === group.id
                    ? 'bg-[#0f3460] text-white'
                    : 'hover:bg-[#f8f9fa] text-[#666]'
                }`}
              >
                <group.icon className="w-5 h-5" />
                <span className="font-medium">{group.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-xl text-[#1a1a2e] mb-6">
            {groups.find(g => g.id === activeGroup)?.label || 'Settings'}
          </h2>

          {groupedSettings[activeGroup]?.length > 0 ? (
            <div className="space-y-6">
              {groupedSettings[activeGroup].map((setting: any) => (
                <div key={setting.key} className="border-b border-[#e5e5e5] pb-6 last:border-0 last:pb-0">
                  <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">
                    {setting.label || setting.key}
                  </label>
                  {setting.description && (
                    <p className="text-sm text-[#666] mb-3">{setting.description}</p>
                  )}
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#666]">
              <Settings className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
              <p>No settings in this group yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Modal Component
function Modal({
  type,
  item,
  furnitureTypes,
  outlets,
  onClose,
  onSave
}: {
  type: string
  item: any
  furnitureTypes: any[]
  outlets: any[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState<any>(item || {})
  const [loading, setLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (item && type === 'product') {
      const images = Array.isArray(item.images) ? item.images : (item.images ? JSON.parse(item.images) : [])
      setExistingImages(images)
    }
  }, [item, type])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = async (index: number) => {
    if (!item?.id) return
    try {
      await api.deleteAdminProductImage(item.id, index)
      setExistingImages(prev => prev.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  // Helper to get image URL
  const getImageUrl = (img: string) => {
    if (!img) return '/products/placeholder.jpg'
    if (img.startsWith('http')) return img
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://api.revivalstudio.uk'
    if (img.startsWith('/storage/')) return `${apiBase}${img}`
    if (img.startsWith('/')) return img
    return `${apiBase}/storage/${img}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (type === 'product') {
        const formDataToSend = new FormData()
        formDataToSend.append('name', formData.name || '')
        formDataToSend.append('description', formData.description || '')
        formDataToSend.append('price', formData.price?.toString() || '0')
        if (formData.original_price) formDataToSend.append('original_price', formData.original_price.toString())
        if (formData.furniture_type_id) formDataToSend.append('furniture_type_id', formData.furniture_type_id.toString())
        if (formData.outlet_id) formDataToSend.append('outlet_id', formData.outlet_id.toString())
        formDataToSend.append('condition', formData.condition || 'good')
        if (formData.brand) formDataToSend.append('brand', formData.brand)
        if (formData.material) formDataToSend.append('material', formData.material)
        if (formData.dimensions) formDataToSend.append('dimensions', formData.dimensions)
        if (formData.color) formDataToSend.append('color', formData.color)
        formDataToSend.append('quantity', formData.quantity?.toString() || '1')
        formDataToSend.append('status', formData.status || 'available')
        formDataToSend.append('featured', formData.featured ? '1' : '0')

        // Add new images
        selectedImages.forEach(img => {
          formDataToSend.append('images[]', img)
        })

        if (item) {
          await api.updateAdminProduct(item.id, formDataToSend)
        } else {
          await api.createAdminProduct(formDataToSend)
        }
      } else if (type === 'furniture-type') {
        if (item) {
          await api.updateAdminFurnitureType(item.id, formData)
        } else {
          await api.createAdminFurnitureType({
            name: formData.name,
            icon: formData.icon,
            base_repair_cost: parseFloat(formData.base_repair_cost) || 0,
            base_value: parseFloat(formData.base_value) || 0,
            active: formData.active !== false,
          })
        }
      } else if (type === 'material') {
        if (item) {
          await api.updateAdminMaterial(item.id, formData)
        } else {
          await api.createAdminMaterial({
            name: formData.name,
            icon: formData.icon,
            repair_multiplier: parseFloat(formData.repair_multiplier) || 1,
            active: formData.active !== false,
          })
        }
      } else if (type === 'damage-type') {
        if (item) {
          await api.updateAdminDamageType(item.id, formData)
        } else {
          await api.createAdminDamageType({
            name: formData.name,
            icon: formData.icon,
            repair_cost: parseFloat(formData.repair_cost) || 0,
            active: formData.active !== false,
          })
        }
      } else if (type === 'outlet') {
        if (!item) {
          await api.createAdminOutlet({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            location: formData.location,
            phone: formData.phone,
            address: formData.address,
          })
        }
      } else if (type === 'comparison-price') {
        if (item) {
          await api.updateAdminComparisonPrice(item.id, {
            furniture_type_id: parseInt(formData.furniture_type_id),
            retailer_name: formData.retailer_name,
            product_name: formData.product_name,
            retail_price: parseFloat(formData.retail_price) || 0,
            product_url: formData.product_url || null,
            is_active: formData.is_active !== false,
          })
        } else {
          await api.createAdminComparisonPrice({
            furniture_type_id: parseInt(formData.furniture_type_id),
            retailer_name: formData.retailer_name,
            product_name: formData.product_name,
            retail_price: parseFloat(formData.retail_price) || 0,
            product_url: formData.product_url || null,
            is_active: formData.is_active !== false,
          })
        }
      }
      onSave()
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#1a1a2e]">
            {item ? 'Edit' : 'Add'} {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-[#f8f9fa] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Form */}
          {type === 'product' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. Vintage Oak Dining Table"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe the product..."
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Price (GBP) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Original Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.original_price || ''}
                    onChange={e => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Furniture Type</label>
                  <select
                    value={formData.furniture_type_id || ''}
                    onChange={e => setFormData({ ...formData, furniture_type_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  >
                    <option value="">Select type...</option>
                    {furnitureTypes.map(ft => (
                      <option key={ft.id} value={ft.id}>{ft.icon} {ft.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Condition *</label>
                  <select
                    value={formData.condition || 'good'}
                    onChange={e => setFormData({ ...formData, condition: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Partner Outlet</label>
                  <select
                    value={formData.outlet_id || ''}
                    onChange={e => setFormData({ ...formData, outlet_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  >
                    <option value="">Admin (No outlet)</option>
                    {outlets.map(outlet => (
                      <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Status</label>
                  <select
                    value={formData.status || 'available'}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. IKEA"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Material</label>
                  <input
                    type="text"
                    value={formData.material || ''}
                    onChange={e => setFormData({ ...formData, material: e.target.value })}
                    placeholder="e.g. Solid Oak"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={formData.dimensions || ''}
                    onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="e.g. 120cm x 80cm x 75cm"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Color</label>
                  <input
                    type="text"
                    value={formData.color || ''}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. Natural Oak"
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity || 1}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured || false}
                      onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-[#e5e5e5] text-[#0f3460] focus:ring-[#0f3460]"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-[#1a1a2e]">Mark as Featured Product</label>
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Product Images</label>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-[#666] mb-2">Current Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={getImageUrl(img)}
                            alt={`Product ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(idx)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {selectedImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-[#666] mb-2">New Images to Upload:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`New ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedImage(idx)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-[#e5e5e5] rounded-xl hover:border-[#0f3460] transition-colors w-full justify-center"
                >
                  <Upload className="w-5 h-5" />
                  <span>Click to upload images</span>
                </button>
              </div>
            </>
          )}

          {/* Outlet Form */}
          {type === 'outlet' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required={!item}
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Furniture Type Form */}
          {type === 'furniture-type' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={formData.icon || ''}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g. 🛋️"
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Base Repair Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.base_repair_cost || ''}
                  onChange={e => setFormData({ ...formData, base_repair_cost: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Base Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.base_value || ''}
                  onChange={e => setFormData({ ...formData, base_value: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Material Form */}
          {type === 'material' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={formData.icon || ''}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g. 🪵"
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Repair Multiplier</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.repair_multiplier || ''}
                  onChange={e => setFormData({ ...formData, repair_multiplier: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Damage Type Form */}
          {type === 'damage-type' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={formData.icon || ''}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g. ⚠️"
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Repair Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.repair_cost || ''}
                  onChange={e => setFormData({ ...formData, repair_cost: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Comparison Price Form */}
          {type === 'comparison-price' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Furniture Type</label>
                <select
                  value={formData.furniture_type_id || ''}
                  onChange={e => setFormData({ ...formData, furniture_type_id: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                >
                  <option value="">Select furniture type...</option>
                  {furnitureTypes.map(ft => (
                    <option key={ft.id} value={ft.id}>
                      {ft.icon || '🪑'} {ft.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Retailer Name</label>
                <input
                  type="text"
                  value={formData.retailer_name || ''}
                  onChange={e => setFormData({ ...formData, retailer_name: e.target.value })}
                  required
                  placeholder="e.g. IKEA, Argos, Amazon"
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Product Name</label>
                <input
                  type="text"
                  value={formData.product_name || ''}
                  onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                  required
                  placeholder="e.g. MALM Bed Frame, KIVIK Sofa"
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Retail Price (GBP)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.retail_price || ''}
                  onChange={e => setFormData({ ...formData, retail_price: e.target.value })}
                  required
                  placeholder="e.g. 299.00"
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Product URL (optional)</label>
                <input
                  type="url"
                  value={formData.product_url || ''}
                  onChange={e => setFormData({ ...formData, product_url: e.target.value })}
                  placeholder="https://www.ikea.com/..."
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active !== false}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-[#e5e5e5] text-[#0f3460] focus:ring-[#0f3460]"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-[#1a1a2e]">Active</label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0f3460] text-white rounded-xl font-semibold hover:bg-[#1a1a2e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {item ? 'Update' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  )
}
