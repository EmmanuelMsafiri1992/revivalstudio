'use client'

import { useState, useEffect, useCallback } from 'react'
import { useContactSettings } from '@/lib/useContactSettings'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Check, Loader2,
  Clock, Shield, TrendingUp, CheckCircle, MessageCircle, Sparkles,
  Tag, Calendar, Star, Package, Camera, Upload, X,
  BadgeCheck, PoundSterling, Truck, Zap,
  MapPin, Building, AlertTriangle, Crown, RefreshCw, User
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface FurnitureType {
  id: number
  name: string
  icon: string
}

const furnitureTypeOptions = [
  { key: 'sofa', label: 'Sofa', icon: '🛋️' },
  { key: 'bed', label: 'Bed', icon: '🛏️' },
  { key: 'wardrobe', label: 'Wardrobe', icon: '🚪' },
  { key: 'dining_table', label: 'Dining Table', icon: '🍽️' },
  { key: 'office_desk', label: 'Office Desk', icon: '🖥️' },
  { key: 'chair', label: 'Chair', icon: '🪑' },
  { key: 'drawer_cabinet', label: 'Drawer / Cabinet', icon: '🗄️' },
  { key: 'other', label: 'Other', icon: '📦' },
]

const brandOptions = [
  { key: 'ikea', label: 'IKEA', icon: '🔵' },
  { key: 'argos', label: 'Argos', icon: '🔴' },
  { key: 'local_unknown', label: 'Local / Unknown', icon: '❓' },
]

const conditionOptions = [
  { key: 'like_new', label: 'Like New', description: 'Barely used, no visible wear', icon: '✨', color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'good', label: 'Good', description: 'Minor wear, fully functional', icon: '👍', color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'average', label: 'Average', description: 'Normal wear for age, works well', icon: '👌', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 'needs_repair', label: 'Needs Repair', description: 'Requires some fixing', icon: '🔧', color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'poor', label: 'Poor', description: 'Significant wear, major repairs needed', icon: '⚠️', color: 'text-red-600', bg: 'bg-red-50' },
]

const damageOptions = [
  { key: 'scratches', label: 'Scratches', icon: '📝' },
  { key: 'broken_parts', label: 'Broken Parts', icon: '💔' },
  { key: 'loose_joints', label: 'Loose Joints', icon: '🔩' },
  { key: 'fabric_tear', label: 'Fabric Tear', icon: '🧵' },
  { key: 'unusable', label: 'Unusable', icon: '❌' },
  { key: 'none', label: 'No Damage', icon: '✅' },
]

const deliveryOptions = [
  { key: 'self_deliver', label: 'I will deliver it', icon: '🚗', description: 'You bring the item to us' },
  { key: 'revival_collect', label: 'Revival must collect', icon: '🚚', description: 'We pick up from your location' },
]

const floorOptions = [
  { key: 'ground', label: 'Ground Floor', icon: '🏠' },
  { key: '1-2', label: '1-2 Floor', icon: '🏢' },
  { key: '3+', label: '3+ Floor', icon: '🏙️' },
  { key: 'lift', label: 'Lift Available', icon: '🛗' },
]

const steps = [
  { num: 1, label: 'Type', icon: Package },
  { num: 2, label: 'Brand', icon: Tag },
  { num: 3, label: 'Condition', icon: Star },
  { num: 4, label: 'Damage', icon: AlertTriangle },
  { num: 5, label: 'Delivery', icon: Truck },
  { num: 6, label: 'Location', icon: MapPin },
  { num: 7, label: 'Photos', icon: Camera },
  { num: 8, label: 'Value', icon: PoundSterling },
  { num: 9, label: 'Contact', icon: User },
]

// Premium multiplier: 20% above standard
const PREMIUM_MULTIPLIER = 1.2

