const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class ApiClient {
  private baseUrl: string
  private token: string | null = null
  private adminToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('outlet_token')
      this.adminToken = localStorage.getItem('admin_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('outlet_token', token)
      } else {
        localStorage.removeItem('outlet_token')
      }
    }
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('outlet_token')
    }
    return this.token
  }

  setAdminToken(token: string | null) {
    this.adminToken = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('admin_token', token)
      } else {
        localStorage.removeItem('admin_token')
      }
    }
  }

  getAdminToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token')
    }
    return this.adminToken
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAdminToken: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const token = useAdminToken ? this.getAdminToken() : this.getToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred')
    }

    return data
  }

  // Furniture data
  async getFurnitureTypes() {
    return this.request<{ success: boolean; data: any[] }>('/furniture-types')
  }

  async getMaterials() {
    return this.request<{ success: boolean; data: any[] }>('/materials')
  }

  async getDamageTypes() {
    return this.request<{ success: boolean; data: any[] }>('/damage-types')
  }

  async getCatalog() {
    return this.request<{ success: boolean; data: any[] }>('/catalog')
  }

  async getRoomTypes() {
    return this.request<{ success: boolean; data: any }>('/room-types')
  }

  async getStyles() {
    return this.request<{ success: boolean; data: any }>('/styles')
  }

  async getResaleOptions() {
    return this.request<{ success: boolean; data: any }>('/resale-options')
  }

  // Repair calculator
  async calculateRepair(data: {
    furniture_type_id: number
    material_id: number
    damage_type_ids: number[]
  }) {
    return this.request<{ success: boolean; data: any }>('/repair/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async submitRepairRequest(data: {
    furniture_type_id: number
    material_id: number
    damage_type_ids: number[]
    customer_name: string
    email: string
    phone?: string
    address?: string
  }) {
    return this.request<{ success: boolean; data: any; message: string }>('/repair/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Resale calculator
  async calculateResale(data: {
    furniture_type_id: number
    age: string
    condition: string
    brand_category?: string
    original_price?: number
  }) {
    return this.request<{ success: boolean; data: any }>('/resale/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async submitSellRequest(data: {
    furniture_type_id: number
    age: string
    condition: string
    brand_category?: string
    original_price?: number
    customer_name: string
    email: string
    phone?: string
    address?: string
  }) {
    return this.request<{ success: boolean; data: any; message: string }>('/resale/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Room planner
  async generateRoomPlan(data: {
    room_type: string
    room_size: string
    style: string
    budget?: number
  }) {
    return this.request<{ success: boolean; data: any }>('/planner/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async submitRoomPlan(data: {
    room_type: string
    room_size: string
    style: string
    budget?: number
    selected_items?: any[]
    total_cost?: number
    customer_name: string
    email: string
    phone?: string
  }) {
    return this.request<{ success: boolean; data: any; message: string }>('/planner/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Outlet auth
  async outletLogin(email: string, password: string) {
    const response = await this.request<{
      success: boolean
      data: { token: string; outlet: any }
      message: string
    }>('/outlet/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async outletLogout() {
    const response = await this.request<{ success: boolean; message: string }>('/outlet/logout', {
      method: 'POST',
    })
    this.setToken(null)
    return response
  }

  async getOutletProfile() {
    return this.request<{ success: boolean; data: any }>('/outlet/profile')
  }

  async updateOutletProfile(data: {
    name?: string
    phone?: string
    address?: string
    city?: string
    postcode?: string
    latitude?: number
    longitude?: number
    description?: string
    opening_hours?: any
  }) {
    return this.request<{ success: boolean; data: any; message: string }>('/outlet/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getOutletStats() {
    return this.request<{ success: boolean; data: any }>('/outlet/stats')
  }

  async getOutletInventory(status?: string) {
    const params = status && status !== 'all' ? `?status=${status}` : ''
    return this.request<{ success: boolean; data: any }>(`/outlet/inventory${params}`)
  }

  async updateInventoryItem(id: number, data: {
    status?: string
    repair_cost?: number
    sale_price?: number
    notes?: string
  }) {
    return this.request<{ success: boolean; data: any; message: string }>(`/outlet/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Partner - Products management
  async getOutletProducts(params?: { status?: string; page?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.page) searchParams.append('page', params.page.toString())
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return this.request<any>(`/outlet/products${query}`)
  }

  async createOutletProduct(data: FormData) {
    const token = this.getToken()
    const response = await fetch(`${this.baseUrl}/outlet/products`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: data,
    })
    return response.json()
  }

  async updateOutletProduct(id: number, data: FormData) {
    const token = this.getToken()
    // Add _method for Laravel to handle as PUT
    data.append('_method', 'PUT')
    const response = await fetch(`${this.baseUrl}/outlet/products/${id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: data,
    })
    return response.json()
  }

  async deleteOutletProduct(id: number) {
    return this.request<{ message: string }>(`/outlet/products/${id}`, {
      method: 'DELETE',
    })
  }

  async deleteOutletProductImage(productId: number, imageIndex: number) {
    return this.request<{ message: string; data: any }>(`/outlet/products/${productId}/images/${imageIndex}`, {
      method: 'DELETE',
    })
  }

  // Public - Products
  async getProducts(params?: {
    furniture_type_id?: number
    condition?: string
    min_price?: number
    max_price?: number
    city?: string
    search?: string
    sort?: string
    order?: string
    page?: number
    per_page?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString())
      })
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return this.request<any>(`/products${query}`)
  }

  async getFeaturedProducts() {
    return this.request<{ data: any[] }>('/products/featured')
  }

  async getProduct(id: number) {
    return this.request<{ data: any; related: any[] }>(`/products/${id}`)
  }

  // Admin auth
  async adminLogin(email: string, password: string) {
    const response = await this.request<{
      success: boolean
      data: { token: string; user: any }
      message: string
    }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data.token) {
      this.setAdminToken(response.data.token)
    }

    return response
  }

  async adminLogout() {
    const response = await this.request<{ success: boolean; message: string }>(
      '/admin/logout',
      { method: 'POST' },
      true
    )
    this.setAdminToken(null)
    return response
  }

  async getAdminProfile() {
    return this.request<{ success: boolean; data: any }>('/admin/profile', {}, true)
  }

  async getAdminDashboard() {
    return this.request<{ success: boolean; data: any }>('/admin/dashboard', {}, true)
  }

  // Admin - Outlets management
  async getAdminOutlets(params?: { status?: string; search?: string; page?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.page) searchParams.append('page', params.page.toString())
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return this.request<{ success: boolean; data: any }>(`/admin/outlets${query}`, {}, true)
  }

  async createAdminOutlet(data: {
    name: string
    email: string
    password: string
    location: string
    phone?: string
    address?: string
  }) {
    return this.request<{ success: boolean; data: any; message: string }>(
      '/admin/outlets',
      { method: 'POST', body: JSON.stringify(data) },
      true
    )
  }

  async updateAdminOutlet(id: number, data: {
    name?: string
    email?: string
    location?: string
    phone?: string
    address?: string
    active?: boolean
  }) {
    return this.request<{ success: boolean; data: any; message: string }>(
      `/admin/outlets/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      true
    )
  }

  // Admin - Repair requests management
  async getAdminRepairRequests(params?: { status?: string; search?: string; page?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.page) searchParams.append('page', params.page.toString())
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return this.request<{ success: boolean; data: any }>(`/admin/repair-requests${query}`, {}, true)
  }

  async updateAdminRepairRequest(id: number, data: {
    status?: string
    notes?: string
    outlet_id?: number | null
  }) {
    return this.request<{ success: boolean; data: any; message: string }>(
      `/admin/repair-requests/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      true
    )
  }

  // Admin - Sell requests management
  async getAdminSellRequests(params?: { status?: string; search?: string; page?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.page) searchParams.append('page', params.page.toString())
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return this.request<{ success: boolean; data: any }>(`/admin/sell-requests${query}`, {}, true)
  }

  async updateAdminSellRequest(id: number, data: {
    status?: string
    notes?: string
    outlet_id?: number | null
  }) {
    return this.request<{ success: boolean; data: any; message: string }>(
      `/admin/sell-requests/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      true
    )
  }

  // Admin - Inventory management
  async getAdminInventory(params?: { status?: string; outlet_id?: number; search?: string; page?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.outlet_id) searchParams.append('outlet_id', params.outlet_id.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.page) searchParams.append('page', params.page.toString())
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return this.request<{ success: boolean; data: any }>(`/admin/inventory${query}`, {}, true)
  }

  // Admin - Furniture types management
  async getAdminFurnitureTypes() {
    return this.request<{ success: boolean; data: any[] }>('/admin/furniture-types', {}, true)
  }

  async createAdminFurnitureType(data: {
    name: string
    icon?: string
    base_repair_cost: number
    base_value: number
    sort_order?: number
    active?: boolean
  }) {
    return this.request<{ success: boolean; data: any; message: string }>(
      '/admin/furniture-types',
      { method: 'POST', body: JSON.stringify(data) },
      true
    )
  }

  async updateAdminFurnitureType(id: number, data: {
    name?: string
    icon?: string
    base_repair_cost?: number
    base_value?: number
    sort_order?: number
    active?: boolean
  }) {
    return this.request<{ success: boolean; data: any; message: string }>(
      `/admin/furniture-types/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      true
    )
  }

  async deleteAdminFurnitureType(id: number) {
    return this.request<{ success: boolean; message: string }>(
      `/admin/furniture-types/${id}`,
      { method: 'DELETE' },
      true
    )
  }

  // Admin - Materials management
  async getAdminMaterials() {
    return this.request<{ success: boolean; data: any[] }>('/admin/materials', {}, true)
  }

  async createAdminMaterial(data: {
    name: string
    icon?: string
    repair_multiplier: number
    sort_order?: number
    active?: boolean
  }) {
    return this.request<{ success: boolean; data: any; message: string }>(
      '/admin/materials',
      { method: 'POST', body: JSON.stringify(data) },
      true
    )
  }

  async updateAdminMaterial(id: number, data: {
    name?: string
    icon?: string
    repair_multiplier?: number
    sort_order?: number
    active?: boolean
  }) {
    return this.request<{ success: boolean; data: any; message: string }>(
      `/admin/materials/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      true
    )
  }

  async deleteAdminMaterial(id: number) {
    return this.request<{ success: boolean; message: string }>(
      `/admin/materials/${id}`,
      { method: 'DELETE' },
      true
    )
  }

  // Admin - Damage types management
  async getAdminDamageTypes() {
    return this.request<{ success: boolean; data: any[] }>('/admin/damage-types', {}, true)
  }

  async createAdminDamageType(data: {
    name: string
    icon?: string
    repair_cost: number
    sort_order?: number
    active?: boolean
  }) {
    return this.request<{ success: boolean; data: any; message: string }>(
      '/admin/damage-types',
      { method: 'POST', body: JSON.stringify(data) },
      true
    )
  }

  async updateAdminDamageType(id: number, data: {
    name?: string
    icon?: string
    repair_cost?: number
    sort_order?: number
    active?: boolean
  }) {
    return this.request<{ success: boolean; data: any; message: string }>(
      `/admin/damage-types/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      true
    )
  }

  async deleteAdminDamageType(id: number) {
    return this.request<{ success: boolean; message: string }>(
      `/admin/damage-types/${id}`,
      { method: 'DELETE' },
      true
    )
  }

  // Admin - Products management
  async getAdminProducts(params?: { status?: string; outlet_id?: number; page?: number; per_page?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.outlet_id) searchParams.append('outlet_id', params.outlet_id.toString())
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString())
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return this.request<any>(`/admin/products${query}`, {}, true)
  }

  async updateAdminProduct(id: number, data: {
    name?: string
    description?: string
    price?: number
    condition?: string
    status?: string
    featured?: boolean
  }) {
    return this.request<{ message: string; data: any }>(
      `/admin/products/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      true
    )
  }

  async deleteAdminProduct(id: number) {
    return this.request<{ message: string }>(
      `/admin/products/${id}`,
      { method: 'DELETE' },
      true
    )
  }

  // Health check
  async healthCheck() {
    return this.request<{ success: boolean; message: string; version: string }>('/health')
  }
}

export const api = new ApiClient(API_BASE_URL)
