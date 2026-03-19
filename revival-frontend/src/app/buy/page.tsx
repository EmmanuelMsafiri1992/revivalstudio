import { BuyPageClient } from './BuyPageClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.revivalstudio.uk/api'

async function getInitialData() {
  try {
    const [typesRes, productsRes] = await Promise.all([
      fetch(`${API_URL}/furniture-types`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/products?page=1&per_page=12&sort=created_at&order=desc`, { next: { revalidate: 60 } }),
    ])
    const [typesData, productsData] = await Promise.all([typesRes.json(), productsRes.json()])
    return {
      furnitureTypes: typesData.data || [],
      initialProducts: productsData.data || [],
      initialTotalPages: productsData.last_page || 1,
      initialTotal: productsData.total || 0,
    }
  } catch {
    return { furnitureTypes: [], initialProducts: [], initialTotalPages: 1, initialTotal: 0 }
  }
}

export default async function BuyPage() {
  const initialData = await getInitialData()
  return <BuyPageClient {...initialData} />
}