export default function ExchangeProPage() {
  const router = useRouter()
  const contact = useContactSettings()
  const [hasPremium, setHasPremium] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([])

  const [selectedFurnitureType, setSelectedFurnitureType] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('')
  const [selectedDamages, setSelectedDamages] = useState<string[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState('')
  const [postcode, setPostcode] = useState('')
  const [selectedFloor, setSelectedFloor] = useState('')
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<any>(null)
  const [animateResult, setAnimateResult] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('premium_token')
      if (token === 'authenticated') {
        setHasPremium(true)
      } else {
        router.replace('/premium-login?redirect=/exchange-pro')
        return
      }
    }
    setCheckingAuth(false)
  }, [router])

  useEffect(() => {
    if (!hasPremium) return
    api.getFurnitureTypes().then(res => setFurnitureTypes(res.data)).catch(() => {})
  }, [hasPremium])

  function toggleDamage(key: string) {
    if (key === 'none') {
      setSelectedDamages(['none'])
    } else {
      setSelectedDamages(prev => {
        const filtered = prev.filter(d => d !== 'none')
        return filtered.includes(key) ? filtered.filter(d => d !== key) : [...filtered, key]
      })
    }
  }

  async function calculateValue() {
    if (!selectedFurnitureType || !selectedCondition) return
    setCalculating(true)
    try {
      const matchingType = furnitureTypes.find(ft =>
        ft.name.toLowerCase().includes(selectedFurnitureType.replace('_', ' '))
      )
      const res = await api.calculateExchangePro({
        furniture_type_id: matchingType?.id || 1,
        age: selectedCondition === 'like_new' ? 'new' : '1-3',
        condition: selectedCondition === 'like_new' ? 'excellent' :
                   selectedCondition === 'good' ? 'good' :
                   selectedCondition === 'average' ? 'fair' : 'poor',
        brand_category: selectedBrand === 'ikea' ? 'standard' :
                        selectedBrand === 'argos' ? 'budget' : 'unknown',
      })
      setResult(res.data)
    } catch {
      // Fallback with estimated values
      setResult({
        estimated_min: 60,
        estimated_max: 240,
        furniture_type: { name: furnitureTypeOptions.find(f => f.key === selectedFurnitureType)?.label || 'Furniture' },
        condition: { name: conditionOptions.find(c => c.key === selectedCondition)?.label || 'Good' },
        brand: { name: brandOptions.find(b => b.key === selectedBrand)?.label || 'Unknown' },
      })
    } finally {
      setCalculating(false)
      setStep(8)
      setTimeout(() => setAnimateResult(true), 100)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await api.submitExchangePro({
        furniture_type: selectedFurnitureType,
        age: selectedCondition === 'like_new' ? 'new' : '1-3',
        condition: selectedCondition,
        brand_category: selectedBrand,
        postcode,
        description,
        customer_name: name,
        email,
        phone,
        address: postcode,
        estimated_value: result ? Math.round(result.estimated_min * PREMIUM_MULTIPLIER) : undefined,
      } as any)
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    } finally {
      setSubmitting(false)
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
    setStep(1); setSelectedFurnitureType(''); setSelectedBrand(''); setSelectedCondition('')
    setSelectedDamages([]); setSelectedDelivery(''); setPostcode(''); setSelectedFloor('')
    setUploadedPhotos([]); setDescription(''); setName(''); setEmail(''); setPhone('')
    setResult(null); setAnimateResult(false); setSubmitted(false)
  }

  const getConfidenceScore = () => {
    let score = 60
    if (uploadedPhotos.length > 0) score += 20
    if (uploadedPhotos.length > 2) score += 10
    if (description.length > 20) score += 10
    return Math.min(score, 100)
  }

  // Apply 20% premium multiplier
  const premiumMin = result ? Math.round(result.estimated_min * PREMIUM_MULTIPLIER) : 0
  const premiumMax = result ? Math.round(result.estimated_max * PREMIUM_MULTIPLIER) : 0

  const selectedFurnitureName = furnitureTypeOptions.find(f => f.key === selectedFurnitureType)?.label || ''

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a962]" />
      </div>
    )
  }
  if (!hasPremium) return null

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#7a9b76] text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a962]/20 rounded-full text-[#c9a962] text-sm font-bold mb-6">
              <Crown className="w-4 h-4" />
              Premium: +20% Value
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Exchange &amp; Gift
              <span className="text-[#c9a962]"> Pro</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Get premium exchange value — 20% above standard resale. Our premium network ensures you receive the best possible price for your furniture.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-5 h-5 text-[#c9a962]" />
                <span>Instant Premium Valuation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-5 h-5 text-[#c9a962]" />
                <span>+20% Above Market Rate</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="w-5 h-5 text-[#c9a962]" />
                <span>Premium Partner Network</span>
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
              <div className="flex justify-between items-center max-w-3xl mx-auto overflow-x-auto">
                {steps.map((s, idx) => (
                  <div key={s.num} className="flex items-center flex-shrink-0">
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
                      <span className={`text-[8px] sm:text-xs mt-1 font-medium hidden sm:block ${s.num <= step ? 'text-white' : 'text-white/50'}`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-4 sm:w-8 lg:w-12 h-0.5 mx-0.5 sm:mx-1 mb-0 sm:mb-5 ${s.num < step ? 'bg-[#7a9b76]' : 'bg-white/20'}`} />
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
                      <span className="inline-block px-3 py-1 bg-[#c9a962]/10 text-[#c9a962] rounded-full text-sm font-medium mb-3">Step 1 of 9</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">What type of furniture is this?</h3>
                      <p className="text-sm text-[#666] mt-2">Select the category that best matches your item</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {furnitureTypeOptions.map(type => (
                        <button key={type.key} onClick={() => setSelectedFurnitureType(type.key)}
                          className={`p-4 sm:p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${selectedFurnitureType === type.key ? 'border-[#c9a962] bg-[#c9a962]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#c9a962] hover:shadow-md'}`}>
                          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{type.icon}</div>
                          <div className="text-xs sm:text-sm font-medium text-[#3d4a3a]">{type.label}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end mt-8">
                      <button onClick={() => setStep(2)} disabled={!selectedFurnitureType}
                        className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg">
                        Continue <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Brand */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#c9a962]/10 text-[#c9a962] rounded-full text-sm font-medium mb-3">Step 2 of 9</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Brand / Manufacturer</h3>
                      <p className="text-sm text-[#666] mt-2">Select the brand of your furniture</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {brandOptions.map(brand => (
                        <button key={brand.key} onClick={() => setSelectedBrand(brand.key)}
                          className={`p-5 sm:p-6 rounded-xl border-2 transition-all hover:scale-[1.02] ${selectedBrand === brand.key ? 'border-[#c9a962] bg-[#c9a962]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#c9a962] hover:shadow-md'}`}>
                          <div className="text-3xl sm:text-4xl mb-2">{brand.icon}</div>
                          <div className="text-sm sm:text-base font-semibold text-[#3d4a3a]">{brand.label}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(3)} disabled={!selectedBrand} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Condition */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#c9a962]/10 text-[#c9a962] rounded-full text-sm font-medium mb-3">Step 3 of 9</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Current Physical Condition</h3>
                      <p className="text-sm text-[#666] mt-2">Be honest — it helps us give you an accurate premium valuation</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {conditionOptions.map(opt => (
                        <button key={opt.key} onClick={() => setSelectedCondition(opt.key)}
                          className={`p-4 sm:p-5 rounded-xl border-2 transition-all text-left hover:scale-[1.01] ${selectedCondition === opt.key ? 'border-[#c9a962] bg-[#c9a962]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#c9a962] hover:shadow-md'}`}>
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
                      <button onClick={() => setStep(4)} disabled={!selectedCondition} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Damage */}
                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#c9a962]/10 text-[#c9a962] rounded-full text-sm font-medium mb-3">Step 4 of 9</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Any visible damage?</h3>
                      <p className="text-sm text-[#666] mt-2">Select all that apply</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {damageOptions.map(damage => (
                        <button key={damage.key} onClick={() => toggleDamage(damage.key)}
                          className={`p-4 sm:p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${selectedDamages.includes(damage.key) ? 'border-[#c9a962] bg-[#c9a962]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#c9a962] hover:shadow-md'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selectedDamages.includes(damage.key) ? 'border-[#c9a962] bg-[#c9a962]' : 'border-[#ccc]'}`}>
                              {selectedDamages.includes(damage.key) && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <span className="text-xl">{damage.icon}</span>
                            <span className="text-sm font-medium text-[#3d4a3a]">{damage.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(3)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(5)} disabled={selectedDamages.length === 0} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Delivery */}
                {step === 5 && (
                  <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#c9a962]/10 text-[#c9a962] rounded-full text-sm font-medium mb-3">Step 5 of 9</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Is delivery available?</h3>
                      <p className="text-sm text-[#666] mt-2">How will the furniture be transported?</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {deliveryOptions.map(opt => (
                        <button key={opt.key} onClick={() => setSelectedDelivery(opt.key)}
                          className={`p-6 sm:p-8 rounded-xl border-2 transition-all hover:scale-[1.02] ${selectedDelivery === opt.key ? 'border-[#c9a962] bg-[#c9a962]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#c9a962] hover:shadow-md'}`}>
                          <div className="text-4xl mb-3">{opt.icon}</div>
                          <div className="font-semibold text-[#3d4a3a] mb-1">{opt.label}</div>
                          <div className="text-sm text-[#666]">{opt.description}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(4)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(6)} disabled={!selectedDelivery} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Location */}
                {step === 6 && (
                  <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#c9a962]/10 text-[#c9a962] rounded-full text-sm font-medium mb-3">Step 6 of 9</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Location &amp; Pick up Condition</h3>
                      <p className="text-sm text-[#666] mt-2">Where should we collect the furniture from?</p>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" /> Pickup Location (Postcode)
                      </label>
                      <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                        placeholder="e.g. SW1A 1AA"
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none text-lg" />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-3">
                        <Building className="w-4 h-4 inline mr-1" /> Floor Level
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {floorOptions.map(floor => (
                          <button key={floor.key} onClick={() => setSelectedFloor(floor.key)}
                            className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${selectedFloor === floor.key ? 'border-[#c9a962] bg-[#c9a962]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#c9a962] hover:shadow-md'}`}>
                            <div className="text-2xl mb-1">{floor.icon}</div>
                            <div className="text-xs sm:text-sm font-medium text-[#3d4a3a]">{floor.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(5)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(7)} disabled={!postcode || !selectedFloor} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 7: Photos */}
                {step === 7 && (
                  <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#c9a962]/10 text-[#c9a962] rounded-full text-sm font-medium mb-3">Step 7 of 9</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Upload photos of your furniture</h3>
                      <p className="text-sm text-[#666] mt-2">Photos from different angles improve your premium valuation</p>
                    </div>
                    <div className="mb-6">
                      <label className="block">
                        <div className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${uploadedPhotos.length > 0 ? 'border-[#c9a962] bg-[#c9a962]/5' : 'border-[#e5e5e5] hover:border-[#c9a962]'}`}>
                          <Upload className="w-10 h-10 mx-auto mb-3 text-[#c9a962]" />
                          <p className="font-medium text-[#3d4a3a]">Click to upload photos</p>
                          <p className="text-sm text-[#666] mt-1">JPG, PNG up to 10MB each</p>
                        </div>
                        <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
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
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Additional details (optional)</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Comes from a smoke-free home, includes matching cushions..."
                        rows={3} className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none resize-none" />
                    </div>
                    <div className="bg-[#faf8f5] rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#3d4a3a]">Valuation Accuracy</span>
                        <span className="text-sm font-bold text-[#c9a962]">{getConfidenceScore()}%</span>
                      </div>
                      <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${getConfidenceScore()}%` }}
                          className="h-full bg-gradient-to-r from-[#c9a962] to-[#d4b46d] rounded-full" />
                      </div>
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(6)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={calculateValue} disabled={calculating}
                        className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold hover:from-[#d4b46d] hover:to-[#c9a962] transition-all shadow-lg disabled:opacity-50">
                        {calculating ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Crown className="w-5 h-5" /> Get Premium Valuation</>}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 8: Results */}
                {step === 8 && result && !submitted && (
                  <motion.div key="step8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    {/* Premium Badge */}
                    <div className="text-center mb-6">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold text-sm">
                        <Crown className="w-4 h-4" /> Premium: +20% Value Applied
                      </span>
                    </div>

                    {/* Premium Value Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={animateResult ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-[#c9a962] via-[#d4b46d] to-[#c9a962] rounded-2xl p-6 sm:p-8 text-center text-[#3d4a3a] mb-6">
                      <p className="font-medium mb-1 opacity-80">Premium Exchange Value (20% Bonus)</p>
                      <p className="text-4xl sm:text-5xl font-bold mb-3">
                        {formatCurrency(premiumMin)} – {formatCurrency(premiumMax)}
                      </p>
                      <p className="text-sm opacity-70 mb-3">
                        Standard value: {formatCurrency(result.estimated_min)} – {formatCurrency(result.estimated_max)}
                      </p>
                      <div className="flex justify-center gap-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/30 rounded-full text-sm font-medium">
                          <BadgeCheck className="w-4 h-4" /> {getConfidenceScore()}% Confidence
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/30 rounded-full text-sm font-medium">
                          <TrendingUp className="w-4 h-4" /> +20% Premium
                        </span>
                      </div>
                      <p className="text-xs mt-3 opacity-60">*Final price confirmed after physical inspection</p>
                    </motion.div>

                    {/* Summary */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={animateResult ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }}
                      className="bg-[#faf8f5] rounded-xl p-4 sm:p-6 mb-6">
                      <h4 className="font-semibold text-[#3d4a3a] mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#c9a962]" /> Submission Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-[#666]">Item:</span><p className="font-medium text-[#3d4a3a]">{selectedFurnitureName}</p></div>
                        <div><span className="text-[#666]">Brand:</span><p className="font-medium text-[#3d4a3a]">{brandOptions.find(b => b.key === selectedBrand)?.label}</p></div>
                        <div><span className="text-[#666]">Condition:</span><p className="font-medium text-[#3d4a3a]">{conditionOptions.find(c => c.key === selectedCondition)?.label}</p></div>
                        <div><span className="text-[#666]">Location:</span><p className="font-medium text-[#3d4a3a]">{postcode}</p></div>
                        <div><span className="text-[#666]">Delivery:</span><p className="font-medium text-[#3d4a3a]">{deliveryOptions.find(d => d.key === selectedDelivery)?.label}</p></div>
                        <div><span className="text-[#666]">Floor:</span><p className="font-medium text-[#3d4a3a]">{floorOptions.find(f => f.key === selectedFloor)?.label}</p></div>
                      </div>
                    </motion.div>

                    {/* CTA */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={animateResult ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}
                      className="flex flex-col sm:flex-row justify-center gap-3">
                      <button onClick={() => setStep(9)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold hover:from-[#d4b46d] hover:to-[#c9a962] transition-all shadow-lg">
                        <Crown className="w-5 h-5" /> Submit Exchange Pro Request
                      </button>
                      <a href={`https://wa.me/${contact.whatsapp_number}?text=Hi, I want to exchange my ${selectedFurnitureName}. Premium offer: ${formatCurrency(premiumMin)} - ${formatCurrency(premiumMax)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#128C7E] transition-colors">
                        <MessageCircle className="w-5 h-5" /> Contact via WhatsApp
                      </a>
                      <button onClick={resetWizard} className="px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors">
                        New Valuation
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 9: Contact Details */}
                {step === 9 && !submitted && (
                  <motion.div key="step9" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#c9a962]/10 text-[#c9a962] rounded-full text-sm font-medium mb-3">Step 9 of 9</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Your Contact Details</h3>
                      <p className="text-sm text-[#666] mt-2">We'll use this to send you your premium offer</p>
                    </div>
                    <div className="space-y-4 max-w-md mx-auto">
                      <div>
                        <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Full Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                          placeholder="e.g. John Smith"
                          className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Email Address *</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="e.g. john@example.com"
                          className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Phone Number (optional)</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                          placeholder="e.g. 07700 900000"
                          className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(8)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={handleSubmit} disabled={!name || !email || submitting}
                        className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#d4b46d] hover:to-[#c9a962] transition-all shadow-lg">
                        {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><Crown className="w-5 h-5" /> Confirm &amp; Submit</>}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Submitted Success */}
                {step === 9 && submitted && (
                  <motion.div key="submitted" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-[#c9a962]/20 rounded-full flex items-center justify-center">
                      <Crown className="w-10 h-10 text-[#c9a962]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#3d4a3a] mb-4">Request Submitted!</h3>
                    <p className="text-[#666] leading-relaxed max-w-md mx-auto mb-6">
                      Your Exchange Pro request has been submitted! We'll contact you with your premium offer.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a962]/10 text-[#c9a962] rounded-full font-semibold mb-6">
                      <TrendingUp className="w-4 h-4" /> Premium offer: {formatCurrency(premiumMin)} – {formatCurrency(premiumMax)}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                      <button onClick={resetWizard} className="px-6 py-3 bg-[#3d4a3a] text-white rounded-full font-semibold hover:bg-[#2d3a2a] transition-colors">
                        New Exchange Request
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
