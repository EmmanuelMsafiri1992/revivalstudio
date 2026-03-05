export interface FurnitureType {
  id: number
  name: string
  slug: string
  icon: string
  base_repair_cost: number
  base_value: number
}

export interface Material {
  id: number
  name: string
  slug: string
  icon: string
  repair_multiplier: number
}

export interface DamageType {
  id: number
  name: string
  slug: string
  icon: string
  repair_cost: number
}

export interface RepairEstimate {
  furniture_type: {
    id: number
    name: string
    base_cost: number
  }
  material: {
    id: number
    name: string
    multiplier: number
  }
  damages: Array<{
    id: number
    name: string
    cost: number
  }>
  damage_total: number
  estimated_min: number
  estimated_max: number
  currency: string
}

export interface ResaleEstimate {
  furniture_type: {
    id: number
    name: string
    base_value: number
  }
  age: {
    key: string
    name: string
    factor: number
  }
  condition: {
    key: string
    name: string
    factor: number
  }
  brand: {
    key: string
    name: string
    factor: number
  }
  original_price: number | null
  base_value_used: number
  estimated_min: number
  estimated_max: number
  currency: string
}

export interface RoomPlan {
  room: {
    type: string
    name: string
    icon: string
  }
  size: {
    key: string
    name: string
    maxItems: number
  }
  style: {
    key: string
    name: string
    priceMultiplier: number
  }
  budget: number | null
  items: RoomPlanItem[]
  total_cost: number
  within_budget: boolean
  currency: string
}

export interface RoomPlanItem {
  id: number
  name: string
  furniture_type: string
  furniture_type_icon: string
  original_price: number
  adjusted_price: number
  style: string
  image: string | null
  selected: boolean
}

export interface Outlet {
  id: number
  name: string
  email: string
  location: string
  phone?: string
  address?: string
}

export interface InventoryItem {
  id: number
  outlet_id: number
  furniture_type_id: number | null
  item_name: string
  description: string | null
  customer_name: string | null
  status: 'pending' | 'collected' | 'repair' | 'sale' | 'sold'
  repair_cost: number | null
  sale_price: number | null
  created_at: string
  furniture_type?: FurnitureType
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}
