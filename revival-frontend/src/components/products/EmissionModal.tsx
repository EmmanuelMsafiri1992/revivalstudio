'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Leaf, Wind, Truck, TrendingDown, TreePine } from 'lucide-react'

interface Product {
  id: number
  name: string
  furniture_type?: {
    id: number
    name: string
    icon?: string | null
  }
}

interface EmissionData {
  product_name: string
  new_co2: number
  refurbished_co2: number
  transport_co2: number
  net_co2_saved: number
}

interface EmissionModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

// Hardcoded CO2 emission data (fallback)
const co2EmissionData: EmissionData[] = [
  { product_name: 'Dining Table (Wood)', new_co2: 120, refurbished_co2: 35, transport_co2: 10, net_co2_saved: 75 },
  { product_name: 'Sofa (3-Seater)', new_co2: 180, refurbished_co2: 50, transport_co2: 15, net_co2_saved: 115 },
  { product_name: 'Office Chair', new_co2: 60, refurbished_co2: 20, transport_co2: 5, net_co2_saved: 35 },
  { product_name: 'Wardrobe (2 Door)', new_co2: 150, refurbished_co2: 45, transport_co2: 12, net_co2_saved: 93 },
  { product_name: 'Coffee Table', new_co2: 70, refurbished_co2: 20, transport_co2: 6, net_co2_saved: 44 },
  { product_name: 'Bed Frame (Double)', new_co2: 130, refurbished_co2: 40, transport_co2: 10, net_co2_saved: 80 },
  { product_name: 'Bookshelf', new_co2: 90, refurbished_co2: 25, transport_co2: 8, net_co2_saved: 57 },
  { product_name: 'TV Unit', new_co2: 85, refurbished_co2: 22, transport_co2: 7, net_co2_saved: 56 },
  { product_name: 'Chest of Drawers', new_co2: 100, refurbished_co2: 30, transport_co2: 9, net_co2_saved: 61 },
  { product_name: 'Side Table', new_co2: 40, refurbished_co2: 12, transport_co2: 4, net_co2_saved: 24 },
  { product_name: 'Dining Chair', new_co2: 35, refurbished_co2: 10, transport_co2: 3, net_co2_saved: 22 },
  { product_name: 'Glass Dining Table', new_co2: 140, refurbished_co2: 50, transport_co2: 12, net_co2_saved: 78 },
  { product_name: 'Recliner Sofa', new_co2: 200, refurbished_co2: 65, transport_co2: 15, net_co2_saved: 120 },
  { product_name: 'Office Desk', new_co2: 110, refurbished_co2: 30, transport_co2: 9, net_co2_saved: 71 },
  { product_name: 'Kitchen Cabinet', new_co2: 160, refurbished_co2: 55, transport_co2: 12, net_co2_saved: 93 },
  { product_name: 'Bar Stool', new_co2: 30, refurbished_co2: 8, transport_co2: 3, net_co2_saved: 19 },
  { product_name: 'Shoe Rack', new_co2: 50, refurbished_co2: 15, transport_co2: 5, net_co2_saved: 30 },
  { product_name: 'Dressing Table', new_co2: 95, refurbished_co2: 28, transport_co2: 7, net_co2_saved: 60 },
  { product_name: 'Outdoor Bench', new_co2: 80, refurbished_co2: 25, transport_co2: 8, net_co2_saved: 47 },
  { product_name: 'Storage Cabinet', new_co2: 120, refurbished_co2: 35, transport_co2: 10, net_co2_saved: 75 },
]

// Fuzzy match: find best CO2 data entry for a given product name or furniture type name
function findBestMatch(productName: string, furnitureTypeName?: string): EmissionData {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '')

  const targets = [productName, furnitureTypeName || ''].filter(Boolean).map(normalize)

  let bestScore = -1
  let bestMatch = co2EmissionData[0]

  for (const entry of co2EmissionData) {
    const entryNorm = normalize(entry.product_name)
    const entryWords = entryNorm.split(' ')

    for (const target of targets) {
      const targetWords = target.split(' ')

      // Count overlapping words
      let score = 0
      for (const tw of targetWords) {
        if (tw.length < 3) continue
        for (const ew of entryWords) {
          if (ew.includes(tw) || tw.includes(ew)) {
            score += 2
          }
        }
      }

      // Direct substring match bonus
      if (entryNorm.includes(target) || target.includes(entryNorm)) {
        score += 5
      }

      if (score > bestScore) {
        bestScore = score
        bestMatch = entry
      }
    }
  }

  return bestMatch
}

