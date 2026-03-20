'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, LogOut, Store, Wrench, DollarSign, Package, Users,
  LayoutDashboard, BoxIcon, Settings, ChevronLeft, ChevronRight,
  Bell, Search, User, TrendingUp, Shield, Armchair, Hammer, AlertTriangle,
  CheckCircle, Clock, XCircle, Eye, Edit2, Trash2, Plus, X, ShoppingBag, Star, Scale,
  Upload, Image as ImageIcon, Globe, MessageSquare, BarChart3, Save, Home, MapPin, Phone, Mail,
  CreditCard, Receipt, ArrowLeftRight, Gavel, Leaf, SlidersHorizontal, KeyRound, RefreshCw, Copy, MessageCircle, ExternalLink
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
  { id: 'orders', label: 'Orders', icon: Receipt },
  { id: 'repair-requests', label: 'Repair Requests', icon: Wrench },
  { id: 'sell-requests', label: 'Sell Requests', icon: DollarSign },
  { id: 'room-plans', label: 'Room Plans', icon: Home },
  { id: 'planner-settings', label: 'Planner Settings', icon: SlidersHorizontal },
  { id: 'inventory', label: 'Inventory', icon: BoxIcon },
  { id: 'furniture-types', label: 'Furniture Types', icon: Armchair },
  { id: 'materials', label: 'Materials', icon: Hammer },
  { id: 'damage-types', label: 'Damage Types', icon: AlertTriangle },
  { id: 'comparison-prices', label: 'Comparison Prices', icon: Scale },
  { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard },
  { id: 'site-settings', label: 'Site Settings', icon: Globe },
  { id: 'near-me-requests', label: 'Near Me Requests', icon: MapPin },
  { id: 'exchange-pro', label: 'Exchange Pro', icon: ArrowLeftRight },
  { id: 'bidding-pro', label: 'Bidding Pro', icon: Gavel },
  { id: 'co2-emissions', label: 'CO2 Emissions', icon: Leaf },
  { id: 'premium-codes', label: 'Premium Codes', icon: KeyRound },
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
  // Order statuses
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  // Payment statuses
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
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
  const [plannerSettingsData, setPlannerSettingsData] = useState<any>({})
  const [roomPlans, setRoomPlans] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [nearMeRequests, setNearMeRequests] = useState<any[]>([])
  const [exchangeProRequests, setExchangeProRequests] = useState<any[]>([])
  const [biddingProRequests, setBiddingProRequests] = useState<any[]>([])
  const [co2Emissions, setCo2Emissions] = useState<any[]>([])
  const [premiumCodes, setPremiumCodes] = useState<any[]>([])
  const [selectedExchangeReq, setSelectedExchangeReq] = useState<any>(null)
  const [selectedBiddingReq, setSelectedBiddingReq] = useState<any>(null)
  const [selectedRoomPlan, setSelectedRoomPlan] = useState<any>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<string>('')
  const [editItem, setEditItem] = useState<any>(null)

  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationItems, setNotificationItems] = useState<any[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

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

  async function loadNotifications() {
    setNotificationsLoading(true)
    try {
      const [repairRes, sellRes, exchangeRes, biddingRes] = await Promise.allSettled([
        api.getAdminRepairRequests({ status: 'pending' }),
        api.getAdminSellRequests({ status: 'pending' }),
        api.getAdminExchangeProRequests(),
        api.getAdminBiddingProRequests(),
      ])

      const items: any[] = []

      if (repairRes.status === 'fulfilled') {
        const rows = repairRes.value.data?.data || []
        rows.filter((r: any) => r.status === 'pending').forEach((r: any) => {
          items.push({ type: 'repair', label: 'New Repair Request', name: r.customer_name, id: r.id, section: 'repair-requests', time: r.created_at })
        })
      }
      if (sellRes.status === 'fulfilled') {
        const rows = sellRes.value.data?.data || []
        rows.filter((r: any) => r.status === 'pending').forEach((r: any) => {
          items.push({ type: 'sell', label: 'New Sell Request', name: r.customer_name, id: r.id, section: 'sell-requests', time: r.created_at })
        })
      }
      if (exchangeRes.status === 'fulfilled') {
        const rows = exchangeRes.value.data || []
        rows.filter((r: any) => r.status === 'pending').forEach((r: any) => {
          items.push({ type: 'exchange', label: 'Exchange Pro Request', name: r.customer_name, id: r.id, section: 'exchange-pro', time: r.created_at })
        })
      }
      if (biddingRes.status === 'fulfilled') {
        const rows = biddingRes.value.data || []
        rows.filter((r: any) => r.status === 'pending').forEach((r: any) => {
          items.push({ type: 'bidding', label: 'Bidding Pro Request', name: r.customer_name, id: r.id, section: 'bidding-pro', time: r.created_at })
        })
      }

      // Sort newest first
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      setNotificationItems(items)
    } catch {
      // silently fail
    } finally {
      setNotificationsLoading(false)
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
          const ftForInv = await api.getAdminFurnitureTypes()
          setFurnitureTypes(ftForInv.data || [])
          const outletsForInv = await api.getAdminOutlets()
          setOutlets(outletsForInv.data.data || [])
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
        case 'room-plans':
          const rpRes = await api.getAdminRoomPlans({ status: statusFilter !== 'all' ? statusFilter : undefined })
          setRoomPlans(rpRes.data?.data || [])
          break
        case 'planner-settings':
          const psRes = await api.getSiteSettingsByGroup('planner')
          setPlannerSettingsData(psRes.data || {})
          break
        case 'payment-methods':
          const pmRes = await api.getAdminPaymentMethods()
          setPaymentMethods(pmRes.data || [])
          break
        case 'orders':
          const ordRes = await api.getAdminOrders({ status: statusFilter !== 'all' ? statusFilter : undefined })
          setOrders(ordRes.data?.data ?? [])
          break
        case 'site-settings':
          const ssRes = await api.getAdminSiteSettings()
          setSiteSettings(ssRes.data || [])
          break
        case 'near-me-requests':
          try { const nmRes = await api.getAdminNearMeRequests(); setNearMeRequests(nmRes.data || []) } catch { setNearMeRequests([]) }
          break
        case 'exchange-pro':
          try { const epRes = await api.getAdminExchangeProRequests(); setExchangeProRequests(epRes.data || []) } catch { setExchangeProRequests([]) }
          break
        case 'bidding-pro':
          try { const bpRes = await api.getAdminBiddingProRequests(); setBiddingProRequests(bpRes.data || []) } catch { setBiddingProRequests([]) }
          break
        case 'co2-emissions':
          try { const co2Res = await api.getAdminCo2Emissions(); setCo2Emissions(co2Res.data || []) } catch {
            setCo2Emissions([
              { id: 1, product_name: 'Dining Table (Wood)', new_co2: 120, refurbished_co2: 35, transport_co2: 10, net_co2_saved: 75 },
              { id: 2, product_name: 'Sofa (3-Seater)', new_co2: 180, refurbished_co2: 50, transport_co2: 15, net_co2_saved: 115 },
              { id: 3, product_name: 'Office Chair', new_co2: 60, refurbished_co2: 20, transport_co2: 5, net_co2_saved: 35 },
              { id: 4, product_name: 'Wardrobe (2 Door)', new_co2: 150, refurbished_co2: 45, transport_co2: 12, net_co2_saved: 93 },
              { id: 5, product_name: 'Coffee Table', new_co2: 70, refurbished_co2: 20, transport_co2: 6, net_co2_saved: 44 },
              { id: 6, product_name: 'Bed Frame (Double)', new_co2: 130, refurbished_co2: 40, transport_co2: 10, net_co2_saved: 80 },
              { id: 7, product_name: 'Bookshelf', new_co2: 90, refurbished_co2: 25, transport_co2: 8, net_co2_saved: 57 },
              { id: 8, product_name: 'TV Unit', new_co2: 85, refurbished_co2: 22, transport_co2: 7, net_co2_saved: 56 },
              { id: 9, product_name: 'Chest of Drawers', new_co2: 100, refurbished_co2: 30, transport_co2: 9, net_co2_saved: 61 },
              { id: 10, product_name: 'Side Table', new_co2: 40, refurbished_co2: 12, transport_co2: 4, net_co2_saved: 24 },
              { id: 11, product_name: 'Dining Chair', new_co2: 35, refurbished_co2: 10, transport_co2: 3, net_co2_saved: 22 },
              { id: 12, product_name: 'Glass Dining Table', new_co2: 140, refurbished_co2: 50, transport_co2: 12, net_co2_saved: 78 },
              { id: 13, product_name: 'Recliner Sofa', new_co2: 200, refurbished_co2: 65, transport_co2: 15, net_co2_saved: 120 },
              { id: 14, product_name: 'Office Desk', new_co2: 110, refurbished_co2: 30, transport_co2: 9, net_co2_saved: 71 },
              { id: 15, product_name: 'Kitchen Cabinet', new_co2: 160, refurbished_co2: 55, transport_co2: 12, net_co2_saved: 93 },
              { id: 16, product_name: 'Bar Stool', new_co2: 30, refurbished_co2: 8, transport_co2: 3, net_co2_saved: 19 },
              { id: 17, product_name: 'Shoe Rack', new_co2: 50, refurbished_co2: 15, transport_co2: 5, net_co2_saved: 30 },
              { id: 18, product_name: 'Dressing Table', new_co2: 95, refurbished_co2: 28, transport_co2: 7, net_co2_saved: 60 },
              { id: 19, product_name: 'Outdoor Bench', new_co2: 80, refurbished_co2: 25, transport_co2: 8, net_co2_saved: 47 },
              { id: 20, product_name: 'Storage Cabinet', new_co2: 120, refurbished_co2: 35, transport_co2: 10, net_co2_saved: 75 },
            ])
          }
          break
        case 'premium-codes':
          const pcRes = await api.getAdminPremiumCodes()
          setPremiumCodes(pcRes.data || [])
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

  async function deleteRequest(type: 'repair' | 'sell', id: number) {
    if (!confirm(`Are you sure you want to delete this ${type} request? This cannot be undone.`)) return
    try {
      if (type === 'repair') {
        await api.deleteAdminRepairRequest(id)
        loadSectionData('repair-requests')
      } else {
        await api.deleteAdminSellRequest(id)
        loadSectionData('sell-requests')
      }
    } catch (error) {
      console.error('Error deleting request:', error)
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

  async function handleUpdateRoomPlanStatus(id: number, status: string) {
    try {
      await api.updateAdminRoomPlan(id, { status })
      loadSectionData('room-plans')
    } catch (error) {
      console.error('Error updating room plan:', error)
    }
  }

  async function handleDeleteRoomPlan(id: number) {
    if (!confirm('Are you sure you want to delete this room plan submission?')) return
    try {
      await api.deleteAdminRoomPlan(id)
      loadSectionData('room-plans')
    } catch (error) {
      console.error('Error deleting room plan:', error)
    }
  }

  async function handleTogglePaymentMethod(method: any) {
    try {
      await api.updateAdminPaymentMethod(method.id, { is_active: !method.is_active })
      loadSectionData('payment-methods')
    } catch (error) {
      console.error('Error updating payment method:', error)
    }
  }

  async function handleDeletePaymentMethod(id: number) {
    if (!confirm('Are you sure you want to delete this payment method?')) return
    try {
      await api.deleteAdminPaymentMethod(id)
      loadSectionData('payment-methods')
    } catch (error) {
      console.error('Error deleting payment method:', error)
    }
  }

  async function handleUpdateOrderStatus(id: number, field: 'order_status' | 'payment_status', value: string) {
    try {
      await api.updateAdminOrder(id, { [field]: value })
      loadSectionData('orders')
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  async function handleUpdateNearMeStatus(id: number, status: string) {
    try {
      await api.updateAdminNearMeRequest(id, { status })
      loadSectionData('near-me-requests')
    } catch (error) {
      console.error('Error updating near-me request:', error)
    }
  }

  async function handleUpdateExchangeProStatus(id: number, status: string) {
    try {
      await api.updateAdminExchangeProRequest(id, { status })
      loadSectionData('exchange-pro')
    } catch (error) {
      console.error('Error updating exchange-pro request:', error)
    }
  }

  async function handleUpdateBiddingProStatus(id: number, status: string) {
    try {
      await api.updateAdminBiddingProRequest(id, { status })
      loadSectionData('bidding-pro')
    } catch (error) {
      console.error('Error updating bidding-pro request:', error)
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
                  onClick={() => { setActiveSection(item.id); setStatusFilter('all') }}
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

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => window.open('/planner', '_blank')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            title="Open Room Planner"
          >
            <ExternalLink className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Room Planner Tool</span>}
          </button>
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
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    if (!showNotifications) loadNotifications()
                    setShowNotifications(v => !v)
                  }}
                  className="relative p-2 hover:bg-[#f8f9fa] rounded-xl transition-colors"
                >
                  <Bell className="w-6 h-6 text-[#1a1a2e]" />
                  {(stats?.pending_repair_requests || 0) + (stats?.pending_sell_requests || 0) > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-[#e5e5e5] z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e5] bg-[#f8f9fa]">
                      <h3 className="font-semibold text-[#1a1a2e]">Pending Requests</h3>
                      <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-[#e5e5e5] rounded-lg transition-colors">
                        <X className="w-4 h-4 text-[#666]" />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-[#0f3460]" />
                        </div>
                      ) : notificationItems.length === 0 ? (
                        <div className="text-center py-8 text-[#666]">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <p className="text-sm">No pending requests</p>
                        </div>
                      ) : (
                        notificationItems.map((item, idx) => {
                          const iconMap: Record<string, string> = { repair: '🔧', sell: '💰', exchange: '🔄', bidding: '🏷️' }
                          const colorMap: Record<string, string> = { repair: 'bg-purple-100', sell: 'bg-blue-100', exchange: 'bg-yellow-100', bidding: 'bg-green-100' }
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setActiveSection(item.section)
                                setShowNotifications(false)
                                loadSectionData(item.section)
                              }}
                              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#f8f9fa] border-b border-[#f0f0f0] text-left transition-colors"
                            >
                              <span className={`w-9 h-9 flex-shrink-0 rounded-full ${colorMap[item.type]} flex items-center justify-center text-base`}>
                                {iconMap[item.type]}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#1a1a2e]">{item.label}</p>
                                <p className="text-xs text-[#666] truncate">{item.name}</p>
                                <p className="text-xs text-[#999] mt-0.5">{new Date(item.time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                    {notificationItems.length > 0 && (
                      <div className="px-4 py-2 border-t border-[#e5e5e5] text-center">
                        <p className="text-xs text-[#666]">{notificationItems.length} pending request{notificationItems.length !== 1 ? 's' : ''}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                          <div className="flex items-center gap-2">
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
                            <button
                              onClick={() => deleteRequest('repair', req.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
                          <div className="flex items-center gap-2">
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
                            <button
                              onClick={() => deleteRequest('sell', req.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg text-[#1a1a2e]">All Inventory</h2>
                  <button
                    onClick={() => { setModalType('inventory'); setEditItem(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f3460] text-white rounded-xl hover:bg-[#1a1a2e] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
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
                      <th className="text-left p-4 font-semibold text-[#1a1a2e]">Actions</th>
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
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setModalType('inventory'); setEditItem(item); setShowModal(true); }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this inventory item?')) return
                                await api.deleteAdminInventoryItem(item.id)
                                loadSectionData('inventory')
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
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

          {/* Room Plans Section */}
          {activeSection === 'room-plans' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-xl text-[#1a1a2e]">Room Plans</h2>
                  <p className="text-sm text-[#666] mt-1">Customer room planner submissions</p>
                </div>
                <button
                  onClick={() => window.open('/planner', '_blank')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f3460] text-white rounded-xl text-sm font-medium hover:bg-[#0a2540] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Launch Room Planner
                </button>
              </div>

              {/* Status Filter */}
              <div className="p-4 border-b border-[#e5e5e5] flex gap-2">
                {['all', 'submitted', 'contacted', 'completed'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status)
                      setTimeout(() => loadSectionData('room-plans'), 0)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      statusFilter === status
                        ? 'bg-[#0f3460] text-white'
                        : 'bg-[#f8f9fa] text-[#666] hover:bg-[#e5e5e5]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f8f9fa]">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Customer</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Contact</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Address</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Room</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Budget</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Date</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {roomPlans.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#666]">
                          <Home className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
                          <p>No room plan submissions yet.</p>
                        </td>
                      </tr>
                    ) : (
                      roomPlans.map((plan: any) => (
                        <tr key={plan.id} className="hover:bg-[#faf8f5]">
                          <td className="p-4">
                            <div className="font-medium text-[#1a1a2e]">{plan.customer_name}</div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-[#666]">
                                <Mail className="w-3 h-3" />
                                <a href={`mailto:${plan.email}`} className="hover:text-[#0f3460]">{plan.email}</a>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-[#666]">
                                <Phone className="w-3 h-3" />
                                <a href={`tel:${plan.phone}`} className="hover:text-[#0f3460]">{plan.phone}</a>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-[#666]">
                              <div>{plan.house_number} {plan.address_line1}</div>
                              {plan.address_line2 && <div>{plan.address_line2}</div>}
                              <div>{plan.city}, {plan.postcode}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className="font-medium text-[#1a1a2e] capitalize">{plan.room_type?.replace(/([A-Z])/g, ' $1').trim()}</div>
                              <div className="text-[#666]">{plan.style} / {plan.room_size}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-[#1a1a2e]">{formatCurrency(plan.budget || 0)}</div>
                            {plan.total_cost && (
                              <div className="text-xs text-[#666]">Est: {formatCurrency(plan.total_cost)}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <select
                              value={plan.status}
                              onChange={(e) => handleUpdateRoomPlanStatus(plan.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[plan.status] || 'bg-gray-100 text-gray-800'}`}
                            >
                              <option value="submitted">Submitted</option>
                              <option value="contacted">Contacted</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td className="p-4 text-sm text-[#666]">
                            {new Date(plan.created_at).toLocaleDateString('en-GB')}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedRoomPlan(plan)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f3460] text-white rounded-lg text-xs font-medium hover:bg-[#0a2540] transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                View Plan
                              </button>
                              <button
                                onClick={() => handleDeleteRoomPlan(plan.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Room Plan Detail Modal */}
          {selectedRoomPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedRoomPlan(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-[#e5e5e5]">
                  <div>
                    <h3 className="font-bold text-lg text-[#1a1a2e]">Room Plan — {selectedRoomPlan.customer_name}</h3>
                    <p className="text-sm text-[#666] mt-0.5">{new Date(selectedRoomPlan.created_at).toLocaleString('en-GB')}</p>
                  </div>
                  <button onClick={() => setSelectedRoomPlan(null)} className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors">
                    <X className="w-5 h-5 text-[#666]" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Customer Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-[#999]">Name:</span> <span className="font-medium text-[#1a1a2e]">{selectedRoomPlan.customer_name}</span></div>
                      <div><span className="text-[#999]">Email:</span> <a href={`mailto:${selectedRoomPlan.email}`} className="font-medium text-[#0f3460] hover:underline">{selectedRoomPlan.email}</a></div>
                      <div><span className="text-[#999]">Phone:</span> <a href={`tel:${selectedRoomPlan.phone}`} className="font-medium text-[#0f3460] hover:underline">{selectedRoomPlan.phone}</a></div>
                      <div><span className="text-[#999]">Address:</span> <span className="font-medium text-[#1a1a2e]">{selectedRoomPlan.house_number} {selectedRoomPlan.address_line1}, {selectedRoomPlan.city} {selectedRoomPlan.postcode}</span></div>
                    </div>
                  </div>
                  {/* Room Spec */}
                  <div>
                    <h4 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><Home className="w-4 h-4" /> Room Specification</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Room Type', value: selectedRoomPlan.room_type?.replace(/([A-Z])/g, ' $1').trim() },
                        { label: 'Size', value: selectedRoomPlan.room_size },
                        { label: 'Style', value: selectedRoomPlan.style },
                        { label: 'Budget', value: formatCurrency(selectedRoomPlan.budget || 0) },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-[#f8f9fa] rounded-xl p-3 text-center">
                          <div className="text-xs text-[#999] mb-1">{label}</div>
                          <div className="font-semibold text-[#1a1a2e] capitalize text-sm">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Personalised Plan */}
                  {selectedRoomPlan.selected_items && selectedRoomPlan.selected_items.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-[#1a1a2e] flex items-center gap-2"><Package className="w-4 h-4" /> Personalised Furniture Plan ({selectedRoomPlan.selected_items.length} items)</h4>
                        <div className="text-sm font-bold text-[#0f3460]">Total: {formatCurrency(selectedRoomPlan.total_cost || 0)}</div>
                      </div>
                      <div className="space-y-3">
                        {selectedRoomPlan.selected_items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 p-3 bg-[#f8f9fa] rounded-xl border border-[#e5e5e5]">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-[#e5e5e5] flex-shrink-0" />
                            ) : (
                              <div className="w-16 h-16 bg-[#e5e5e5] rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="w-6 h-6 text-[#999]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-[#1a1a2e]">{item.name}</div>
                              <div className="text-xs text-[#666]">{item.furniture_type_icon} {item.furniture_type} · Style: {item.style}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-semibold text-[#0f3460]">{formatCurrency(item.adjusted_price || item.original_price || 0)}</div>
                              {item.adjusted_price !== item.original_price && item.original_price && (
                                <div className="text-xs text-[#999] line-through">{formatCurrency(item.original_price)}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={`mt-4 p-3 rounded-xl text-sm font-medium text-center ${selectedRoomPlan.total_cost <= selectedRoomPlan.budget ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {selectedRoomPlan.total_cost <= selectedRoomPlan.budget
                          ? `✓ Within budget — ${formatCurrency(selectedRoomPlan.budget - selectedRoomPlan.total_cost)} remaining`
                          : `⚠ Over budget by ${formatCurrency(selectedRoomPlan.total_cost - selectedRoomPlan.budget)}`}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[#999] bg-[#f8f9fa] rounded-xl">
                      <Package className="w-10 h-10 mx-auto mb-2 text-[#e5e5e5]" />
                      <p className="text-sm">No furniture items in plan (catalog may have been empty at time of submission)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#e5e5e5]">
                <div>
                  <h2 className="font-bold text-xl text-[#1a1a2e]">Orders</h2>
                  <p className="text-sm text-[#666] mt-1">Manage customer orders</p>
                </div>
              </div>

              {/* Status Filter */}
              <div className="p-4 border-b border-[#e5e5e5] flex gap-2 flex-wrap">
                {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status)
                      setTimeout(() => loadSectionData('orders'), 0)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      statusFilter === status
                        ? 'bg-[#0f3460] text-white'
                        : 'bg-[#f8f9fa] text-[#666] hover:bg-[#e5e5e5]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f8f9fa]">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Order #</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Customer</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Product</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Delivery Address</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Total</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Payment</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#666]">
                          <Receipt className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
                          <p>No orders yet.</p>
                        </td>
                      </tr>
                    ) : (
                      orders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-[#faf8f5]">
                          <td className="p-4">
                            <div className="font-mono font-medium text-[#1a1a2e]">{order.order_number}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-[#1a1a2e]">{order.customer_name}</div>
                            <div className="text-xs text-[#666]">{order.email}</div>
                            <div className="text-xs text-[#666]">{order.phone}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {order.product?.images && order.product.images.length > 0 ? (
                                <img
                                  src={order.product.images[0]}
                                  alt={order.product.name}
                                  className="w-12 h-12 object-cover rounded-lg border border-[#e5e5e5] flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setSelectedOrder(order)}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-[#f8f9fa] rounded-lg border border-[#e5e5e5] flex items-center justify-center flex-shrink-0">
                                  <Package className="w-5 h-5 text-[#ccc]" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-[#1a1a2e]">{order.product?.name || 'N/A'}</div>
                                {order.product?.condition && <div className="text-xs text-[#666] capitalize">{order.product.condition}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-[#666]">
                              <div>{order.house_number} {order.address_line1}</div>
                              {order.address_line2 && <div>{order.address_line2}</div>}
                              <div>{order.city}, {order.postcode}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-[#1a1a2e]">{formatCurrency(order.total_amount || 0)}</div>
                            <div className="text-xs text-[#666] capitalize">{order.payment_method?.replace(/_/g, ' ')}</div>
                          </td>
                          <td className="p-4">
                            <select
                              value={order.payment_status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, 'payment_status', e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.payment_status] || 'bg-gray-100 text-gray-800'}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <select
                              value={order.order_status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, 'order_status', e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.order_status] || 'bg-gray-100 text-gray-800'}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-4 text-sm text-[#666]">
                            {new Date(order.created_at).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedOrder(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-[#e5e5e5]">
                  <div>
                    <h3 className="font-bold text-lg text-[#1a1a2e]">Order {selectedOrder.order_number}</h3>
                    <p className="text-sm text-[#666] mt-0.5">{new Date(selectedOrder.created_at).toLocaleString('en-GB')}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors">
                    <X className="w-5 h-5 text-[#666]" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* Product */}
                  <div>
                    <h4 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> Product</h4>
                    {selectedOrder.product ? (
                      <div className="flex gap-4 bg-[#f8f9fa] rounded-xl p-4">
                        {selectedOrder.product.images && selectedOrder.product.images.length > 0 ? (
                          <div className="flex gap-2 flex-wrap">
                            {selectedOrder.product.images.map((img: string, i: number) => (
                              <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                                <img src={img} alt={`Product ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-[#e5e5e5] hover:opacity-80 transition-opacity" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-[#e5e5e5] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-8 h-8 text-[#999]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="font-semibold text-[#1a1a2e]">{selectedOrder.product.name}</div>
                          {selectedOrder.product.brand && <div className="text-sm text-[#666]">Brand: {selectedOrder.product.brand}</div>}
                          {selectedOrder.product.condition && <div className="text-sm text-[#666] capitalize">Condition: {selectedOrder.product.condition}</div>}
                          {selectedOrder.product.description && <div className="text-xs text-[#999] mt-1 line-clamp-2">{selectedOrder.product.description}</div>}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[#999] text-sm">Product details unavailable</p>
                    )}
                  </div>
                  {/* Customer */}
                  <div>
                    <h4 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Customer</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-[#999]">Name:</span> <span className="font-medium text-[#1a1a2e]">{selectedOrder.customer_name}</span></div>
                      <div><span className="text-[#999]">Email:</span> <a href={`mailto:${selectedOrder.email}`} className="font-medium text-[#0f3460] hover:underline">{selectedOrder.email}</a></div>
                      <div><span className="text-[#999]">Phone:</span> <a href={`tel:${selectedOrder.phone}`} className="font-medium text-[#0f3460] hover:underline">{selectedOrder.phone}</a></div>
                      <div><span className="text-[#999]">Address:</span> <span className="font-medium text-[#1a1a2e]">{selectedOrder.house_number} {selectedOrder.address_line1}, {selectedOrder.city} {selectedOrder.postcode}</span></div>
                    </div>
                  </div>
                  {/* Order Info */}
                  <div>
                    <h4 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><Receipt className="w-4 h-4" /> Order Summary</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-[#999]">Total:</span> <span className="font-bold text-[#1a1a2e]">{formatCurrency(selectedOrder.total_amount || 0)}</span></div>
                      <div><span className="text-[#999]">Payment:</span> <span className="font-medium text-[#1a1a2e] capitalize">{selectedOrder.payment_method?.replace(/_/g, ' ')}</span></div>
                      <div><span className="text-[#999]">Payment Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedOrder.payment_status] || 'bg-gray-100 text-gray-800'}`}>{selectedOrder.payment_status}</span></div>
                      <div><span className="text-[#999]">Order Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedOrder.order_status] || 'bg-gray-100 text-gray-800'}`}>{selectedOrder.order_status}</span></div>
                    </div>
                    {selectedOrder.notes && (
                      <div className="mt-3">
                        <span className="text-[#999] text-sm">Notes:</span>
                        <p className="mt-1 text-sm text-[#1a1a2e] bg-[#f8f9fa] rounded-lg p-3">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods Section */}
          {activeSection === 'payment-methods' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-xl text-[#1a1a2e]">Payment Methods</h2>
                  <p className="text-sm text-[#666] mt-1">Configure available payment options</p>
                </div>
                <button
                  onClick={() => {
                    setModalType('payment-method')
                    setEditItem(null)
                    setShowModal(true)
                  }}
                  className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Method
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f8f9fa]">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Name</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Code</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Description</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Order</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {paymentMethods.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#666]">
                          <CreditCard className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
                          <p>No payment methods configured.</p>
                        </td>
                      </tr>
                    ) : (
                      paymentMethods.map((method: any) => (
                        <tr key={method.id} className="hover:bg-[#faf8f5]">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-5 h-5 text-[#c9a962]" />
                              <span className="font-medium text-[#1a1a2e]">{method.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <code className="px-2 py-1 bg-[#f8f9fa] rounded text-sm">{method.code}</code>
                          </td>
                          <td className="p-4 text-sm text-[#666] max-w-xs truncate">
                            {method.description || '-'}
                          </td>
                          <td className="p-4 text-sm text-[#666]">
                            {method.sort_order}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleTogglePaymentMethod(method)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                method.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {method.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setModalType('payment-method')
                                  setEditItem(method)
                                  setShowModal(true)
                                }}
                                className="p-2 text-[#0f3460] hover:bg-[#f8f9fa] rounded-lg"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePaymentMethod(method.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Planner Settings Section */}
          {activeSection === 'planner-settings' && (
            <PlannerSettingsSection settings={plannerSettingsData} onRefresh={() => loadSectionData('planner-settings')} />
          )}

          {/* Site Settings Section */}
          {activeSection === 'site-settings' && (
            <SiteSettingsSection settings={siteSettings} onRefresh={() => loadSectionData('site-settings')} />
          )}

          {/* Near Me Requests Section */}
          {activeSection === 'near-me-requests' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#e5e5e5]">
                <h2 className="font-bold text-xl text-[#1a1a2e]">Near Me Requests</h2>
                <p className="text-sm text-[#666] mt-1">Customer near-me search requests</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f8f9fa]">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Date</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Customer / Contact</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Postcode</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Distance (miles)</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Search Term</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {nearMeRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#666]">
                          <MapPin className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
                          <p>No near-me requests yet.</p>
                        </td>
                      </tr>
                    ) : (
                      nearMeRequests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-[#faf8f5]">
                          <td className="p-4 text-sm text-[#666]">
                            {req.created_at ? new Date(req.created_at).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-[#1a1a2e]">{req.customer_name || req.name || '-'}</div>
                            {req.email && <div className="text-xs text-[#666]">{req.email}</div>}
                            {req.phone && <div className="text-xs text-[#666]">{req.phone}</div>}
                          </td>
                          <td className="p-4 text-sm text-[#666]">{req.postcode || '-'}</td>
                          <td className="p-4 text-sm text-[#666]">{req.distance_miles ?? req.distance ?? '-'}</td>
                          <td className="p-4 text-sm text-[#666]">{req.search_term || req.product_search || '-'}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[req.status] || 'bg-gray-100 text-gray-800'}`}>
                              {req.status || 'pending'}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={req.status || 'pending'}
                              onChange={(e) => handleUpdateNearMeStatus(req.id, e.target.value)}
                              className="px-3 py-1 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
                            >
                              <option value="pending">Pending</option>
                              <option value="contacted">Contacted</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Exchange Pro Section */}
          {activeSection === 'exchange-pro' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#e5e5e5]">
                <h2 className="font-bold text-xl text-[#1a1a2e]">Exchange Pro Requests</h2>
                <p className="text-sm text-[#666] mt-1">Customer exchange-pro submissions</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f8f9fa]">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Date</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Customer</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Furniture Type</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Condition</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Est. Value</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {exchangeProRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#666]">
                          <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
                          <p>No exchange-pro requests yet.</p>
                        </td>
                      </tr>
                    ) : (
                      exchangeProRequests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-[#faf8f5]">
                          <td className="p-4 text-sm text-[#666]">
                            {req.created_at ? new Date(req.created_at).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-[#1a1a2e]">{req.customer_name || req.name || '-'}</div>
                            {req.email && <div className="text-xs text-[#666]">{req.email}</div>}
                            {req.phone && <div className="text-xs text-[#666]">{req.phone}</div>}
                          </td>
                          <td className="p-4 text-sm text-[#666]">{req.furniture_type?.name || req.furniture_type || '-'}</td>
                          <td className="p-4 text-sm text-[#666] capitalize">{req.condition || '-'}</td>
                          <td className="p-4 text-sm font-medium text-[#0f3460]">
                            {req.estimated_value ? formatCurrency(req.estimated_value) : (req.premium_value ? formatCurrency(req.premium_value) : '-')}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[req.status] || 'bg-gray-100 text-gray-800'}`}>
                              {req.status || 'pending'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedExchangeReq(req)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f3460] text-white rounded-lg text-xs font-medium hover:bg-[#0a2540] transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                Details
                              </button>
                              <select
                                value={req.status || 'pending'}
                                onChange={(e) => handleUpdateExchangeProStatus(req.id, e.target.value)}
                                className="px-3 py-1 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
                              >
                                <option value="pending">Pending</option>
                                <option value="contacted">Contacted</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Exchange Pro Detail Modal */}
          {selectedExchangeReq && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedExchangeReq(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-[#e5e5e5]">
                  <h3 className="font-bold text-lg text-[#1a1a2e]">Exchange Pro Request Details</h3>
                  <button onClick={() => setSelectedExchangeReq(null)} className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors">
                    <X className="w-5 h-5 text-[#666]" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Customer Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-[#999]">Name:</span> <span className="font-medium text-[#1a1a2e]">{selectedExchangeReq.customer_name || '-'}</span></div>
                      <div><span className="text-[#999]">Email:</span> <span className="font-medium text-[#1a1a2e]">{selectedExchangeReq.email || '-'}</span></div>
                      <div><span className="text-[#999]">Phone:</span> <span className="font-medium text-[#1a1a2e]">{selectedExchangeReq.phone || '-'}</span></div>
                      <div><span className="text-[#999]">Postcode:</span> <span className="font-medium text-[#1a1a2e]">{selectedExchangeReq.postcode || '-'}</span></div>
                      <div><span className="text-[#999]">Submitted:</span> <span className="font-medium text-[#1a1a2e]">{selectedExchangeReq.created_at ? new Date(selectedExchangeReq.created_at).toLocaleString('en-GB') : '-'}</span></div>
                      <div><span className="text-[#999]">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedExchangeReq.status] || 'bg-gray-100 text-gray-800'}`}>{selectedExchangeReq.status || 'pending'}</span></div>
                    </div>
                  </div>
                  {/* Furniture Info */}
                  <div>
                    <h4 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><Armchair className="w-4 h-4" /> Furniture Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-[#999]">Type:</span> <span className="font-medium text-[#1a1a2e]">{selectedExchangeReq.furniture_type?.name || selectedExchangeReq.furniture_type || '-'}</span></div>
                      <div><span className="text-[#999]">Brand:</span> <span className="font-medium text-[#1a1a2e]">{selectedExchangeReq.brand || '-'}</span></div>
                      <div><span className="text-[#999]">Condition:</span> <span className="font-medium text-[#1a1a2e] capitalize">{selectedExchangeReq.condition || '-'}</span></div>
                      <div><span className="text-[#999]">Est. Value:</span> <span className="font-medium text-[#0f3460]">{selectedExchangeReq.estimated_value ? formatCurrency(selectedExchangeReq.estimated_value) : '-'}</span></div>
                      <div><span className="text-[#999]">Delivery:</span> <span className="font-medium text-[#1a1a2e] capitalize">{selectedExchangeReq.delivery || '-'}</span></div>
                      <div><span className="text-[#999]">Floor:</span> <span className="font-medium text-[#1a1a2e]">{selectedExchangeReq.floor || '-'}</span></div>
                    </div>
                    {selectedExchangeReq.description && (
                      <div className="mt-3">
                        <span className="text-[#999] text-sm">Description:</span>
                        <p className="mt-1 text-sm text-[#1a1a2e] bg-[#f8f9fa] rounded-lg p-3">{selectedExchangeReq.description}</p>
                      </div>
                    )}
                  </div>
                  {/* Photos */}
                  {selectedExchangeReq.photos && selectedExchangeReq.photos.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Photos ({selectedExchangeReq.photos.length})</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedExchangeReq.photos.map((photo: string, idx: number) => (
                          <a key={idx} href={photo} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-[#e5e5e5] hover:opacity-90 transition-opacity">
                            <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bidding Pro Section */}
          {activeSection === 'bidding-pro' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#e5e5e5]">
                <h2 className="font-bold text-xl text-[#1a1a2e]">Bidding Pro Requests</h2>
                <p className="text-sm text-[#666] mt-1">All bidding requests from customers</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f8f9fa]">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Date</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Customer</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Furniture Type</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Condition</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Asking Price</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">WhatsApp</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {biddingProRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#666]">
                          <Gavel className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
                          <p>No bidding requests yet.</p>
                        </td>
                      </tr>
                    ) : (
                      biddingProRequests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-[#faf8f5]">
                          <td className="p-4 text-sm text-[#666]">
                            {req.created_at ? new Date(req.created_at).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-[#1a1a2e]">{req.customer_name || req.name || '-'}</div>
                            {req.email && <div className="text-xs text-[#666]">{req.email}</div>}
                            {req.phone && <div className="text-xs text-[#666]">{req.phone}</div>}
                          </td>
                          <td className="p-4 text-sm text-[#666]">{req.furniture_type?.name || req.furniture_type || '-'}</td>
                          <td className="p-4 text-sm text-[#666] capitalize">{req.condition || '-'}</td>
                          <td className="p-4 text-sm font-semibold text-[#3d4a3a]">
                            {req.desired_price ? `£${parseFloat(req.desired_price).toFixed(2)}` : '-'}
                          </td>
                          <td className="p-4">
                            {req.whatsapp ? (
                              <a
                                href={`https://wa.me/${req.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-medium hover:bg-[#128C7E] transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                                {req.whatsapp}
                              </a>
                            ) : (
                              <span className="text-[#999] text-sm">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              req.status === 'offers_received' ? 'bg-blue-100 text-blue-800' :
                              req.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                              statusColors[req.status] || 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {req.status === 'offers_received' ? 'Offers Received' : req.status === 'closed' ? 'Closed' : req.status || 'Pending'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedBiddingReq(req)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f3460] text-white rounded-lg text-xs font-medium hover:bg-[#0a2540] transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                Details
                              </button>
                              <select
                                value={req.status || 'pending'}
                                onChange={(e) => handleUpdateBiddingProStatus(req.id, e.target.value)}
                                className="px-3 py-1 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
                              >
                                <option value="pending">Pending</option>
                                <option value="offers_received">Offers Received</option>
                                <option value="closed">Closed</option>
                              </select>
                              {req.offers && req.offers.length > 0 && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                                  {req.offers.length} offer{req.offers.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bidding Pro Detail Modal */}
          {selectedBiddingReq && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedBiddingReq(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-[#e5e5e5]">
                  <h3 className="font-bold text-lg text-[#1a1a2e]">Bidding Pro Request Details</h3>
                  <button onClick={() => setSelectedBiddingReq(null)} className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors">
                    <X className="w-5 h-5 text-[#666]" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Customer Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-[#999]">Name:</span> <span className="font-medium text-[#1a1a2e]">{selectedBiddingReq.customer_name || '-'}</span></div>
                      <div><span className="text-[#999]">Email:</span> <span className="font-medium text-[#1a1a2e]">{selectedBiddingReq.email || '-'}</span></div>
                      <div><span className="text-[#999]">Phone:</span> <span className="font-medium text-[#1a1a2e]">{selectedBiddingReq.phone || '-'}</span></div>
                      <div><span className="text-[#999]">Postcode:</span> <span className="font-medium text-[#1a1a2e]">{selectedBiddingReq.postcode || '-'}</span></div>
                      <div><span className="text-[#999]">Submitted:</span> <span className="font-medium text-[#1a1a2e]">{selectedBiddingReq.created_at ? new Date(selectedBiddingReq.created_at).toLocaleString('en-GB') : '-'}</span></div>
                      <div><span className="text-[#999]">WhatsApp:</span>{' '}
                        {selectedBiddingReq.whatsapp ? (
                          <a href={`https://wa.me/${selectedBiddingReq.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-medium text-[#25D366] hover:underline">{selectedBiddingReq.whatsapp}</a>
                        ) : <span className="font-medium text-[#1a1a2e]">-</span>}
                      </div>
                    </div>
                  </div>
                  {/* Furniture Info */}
                  <div>
                    <h4 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><Gavel className="w-4 h-4" /> Item Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-[#999]">Type:</span> <span className="font-medium text-[#1a1a2e]">{selectedBiddingReq.furniture_type?.name || selectedBiddingReq.furniture_type || '-'}</span></div>
                      <div><span className="text-[#999]">Brand:</span> <span className="font-medium text-[#1a1a2e]">{selectedBiddingReq.brand || '-'}</span></div>
                      <div><span className="text-[#999]">Condition:</span> <span className="font-medium text-[#1a1a2e] capitalize">{selectedBiddingReq.condition || '-'}</span></div>
                      <div><span className="text-[#999]">Desired Price:</span> <span className="font-semibold text-[#3d4a3a]">{selectedBiddingReq.desired_price ? `£${parseFloat(selectedBiddingReq.desired_price).toFixed(2)}` : '-'}</span></div>
                      <div><span className="text-[#999]">Delivery:</span> <span className="font-medium text-[#1a1a2e] capitalize">{selectedBiddingReq.delivery || '-'}</span></div>
                      <div><span className="text-[#999]">Floor:</span> <span className="font-medium text-[#1a1a2e]">{selectedBiddingReq.floor || '-'}</span></div>
                    </div>
                    {selectedBiddingReq.damages && selectedBiddingReq.damages.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[#999] text-sm">Damages:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedBiddingReq.damages.map((d: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs">{d}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedBiddingReq.description && (
                      <div className="mt-3">
                        <span className="text-[#999] text-sm">Description:</span>
                        <p className="mt-1 text-sm text-[#1a1a2e] bg-[#f8f9fa] rounded-lg p-3">{selectedBiddingReq.description}</p>
                      </div>
                    )}
                  </div>
                  {/* Offers */}
                  {selectedBiddingReq.offers && selectedBiddingReq.offers.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[#1a1a2e] mb-3">Outlet Offers ({selectedBiddingReq.offers.length})</h4>
                      <div className="space-y-2">
                        {selectedBiddingReq.offers.map((offer: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-[#f8f9fa] rounded-lg p-3 text-sm">
                            <span className="text-[#666]">Outlet #{offer.outlet_id}</span>
                            <span className="font-semibold text-[#3d4a3a]">£{parseFloat(offer.offered_price).toFixed(2)}</span>
                            {offer.message && <span className="text-[#666] text-xs max-w-[200px] truncate">{offer.message}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Photos */}
                  {selectedBiddingReq.photos && selectedBiddingReq.photos.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Photos ({selectedBiddingReq.photos.length})</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedBiddingReq.photos.map((photo: string, idx: number) => (
                          <a key={idx} href={photo} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-[#e5e5e5] hover:opacity-90 transition-opacity">
                            <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CO2 Emissions Section */}
          {activeSection === 'co2-emissions' && (
            <Co2EmissionsSection
              co2Emissions={co2Emissions}
              setCo2Emissions={setCo2Emissions}
              onRefresh={() => loadSectionData('co2-emissions')}
            />
          )}

          {/* Premium Codes Section */}
          {activeSection === 'premium-codes' && (
            <PremiumCodesSection
              codes={premiumCodes}
              onRefresh={() => loadSectionData('premium-codes')}
            />
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

function PremiumCodesSection({ codes, onRefresh }: { codes: any[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [form, setForm] = useState({ code: '', description: '', max_uses: '', expires_at: '' })

  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const random = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setForm(f => ({ ...f, code: `REVIVAL${random.slice(0, 6)}` }))
  }

  async function handleCreate() {
    if (!form.code.trim()) return
    setSaving(true)
    try {
      await api.createAdminPremiumCode({
        code: form.code.trim().toUpperCase(),
        description: form.description || undefined,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
        is_active: true,
      })
      setForm({ code: '', description: '', max_uses: '', expires_at: '' })
      setShowForm(false)
      onRefresh()
    } catch (e: any) {
      alert(e?.message || 'Failed to create code')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(code: any) {
    await api.updateAdminPremiumCode(code.id, { is_active: !code.is_active })
    onRefresh()
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this premium code? Users with this code will lose access.')) return
    await api.deleteAdminPremiumCode(id)
    onRefresh()
  }

  function copyToClipboard(code: any) {
    navigator.clipboard.writeText(code.code)
    setCopiedId(code.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg text-[#1a1a2e]">Premium Access Codes</h2>
          <p className="text-sm text-[#666] mt-1">Create and manage codes that give users access to premium features</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); if (!showForm) generateCode() }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f3460] text-white rounded-xl hover:bg-[#1a1a2e] transition-colors"
        >
          <Plus className="w-4 h-4" /> Generate Code
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="p-6 bg-[#faf8f5] border-b border-[#e5e5e5]">
          <h3 className="font-semibold text-[#1a1a2e] mb-4">New Premium Code</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Code *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="flex-1 px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460] font-mono"
                  placeholder="REVIVAL..."
                />
                <button type="button" onClick={generateCode} className="px-3 py-2 border border-[#e5e5e5] rounded-lg hover:bg-white transition-colors" title="Regenerate">
                  <RefreshCw className="w-4 h-4 text-[#666]" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460]"
                placeholder="e.g. VIP client — John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Max Uses <span className="text-[#999]">(blank = unlimited)</span></label>
              <input
                type="number"
                min="1"
                value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460]"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Expires <span className="text-[#999]">(blank = never)</span></label>
              <input
                type="date"
                value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460]"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreate}
              disabled={saving || !form.code.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-[#0f3460] text-white rounded-xl hover:bg-[#1a1a2e] disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {saving ? 'Creating...' : 'Create Code'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 border border-[#e5e5e5] rounded-xl hover:bg-white transition-colors text-[#666]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Codes table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8f9fa]">
              <th className="text-left p-4 font-semibold text-[#1a1a2e]">Code</th>
              <th className="text-left p-4 font-semibold text-[#1a1a2e]">Description</th>
              <th className="text-left p-4 font-semibold text-[#1a1a2e]">Uses</th>
              <th className="text-left p-4 font-semibold text-[#1a1a2e]">Expires</th>
              <th className="text-left p-4 font-semibold text-[#1a1a2e]">Status</th>
              <th className="text-left p-4 font-semibold text-[#1a1a2e]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#999]">No premium codes yet. Generate one above.</td>
              </tr>
            ) : codes.map(code => (
              <tr key={code.id} className="border-t border-[#e5e5e5] hover:bg-[#f8f9fa]">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0f3460] tracking-widest">{code.code}</span>
                    <button
                      onClick={() => copyToClipboard(code)}
                      className="p-1 text-[#999] hover:text-[#0f3460] transition-colors"
                      title="Copy code"
                    >
                      {copiedId === code.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
                <td className="p-4 text-[#666] text-sm">{code.description || '—'}</td>
                <td className="p-4 text-[#666] text-sm">
                  {code.used_count}{code.max_uses ? ` / ${code.max_uses}` : ' / ∞'}
                </td>
                <td className="p-4 text-[#666] text-sm">
                  {code.expires_at ? new Date(code.expires_at).toLocaleDateString('en-GB') : 'Never'}
                </td>
                <td className="p-4">
                  <button onClick={() => toggleActive(code)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${code.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {code.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleDelete(code.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete code"
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

// CO2 Emissions Component
function Co2EmissionsSection({ co2Emissions, setCo2Emissions, onRefresh }: { co2Emissions: any[], setCo2Emissions: (data: any[]) => void, onRefresh: () => void }) {
  const [editingRows, setEditingRows] = useState<Record<number, any>>({})
  const [savingRows, setSavingRows] = useState<Record<number, boolean>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRow, setNewRow] = useState({ product_name: '', new_co2: '', refurbished_co2: '', transport_co2: '', net_co2_saved: '' })

  const handleEdit = (item: any) => {
    setEditingRows(prev => ({
      ...prev,
      [item.id]: { product_name: item.product_name, new_co2: item.new_co2, refurbished_co2: item.refurbished_co2, transport_co2: item.transport_co2, net_co2_saved: item.net_co2_saved }
    }))
  }

  const handleCancelEdit = (id: number) => {
    setEditingRows(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleSaveRow = async (id: number) => {
    setSavingRows(prev => ({ ...prev, [id]: true }))
    try {
      await api.updateAdminCo2Emission(id, editingRows[id])
      handleCancelEdit(id)
      onRefresh()
    } catch {
      // Update locally if API not available
      setCo2Emissions(co2Emissions.map(item => item.id === id ? { ...item, ...editingRows[id] } : item))
      handleCancelEdit(id)
    } finally {
      setSavingRows(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleAddRow = async () => {
    const row = {
      product_name: newRow.product_name,
      new_co2: parseFloat(newRow.new_co2) || 0,
      refurbished_co2: parseFloat(newRow.refurbished_co2) || 0,
      transport_co2: parseFloat(newRow.transport_co2) || 0,
      net_co2_saved: parseFloat(newRow.net_co2_saved) || 0,
    }
    try {
      await api.createAdminCo2Emission(row)
      setNewRow({ product_name: '', new_co2: '', refurbished_co2: '', transport_co2: '', net_co2_saved: '' })
      setShowAddForm(false)
      onRefresh()
    } catch {
      // Add locally if API not available
      const newId = Math.max(...co2Emissions.map(i => i.id), 0) + 1
      setCo2Emissions([...co2Emissions, { id: newId, ...row }])
      setNewRow({ product_name: '', new_co2: '', refurbished_co2: '', transport_co2: '', net_co2_saved: '' })
      setShowAddForm(false)
    }
  }

  const handleDeleteRow = async (id: number) => {
    if (!confirm('Are you sure you want to delete this CO2 record?')) return
    try {
      await api.deleteAdminCo2Emission(id)
      onRefresh()
    } catch {
      setCo2Emissions(co2Emissions.filter(item => item.id !== id))
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl text-[#1a1a2e]">CO2 Emissions</h2>
          <p className="text-sm text-[#666] mt-1">Manage CO2 data for furniture types</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f3460] text-white rounded-xl hover:bg-[#1a1a2e] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {showAddForm && (
        <div className="p-6 border-b border-[#e5e5e5] bg-[#f8f9fa]">
          <h3 className="font-semibold text-[#1a1a2e] mb-4">Add New CO2 Record</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-[#1a1a2e] mb-1">Product Name</label>
              <input
                type="text"
                value={newRow.product_name}
                onChange={e => setNewRow({ ...newRow, product_name: e.target.value })}
                placeholder="e.g. Dining Table"
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a1a2e] mb-1">New CO2 (kg)</label>
              <input
                type="number"
                value={newRow.new_co2}
                onChange={e => setNewRow({ ...newRow, new_co2: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a1a2e] mb-1">Refurb CO2 (kg)</label>
              <input
                type="number"
                value={newRow.refurbished_co2}
                onChange={e => setNewRow({ ...newRow, refurbished_co2: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a1a2e] mb-1">Transport CO2 (kg)</label>
              <input
                type="number"
                value={newRow.transport_co2}
                onChange={e => setNewRow({ ...newRow, transport_co2: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a1a2e] mb-1">Net CO2 Saved (kg)</label>
              <input
                type="number"
                value={newRow.net_co2_saved}
                onChange={e => setNewRow({ ...newRow, net_co2_saved: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddRow}
              disabled={!newRow.product_name}
              className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a1a2e] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Record
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewRow({ product_name: '', new_co2: '', refurbished_co2: '', transport_co2: '', net_co2_saved: '' }) }}
              className="px-4 py-2 border border-[#e5e5e5] rounded-lg hover:bg-[#f8f9fa] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f8f9fa]">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Product Name</th>
              <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">New CO2 (kg)</th>
              <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Refurbished CO2 (kg)</th>
              <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Transport CO2 (kg)</th>
              <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Net CO2 Saved (kg)</th>
              <th className="text-left p-4 text-sm font-semibold text-[#1a1a2e]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5]">
            {co2Emissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#666]">
                  <Leaf className="w-16 h-16 mx-auto mb-4 text-[#e5e5e5]" />
                  <p>No CO2 emissions data yet.</p>
                </td>
              </tr>
            ) : (
              co2Emissions.map((item: any) => {
                const isEditing = editingRows[item.id] !== undefined
                const editData = editingRows[item.id] || {}
                return (
                  <tr key={item.id} className="hover:bg-[#faf8f5]">
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.product_name}
                          onChange={e => setEditingRows(prev => ({ ...prev, [item.id]: { ...prev[item.id], product_name: e.target.value } }))}
                          className="w-full px-3 py-1.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
                        />
                      ) : (
                        <span className="font-medium text-[#1a1a2e]">{item.product_name}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.new_co2}
                          onChange={e => setEditingRows(prev => ({ ...prev, [item.id]: { ...prev[item.id], new_co2: e.target.value } }))}
                          className="w-24 px-3 py-1.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
                        />
                      ) : (
                        <span className="text-[#666]">{item.new_co2}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.refurbished_co2}
                          onChange={e => setEditingRows(prev => ({ ...prev, [item.id]: { ...prev[item.id], refurbished_co2: e.target.value } }))}
                          className="w-24 px-3 py-1.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
                        />
                      ) : (
                        <span className="text-[#666]">{item.refurbished_co2}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.transport_co2}
                          onChange={e => setEditingRows(prev => ({ ...prev, [item.id]: { ...prev[item.id], transport_co2: e.target.value } }))}
                          className="w-24 px-3 py-1.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
                        />
                      ) : (
                        <span className="text-[#666]">{item.transport_co2}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.net_co2_saved}
                          onChange={e => setEditingRows(prev => ({ ...prev, [item.id]: { ...prev[item.id], net_co2_saved: e.target.value } }))}
                          className="w-24 px-3 py-1.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#0f3460]"
                        />
                      ) : (
                        <span className="font-medium text-green-700">{item.net_co2_saved}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveRow(item.id)}
                            disabled={savingRows[item.id]}
                            className="px-3 py-1.5 bg-[#0f3460] text-white rounded-lg text-sm hover:bg-[#1a1a2e] transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {savingRows[item.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Save
                          </button>
                          <button
                            onClick={() => handleCancelEdit(item.id)}
                            className="px-3 py-1.5 border border-[#e5e5e5] rounded-lg text-sm hover:bg-[#f8f9fa] transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Planner Settings Component
function PlannerSettingsSection({ settings, onRefresh }: { settings: any, onRefresh: () => void }) {
  const [form, setForm] = useState({
    planner_budget_min: '',
    planner_budget_max: '',
    planner_budget_default: '',
    planner_budget_presets: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setForm({
        planner_budget_min: String(settings.planner_budget_min ?? 500),
        planner_budget_max: String(settings.planner_budget_max ?? 10000),
        planner_budget_default: String(settings.planner_budget_default ?? 2000),
        planner_budget_presets: Array.isArray(settings.planner_budget_presets)
          ? settings.planner_budget_presets.join(', ')
          : '1000, 2000, 3000, 5000',
      })
    }
  }, [settings])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const presets = form.planner_budget_presets
        .split(',')
        .map(v => parseInt(v.trim(), 10))
        .filter(v => !isNaN(v))

      await api.bulkUpdateAdminSiteSettings({
        planner_budget_min: parseInt(form.planner_budget_min, 10),
        planner_budget_max: parseInt(form.planner_budget_max, 10),
        planner_budget_default: parseInt(form.planner_budget_default, 10),
        planner_budget_presets: presets,
      })
      setSaved(true)
      onRefresh()
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving planner settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#e5e5e5]">
        <h2 className="font-bold text-xl text-[#1a1a2e]">Planner Settings</h2>
        <p className="text-sm text-[#666] mt-1">Configure the budget options shown in the Room Planner tool</p>
      </div>

      <div className="p-6 max-w-xl">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Budget Minimum (£)
              </label>
              <input
                type="number"
                min="0"
                value={form.planner_budget_min}
                onChange={e => setForm(f => ({ ...f, planner_budget_min: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
              />
              <p className="text-xs text-[#666] mt-1">Lowest value on the slider</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Budget Maximum (£)
              </label>
              <input
                type="number"
                min="0"
                value={form.planner_budget_max}
                onChange={e => setForm(f => ({ ...f, planner_budget_max: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
              />
              <p className="text-xs text-[#666] mt-1">Highest value on the slider</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
              Default Budget (£)
            </label>
            <input
              type="number"
              min="0"
              value={form.planner_budget_default}
              onChange={e => setForm(f => ({ ...f, planner_budget_default: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
            />
            <p className="text-xs text-[#666] mt-1">The budget value pre-selected when the planner loads</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
              Quick-Select Preset Buttons (£)
            </label>
            <input
              type="text"
              value={form.planner_budget_presets}
              onChange={e => setForm(f => ({ ...f, planner_budget_presets: e.target.value }))}
              placeholder="e.g. 1000, 2000, 3000, 5000"
              className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
            />
            <p className="text-xs text-[#666] mt-1">Comma-separated values for the quick-select buttons below the slider</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#0f3460] text-white rounded-xl font-semibold hover:bg-[#1a1a2e] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </div>
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

  // Reset form when item changes (switching between create/edit)
  useEffect(() => {
    setFormData(item || {})
    setSelectedImages([])
    if (item && type === 'product') {
      const images = Array.isArray(item.images) ? item.images : (item.images ? JSON.parse(item.images) : [])
      setExistingImages(images)
    } else {
      setExistingImages([])
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

        // Add comparison fields
        if (formData.comparison_retailer) formDataToSend.append('comparison_retailer', formData.comparison_retailer)
        if (formData.comparison_product_name) formDataToSend.append('comparison_product_name', formData.comparison_product_name)
        if (formData.comparison_price) formDataToSend.append('comparison_price', formData.comparison_price.toString())
        if (formData.comparison_url) formDataToSend.append('comparison_url', formData.comparison_url)

        // Add CO2 emissions fields
        if (formData.co2_new) formDataToSend.append('co2_new', formData.co2_new.toString())
        if (formData.co2_refurbished) formDataToSend.append('co2_refurbished', formData.co2_refurbished.toString())
        if (formData.co2_saved) formDataToSend.append('co2_saved', formData.co2_saved.toString())

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
      } else if (type === 'inventory') {
        const payload = {
          outlet_id: parseInt(formData.outlet_id),
          furniture_type_id: formData.furniture_type_id ? parseInt(formData.furniture_type_id) : null,
          item_name: formData.item_name,
          description: formData.description || null,
          customer_name: formData.customer_name || null,
          status: formData.status || 'pending',
          repair_cost: formData.repair_cost ? parseFloat(formData.repair_cost) : null,
          sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
          notes: formData.notes || null,
        }
        if (item) {
          await api.updateAdminInventoryItem(item.id, payload)
        } else {
          await api.createAdminInventoryItem(payload)
        }
      } else if (type === 'payment-method') {
        if (item) {
          await api.updateAdminPaymentMethod(item.id, {
            name: formData.name,
            code: formData.code,
            description: formData.description || null,
            instructions: formData.instructions || null,
            is_active: formData.is_active !== false,
            sort_order: parseInt(formData.sort_order) || 0,
          })
        } else {
          await api.createAdminPaymentMethod({
            name: formData.name,
            code: formData.code,
            description: formData.description || null,
            instructions: formData.instructions || null,
            is_active: formData.is_active !== false,
            sort_order: parseInt(formData.sort_order) || 0,
          })
        }
      }
      onSave()
    } catch (error: any) {
      console.error('Error saving:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save. Please try again.'
      alert(errorMessage)
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

              {/* Comparison Data Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-[#1a1a2e] mb-3">Price Comparison (Optional)</h4>
                <p className="text-xs text-[#666] mb-4">Set custom comparison data for this product. If not set, the furniture type default will be used.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Comparison Retailer</label>
                    <input
                      type="text"
                      value={formData.comparison_retailer || ''}
                      onChange={e => setFormData({ ...formData, comparison_retailer: e.target.value })}
                      placeholder="e.g. IKEA, Argos, Amazon"
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Comparison Product Name</label>
                    <input
                      type="text"
                      value={formData.comparison_product_name || ''}
                      onChange={e => setFormData({ ...formData, comparison_product_name: e.target.value })}
                      placeholder="e.g. MALM Bed Frame"
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Comparison Price (GBP)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.comparison_price || ''}
                      onChange={e => setFormData({ ...formData, comparison_price: e.target.value })}
                      placeholder="e.g. 299.00"
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Comparison URL</label>
                    <input
                      type="url"
                      value={formData.comparison_url || ''}
                      onChange={e => setFormData({ ...formData, comparison_url: e.target.value })}
                      placeholder="https://www.ikea.com/..."
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* CO2 Emissions Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-[#1a1a2e] mb-3 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" /> CO2 Emissions (Optional)
                </h4>
                <p className="text-xs text-[#666] mb-4">Enter kg of CO2 to show buyers the environmental impact of choosing refurbished.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-1">If Bought New (kg CO2)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.co2_new || ''}
                      onChange={e => setFormData({ ...formData, co2_new: e.target.value })}
                      placeholder="e.g. 120"
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Refurbished (kg CO2)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.co2_refurbished || ''}
                      onChange={e => setFormData({ ...formData, co2_refurbished: e.target.value })}
                      placeholder="e.g. 35"
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-1">CO2 Saved (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.co2_saved || ''}
                      onChange={e => setFormData({ ...formData, co2_saved: e.target.value })}
                      placeholder="e.g. 85"
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                    />
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

          {/* Inventory Form */}
          {type === 'inventory' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Item Name *</label>
                  <input
                    type="text"
                    value={formData.item_name || ''}
                    onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460]"
                    placeholder="e.g. Blue Fabric Sofa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Outlet *</label>
                  <select
                    value={formData.outlet_id || ''}
                    onChange={e => setFormData({ ...formData, outlet_id: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460]"
                    required
                  >
                    <option value="">Select outlet</option>
                    {outlets.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Furniture Type</label>
                  <select
                    value={formData.furniture_type_id || ''}
                    onChange={e => setFormData({ ...formData, furniture_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460]"
                  >
                    <option value="">Select type</option>
                    {furnitureTypes.map((ft: any) => <option key={ft.id} value={ft.id}>{ft.icon} {ft.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Status *</label>
                  <select
                    value={formData.status || 'pending'}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460]"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="collected">Collected</option>
                    <option value="repair">Repair</option>
                    <option value="sale">For Sale</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customer_name || ''}
                    onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460]"
                    placeholder="Who brought this item?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Repair Cost (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.repair_cost || ''}
                    onChange={e => setFormData({ ...formData, repair_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460]"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Sale Price (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.sale_price || ''}
                    onChange={e => setFormData({ ...formData, sale_price: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460]"
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460] resize-none"
                    placeholder="Brief description of the item..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Internal Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#0f3460] resize-none"
                    placeholder="Admin notes (not visible to customers)..."
                  />
                </div>
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

          {/* Payment Method Form */}
          {type === 'payment-method' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Method Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Cash on Delivery"
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Code *</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  required
                  placeholder="e.g. cod, bank_transfer"
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier (lowercase, no spaces)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Pay when your order arrives"
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Payment Instructions</label>
                <textarea
                  value={formData.instructions || ''}
                  onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                  rows={3}
                  placeholder="Instructions shown to customer at checkout..."
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order || 0}
                  onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="pm_is_active"
                  checked={formData.is_active !== false}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-[#e5e5e5] text-[#0f3460] focus:ring-[#0f3460]"
                />
                <label htmlFor="pm_is_active" className="text-sm font-medium text-[#1a1a2e]">Active</label>
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
