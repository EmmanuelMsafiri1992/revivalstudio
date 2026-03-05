'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Calculator, Check, Loader2,
  Clock, Shield, TrendingUp, CheckCircle, MessageCircle, Sparkles,
  Tag, Calendar, Star, Package, Camera, Upload, X,
  BadgeCheck, Flame, TrendingDown, PoundSterling, Truck, Zap
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface FurnitureType {
  id: number
  name: string
  icon: string
}

const ageOptions = [
  { key: 'new', label: 'Like New', description: 'Under 1 year', icon: '✨', multiplier: 0.85 },
  { key: '1-3', label: '1-3 Years', description: 'Light use', icon: '📅', multiplier: 0.65 },
  { key: '3-5', label: '3-5 Years', description: 'Moderate use', icon: '📆', multiplier: 0.45 },
  { key: '5-10', label: '5-10 Years', description: 'Well used', icon: '🗓️', multiplier: 0.30 },
  { key: '10+', label: '10+ Years', description: 'Vintage', icon: '📜', multiplier: 0.20 },
  { key: 'antique', label: 'Antique', description: '50+ years', icon: '🏛️', multiplier: 0.50 },
]

const conditionOptions = [
  { key: 'excellent', label: 'Excellent', description: 'No visible wear, looks brand new', icon: '⭐', color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'good', label: 'Good', description: 'Minor wear, fully functional', icon: '👍', color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'fair', label: 'Fair', description: 'Visible wear, may need minor repairs', icon: '👌', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 'poor', label: 'Poor', description: 'Significant wear, needs repairs', icon: '🔧', color: 'text-red-600', bg: 'bg-red-50' },
]

const brandOptions = [
  { key: 'designer', label: 'Designer/Luxury', description: 'e.g. Ligne Roset, B&B Italia', icon: '💎', premium: true },
  { key: 'premium', label: 'Premium Brand', description: 'e.g. Made.com, Loaf, West Elm', icon: '🌟', premium: false },
  { key: 'standard', label: 'Standard Brand', description: 'e.g. IKEA, DFS, Habitat', icon: '🏷️', premium: false },
  { key: 'budget', label: 'Budget Brand', description: 'e.g. Argos, Wayfair basics', icon: '💰', premium: false },
  { key: 'unknown', label: 'Unknown/Custom', description: 'Unbranded or custom made', icon: '❓', premium: false },
]

const steps = [
  { num: 1, label: 'Item', icon: Package },
  { num: 2, label: 'Age', icon: Calendar },
  { num: 3, label: 'Condition', icon: Star },
  { num: 4, label: 'Brand', icon: Tag },
  { num: 5, label: 'Photos', icon: Camera },
  { num: 6, label: 'Value', icon: PoundSterling },
]