export function EmissionModal({ product, isOpen, onClose }: EmissionModalProps) {
  const [emissionData, setEmissionData] = useState<EmissionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<'api' | 'fallback'>('fallback')

  useEffect(() => {
    async function fetchEmissionData() {
      if (!product) return

      setLoading(true)

      // Try API first
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
        const productName = encodeURIComponent(product.name)
        const response = await fetch(`${apiBase}/co2-emissions?product_name=${productName}`)

        if (response.ok) {
          const json = await response.json()
          if (json.data || json.new_co2 !== undefined) {
            const data = json.data || json
            setEmissionData({
              product_name: data.product_name || product.name,
              new_co2: data.new_co2,
              refurbished_co2: data.refurbished_co2,
              transport_co2: data.transport_co2,
              net_co2_saved: data.net_co2_saved,
            })
            setDataSource('api')
            setLoading(false)
            return
          }
        }
      } catch {
        // Silently fall through to hardcoded data
      }

      // Fall back to hardcoded data with fuzzy matching
      const match = findBestMatch(product.name, product.furniture_type?.name)
      setEmissionData(match)
      setDataSource('fallback')
      setLoading(false)
    }

    if (isOpen && product) {
      fetchEmissionData()
    }
  }, [product, isOpen])

  if (!product) return null

  const savingPercent = emissionData
    ? Math.round((emissionData.net_co2_saved / emissionData.new_co2) * 100)
    : 0

  const savingBarWidth = emissionData
    ? Math.min(100, Math.round((emissionData.net_co2_saved / emissionData.new_co2) * 100))
    : 0

  const statCards = emissionData
    ? [
        {
          label: 'New Product CO2',
          value: emissionData.new_co2,
          icon: Wind,
          bg: 'bg-red-50',
          text: 'text-red-700',
          iconColor: 'text-red-500',
          border: 'border-red-100',
          description: 'Manufacturing a new item',
        },
        {
          label: 'Refurbished CO2',
          value: emissionData.refurbished_co2,
          icon: Leaf,
          bg: 'bg-green-50',
          text: 'text-green-700',
          iconColor: 'text-green-500',
          border: 'border-green-100',
          description: 'Refurbishment process',
        },
        {
          label: 'Transport CO2',
          value: emissionData.transport_co2,
          icon: Truck,
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          iconColor: 'text-amber-500',
          border: 'border-amber-100',
          description: 'Delivery emissions',
        },
        {
          label: 'Net CO2 Saved',
          value: emissionData.net_co2_saved,
          icon: TrendingDown,
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          iconColor: 'text-emerald-500',
          border: 'border-emerald-200',
          description: 'Your environmental impact',
          highlight: true,
        },
      ]
    : []

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-5 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <TreePine className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">CO2 Impact</h2>
                    <p className="text-white/80 text-sm mt-0.5 line-clamp-1">{product.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Calculating CO2 impact...</p>
                </div>
              ) : emissionData ? (
                <>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {statCards.map((card) => {
                      const Icon = card.icon
                      return (
                        <motion.div
                          key={card.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`${card.bg} border ${card.border} rounded-xl p-3.5 ${
                            card.highlight ? 'ring-2 ring-emerald-400 ring-offset-1' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <Icon className={`w-4 h-4 ${card.iconColor}`} />
                            <span className={`text-xs font-medium ${card.text}`}>{card.label}</span>
                          </div>
                          <div className={`text-2xl font-bold ${card.text}`}>
                            {card.value}
                            <span className="text-sm font-normal ml-1">kg</span>
                          </div>
                          <div className={`text-xs mt-1 opacity-70 ${card.text}`}>{card.description}</div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Savings Bar */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-green-800">
                        You&apos;re saving {emissionData.net_co2_saved} kg of CO2
                      </span>
                      <span className="text-sm font-bold text-emerald-600">{savingPercent}%</span>
                    </div>

                    {/* Bar comparison */}
                    <div className="space-y-2">
                      {/* New product bar */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>New product</span>
                          <span>{emissionData.new_co2} kg CO2</span>
                        </div>
                        <div className="h-3 bg-red-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full w-full" />
                        </div>
                      </div>

                      {/* Refurbished bar */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Refurbished (you)</span>
                          <span>
                            {emissionData.refurbished_co2 + emissionData.transport_co2} kg CO2
                          </span>
                        </div>
                        <div className="h-3 bg-green-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.round(
                                ((emissionData.refurbished_co2 + emissionData.transport_co2) /
                                  emissionData.new_co2) *
                                  100
                              )}%`,
                            }}
                            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                            className="h-full bg-green-500 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Saved indicator */}
                      <div>
                        <div className="flex justify-between text-xs text-emerald-600 mb-1 font-medium">
                          <span>Net saved</span>
                          <span>{emissionData.net_co2_saved} kg CO2</span>
                        </div>
                        <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${savingBarWidth}%` }}
                            transition={{ duration: 0.9, delay: 0.45, ease: 'easeOut' }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-start gap-3 bg-green-700 text-white rounded-xl p-4"
                  >
                    <Leaf className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">By choosing refurbished, you&apos;re saving the environment!</p>
                      <p className="text-white/80 text-xs mt-1">
                        Every refurbished purchase helps reduce landfill waste and lowers carbon emissions.
                        Together we make a difference.
                      </p>
                    </div>
                  </motion.div>

                  {/* Net CO2 Saved highlight */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                    className="mt-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-4 text-white text-center"
                  >
                    <div className="text-xs font-medium uppercase tracking-wider text-white/80 mb-1">
                      Net CO2 Saved
                    </div>
                    <div className="text-4xl font-bold">
                      {emissionData.net_co2_saved}
                      <span className="text-xl font-normal ml-1">kg</span>
                    </div>
                    <div className="text-white/80 text-xs mt-1">
                      equivalent to planting ~{Math.round(emissionData.net_co2_saved / 21)} trees
                    </div>
                  </motion.div>

                  {dataSource === 'fallback' && (
                    <p className="text-xs text-center text-gray-400 mt-3">
                      * Estimates based on average furniture emission data
                    </p>
                  )}
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-4 bg-[#faf8f5] flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-green-700 text-white rounded-full font-semibold hover:bg-green-800 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