export default function SellPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([])
  const [selectedFurniture, setSelectedFurniture] = useState<number | null>(null)
  const [selectedAge, setSelectedAge] = useState<string>('')
  const [selectedCondition, setSelectedCondition] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [originalPrice, setOriginalPrice] = useState<string>('')
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [result, setResult] = useState<any>(null)
  const [animateResult, setAnimateResult] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getFurnitureTypes()
        setFurnitureTypes(res.data)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  async function calculateValue() {
    if (!selectedFurniture || !selectedAge || !selectedCondition) return

    setCalculating(true)
    try {
      const res = await api.calculateResale({
        furniture_type_id: selectedFurniture,
        age: selectedAge,
        condition: selectedCondition,
        brand_category: selectedBrand || 'standard',
        original_price: originalPrice ? parseFloat(originalPrice) : undefined,
      })
      setResult(res.data)
      setStep(6)
      setTimeout(() => setAnimateResult(true), 100)
    } catch (error) {
      console.error('Error calculating:', error)
    } finally {
      setCalculating(false)
    }
  }

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadedPhotos(prev => [...prev, event.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }, [])

  function removePhoto(index: number) {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  function resetWizard() {
    setStep(1)
    setSelectedFurniture(null)
    setSelectedAge('')
    setSelectedCondition('')
    setSelectedBrand('')
    setOriginalPrice('')
    setUploadedPhotos([])
    setDescription('')
    setResult(null)
    setAnimateResult(false)
  }

  // Get demand level based on furniture type and condition
  const getDemandLevel = () => {
    const highDemand = ['Sofa', 'Bed', 'Dining Table', 'Wardrobe']
    const furnitureName = furnitureTypes.find(f => f.id === selectedFurniture)?.name || ''
    if (highDemand.some(item => furnitureName.includes(item))) {
      return { level: 'High', color: 'text-green-600', bg: 'bg-green-100', icon: Flame }
    }
    if (selectedCondition === 'excellent' || selectedCondition === 'good') {
      return { level: 'Medium', color: 'text-blue-600', bg: 'bg-blue-100', icon: TrendingUp }
    }
    return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: TrendingDown }
  }

  // Calculate confidence score
  const getConfidenceScore = () => {
    let score = 60
    if (originalPrice) score += 15
    if (uploadedPhotos.length > 0) score += 15
    if (description.length > 20) score += 10
    return Math.min(score, 100)
  }

  // Get best time to sell
  const getBestTimeToSell = () => {
    const month = new Date().getMonth()
    // Spring/Summer (March-August) is generally better for furniture
    if (month >= 2 && month <= 7) {
      return { time: 'Now is great!', reason: 'Spring/Summer is peak season for furniture sales' }
    }
    return { time: 'Good timing', reason: 'Autumn/Winter still sees steady demand' }
  }

  const selectedFurnitureName = furnitureTypes.find(f => f.id === selectedFurniture)?.name || ''

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-10 h-10 animate-spin text-[#7a9b76] mb-4" />
        <p className="text-[#666]">Loading valuation options...</p>
      </div>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#7a9b76] text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a962]/20 rounded-full text-[#c9a962] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Market Analysis
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Instant Resale Value
              <span className="text-[#c9a962]"> Generator</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Discover what your furniture is worth in under 60 seconds. Our AI analyzes market data, demand trends, and condition factors to give you a fair, transparent valuation.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-5 h-5 text-[#c9a962]" />
                <span>Instant Valuation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-5 h-5 text-[#c9a962]" />
                <span>Market-Based Pricing</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-5 h-5 text-[#c9a962]" />
                <span>Free Collection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wizard */}
      <section className="py-8 sm:py-12 px-4 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-gradient-to-r from-[#3d4a3a] to-[#4a5a46] p-4 sm:p-6">
              <div className="flex justify-between items-center max-w-2xl mx-auto">
                {steps.map((s, idx) => (
                  <div key={s.num} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        s.num === step
                          ? 'bg-[#c9a962] text-[#3d4a3a] ring-4 ring-[#c9a962]/30'
                          : s.num < step
                            ? 'bg-[#7a9b76] text-white'
                            : 'bg-white/20 text-white/60'
                      }`}>
                        {s.num < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                      </div>
                      <span className={`text-[9px] sm:text-xs mt-1 font-medium hidden sm:block ${s.num <= step ? 'text-white' : 'text-white/50'}`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-4 sm:w-10 lg:w-14 h-0.5 mx-0.5 sm:mx-1 mb-0 sm:mb-5 ${s.num < step ? 'bg-[#7a9b76]' : 'bg-white/20'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <AnimatePresence mode="wait">
                {/* Step 1: Furniture Type */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                        Step 1 of 5
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">What are you selling?</h3>
                      <p className="text-sm text-[#666] mt-2">Select the furniture type that best matches your item</p>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
                      {furnitureTypes.map(type => (
                        <button key={type.id} onClick={() => setSelectedFurniture(type.id)} className={`p-3 sm:p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${selectedFurniture === type.id ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'}`}>
                          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{type.icon}</div>
                          <div className="text-xs sm:text-sm font-medium text-[#3d4a3a]">{type.name}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end mt-8">
                      <button onClick={() => setStep(2)} disabled={!selectedFurniture} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
                        Continue <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Age */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                        Step 2 of 5
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">How old is your furniture?</h3>
                      <p className="text-sm text-[#666] mt-2">Age affects value - but antiques can be worth more!</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {ageOptions.map(opt => (
                        <button key={opt.key} onClick={() => setSelectedAge(opt.key)} className={`p-4 sm:p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${selectedAge === opt.key ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'}`}>
                          <div className="text-2xl sm:text-3xl mb-2">{opt.icon}</div>
                          <div className="text-sm font-semibold text-[#3d4a3a]">{opt.label}</div>
                          <div className="text-xs text-[#666]">{opt.description}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(3)} disabled={!selectedAge} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Condition */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                        Step 3 of 5
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">What condition is it in?</h3>
                      <p className="text-sm text-[#666] mt-2">Be honest - it helps us give you an accurate valuation</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {conditionOptions.map(opt => (
                        <button key={opt.key} onClick={() => setSelectedCondition(opt.key)} className={`p-4 sm:p-5 rounded-xl border-2 transition-all text-left hover:scale-[1.01] ${selectedCondition === opt.key ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'}`}>
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 ${opt.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <span className="text-2xl">{opt.icon}</span>
                            </div>
                            <div>
                              <div className={`font-semibold ${opt.color}`}>{opt.label}</div>
                              <div className="text-sm text-[#666]">{opt.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(4)} disabled={!selectedCondition} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Brand & Price */}
                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                        Step 4 of 5
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Tell us about the brand</h3>
                      <p className="text-sm text-[#666] mt-2">Designer brands often retain more value</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                      {brandOptions.map(opt => (
                        <button key={opt.key} onClick={() => setSelectedBrand(opt.key)} className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left relative ${selectedBrand === opt.key ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'}`}>
                          {opt.premium && (
                            <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#c9a962] text-[#3d4a3a] text-[10px] font-bold rounded-full">PREMIUM</span>
                          )}
                          <div className="text-xl sm:text-2xl mb-1">{opt.icon}</div>
                          <div className="font-medium text-[#3d4a3a] text-xs sm:text-sm">{opt.label}</div>
                          <div className="text-[10px] sm:text-xs text-[#666] line-clamp-1">{opt.description}</div>
                        </button>
                      ))}
                    </div>
                    <div className="bg-[#faf8f5] rounded-xl p-4 sm:p-6 mb-6">
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">
                        <PoundSterling className="w-4 h-4 inline mr-1" />
                        Original Purchase Price (optional but recommended)
                      </label>
                      <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="e.g. 500" className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none" />
                      <p className="text-xs text-[#666] mt-2">Helps us calculate depreciation more accurately</p>
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(3)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(5)} disabled={!selectedBrand} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Photos */}
                {step === 5 && (
                  <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                        Step 5 of 5 (Optional)
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Add photos of your furniture</h3>
                      <p className="text-sm text-[#666] mt-2">Photos increase buyer interest and help us verify condition</p>
                    </div>

                    {/* Photo Upload Area */}
                    <div className="mb-6">
                      <label className="block">
                        <div className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                          uploadedPhotos.length > 0 ? 'border-[#7a9b76] bg-[#7a9b76]/5' : 'border-[#e5e5e5] hover:border-[#7a9b76]'
                        }`}>
                          <Upload className="w-10 h-10 mx-auto mb-3 text-[#7a9b76]" />
                          <p className="font-medium text-[#3d4a3a]">Click to upload photos</p>
                          <p className="text-sm text-[#666] mt-1">JPG, PNG up to 10MB each</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Uploaded Photos Preview */}
                    {uploadedPhotos.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                        {uploadedPhotos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-20 sm:h-24 object-cover rounded-lg" />
                            <button onClick={() => removePhoto(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">
                        Additional details (optional)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Comes from a smoke-free home, includes matching cushions..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none resize-none"
                      />
                    </div>

                    {/* Accuracy Indicator */}
                    <div className="bg-[#faf8f5] rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#3d4a3a]">Valuation Accuracy</span>
                        <span className="text-sm font-bold text-[#7a9b76]">{getConfidenceScore()}%</span>
                      </div>
                      <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getConfidenceScore()}%` }}
                          className="h-full bg-gradient-to-r from-[#7a9b76] to-[#c9a962] rounded-full"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(4)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={calculateValue} disabled={calculating} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#c9a962] text-[#3d4a3a] rounded-full font-bold hover:bg-[#d4b46d] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50">
                        {calculating ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Sparkles className="w-5 h-5" /> Get AI Valuation</>}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Results */}
                {step === 6 && result && (
                  <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                        <Sparkles className="w-4 h-4" />
                        AI Market Valuation
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Your Furniture Valuation</h3>
                    </div>

                    {/* Main Value Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={animateResult ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#7a9b76] rounded-2xl p-6 sm:p-8 text-center text-white mb-6"
                    >
                      <p className="text-white/80 mb-2">Estimated Resale Value</p>
                      <p className="text-4xl sm:text-5xl font-bold text-[#c9a962] mb-3">
                        {formatCurrency(result.estimated_min)} - {formatCurrency(result.estimated_max)}
                      </p>
                      <div className="flex justify-center gap-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-sm">
                          <BadgeCheck className="w-4 h-4" /> {getConfidenceScore()}% Confidence
                        </span>
                      </div>
                    </motion.div>

                    {/* Market Insights */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={animateResult ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.4 }}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6"
                    >
                      <div className="bg-[#faf8f5] rounded-xl p-4 text-center">
                        <div className={`w-10 h-10 mx-auto mb-2 ${getDemandLevel().bg} rounded-full flex items-center justify-center`}>
                          {(() => { const IconComp = getDemandLevel().icon; return <IconComp className={`w-5 h-5 ${getDemandLevel().color}`} />; })()}
                        </div>
                        <div className="text-xs text-[#666]">Market Demand</div>
                        <div className={`font-bold ${getDemandLevel().color}`}>{getDemandLevel().level}</div>
                      </div>
                      <div className="bg-[#faf8f5] rounded-xl p-4 text-center">
                        <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                          <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-xs text-[#666]">Sell Timing</div>
                        <div className="font-bold text-blue-600">{getBestTimeToSell().time}</div>
                      </div>
                      <div className="bg-[#faf8f5] rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                        <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                          <Truck className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-xs text-[#666]">Collection</div>
                        <div className="font-bold text-green-600">FREE</div>
                      </div>
                    </motion.div>

                    {/* Summary */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={animateResult ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.5 }}
                      className="bg-[#faf8f5] rounded-xl p-4 sm:p-6 mb-6"
                    >
                      <h4 className="font-semibold text-[#3d4a3a] mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#c9a962]" />
                        Valuation Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-[#666]">Item:</span><p className="font-medium text-[#3d4a3a]">{result.furniture_type.name}</p></div>
                        <div><span className="text-[#666]">Age:</span><p className="font-medium text-[#3d4a3a]">{result.age.name}</p></div>
                        <div><span className="text-[#666]">Condition:</span><p className="font-medium text-[#3d4a3a]">{result.condition.name}</p></div>
                        <div><span className="text-[#666]">Brand Tier:</span><p className="font-medium text-[#3d4a3a]">{result.brand.name}</p></div>
                      </div>
                    </motion.div>

                    {/* What Happens Next */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={animateResult ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.6 }}
                      className="bg-[#25D366]/10 rounded-xl p-4 sm:p-6 mb-6"
                    >
                      <h4 className="font-semibold text-[#3d4a3a] mb-3">Ready to sell?</h4>
                      <div className="space-y-2 text-sm text-[#666] mb-4">
                        <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#25D366]" /> Contact us on WhatsApp</p>
                        <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#25D366]" /> We arrange FREE collection</p>
                        <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#25D366]" /> Get paid within 24 hours</p>
                      </div>
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={animateResult ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.7 }}
                      className="flex flex-col sm:flex-row justify-center gap-3"
                    >
                      <a
                        href={`https://wa.me/447570578520?text=Hi, I want to sell my ${selectedFurnitureName}. AI Valuation: ${formatCurrency(result.estimated_min)} - ${formatCurrency(result.estimated_max)}. Condition: ${result.condition.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#128C7E] transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Sell via WhatsApp
                      </a>
                      <button onClick={resetWizard} className="px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors">
                        New Valuation
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Why Sell With Us */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d4a3a] text-center mb-8 sm:mb-12">
            Why Sell With Revival Studio?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, title: 'Best Market Rates', description: 'Our AI analyzes current market trends to ensure you get a fair price.' },
              { icon: Truck, title: 'Free Collection', description: 'We collect your furniture for free from anywhere in the UK.' },
              { icon: Zap, title: 'Fast Payment', description: 'Get paid within 24 hours of collection - no waiting around.' },
              { icon: CheckCircle, title: 'Eco-Friendly', description: 'Your furniture gets a new life instead of ending up in landfill.' },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-[#faf8f5] hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#7a9b76]/20 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-[#7a9b76]" />
                </div>
                <h3 className="font-semibold text-[#3d4a3a] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#666]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
